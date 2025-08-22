"use client"
import { useEffect, useState } from "react";
import Link from "next/link";

// رنگ سبز هماهنگ با هدر
const mainGreen = "#399918";
const lightGreen = "#eafbe6";
const borderGreen = "#b6e2b2";
const darkGreen = "#237a13";

export default function ExamResults({ examId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!examId) return;
    fetch(`/api/teacher/exams/${examId}/answers`)
      .then(res => res.json())
      .then(setData);
  }, [examId]);

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
                  نمره: <b>{ans.marks_obtained}</b>
                  <span style={{
                    background: "#fffde7",
                    color: "#fbc02d",
                    borderRadius: 5,
                    padding: "1px 8px",
                    fontSize: 12,
                    marginRight: 8
                  }}>{ans.status}</span>
                </div>
                <div style={{ color: "#607d8b", fontSize: 12, marginBottom: 6 }}>
                  شماره دانش‌آموزی: {ans.students?.student_number}
                </div>
                {ans.student_answers && ans.student_answers.length > 0 && (
                  <div style={{ marginTop: 7 }}>
                    <b style={{ color: mainGreen, fontSize: 13 }}>پاسخ‌ها:</b>
                    <ul style={{ marginTop: 5, paddingRight: 12 }}>
                      {ans.student_answers.map(sa => (
                        <li key={sa.id} style={{
                          marginBottom: 5,
                          background: "#f6fff4",
                          borderRadius: 6,
                          padding: "5px 8px",
                          fontSize: 13,
                          boxShadow: `0 1px 2px ${mainGreen}08`
                        }}>
                          <span style={{ color: mainGreen }}>
                            سوال: <b>{sa.exam_questions?.question_text || sa.question_id}</b>
                          </span>
                          <br />
                          <span>
                            گزینه انتخابی: <b style={{ color: "#1976d2" }}>{sa.question_options?.option_text || sa.selected_option_id}</b>
                            {sa.is_correct !== undefined && (
                              <span style={{
                                color: sa.is_correct ? mainGreen : "#c62828",
                                fontWeight: "bold",
                                marginRight: 6
                              }}>
                                {sa.is_correct ? '✅ صحیح' : '❌ غلط'}
                              </span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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
                <div style={{ color: "#607d8b", fontSize: 12, marginBottom: 6 }}>
                  شماره دانش‌آموزی: {ans.students?.student_number}
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
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}