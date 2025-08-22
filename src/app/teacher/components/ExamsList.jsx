"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'

// رنگ سبز هماهنگ با هدر
const mainGreen = "#399918";
const lightGreen = "#eafbe6";
const borderGreen = "#b6e2b2";
const darkGreen = "#237a13";

const classesList = [
  { id: 1, name: "کلاس اول" },
  { id: 2, name: "کلاس دوم" },
  { id: 3, name: "کلاس سوم" },
  { id: 4, name: "کلاس چهارم" }
]

const initialForm = {
  title: '',
  type: 'pdf',
  file: null,
  image: null,
  class_id: '',
  questions: [
    { question: '', options: ['', '', '', ''], answer: 0 }
  ]
}

export default function ExamsList() {
  const [form, setForm] = useState(initialForm)
  const [exams, setExams] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => { fetchExams() }, [])

  const fetchExams = async () => {
    try {
      const res = await fetch('/api/teacher/exams')
      if (!res.ok) throw new Error('خطا در دریافت لیست آزمون‌ها')
      const data = await res.json()
      setExams(data)
    } catch (err) { setError(err.message) }
  }

  const handleChange = (e) => {
    const { name, value, files, type } = e.target
    if (type === 'file') setForm(f => ({ ...f, [name]: files[0] }))
    else setForm(f => ({ ...f, [name]: value }))
  }

  const handleQuestionChange = (idx, field, value) => {
    setForm(f => {
      const questions = [...f.questions]
      if (field === 'question') questions[idx].question = value
      else if (field === 'answer') questions[idx].answer = Number(value)
      return { ...f, questions }
    })
  }

  const handleOptionChange = (qIdx, oIdx, value) => {
    setForm(f => {
      const questions = [...f.questions]
      questions[qIdx].options[oIdx] = value
      return { ...f, questions }
    })
  }

  const addQuestion = () => {
    setForm(f => ({
      ...f,
      questions: [...f.questions, { question: '', options: ['', '', '', ''], answer: 0 }]
    }))
  }

  const handleDelete = async (id) => {
    if (!window.confirm('آیا از حذف این آزمون مطمئن هستید؟')) return
    try {
      const res = await fetch(`/api/teacher/exams?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('خطا در حذف آزمون')
      await fetchExams()
    } catch (err) { setError(err.message) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)
    setError('')
    setSuccess(false)

    if (!form.title.trim()) {
      setError('عنوان آزمون الزامی است')
      setUploading(false)
      return
    }
    if (!form.class_id) {
      setError('کلاس آزمون را انتخاب کنید')
      setUploading(false)
      return
    }
    if (form.type === 'pdf' && !form.file) {
      setError('فایل PDF را انتخاب کنید')
      setUploading(false)
      return
    }
    if (form.type === 'image' && !form.image) {
      setError('تصویر آزمون را انتخاب کنید')
      setUploading(false)
      return
    }
    if (form.type === 'quiz') {
      for (let q of form.questions) {
        if (!q.question.trim() || q.options.some(opt => !opt.trim())) {
          setError('همه سوالات و گزینه‌ها را کامل کنید')
          setUploading(false)
          return
        }
      }
    }

    try {
      let pdf_url = null, image_url = null

      if (form.type === 'pdf' && form.file) {
        const formData = new FormData()
        formData.append('file', form.file)
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        const uploadData = await uploadRes.json()
        if (!uploadRes.ok) throw new Error(uploadData.error || 'خطا در آپلود فایل PDF')
        pdf_url = uploadData.url
      }

      if (form.type === 'image' && form.image) {
        const formData = new FormData()
        formData.append('file', form.image)
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        const uploadData = await uploadRes.json()
        if (!uploadRes.ok) throw new Error(uploadData.error || 'خطا در آپلود تصویر')
        image_url = uploadData.url
      }

      const response = await fetch('/api/teacher/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: form.type,
          title: form.title,
          pdf_url,
          image_url,
          class_id: form.class_id,
          questions: form.type === 'quiz' ? form.questions : undefined
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'خطا در ارسال آزمون')
      }

      setUploading(false)
      setSuccess(true)
      setShowForm(false)
      setForm(initialForm)
      await fetchExams()
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      setError(error.message || 'خطا در ارسال آزمون')
      setUploading(false)
    }
  }

  return (
    <div style={{
      maxWidth: 520,
      margin: "32px auto",
      background: `linear-gradient(135deg,${lightGreen} 60%,#f6fff4 100%)`,
      borderRadius: 16,
      boxShadow: `0 2px 24px ${mainGreen}22`,
      padding: 24,
      border: `1.5px solid ${borderGreen}`
    }}>
      <h2 style={{
        textAlign: "center",
        marginBottom: 18,
        color: mainGreen,
        fontWeight: "bold",
        letterSpacing: 1,
        fontSize: 22,
        borderBottom: `1.5px solid ${borderGreen}`,
        paddingBottom: 8
      }}>مدیریت آزمون‌ها</h2>
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <button
          onClick={() => setShowForm(true)}
          style={{
            background: `linear-gradient(90deg,${mainGreen},${darkGreen})`,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "8px 26px",
            fontSize: 15,
            cursor: "pointer",
            boxShadow: `0 2px 12px ${mainGreen}22`,
            fontWeight: "bold",
            transition: "0.2s"
          }}
        >
          + ثبت آزمون جدید
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} style={{
          background: "#fff",
          borderRadius: 12,
          padding: 18,
          marginBottom: 24,
          boxShadow: `0 1px 8px ${mainGreen}11`,
          border: `1px solid ${borderGreen}`,
          overflow: "hidden"
        }}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ color: mainGreen, fontWeight: "bold", fontSize: 14 }}>عنوان آزمون:</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: 6,
                border: `1px solid ${borderGreen}`,
                marginTop: 5,
                fontSize: 14
              }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ color: mainGreen, fontWeight: "bold", fontSize: 14 }}>نوع آزمون:</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: 6,
                border: `1px solid ${borderGreen}`,
                marginTop: 5,
                fontSize: 14
              }}
            >
              <option value="pdf">PDF</option>
              <option value="image">تصویری</option>
              <option value="quiz">تستی</option>
            </select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ color: mainGreen, fontWeight: "bold", fontSize: 14 }}>کلاس:</label>
            <select
              name="class_id"
              value={form.class_id}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: 6,
                border: `1px solid ${borderGreen}`,
                marginTop: 5,
                fontSize: 14
              }}
            >
              <option value="">انتخاب کنید</option>
              {classesList.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
          {form.type === "pdf" && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ color: mainGreen, fontWeight: "bold", fontSize: 14 }}>فایل PDF آزمون:</label>
              <input
                type="file"
                name="file"
                accept="application/pdf"
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: 6,
                  border: `1px solid ${borderGreen}`,
                  marginTop: 5,
                  fontSize: 14,
                  background: "#fff"
                }}
              />
            </div>
          )}
          {form.type === "image" && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ color: mainGreen, fontWeight: "bold", fontSize: 14 }}>تصویر آزمون:</label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: 6,
                  border: `1px solid ${borderGreen}`,
                  marginTop: 5,
                  fontSize: 14,
                  background: "#fff"
                }}
              />
            </div>
          )}
          {form.type === "quiz" && (
            <div style={{
              background: lightGreen,
              borderRadius: 8,
              padding: 10,
              marginBottom: 12,
              border: `1px solid ${borderGreen}`
            }}>
              <label style={{ color: mainGreen, fontWeight: "bold", marginBottom: 6, display: "block", fontSize: 14 }}>سوالات تستی:</label>
              {form.questions.map((q, idx) => (
                <div key={idx} style={{
                  marginBottom: 12,
                  padding: 8,
                  background: "#fff",
                  borderRadius: 6,
                  border: `1px solid ${borderGreen}`
                }}>
                  <input
                    type="text"
                    placeholder={`متن سوال ${idx + 1}`}
                    value={q.question}
                    onChange={e => handleQuestionChange(idx, "question", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "7px",
                      borderRadius: 5,
                      border: `1px solid ${borderGreen}`,
                      marginBottom: 6,
                      fontSize: 13
                    }}
                  />
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
                      <input
                        type="text"
                        placeholder={`گزینه ${oIdx + 1}`}
                        value={opt}
                        onChange={e => handleOptionChange(idx, oIdx, e.target.value)}
                        style={{
                          flex: 1,
                          padding: "6px",
                          borderRadius: 5,
                          border: `1px solid ${borderGreen}`,
                          fontSize: 13,
                          marginLeft: 6
                        }}
                      />
                      <label style={{
                        color: mainGreen,
                        fontWeight: "bold",
                        marginLeft: 6,
                        fontSize: 13
                      }}>
                        <input
                          type="radio"
                          name={`answer_${idx}`}
                          checked={q.answer === oIdx}
                          onChange={() => handleQuestionChange(idx, "answer", oIdx)}
                          style={{ marginLeft: 3 }}
                        />
                        صحیح
                      </label>
                    </div>
                  ))}
                </div>
              ))}
              <button
                type="button"
                onClick={addQuestion}
                style={{
                  background: `linear-gradient(90deg,${mainGreen},${darkGreen})`,
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "6px 18px",
                  fontSize: 13,
                  fontWeight: "bold",
                  cursor: "pointer",
                  marginTop: 4
                }}
              >
                + افزودن سوال
              </button>
            </div>
          )}
          {error && <div style={{ color: "#c62828", marginBottom: 10, fontSize: 13 }}>{error}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="submit"
              disabled={uploading}
              style={{
                background: `linear-gradient(90deg,${mainGreen},${darkGreen})`,
                color: "#fff",
                border: "none",
                borderRadius: 7,
                padding: "8px 22px",
                fontSize: 14,
                fontWeight: "bold",
                cursor: "pointer",
                marginTop: 8,
                minWidth: 90
              }}
            >
              {uploading ? "در حال ارسال..." : "ثبت آزمون"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              style={{
                background: "linear-gradient(90deg,#c62828,#ef5350)",
                color: "#fff",
                border: "none",
                borderRadius: 7,
                padding: "8px 22px",
                fontSize: 14,
                fontWeight: "bold",
                cursor: "pointer",
                marginTop: 8,
                minWidth: 90
              }}
            >
              انصراف
            </button>
          </div>
        </form>
      )}
      <h3 style={{
        marginTop: 18,
        color: mainGreen,
        fontWeight: "bold",
        letterSpacing: 1,
        fontSize: 17,
        borderBottom: `1px solid ${borderGreen}`,
        paddingBottom: 6
      }}>لیست آزمون‌ها</h3>
      <ul style={{ listStyle: "none", padding: 0, marginTop: 14 }}>
        {exams.map(exam => (
          <li key={exam.id} style={{
            background: "#fff",
            borderRadius: 9,
            marginBottom: 12,
            padding: 13,
            boxShadow: `0 1px 8px ${mainGreen}11`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: `1px solid ${borderGreen}`,
            gap: 8
          }}>
            <span style={{
              fontWeight: "bold",
              color: mainGreen,
              fontSize: 15,
              minWidth: 90,
              display: "inline-block"
            }}>{exam.title}</span>
            <span style={{
              background: mainGreen,
              color: "#fff",
              borderRadius: 6,
              padding: "5px 14px",
              fontSize: 13,
              fontWeight: "bold",
              marginLeft: 6,
              minWidth: 60,
              textAlign: "center",
              display: "inline-block"
            }}>{exam.type === "pdf" ? "PDF" : exam.type === "image" ? "تصویری" : "تستی"}</span>
            <span style={{
              background: "#f6fff4",
              color: mainGreen,
              border: `1px solid ${mainGreen}`,
              borderRadius: 6,
              padding: "5px 12px",
              fontSize: 13,
              fontWeight: "bold",
              marginLeft: 6,
              minWidth: 70,
              textAlign: "center",
              display: "inline-block"
            }}>
              {classesList.find(cls => cls.id == exam.class_id)?.name || "بدون کلاس"}
            </span>
            <Link href={`/teacher/exams/${exam.id}`}>
              <button
                style={{
                  background: "linear-gradient(90deg,#1976d2,#64b5f6)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "6px 18px",
                  fontSize: 13,
                  fontWeight: "bold",
                  cursor: "pointer",
                  marginRight: 4,
                  transition: "0.2s",
                  minWidth: 70
                }}
              >
                نتایج
              </button>
            </Link>
            <button
              onClick={() => handleDelete(exam.id)}
              style={{
                background: "linear-gradient(90deg,#c62828,#ef5350)",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "6px 18px",
                fontSize: 13,
                fontWeight: "bold",
                cursor: "pointer",
                marginRight: 4,
                transition: "0.2s",
                minWidth: 60
              }}
            >
              حذف
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}