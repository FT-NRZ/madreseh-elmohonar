'use client';
import React, { useState, useEffect } from 'react';
import { ArrowRight, GraduationCap, User, Phone, Send, CheckCircle, Home } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function PreRegistrationPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    grade: ''
  });

  const [grades, setGrades] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  // دریافت لیست پایه‌ها
  useEffect(() => {
    async function fetchGrades() {
      try {
        const response = await fetch('/api/grades', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.grades)) {
            setGrades(data.grades);
          }
        }
      } catch (error) {
        console.error('خطا در دریافت پایه‌ها:', error);
        // لیست پیش‌فرض
        setGrades([
          { id: 1, grade_name: 'اول ابتدایی' },
          { id: 2, grade_name: 'دوم ابتدایی' },
          { id: 3, grade_name: 'سوم ابتدایی' },
          { id: 4, grade_name: 'چهارم ابتدایی' },
          { id: 5, grade_name: 'پنجم ابتدایی' },
          { id: 6, grade_name: 'ششم ابتدایی' }
        ]);
      }
    }
    fetchGrades();
  }, []);

  const sanitizeInput = (input) => {
    return input
      .replace(/[<>\"'&]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 50);
  };

  const isValidPersianName = (name) => {
    const persianNameRegex = /^[آ-ی\s]+$/;
    return name.length >= 2 && name.length <= 50 && persianNameRegex.test(name);
  };

  const isValidIranianPhone = (phone) => {
    const cleanPhone = phone.replace(/[-\s]/g, '');
    const iranMobileRegex = /^09(0[1-5]|1[0-9]|3[0-9]|2[0-2]|9[0-9])\d{7}$/;
    return iranMobileRegex.test(cleanPhone) && cleanPhone.length === 11;
  };

  const handleInputChange = (field, value) => {
    let cleanValue = value;
    
    if (field === 'firstName' || field === 'lastName') {
      cleanValue = sanitizeInput(value);
    } else if (field === 'phone') {
      cleanValue = value.replace(/[^0-9]/g, '').substring(0, 11);
    }
    
    setFormData(prev => ({ ...prev, [field]: cleanValue }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'نام الزامی است';
    } else if (!isValidPersianName(formData.firstName)) {
      newErrors.firstName = 'نام باید فقط شامل حروف فارسی باشد (2-50 کاراکتر)';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'نام خانوادگی الزامی است';
    } else if (!isValidPersianName(formData.lastName)) {
      newErrors.lastName = 'نام خانوادگی باید فقط شامل حروف فارسی باشد (2-50 کاراکتر)';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'شماره تماس الزامی است';
    } else if (!isValidIranianPhone(formData.phone)) {
      newErrors.phone = 'شماره تماس نامعتبر است (فقط شماره‌های موبایل ایرانی)';
    }
    
    if (!formData.grade) {
      newErrors.grade = 'انتخاب پایه تحصیلی الزامی است';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('لطفاً همه فیلدها را به درستی پر کنید');
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch('/api/pre-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          grade_id: parseInt(formData.grade), // ارسال ID عددی
          phone: formData.phone.trim()
        })
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'خطا در ثبت اطلاعات');
      }

      toast.success('پیش‌ثبت‌نام با موفقیت انجام شد!');
      setIsSuccess(true);
    } catch (error) {
      toast.error(error.message || 'خطا در ثبت اطلاعات');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ firstName: '', lastName: '', phone: '', grade: '' });
    setErrors({});
    setIsSuccess(false);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center border border-green-100">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-green-700 mb-3">ثبت نام موفق!</h3>
          <p className="text-gray-600 mb-6 text-sm">
            درخواست شما ثبت شد.<br />به زودی تماس می‌گیریم.
          </p>
          <div className="space-y-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition w-full"
            >
              <Home className="w-4 h-4" />
              بازگشت به خانه
            </Link>
            <button
              onClick={resetForm}
              className="text-green-600 hover:text-green-700 font-medium text-sm"
            >
              ثبت نام جدید
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-green-600 hover:text-green-700 transition font-medium"
            >
              <ArrowRight className="w-4 h-4" />
              بازگشت
            </Link>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-green-600" />
              <span className="font-bold text-green-700">علم و هنر</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center py-8 px-4">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 border border-green-100">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <GraduationCap className="w-6 h-6 text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-green-700 mb-2">پیش ثبت نام</h1>
            <p className="text-gray-600 text-sm">اطلاعات فرزندتان را وارد کنید</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* نام */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <User className="w-4 h-4 text-green-600" />
                نام *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none transition ${
                  errors.firstName ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="نام فرزندتان"
                style={{ direction: 'rtl' }}
                maxLength="50"
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>

            {/* نام خانوادگی */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <User className="w-4 h-4 text-green-600" />
                نام خانوادگی *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none transition ${
                  errors.lastName ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="نام خانوادگی"
                style={{ direction: 'rtl' }}
                maxLength="50"
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
              )}
            </div>

            {/* شماره تماس */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Phone className="w-4 h-4 text-green-600" />
                شماره تماس *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none transition ${
                  errors.phone ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="09123456789"
                style={{ direction: 'ltr', textAlign: 'right' }}
                maxLength="11"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            {/* پایه تحصیلی */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <GraduationCap className="w-4 h-4 text-green-600" />
                پایه تحصیلی *
              </label>
              <select
                value={formData.grade}
                onChange={(e) => handleInputChange('grade', e.target.value)}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none transition ${
                  errors.grade ? 'border-red-300' : 'border-gray-200'
                }`}
                style={{ direction: 'rtl' }}
              >
                <option value="">انتخاب پایه</option>
                {grades.map(grade => (
                  <option key={grade.id} value={grade.id}>
                    {grade.grade_name}
                  </option>
                ))}
              </select>
              {errors.grade && (
                <p className="text-red-500 text-xs mt-1">{errors.grade}</p>
              )}
            </div>

            {/* دکمه ثبت */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  در حال ثبت...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  ثبت درخواست
                </>
              )}
            </button>

            <div className="bg-green-50 border border-green-100 rounded-lg p-3 mt-4">
              <p className="text-green-700 text-xs text-center">
                پس از ثبت درخواست، کارشناسان ما با شما تماس خواهند گرفت
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}