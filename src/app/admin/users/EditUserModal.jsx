'use client';
import React, { useState, useEffect } from 'react';
import { Edit, Eye, EyeOff, X } from 'lucide-react';

export default function EditUserModal({ user, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    nationalCode: user.nationalCode || '',
    phone: user.phone || '',
    email: user.email || '',
    role: user.role || 'student',
    password: '',
    teachingType: user.teachingType || '',
    gradeId: user.gradeId || '',
    workshopId: user.workshopId || '',
    subject: user.subject || '',
    classId: user.classId || ''
  });

  const [classes, setClasses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage?.getItem?.('token');
        // دریافت کلاس‌ها
        const classesRes = await fetch('/api/admin/classes', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (classesRes.ok) {
          const classesData = await classesRes.json();
          setClasses(Array.isArray(classesData.classes) ? classesData.classes : []);
        }
        // دریافت پایه‌ها
        const gradesRes = await fetch('/api/grades', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (gradesRes.ok) {
          const gradesData = await gradesRes.json();
          setGrades(Array.isArray(gradesData.grades) ? gradesData.grades : []);
        }
        // دریافت کارگاه‌ها
        const workshopsRes = await fetch('/api/workshops', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (workshopsRes.ok) {
          const workshopsData = await workshopsRes.json();
          setWorkshops(Array.isArray(workshopsData.workshops) ? workshopsData.workshops : []);
        }
      } catch (error) {
        console.error('خطا در دریافت داده‌ها:', error);
      }
    }
    fetchData();
  }, []);

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) password += chars.charAt(Math.floor(Math.random() * chars.length));
    setFormData(prev => ({ ...prev, password }));
  };

  const handleRoleChange = (newRole) => {
    setFormData(prev => ({
      ...prev,
      role: newRole,
      classId: '',
      teachingType: '',
      gradeId: '',
      workshopId: '',
      subject: ''
    }));
  };

  const handleTeachingTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      teachingType: type,
      gradeId: '',
      workshopId: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // اعتبارسنجی برای معلم
    if (formData.role === 'teacher') {
      if (!formData.teachingType) {
        setError('انتخاب نوع تدریس برای معلم الزامی است');
        setIsLoading(false);
        return;
      }
      if (formData.teachingType === 'grade' && !formData.gradeId) {
        setError('انتخاب پایه برای معلم پایه‌ای الزامی است');
        setIsLoading(false);
        return;
      }
      if (formData.teachingType === 'workshop' && !formData.workshopId) {
        setError('انتخاب کارگاه برای معلم کارگاه الزامی است');
        setIsLoading(false);
        return;
      }
    }

    try {
      const token = localStorage?.getItem?.('token');
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          nationalCode: formData.nationalCode,
          phone: formData.phone || null,
          email: formData.email || null,
          role: formData.role,
          password: formData.password || undefined,
          classId: formData.role === 'student' && formData.classId ? Number(formData.classId) : undefined,
          teachingType: formData.role === 'teacher' ? formData.teachingType : undefined,
          gradeId: formData.role === 'teacher' && formData.teachingType === 'grade' ? Number(formData.gradeId) : undefined,
          workshopId: formData.role === 'teacher' && formData.teachingType === 'workshop' ? Number(formData.workshopId) : undefined,
          subject: formData.role === 'teacher' ? formData.subject : undefined
        })
      });
      const data = await response.json();
      if (response.ok && (data?.success ?? true)) {
        onSuccess();
      } else {
        setError(data?.message || 'خطا در ویرایش کاربر');
      }
    } catch {
      setError('خطا در ارتباط با سرور');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-green-100 p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-5 bg-gradient-to-r from-green-100 to-green-50 border-b border-green-100">
          <div className="flex items-center gap-2">
            <Edit className="w-6 h-6 text-green-600" />
            <h2 className="text-lg font-bold text-green-700">ویرایش کاربر</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-green-50 hover:bg-green-200 transition" title="بستن">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
          {/* اطلاعات پایه */}
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={formData.firstName}
              onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              className="px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition"
              placeholder="نام"
              required
            />
            <input
              type="text"
              value={formData.lastName}
              onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              className="px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition"
              placeholder="نام خانوادگی"
              required
            />
          </div>

          <input
            type="text"
            value={formData.nationalCode}
            onChange={e => setFormData(prev => ({ ...prev, nationalCode: e.target.value }))}
            className="w-full px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition"
            placeholder="کد ملی"
            required
          />

          <input
            type="tel"
            value={formData.phone}
            onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition"
            placeholder="شماره موبایل"
          />

          <input
            type="email"
            value={formData.email}
            onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition"
            placeholder="ایمیل (اختیاری)"
          />

          {/* انتخاب نقش */}
          <select
            value={formData.role}
            onChange={e => handleRoleChange(e.target.value)}
            className="w-full px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition"
          >
            <option value="student">دانش‌آموز</option>
            <option value="teacher">معلم</option>
            <option value="admin">مدیر</option>
          </select>

          {/* فیلدهای مخصوص دانش‌آموز */}
          {formData.role === 'student' && (
            <div>
              <select
                value={formData.classId}
                onChange={e => setFormData(prev => ({ ...prev, classId: e.target.value }))}
                className="w-full px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition"
              >
                <option value="">انتخاب کلاس (اختیاری)</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.class_name} {c.class_number ? `- شماره ${c.class_number}` : ''} {c.academic_year ? `(${c.academic_year})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* فیلدهای مخصوص معلم */}
          {formData.role === 'teacher' && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h3 className="font-semibold text-blue-800">اطلاعات معلم</h3>
              {/* نوع تدریس */}
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">نوع تدریس *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleTeachingTypeChange('grade')}
                    className={`p-3 border-2 rounded-lg text-center transition ${
                      formData.teachingType === 'grade'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg mb-1">📚</div>
                    <div className="font-semibold text-sm">معلم پایه</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTeachingTypeChange('workshop')}
                    className={`p-3 border-2 rounded-lg text-center transition ${
                      formData.teachingType === 'workshop'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg mb-1">🎪</div>
                    <div className="font-semibold text-sm">معلم کارگاه</div>
                  </button>
                </div>
              </div>
              {/* انتخاب پایه برای معلم پایه‌ای */}
              {formData.teachingType === 'grade' && (
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">انتخاب پایه تحصیلی *</label>
                  <select
                    value={formData.gradeId}
                    onChange={e => setFormData(prev => ({ ...prev, gradeId: e.target.value }))}
                    className="w-full px-3 py-2 border border-blue-100 rounded-xl bg-blue-50 focus:ring-2 focus:ring-blue-400 outline-none transition"
                    required
                  >
                    <option value="">انتخاب پایه...</option>
                    {grades.map(grade => (
                      <option key={grade.id} value={grade.id}>
                        📚 {grade.grade_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {/* انتخاب کارگاه برای معلم کارگاه */}
              {formData.teachingType === 'workshop' && (
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">انتخاب کارگاه *</label>
                  <select
                    value={formData.workshopId}
                    onChange={e => setFormData(prev => ({ ...prev, workshopId: e.target.value }))}
                    className="w-full px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition"
                    required
                  >
                    <option value="">انتخاب کارگاه...</option>
                    {workshops.map(workshop => (
                      <option key={workshop.id} value={workshop.id}>
                        {workshop.icon || '🎪'} {workshop.workshop_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {/* موضوع تدریس */}
              <input
                type="text"
                value={formData.subject}
                onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-3 py-2 border border-blue-100 rounded-xl bg-blue-50 focus:ring-2 focus:ring-blue-400 outline-none transition"
                placeholder="موضوع تدریس (اختیاری)"
              />
            </div>
          )}

          {/* رمز عبور */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition"
              placeholder="رمز جدید (اختیاری)"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-2 top-2 text-gray-400" title={showPassword ? 'مخفی کردن' : 'نمایش رمز'}>
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button type="button" onClick={generatePassword} className="absolute left-10 top-2 text-xs bg-green-100 px-2 py-1 rounded-xl shadow hover:bg-green-200 transition">
              تولید
            </button>
          </div>

          {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-200">{error}</div>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 rounded-xl text-gray-700 shadow hover:bg-gray-200 transition">
              انصراف
            </button>
            <button type="submit" className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white shadow hover:scale-105 transition" disabled={isLoading}>
              {isLoading ? 'در حال ذخیره...' : 'ذخیره'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}