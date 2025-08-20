import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyJWT } from '@/lib/jwt';

// GET - گزارش‌های مدیریتی
export async function GET(request) {
  try {
    // احراز هویت
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, message: 'توکن ارسال نشده است' }, { status: 401 });
    }
    const payload = verifyJWT(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'دسترسی مجاز نیست' }, { status: 403 });
    }

    // آمار پایه
    const [totalUsers, students, teachers] = await Promise.all([
      prisma.users.count(),
      prisma.students.count().catch(() => 0),
      prisma.teachers.count().catch(() => 0)
    ]);

    // ثبت‌نام‌های این ماه (بر اساس created_at در جدول entrances یا users)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const registrationsThisMonth =
      (await prisma.entrances.count({
        where: { created_at: { gte: startOfMonth } }
      }).catch(async () => {
        // fallback to users.created_at if entrances not available
        return prisma.users.count({ where: { created_at: { gte: startOfMonth } } }).catch(() => 0);
      }));

    // ثبت‌نام‌های اخیر
    const recentRegistrations = await prisma.entrances.findMany({
      orderBy: { created_at: 'desc' },
      take: 10,
      include: {
        users: {
          select: { id: true, first_name: true, last_name: true, phone: true, email: true }
        }
      }
    }).catch(async () => {
      // fallback to users if entrances not available
      return (await prisma.users.findMany({
        orderBy: { created_at: 'desc' },
        take: 10
      })).map(u => ({ id: u.id, national_code: null, role: null, created_at: u.created_at, users: u }));
    });

    const recentFormatted = recentRegistrations.map(r => ({
      id: r.users?.id ?? r.id,
      firstName: r.users?.first_name ?? (r.first_name || null),
      lastName: r.users?.last_name ?? (r.last_name || null),
      nationalCode: r.national_code ?? null,
      role: r.role ?? null,
      createdAt: (r.created_at || r.users?.created_at)?.toISOString ? (r.created_at || r.users?.created_at).toISOString() : (r.created_at || r.users?.created_at)
    }));

    // میانگین نمرات، توزیع و برترین‌ها
    // سعی می‌کنیم از جداول متداول استفاده کنیم؛ اگر وجود نداشت، مقدار null/[] باز می‌گردانیم
    let averageGrade = null;
    let gradeDistribution = {};
    let topStudents = [];

    // helper: try raw queries on common score table names
    const tryScoreQueries = async () => {
      const candidates = [
        'student_scores', // common
        'scores',
        'exam_results',
        'grades_records'
      ];
      for (const table of candidates) {
        try {
          // میانگین
          const avgRes = await prisma.$queryRawUnsafe(`SELECT AVG(score) as avg FROM ${table}`);
          const avg = Array.isArray(avgRes) ? (avgRes[0]?.avg ?? null) : (avgRes?.avg ?? null);
          if (avg !== null && avg !== undefined) {
            averageGrade = Number(avg);
            // توزیع - گروه‌بندی بر اساس نمره کامل (می‌توان تغییر داد)
            const distRes = await prisma.$queryRawUnsafe(
              `SELECT ROUND(score)::TEXT as label, COUNT(*) as count FROM ${table} GROUP BY ROUND(score) ORDER BY label DESC`
            ).catch(async () => {
              // for sqlite / mysql without ::TEXT
              return prisma.$queryRawUnsafe(
                `SELECT ROUND(score) as label, COUNT(*) as count FROM ${table} GROUP BY ROUND(score) ORDER BY label DESC`
              );
            });
            if (Array.isArray(distRes) && distRes.length) {
              gradeDistribution = distRes.reduce((acc, row) => {
                const label = row.label?.toString?.() ?? String(row.label);
                acc[label] = Number(row.count || 0);
                return acc;
              }, {});
            }

            // برترین دانش‌آموزان بر اساس میانگین نمره
            const topRes = await prisma.$queryRawUnsafe(
              `SELECT s.user_id as userId, u.first_name as firstName, u.last_name as lastName, AVG(s.score) as avgGrade
               FROM ${table} s
               JOIN users u ON u.id = s.user_id
               GROUP BY s.user_id, u.first_name, u.last_name
               ORDER BY avgGrade DESC
               LIMIT 5`
            ).catch(() => []); // if join fails, ignore
            if (Array.isArray(topRes) && topRes.length) {
              topStudents = topRes.map(t => ({
                id: Number(t.userid ?? t.userId ?? t.user_id),
                firstName: t.firstname ?? t.firstName ?? t.first_name,
                lastName: t.lastname ?? t.lastName ?? t.last_name,
                avgGrade: Number(Number(t.avggrade ?? t.avgGrade).toFixed?.(2) ?? t.avggrade ?? t.avgGrade)
              }));
            }

            return true;
          }
        } catch (e) {
          // table doesn't exist or query failed — آزمایش جدول دیگر
          continue;
        }
      }
      return false;
    };

    await tryScoreQueries().catch(() => { /* ignore */ });

    // اگر نتوانستیم نمرات را پیدا کنیم، مقدار پیش‌فرض ثابت بگذار
    if (averageGrade === null) {
      averageGrade = null;
      gradeDistribution = {};
      topStudents = [];
    }

    return NextResponse.json({
      success: true,
      totalUsers,
      students,
      teachers,
      registrationsThisMonth,
      averageGrade,
      gradeDistribution,
      recentRegistrations: recentFormatted,
      topStudents
    });

  } catch (error) {
    console.error('Admin reports API error:', error);
    return NextResponse.json({ success: false, message: 'خطا در دریافت گزارش‌ها: ' + (error.message || '') }, { status: 500 });
  }
}