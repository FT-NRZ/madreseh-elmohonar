'use client'
import React, { useEffect, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import Link from 'next/link';

const classes = [
  { id: 1, title: 'پایه اول ابتدایی' },
  { id: 2, title: 'پایه دوم ابتدایی' },
  { id: 3, title: 'پایه سوم ابتدایی' },
  { id: 4, title: 'پایه چهارم ابتدایی' },
];

const mainGreen = "#399918";
const lightGreen = "#eafbe6";
const borderGreen = "#b6e2b2";
const darkGreen = "#237a13";

export default function ExamsList({ studentId }) {
  const [selectedClassId, setSelectedClassId] = useState('');
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedClassId) return;
    setLoading(true);
    async function fetchExams() {
      try {
        const res = await fetch(`/api/exams/all?class_id=${selectedClassId}`);
        const data = await res.json();
        setExams(data.exams || []);
      } catch {
        setExams([]);
      }
      setLoading(false);
    }
    fetchExams();
  }, [selectedClassId]);

  return (
    <div
      style={{
        background: `linear-gradient(135deg,${lightGreen} 60%,#f6fff4 100%)`,
        borderRadius: 16,
        boxShadow: `0 4px 24px ${mainGreen}22`,
        border: `1.5px solid ${borderGreen}`,
        padding: 28,
        marginBottom: 32,
        maxWidth: 500,
        marginLeft: "auto",
        marginRight: "auto"
      }}
    >
      <h2
        style={{
          fontSize: 20,
          fontWeight: "bold",
          color: mainGreen,
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 8,
          borderBottom: `1.5px solid ${borderGreen}`,
          paddingBottom: 8,
          letterSpacing: 1
        }}
      >
        <ClipboardList className="w-6 h-6" color={mainGreen} />
        آزمون‌های من
      </h2>
      <div style={{ marginBottom: 18 }}>
        <label style={{ display: "block", marginBottom: 7, fontWeight: "bold", color: "#444", fontSize: 15 }}>
          پایه (کلاس) خود را انتخاب کنید:
        </label>
        <select
          style={{
            border: `1.5px solid ${borderGreen}`,
            borderRadius: 7,
            padding: "9px 12px",
            width: "100%",
            fontSize: 15,
            background: "#fff",
            color: "#333",
            outline: "none",
            boxShadow: "0 1px 6px #39991811"
          }}
          value={selectedClassId}
          onChange={e => setSelectedClassId(e.target.value)}
        >
          <option value="">انتخاب پایه...</option>
          {classes.map(cls => (
            <option key={cls.id} value={cls.id}>{cls.title}</option>
          ))}
        </select>
      </div>
      {loading && (
        <div style={{ color: mainGreen, fontWeight: "bold", textAlign: "center", margin: "18px 0" }}>
          در حال دریافت آزمون‌ها...
        </div>
      )}
      {!loading && selectedClassId && (
        exams.length === 0 ? (
          <div style={{
            color: "#c62828",
            background: "#fff",
            borderRadius: 8,
            padding: "14px 0",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 15,
            boxShadow: `0 1px 6px ${mainGreen}11`
          }}>
            آزمونی برای این پایه ثبت نشده است.
          </div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {exams.map((exam) => (
              <li
                key={exam.id}
                style={{
                  borderBottom: `1px solid ${borderGreen}`,
                  padding: "13px 0",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  alignItems: "flex-start",
                  marginBottom: 2
                }}
                className="group"
              >
                <div style={{ fontWeight: "bold", color: "#444", fontSize: 16 }}>
                  {exam.title}
                </div>
                <Link
                  href={`/student/exams/${exam.id}`}
                  style={{
                    display: "inline-block",
                    background: `linear-gradient(90deg,${mainGreen},${darkGreen})`,
                    color: "#fff",
                    padding: "7px 22px",
                    borderRadius: 7,
                    fontSize: 14,
                    fontWeight: "bold",
                    textDecoration: "none",
                    boxShadow: `0 2px 8px ${mainGreen}22`,
                    transition: "0.2s",
                    marginTop: 2
                  }}
                >
                  شرکت در آزمون
                </Link>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
}