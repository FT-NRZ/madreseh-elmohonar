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

  useEffect(() => {
    if (!examId) return;
    fetch(`/api/teacher/exams/${examId}/answers`)
      .then(res => res.json())
      .then(setData);
  }, [examId]);

  // هندل ثبت نمره تستی
  const handleScoreSubmit = async (resultId, grade) => {
    const res = await fetch(`/api/exam-results/${resultId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grade_desc: grade })
    });
    if (res.ok) {
      alert('نمره ثبت شد!');
      setData(prev => ({
        ...prev,
        quizAnswers: prev.quizAnswers.map(ans =>
          ans.id === resultId ? { ...ans, grade_desc: grade } : ans
        )
      }));
    } else {
      alert('خطا در ثبت نمره');
    }
  };

  // هندل ثبت نمره و توضیح فایل
  const handleFileFeedback = async (answerId, grade, feedback) => {
    const res = await fetch(`/api/exam-file-answers/${answerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grade_desc: grade, teacher_feedback: feedback })
    });
    if (res.ok) {
      alert('بازخورد ثبت شد!');
      setData(prev => ({
        ...prev,
        fileAnswers: prev.fileAnswers.map(ans =>
          ans.id === answerId ? { ...ans, grade_desc: grade, teacher_feedback: feedback } : ans
        )
      }));
    } else {
      alert('خطا در ثبت بازخورد');
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
  if (!data) return (
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
      در حال بارگذاری...
    </div>
  );

  return (
    <div style={{
      maxWidth: 650,
      margin: "32px auto",
      background: `linear-gradient(135deg,${lightGreen} 60%,#f6fff4 100%)`,
      borderRadius: 16,
      boxShadow: `0 4px 24px ${mainGreen}22`,
      padding: 24,
      border: `1.5px solid ${borderGreen}`
    }}>
      {/* دکمه بازگشت */}
      <div style={{ marginBottom: 18 }}>
        <Link href="/teacher/dashboard">
          <button style={{
            background: `linear-gradient(90deg,${mainGreen},${darkGreen})`,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "8px 28px",
            fontSize: 15,
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: `0 2px 12px ${mainGreen}33`,
            transition: "0.2s"
          }}>
            ← بازگشت به لیست آزمون‌ها
          </button>
        </Link>
      </div>
      <h2 style={{
        textAlign: "center",
        marginBottom: 22,
        color: mainGreen,
        fontWeight: "bold",
        fontSize: 22,
        letterSpacing: 1,
        borderBottom: `1.5px solid ${borderGreen}`,
        paddingBottom: 8
      }}>نتایج آزمون</h2>
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
          }}>پاسخ‌های تستی</h3>
          <ul style={{ padding: 0, listStyle: "none" }}>
            {(!data.quizAnswers || data.quizAnswers.length === 0) && <li style={{ color: "#888", fontSize: 13 }}>پاسخی ثبت نشده است.</li>}
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
                  👤 {ans.students?.full_name || ans.student_id}
                </div>
                <div style={{ color: mainGreen, fontSize: 13 }}>
                  نمره: <b>{ans.grade_desc ?? "---"}</b>
                </div>
                {/* فرم ثبت نمره توصیفی */}
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    const grade = scoreInputs[ans.id] ?? ans.grade_desc ?? "";
                    handleScoreSubmit(ans.id, grade);
                  }}
                  style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}
                >
                  <select
                    name="marks"
                    value={scoreInputs[ans.id] ?? ans.grade_desc ?? ""}
                    onChange={e => setScoreInputs(inputs => ({
                      ...inputs,
                      [ans.id]: e.target.value
                    }))}
                    style={{
                      width: 140,
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
        {/* پاسخ‌های فایل (PDF/تصویر) با فرم ثبت نمره و توضیح توصیفی */}
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
          }}>پاسخ‌های فایل (PDF/تصویر)</h3>
          <ul style={{ padding: 0, listStyle: "none" }}>
            {(!data.fileAnswers || data.fileAnswers.length === 0) && <li style={{ color: "#888", fontSize: 13 }}>پاسخی ثبت نشده است.</li>}
            {data.fileAnswers && data.fileAnswers.map(ans => (
              <li key={ans.id} style={{
                marginBottom: 10,
                background: lightGreen,
                borderRadius: 8,
                boxShadow: `0 1px 4px ${mainGreen}11`,
                padding: 10
              }}>
                <div style={{ fontWeight: "bold", color: mainGreen, marginBottom: 4, fontSize: 14 }}>
                  👤 {ans.students?.full_name || ans.student_id}
                </div>
                <a
                  href={ans.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: `linear-gradient(90deg,${mainGreen},${darkGreen})`,
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "6px 18px",
                    fontSize: 13,
                    fontWeight: "bold",
                    cursor: "pointer",
                    textDecoration: "none",
                    transition: "0.2s"
                  }}
                >
                  دانلود فایل
                </a>
                {/* فرم ثبت نمره و توضیح توصیفی */}
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    const grade = fileInputs[ans.id]?.marks ?? ans.grade_desc ?? "";
                    const feedback = fileInputs[ans.id]?.feedback ?? ans.teacher_feedback ?? "";
                    handleFileFeedback(ans.id, grade, feedback);
                  }}
                  style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}
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
                    style={{ width: 140, padding: "5px 8px", borderRadius: 6, border: "1px solid #b6e2b2", fontSize: 13 }}
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
                    placeholder="توضیحات معلم (اختیاری)"
                    onChange={e => setFileInputs(inputs => ({
                      ...inputs,
                      [ans.id]: {
                        ...inputs[ans.id],
                        feedback: e.target.value
                      }
                    }))}
                    style={{ borderRadius: 6, border: "1px solid #b6e2b2", fontSize: 13, padding: 6 }}
                  />
                  <button
                    type="submit"
                    style={{
                      background: `linear-gradient(90deg,#399918,#237a13)`,
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "6px 18px",
                      fontSize: 13,
                      fontWeight: "bold",
                      cursor: "pointer"
                    }}
                  >
                    ثبت بازخورد
                  </button>
                </form>
                {/* نمایش بازخورد فعلی */}
                {(ans.teacher_feedback || ans.grade_desc) && (
                  <div style={{ marginTop: 8, fontSize: 13, color: mainGreen }}>
                    {ans.grade_desc && <>نمره ثبت‌شده: <b>{ans.grade_desc}</b><br /></>}
                    {ans.teacher_feedback && <>توضیح معلم: <span>{ans.teacher_feedback}</span></>}
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