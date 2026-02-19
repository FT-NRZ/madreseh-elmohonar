'use client';
import React, { useState, useEffect } from 'react';
import { ArrowRight, GraduationCap, User, Phone, Send, CheckCircle, Home, Shield } from 'lucide-react';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

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
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeLeft, setBlockTimeLeft] = useState(0);

  // محدودیت تلاش
  const MAX_ATTEMPTS = 3;
  const BLOCK_DURATION = 15 * 60 * 1000; // 15 دقیقه

  // تشخیص بلاک شدن
  useEffect(() => {
    const lastBlockTime = localStorage.getItem('preRegBlockTime');
    const attemptCount = parseInt(localStorage.getItem('preRegAttempts') || '0');
    
    if (lastBlockTime) {
      const blockTime = parseInt(lastBlockTime);
      const timeLeft = blockTime + BLOCK_DURATION - Date.now();
      
      if (timeLeft > 0) {
        setIsBlocked(true);
        setBlockTimeLeft(Math.ceil(timeLeft / 1000));
        
        const timer = setInterval(() => {
          const newTimeLeft = blockTime + BLOCK_DURATION - Date.now();
          if (newTimeLeft <= 0) {
            setIsBlocked(false);
            setBlockTimeLeft(0);
            localStorage.removeItem('preRegBlockTime');
            localStorage.removeItem('preRegAttempts');
            clearInterval(timer);
          } else {
            setBlockTimeLeft(Math.ceil(newTimeLeft / 1000));
          }
        }, 1000);
        
        return () => clearInterval(timer);
      } else {
        localStorage.removeItem('preRegBlockTime');
        localStorage.removeItem('preRegAttempts');
      }
    }
    
    setAttempts(attemptCount);
  }, []);

  // دریافت لیست پایه‌ها
  useEffect(() => {
    async function fetchGrades() {
      try {
        const response = await fetch('/api/grades', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.grades)) {
            setGrades(data.grades.map(g => g.grade_name));
          }
        }
      } catch (error) {
        console.error('خطا در دریافت پایه‌ها:', error);
        // استفاده از لیست پیش‌فرض در صورت خطا
        setGrades([
          'اول ابتدایی', 'دوم ابتدایی', 'سوم ابتدایی', 
          'چهارم ابتدایی', 'پنجم ابتدایی', 'ششم ابتدایی'
        ]);
      }
    }
    fetchGrades();
  }, []);

  // تنظیف ورودی از کاراکترهای خطرناک
  const sanitizeInput = (input) => {
    return input
      .replace(/[<>\"'&]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 50);
  };

  // اعتبارسنجی نام فارسی
  const isValidPersianName = (name) => {
    const persianNameRegex = /^[آ-ی\s]+$/;
    return name.length >= 2 && name.length <= 50 && persianNameRegex.test(name);
  };

  // اعتبارسنجی شماره موبایل ایرانی
  const isValidIranianPhone = (phone) => {
    const cleanPhone = phone.replace(/[-\s]/g, '');
    const iranMobileRegex = /^09(0[1-5]|1[0-9]|3[0-9]|2[0-2]|9[0-9])\d{7}$/;
    return iranMobileRegex.test(cleanPhone) && cleanPhone.length === 11;
  };

  const handleInputChange = (field, value) => {
    let cleanValue = value;
    
    // تنظیف ورودی
    if (field === 'firstName' || field === 'lastName') {
      cleanValue = sanitizeInput(value);
    } else if (field === 'phone') {
      cleanValue = value.replace(/[^0-9]/g, '').substring(0, 11);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: cleanValue
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
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
    } else if (!grades.includes(formData.grade)) {
      newErrors.grade = 'پایه تحصیلی نامعتبر است';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isBlocked) {
      toast.error(`شما به مدت ${Math.ceil(blockTimeLeft / 60)} دقیقه مسدود شده‌اید`);
      return;
    }
    
    if (!validateForm()) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem('preRegAttempts', newAttempts.toString());
      
      if (newAttempts >= MAX_ATTEMPTS) {
        setIsBlocked(true);
        const blockTime = Date.now();
        localStorage.setItem('preRegBlockTime', blockTime.toString());
        setBlockTimeLeft(BLOCK_DURATION / 1000);
        toast.error('به دلیل تلاش‌های نافرجام زیاد، 15 دقیقه مسدود شدید');
        return;
      }
      
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
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          grade: formData.grade,
          phone: formData.phone.trim()
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        toast.success('پیش‌ثبت‌نام با موفقیت انجام شد!');
        setIsSuccess(true);
        // پاک کردن تلاش‌های ناموفق
        localStorage.removeItem('preRegAttempts');
        localStorage.removeItem('preRegBlockTime');
        setAttempts(0);
      } else {
        throw new Error(result.error || 'خطا در ثبت اطلاعات');
      }
    } catch (error) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem('preRegAttempts', newAttempts.toString());
      
      if (newAttempts >= MAX_ATTEMPTS) {
        setIsBlocked(true);
        const blockTime = Date.now();
        localStorage.setItem('preRegBlockTime', blockTime.toString());
        setBlockTimeLeft(BLOCK_DURATION / 1000);
        toast.error('به دلیل تلاش‌های نافرجام زیاد، 15 دقیقه مسدود شدید');
      } else {
        toast.error(error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      phone: '',
      grade: ''
    });
    setErrors({});
    setIsSuccess(false);
    setAttempts(0);
    localStorage.removeItem('preRegAttempts');
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <Toaster position="top-center" />
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
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#374151',
            fontSize: '14px',
            fontWeight: '500',
            padding: '16px 20px',
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }
        }}
      />

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
          {/* Page Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <GraduationCap className="w-6 h-6 text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-green-700 mb-2">
              پیش ثبت نام
            </h1>
            <p className="text-gray-600 text-sm">
              اطلاعات فرزندتان را وارد کنید
            </p>

            {/* نمایش وضعیت امنیتی */}
            {(attempts > 0 || isBlocked) && (
              <div className={`mt-3 p-3 rounded-lg border ${
                isBlocked 
                  ? 'bg-red-50 border-red-200 text-red-700' 
                  : 'bg-yellow-50 border-yellow-200 text-yellow-700'
              }`}>
                <div className="flex items-center gap-2 justify-center">
                  <Shield className="w-4 h-4" />
                  {isBlocked ? (
                    <span className="text-sm">
                      مسدود شده - {Math.floor(blockTimeLeft / 60)}:{String(blockTimeLeft % 60).padStart(2, '0')} باقی‌مانده
                    </span>
                  ) : (
                    <span className="text-sm">
                      {MAX_ATTEMPTS - attempts} تلاش باقی‌مانده
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Form */}
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
                disabled={isBlocked || isSubmitting}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.firstName
                    ? 'border-red-300'
                    : 'border-gray-200'
                }`}
                placeholder="نام فرزندتان"
                style={{ direction: 'rtl' }}
                maxLength="50"
                autoComplete="given-name"
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
                disabled={isBlocked || isSubmitting}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.lastName
                    ? 'border-red-300'
                    : 'border-gray-200'
                }`}
                placeholder="نام خانوادگی"
                style={{ direction: 'rtl' }}
                maxLength="50"
                autoComplete="family-name"
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
                disabled={isBlocked || isSubmitting}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.phone
                    ? 'border-red-300'
                    : 'border-gray-200'
                }`}
                placeholder="09123456789"
                style={{ direction: 'ltr', textAlign: 'right' }}
                maxLength="11"
                autoComplete="tel"
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
                disabled={isBlocked || isSubmitting}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.grade
                    ? 'border-red-300'
                    : 'border-gray-200'
                }`}
                style={{ direction: 'rtl' }}
              >
                <option value="">انتخاب پایه</option>
                {grades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
              {errors.grade && (
                <p className="text-red-500 text-xs mt-1">{errors.grade}</p>
              )}
            </div>

            {/* دکمه ثبت */}
            <button
              type="submit"
              disabled={isSubmitting || isBlocked}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  در حال ثبت...
                </>
              ) : isBlocked ? (
                <>
                  <Shield className="w-4 h-4" />
                  مسدود شده
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  ثبت درخواست
                </>
              )}
            </button>

            {/* راهنما */}
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