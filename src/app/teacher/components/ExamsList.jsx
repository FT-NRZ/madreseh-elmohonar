"use client"
import React, { useState, useEffect } from 'react'

// فرضی: لیست کلاس‌ها. اگر از API می‌گیری، این بخش را با داده واقعی جایگزین کن.
const classesList = [
  { id: 1, name: "کلاس اول" },
  { id: 2, name: "کلاس دوم" },
  { id: 3, name: "کلاس سوم" }
]

const initialForm = {
  title: '',
  type: 'pdf',
  file: null,
  image: null,
  class_id: '', // اضافه شد
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

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    try {
      const res = await fetch('/api/teacher/exams')
      if (!res.ok) throw new Error('خطا در دریافت لیست آزمون‌ها')
      const data = await res.json()
      setExams(data)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleChange = (e) => {
    const { name, value, files, type } = e.target
    if (type === 'file') {
      setForm(f => ({ ...f, [name]: files[0] }))
    } else {
      setForm(f => ({ ...f, [name]: value }))
    }
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

  // حذف آزمون
  const handleDelete = async (id) => {
    if (!window.confirm('آیا از حذف این آزمون مطمئن هستید؟')) return
    try {
      const res = await fetch(`/api/teacher/exams?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('خطا در حذف آزمون')
      await fetchExams()
    } catch (err) {
      setError(err.message)
    }
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
          class_id: form.class_id, // اضافه شد
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
      maxWidth: 650,
      margin: "40px auto",
      background: "#f6fff7",
      borderRadius: 16,
      boxShadow: "0 2px 24px #4caf5022",
      padding: 32,
      border: "2px solid #43a047"
    }}>
      <h2 style={{
        textAlign: "center",
        marginBottom: 24,
        color: "#388e3c",
        fontWeight: "bold",
        letterSpacing: 1
      }}>مدیریت آزمون‌ها</h2>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <button
          onClick={() => setShowForm(true)}
          style={{
            background: "linear-gradient(90deg,#43a047,#66bb6a)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "12px 36px",
            fontSize: 19,
            cursor: "pointer",
            boxShadow: "0 2px 12px #43a04733",
            fontWeight: "bold",
            transition: "0.2s"
          }}
        >
          + ثبت آزمون جدید
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} style={{
          background: "#e8f5e9",
          borderRadius: 14,
          padding: 24,
          marginBottom: 32,
          boxShadow: "0 1px 12px #43a04722",
          border: "1.5px solid #a5d6a7",
          overflow: "hidden"
        }}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: "bold", color: "#388e3c" }}>عنوان آزمون:</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="مثلاً آزمون ریاضی نوبت اول"
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 8,
                border: "1.5px solid #a5d6a7",
                marginTop: 7,
                fontSize: 16,
                background: "#fff"
              }}
            />
          </div>
          {/* انتخاب کلاس */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: "bold", color: "#388e3c" }}>کلاس:</label>
            <select
              name="class_id"
              value={form.class_id}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 8,
                border: "1.5px solid #a5d6a7",
                marginTop: 7,
                fontSize: 16,
                background: "#fff"
              }}
              required
            >
              <option value="">انتخاب کلاس</option>
              {classesList.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: "bold", color: "#388e3c" }}>نوع آزمون:</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 8,
                border: "1.5px solid #a5d6a7",
                marginTop: 7,
                fontSize: 16,
                background: "#fff"
              }}
            >
              <option value="pdf">PDF</option>
              <option value="image">تصویری</option>
              <option value="quiz">تستی</option>
            </select>
          </div>
          {form.type === 'pdf' && (
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: "bold", color: "#388e3c" }}>فایل PDF آزمون:</label>
              <input
                type="file"
                name="file"
                accept="application/pdf"
                onChange={handleChange}
                style={{
                  marginTop: 7,
                  padding: 8,
                  borderRadius: 8,
                  border: "1.5px solid #a5d6a7",
                  background: "#fff"
                }}
              />
            </div>
          )}
          {form.type === 'image' && (
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: "bold", color: "#388e3c" }}>تصویر آزمون:</label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                style={{
                  marginTop: 7,
                  padding: 8,
                  borderRadius: 8,
                  border: "1.5px solid #a5d6a7",
                  background: "#fff"
                }}
              />
            </div>
          )}
          {form.type === 'quiz' && (
            <div style={{
              marginBottom: 18,
              background: "#f1f8e9",
              borderRadius: 10,
              padding: 12,
              border: "1.5px solid #c8e6c9",
              maxHeight: 350,
              overflowY: "auto"
            }}>
              <label style={{ fontWeight: "bold", color: "#388e3c" }}>سوالات تستی:</label>
              {form.questions.map((q, idx) => (
                <div key={idx} style={{
                  background: "#fff",
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 14,
                  border: "1.5px solid #a5d6a7",
                  boxShadow: "0 1px 4px #43a04711"
                }}>
                  <input
                    placeholder={`سوال ${idx + 1}`}
                    value={q.question}
                    onChange={e => handleQuestionChange(idx, 'question', e.target.value)}
                    style={{
                      width: "100%",
                      padding: 10,
                      borderRadius: 7,
                      border: "1.5px solid #a5d6a7",
                      marginBottom: 10,
                      fontSize: 15,
                      background: "#f9fff9"
                    }}
                  />
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 8,
                    marginBottom: 10
                  }}>
                    {q.options.map((opt, oIdx) => (
                      <input
                        key={oIdx}
                        placeholder={`گزینه ${oIdx + 1}`}
                        value={opt}
                        onChange={e => handleOptionChange(idx, oIdx, e.target.value)}
                        style={{
                          width: "100%",
                          minWidth: 0,
                          padding: 10,
                          borderRadius: 7,
                          border: "1.5px solid #a5d6a7",
                          fontSize: 15,
                          background: "#f9fff9"
                        }}
                      />
                    ))}
                  </div>
                  <select
                    value={q.answer}
                    onChange={e => handleQuestionChange(idx, 'answer', e.target.value)}
                    style={{
                      width: "100%",
                      padding: 10,
                      borderRadius: 7,
                      border: "1.5px solid #a5d6a7",
                      fontSize: 15,
                      background: "#f9fff9"
                    }}
                  >
                    <option value={0}>گزینه ۱ صحیح</option>
                    <option value={1}>گزینه ۲ صحیح</option>
                    <option value={2}>گزینه ۳ صحیح</option>
                    <option value={3}>گزینه ۴ صحیح</option>
                  </select>
                </div>
              ))}
              <button
                type="button"
                onClick={addQuestion}
                style={{
                  background: "linear-gradient(90deg,#43a047,#66bb6a)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 22px",
                  fontSize: 16,
                  cursor: "pointer",
                  marginTop: 4,
                  fontWeight: "bold",
                  boxShadow: "0 1px 6px #43a04722"
                }}
              >
                + افزودن سوال
              </button>
            </div>
          )}
          {error && <div style={{ color: '#c62828', marginBottom: 10, fontWeight: "bold" }}>{error}</div>}
          {success && <div style={{ color: '#388e3c', marginBottom: 10, fontWeight: "bold" }}>آزمون با موفقیت ثبت شد!</div>}
          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="submit"
              disabled={uploading}
              style={{
                background: "linear-gradient(90deg,#43a047,#66bb6a)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "12px 36px",
                fontSize: 18,
                cursor: uploading ? "not-allowed" : "pointer",
                flex: 1,
                fontWeight: "bold",
                boxShadow: "0 2px 8px #43a04733"
              }}
            >
              {uploading ? 'در حال ثبت...' : 'ثبت آزمون'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              style={{
                background: "#fff",
                color: "#43a047",
                border: "2px solid #43a047",
                borderRadius: 10,
                padding: "12px 36px",
                fontSize: 18,
                cursor: "pointer",
                flex: 1,
                fontWeight: "bold"
              }}
            >
              انصراف
            </button>
          </div>
        </form>
      )}
      <h3 style={{
        marginTop: 32,
        color: "#388e3c",
        fontWeight: "bold",
        letterSpacing: 1
      }}>لیست آزمون‌ها</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {exams.map(exam => (
          <li key={exam.id} style={{
            background: "#e8f5e9",
            borderRadius: 10,
            marginBottom: 14,
            padding: 18,
            boxShadow: "0 1px 8px #43a04711",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: "1.5px solid #a5d6a7"
          }}>
            <span style={{ fontWeight: "bold", color: "#388e3c" }}>{exam.title}</span>
            <span style={{
              background: "#43a047",
              color: "#fff",
              borderRadius: 7,
              padding: "5px 18px",
              fontSize: 15,
              fontWeight: "bold",
              marginLeft: 12
            }}>{exam.type === "pdf" ? "PDF" : exam.type === "image" ? "تصویری" : "تستی"}</span>
            <span style={{
              background: "#fff",
              color: "#43a047",
              border: "1px solid #43a047",
              borderRadius: 7,
              padding: "5px 14px",
              fontSize: 14,
              fontWeight: "bold",
              marginLeft: 12
            }}>
              {classesList.find(cls => cls.id == exam.class_id)?.name || "بدون کلاس"}
            </span>
            <button
              onClick={() => handleDelete(exam.id)}
              style={{
                background: "#c62828",
                color: "#fff",
                border: "none",
                borderRadius: 7,
                padding: "6px 18px",
                fontSize: 15,
                fontWeight: "bold",
                cursor: "pointer",
                marginRight: 8,
                transition: "0.2s"
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