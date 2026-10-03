"use client"
import { useEffect, useState } from "react";
import Link from "next/link";

const mainGreen = "#399918";
const lightGreen = "#eafbe6";
const borderGreen = "#b6e2b2";
const darkGreen = "#237a13";

// گزینه‌های توصیفی نمره
const gradeOptions = [
  { value: "عالی", label: "عالی" },
  { value: "خیلی خوب", label: "خیلی خوب" },
  { value: "خوب", label: "خوب" },
  { value: "متوسط", label: "متوسط" },
  { value: "نیاز به تلاش بیشتر", label: "نیاز به تلاش بیشتر" }
];

export default function ExamResults({ examId }) {
  const [data, setData] = useState(null);
  const [scoreInputs, setScoreInputs] = useState({});
  const [fileInputs, setFileInputs] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!examId) return;
    
    console.log('🔄 Fetching exam results for examId:', examId);
    setLoading(true);
    
    // ✅ ارسال توکن احراز هویت
    const token = localStorage.getItem('token');
    
    fetch(`/api/teacher/exams/${examId}/answers`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        console.log('📡 API Response status:', res.status);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then(result => {
        console.log('📊 API Response data:', result);
        setData(result);
      })
      .catch(error => {
        console.error('💥 Error fetching exam results:', error);
        alert('خطا در دریافت نتایج آزمون');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [examId]);

  const getFileName = (url = '') => {
    try {
      const u = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
      return (u.pathname || '').split('/').pop() || 'file';
    } catch {
      return (url.split('/').pop() || 'file');
    }
  };
  const isImage = (url = '') => /\.(png|jpe?g|gif|webp|svg|bmp|tiff?|ico|avif|heic|heif)$/i.test((url || '').split('?')[0]);
const makeFileUrl = (url = '', disposition = 'inline') => {
  if (!url) return '#';
  try {
    if (/^https?:\/\//i.test(url)) {
      const name = getFileName(url);
      return `/api/files/download?path=${encodeURIComponent(url)}&disposition=${disposition}&name=${encodeURIComponent(name)}`;
    }
  } catch {}
  const raw = url.replace(/^\/+/, '');
  const name = getFileName(url);
  return `/api/files/download?path=${encodeURIComponent(raw)}&disposition=${disposition}&name=${encodeURIComponent(name)}`;
};

  // هندل ثبت نمره تستی
 const handleScoreSubmit = async (resultId, grade) => {
    console.log('💾 Submitting score:', { resultId, grade });
    
    try {
      const token = localStorage.getItem('token'); // اضافه کردن token
      
      const res = await fetch(`/api/exam-results/${resultId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // اضافه کردن header
        },
        body: JSON.stringify({ grade_desc: grade })
      });
      
      const result = await res.json();
      console.log('💾 Score submit response:', result);
      
      if (res.ok && result.success) {
        alert('نمره با موفقیت ثبت شد! ✅');
        // بروزرسانی state محلی
        setData(prev => ({
          ...prev,
          quizAnswers: prev.quizAnswers.map(ans =>
            ans.id === resultId ? { ...ans, grade_desc: grade } : ans
          )
        }));
        // پاک کردن input
        setScoreInputs(prev => {
          const newInputs = { ...prev };
          delete newInputs[resultId];
          return newInputs;
        });
      } else {
        alert(`خطا در ثبت نمره: ${result.error || 'خطای ناشناخته'}`);
      }
    } catch (error) {
      console.error('💥 Error submitting score:', error);
      alert('خطا در ارتباط با سرور');
    }
  };

  // هندل ثبت نمره و توضیح فایل
  const handleFileFeedback = async (answerId, grade, feedback) => {
    console.log('💾 Submitting file feedback:', { answerId, grade, feedback });
    
    try {
      const token = localStorage.getItem('token'); // اضافه کردن token
      
      const res = await fetch(`/api/exam-file-answers/${answerId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // اضافه کردن header
        },
        body: JSON.stringify({ grade_desc: grade, teacher_feedback: feedback })
      });
      
      const result = await res.json();
      console.log('💾 File feedback response:', result);
      
      if (res.ok && result.success) {
        alert('بازخورد با موفقیت ثبت شد! ✅');
        // بروزرسانی state محلی
        setData(prev => ({
          ...prev,
          fileAnswers: prev.fileAnswers.map(ans =>
            ans.id === answerId ? { ...ans, grade_desc: grade, teacher_feedback: feedback } : ans
          )
        }));
        // پاک کردن input
        setFileInputs(prev => {
          const newInputs = { ...prev };
          delete newInputs[answerId];
          return newInputs;
        });
      } else {
        alert(`خطا در ثبت بازخورد: ${result.error || 'خطای ناشناخته'}`);
      }
    } catch (error) {
      console.error('💥 Error submitting file feedback:', error);
      alert('خطا در ارتباط با سرور');
    }
  };

  if (!examId) return (
    <div style={{
      background: "#fff",
      borderRadius: 14,
      padding: 28,
      boxShadow: `0 2px 18px ${mainGreen}22`,
      color: "#c62828",
      textAlign: "center",
      fontWeight: "bold",
      fontSize: 15
    }}>
      آزمون انتخاب نشده است.
    </div>
  );

  if (loading) return (
    <div style={{
      background: "#fff",
      borderRadius: 14,
      padding: 28,
      boxShadow: `0 2px 18px ${mainGreen}22`,
      color: mainGreen,
      textAlign: "center",
      fontWeight: "bold",
      fontSize: 15
    }}>
      در حال بارگذاری نتایج...
    </div>
  );

  if (!data) return (
    <div style={{
      background: "#fff",
      borderRadius: 14,
      padding: 28,
      boxShadow: `0 2px 18px ${mainGreen}22`,
      color: "#c62828",
      textAlign: "center",
      fontWeight: "bold",
      fontSize: 15
    }}>
      خطا در دریافت اطلاعات آزمون.
    </div>
  );

  return (
    <div style={{
      maxWidth: 900,
      margin: "32px auto",
      background: `linear-gradient(135deg,${lightGreen} 60%,#f6fff4 100%)`,
      borderRadius: 16,
      boxShadow: `0 4px 24px ${mainGreen}22`,
      padding: 24,
      border: `1.5px solid ${borderGreen}`
    }}>

      <h2 style={{
        textAlign: "center",
        marginBottom: 22,
        color: mainGreen,
        fontWeight: "bold",
        fontSize: 22,
        letterSpacing: 1,
        borderBottom: `1.5px solid ${borderGreen}`,
        paddingBottom: 8
      }}>
        نتایج آزمون 
        {data.exam && (
          <div style={{ fontSize: 16, color: darkGreen, marginTop: 8 }}>
            {data.exam.title}
          </div>
        )}
      </h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 18,
        marginBottom: 20
      }}>
        <div style={{
          background: "#fff",
          borderRadius: 12,
          padding: 16,
          border: `1px solid ${borderGreen}`,
          textAlign: "center"
        }}>
          <div style={{ color: mainGreen, fontSize: 24, fontWeight: "bold" }}>
            {data.quizAnswers?.length || 0}
          </div>
          <div style={{ color: darkGreen, fontSize: 14 }}>پاسخ تستی</div>
        </div>
        <div style={{
          background: "#fff",
          borderRadius: 12,
          padding: 16,
          border: `1px solid ${borderGreen}`,
          textAlign: "center"
        }}>
          <div style={{ color: mainGreen, fontSize: 24, fontWeight: "bold" }}>
            {data.fileAnswers?.length || 0}
          </div>
          <div style={{ color: darkGreen, fontSize: 14 }}>پاسخ فایلی</div>
        </div>
      </div>

      <div style={{
        display: "flex",
        gap: 18,
        flexWrap: "wrap",
        justifyContent: "space-between"
      }}>
        {/* پاسخ‌های تستی */}
        <div style={{
          flex: 1,
          minWidth: 260,
          background: "#fff",
          borderRadius: 11,
          boxShadow: `0 1px 8px ${mainGreen}11`,
          border: `1.5px solid ${borderGreen}`,
          padding: 16,
          marginBottom: 18
        }}>
          <h3 style={{
            color: mainGreen,
            fontWeight: "bold",
            fontSize: 16,
            marginBottom: 12,
            borderBottom: `1px solid ${borderGreen}`,
            paddingBottom: 6
          }}>پاسخ‌های تستی ({data.quizAnswers?.length || 0})</h3>
          
          <ul style={{ padding: 0, listStyle: "none" }}>
            {(!data.quizAnswers || data.quizAnswers.length === 0) && (
              <li style={{ color: "#888", fontSize: 13, textAlign: "center", padding: 20 }}>
                هیچ پاسخ تستی ثبت نشده است.
              </li>
            )}
            {data.quizAnswers && data.quizAnswers.map(ans => (
              <li key={ans.id} style={{
                marginBottom: 18,
                borderBottom: '1px solid #e0e0e0',
                paddingBottom: 10,
                background: lightGreen,
                borderRadius: 8,
                boxShadow: `0 1px 4px ${mainGreen}11`,
                padding: 10
              }}>
                <div style={{ fontWeight: "bold", color: mainGreen, marginBottom: 4, fontSize: 14 }}>
                  👤 {ans.students?.users ? `${ans.students.users.first_name} ${ans.students.users.last_name}` : `دانش‌آموز ${ans.student_id}`}
                </div>
                <div style={{ color: darkGreen, fontSize: 13, marginBottom: 8 }}>
                  نمره عددی: <b>{ans.marks_obtained || '---'}</b> | 
                  نمره توصیفی: <b>{ans.grade_desc || "ثبت نشده"}</b>
                </div>
                
                {/* فرم ثبت نمره توصیفی */}
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    const grade = scoreInputs[ans.id] ?? ans.grade_desc ?? "";
                    if (!grade) {
                      alert('لطفاً نمره توصیفی را انتخاب کنید');
                      return;
                    }
                    handleScoreSubmit(ans.id, grade);
                  }}
                  style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}
                >
                  <select
                    name="marks"
                    value={scoreInputs[ans.id] ?? ans.grade_desc ?? ""}
                    onChange={e => setScoreInputs(inputs => ({
                      ...inputs,
                      [ans.id]: e.target.value
                    }))}
                    style={{
                      width: 160,
                      padding: "5px 8px",
                      borderRadius: 6,
                      border: `1px solid ${borderGreen}`,
                      fontSize: 13
                    }}
                    required
                  >
                    <option value="">انتخاب نمره توصیفی</option>
                    {gradeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    style={{
                      background: `linear-gradient(90deg,${mainGreen},${darkGreen})`,
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "6px 18px",
                      fontSize: 13,
                      fontWeight: "bold",
                      cursor: "pointer"
                    }}
                  >
                    ثبت نمره
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>

        {/* پاسخ‌های فایل */}
        <div style={{
          flex: 1,
          minWidth: 260,
          background: "#fff",
          borderRadius: 11,
          boxShadow: `0 1px 8px ${mainGreen}11`,
          border: `1.5px solid ${borderGreen}`,
          padding: 16,
          marginBottom: 18
        }}>
          <h3 style={{
            color: mainGreen,
            fontWeight: "bold",
            fontSize: 16,
            marginBottom: 12,
            borderBottom: `1px solid ${borderGreen}`,
            paddingBottom: 6
          }}>پاسخ‌های فایلی ({data.fileAnswers?.length || 0})</h3>
          
          <ul style={{ padding: 0, listStyle: "none" }}>
            {(!data.fileAnswers || data.fileAnswers.length === 0) && (
              <li style={{ color: "#888", fontSize: 13, textAlign: "center", padding: 20 }}>
                هیچ پاسخ فایلی ثبت نشده است.
              </li>
            )}
            {data.fileAnswers && data.fileAnswers.map(ans => (
              <li key={ans.id} style={{
                marginBottom: 15,
                background: lightGreen,
                borderRadius: 8,
                boxShadow: `0 1px 4px ${mainGreen}11`,
                padding: 12
              }}>
                <div style={{ fontWeight: "bold", color: mainGreen, marginBottom: 6, fontSize: 14 }}>
                  👤 {ans.students?.users ? `${ans.students.users.first_name} ${ans.students.users.last_name}` : `دانش‌آموز ${ans.student_id}`}
                </div>

                {/* دکمه‌های مشاهده و دانلود فایل - جایگزین لینک قبلی */}
                <div style={{ marginBottom: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <a
                    href={makeFileUrl(ans.file_url, 'inline')}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: `linear-gradient(90deg,${mainGreen},${darkGreen})`,
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "8px 20px",
                      fontSize: 13,
                      fontWeight: "bold",
                      textDecoration: "none",
                      display: "inline-block"
                    }}
                  >
                    🔎 مشاهده در تب جدید
                  </a>
                  <a
                    href={makeFileUrl(ans.file_url, 'attachment')}
                    download={getFileName(ans.file_url)}
                    style={{
                      background: "#2e7d32",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "8px 20px",
                      fontSize: 13,
                      fontWeight: "bold",
                      textDecoration: "none",
                      display: "inline-block"
                    }}
                  >
                    ⬇️ دانلود فایل
                  </a>
                </div>

                {/* پیش‌نمایش تصویر (اختیاری) */}
                {isImage(ans.file_url) && (
                  <div style={{ marginBottom: 10 }}>
                    <img
                      src={makeFileUrl(ans.file_url, 'inline')}
                      alt="پاسخ دانش‌آموز"
                      style={{ maxWidth: "100%", borderRadius: 8, border: `1px solid ${borderGreen}` }}
                    />
                  </div>
                )}

                {/* فرم ثبت نمره و بازخورد */}
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    const grade = fileInputs[ans.id]?.marks ?? ans.grade_desc ?? "";
                    const feedback = fileInputs[ans.id]?.feedback ?? ans.teacher_feedback ?? "";
                    if (!grade) {
                      alert('لطفاً نمره توصیفی را انتخاب کنید');
                      return;
                    }
                    handleFileFeedback(ans.id, grade, feedback);
                  }}
                  style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }}
                >
                  <select
                    name="marks"
                    value={fileInputs[ans.id]?.marks ?? ans.grade_desc ?? ""}
                    onChange={e => setFileInputs(inputs => ({
                      ...inputs,
                      [ans.id]: {
                        ...inputs[ans.id],
                        marks: e.target.value
                      }
                    }))}
                    style={{ 
                      width: "100%", 
                      padding: "8px 10px", 
                      borderRadius: 6, 
                      border: `1px solid ${borderGreen}`, 
                      fontSize: 13 
                    }}
                    required
                  >
                    <option value="">انتخاب نمره توصیفی</option>
                    {gradeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  
                  <textarea
                    name="feedback"
                    value={fileInputs[ans.id]?.feedback ?? ans.teacher_feedback ?? ""}
                    placeholder="توضیحات و بازخورد معلم (اختیاری)"
                    onChange={e => setFileInputs(inputs => ({
                      ...inputs,
                      [ans.id]: {
                        ...inputs[ans.id],
                        feedback: e.target.value
                      }
                    }))}
                    style={{ 
                      borderRadius: 6, 
                      border: `1px solid ${borderGreen}`, 
                      fontSize: 13, 
                      padding: 8,
                      minHeight: 60,
                      resize: "vertical"
                    }}
                  />
                  
                  <button
                    type="submit"
                    style={{
                      background: `linear-gradient(90deg,${mainGreen},${darkGreen})`,
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "8px 20px",
                      fontSize: 13,
                      fontWeight: "bold",
                      cursor: "pointer"
                    }}
                  >
                    💾 ثبت بازخورد
                  </button>
                </form>

                {/* نمایش بازخورد فعلی */}
                {(ans.teacher_feedback || ans.grade_desc) && (
                  <div style={{ 
                    marginTop: 12, 
                    fontSize: 12, 
                    color: darkGreen,
                    background: "#f0f9f0",
                    padding: 8,
                    borderRadius: 6,
                    border: `1px solid ${borderGreen}`
                  }}>
                    {ans.grade_desc && (
                      <div><strong>نمره ثبت‌شده:</strong> {ans.grade_desc}</div>
                    )}
                    {ans.teacher_feedback && (
                      <div style={{ marginTop: 4 }}>
                        <strong>بازخورد:</strong> {ans.teacher_feedback}
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
