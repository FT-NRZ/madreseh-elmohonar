'use client'
import React, { useState } from 'react';
import { ArrowRight, GraduationCap, User, Phone, Send, CheckCircle, Home } from 'lucide-react';
import Link from 'next/link';

export default function PreRegistrationPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    grade: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  // پایه‌های تحصیلی مدرسه
  const grades = [
    'اول ابتدایی',
    'دوم ابتدایی', 
    'سوم ابتدایی',
    'چهارم ابتدایی'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'نام خانوادگی الزامی است';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'شماره تماس الزامی است';
    } else if (!/^09\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'شماره تماس نامعتبر است';
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
      return;
    }
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSuccess(true);
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
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-400 flex items-center justify-center p-4">
        <div className="relative bg-white/90 rounded-3xl shadow-2xl w-full max-w-md p-8 text-center border border-green-200 overflow-hidden">
          <div className="absolute -top-16 -left-16 w-48 h-48 bg-gradient-to-br from-green-400 via-green-500 to-green-700 rounded-full opacity-20 blur-2xl"></div>
          <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-gradient-to-tr from-green-300 via-green-400 to-green-600 rounded-full opacity-20 blur-2xl"></div>
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-extrabold bg-gradient-to-r from-green-600 via-green-500 to-green-700 bg-clip-text text-transparent mb-4">ثبت نام موفق!</h3>
          <p className="text-green-800 mb-8 leading-relaxed font-medium">
            پیش ثبت نام شما با موفقیت انجام شد.<br />به زودی با شما تماس خواهیم گرفت.
          </p>
          <div className="flex flex-col gap-3">
            <Link 
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#399918] to-green-600 text-white px-6 py-3 rounded-xl font-bold hover:from-green-600 hover:to-[#399918] transition-all duration-300 shadow"
            >
              <Home className="w-5 h-5" />
              بازگشت به خانه
            </Link>
            <button
              onClick={resetForm}
              className="text-green-700 hover:text-[#399918] font-bold transition-colors"
            >
              ثبت نام جدید
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-400 flex flex-col">
      {/* Header */}
      <div className="bg-white/90 shadow-lg border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link 
              href="/"
              className="flex items-center gap-2 text-green-700 hover:text-[#399918] transition-colors font-bold"
            >
              <ArrowRight className="w-5 h-5" />
              بازگشت به خانه
            </Link>
            <div className="flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-[#399918]" />
              <h1 className="text-xl font-extrabold text-[#399918]">علم و هنر</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="relative max-w-2xl w-full bg-white/90 rounded-3xl shadow-2xl p-8 md:p-12 border border-green-200 overflow-hidden">
          {/* تزئینات سبز */}
          <div className="absolute -top-16 -left-16 w-48 h-48 bg-gradient-to-br from-green-400 via-green-500 to-green-700 rounded-full opacity-20 blur-2xl"></div>
          <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-gradient-to-tr from-green-300 via-green-400 to-green-600 rounded-full opacity-20 blur-2xl"></div>
          {/* Page Header */}
          <div className="text-center mb-10 relative z-10">
            <div className="w-20 h-20 bg-[#399918]/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow">
              <GraduationCap className="w-10 h-10 text-[#399918]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-green-600 via-green-500 to-green-700 bg-clip-text text-transparent mb-4">
              پیش ثبت نام مدرسه علم و هنر
            </h1>
            <p className="text-green-800 text-lg font-medium">
              برای ثبت نام فرزندتان در پایه‌های اول تا چهارم ابتدایی،<br />
              لطفاً اطلاعات زیر را تکمیل کنید
            </p>
          </div>
          {/* Form Card */}
          <form onSubmit={handleSubmit} className="space-y-7 relative z-10">
            {/* نام */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-green-700 mb-2">
                <User className="w-4 h-4" />
                نام دانش‌آموز *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={`w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-green-300/30 outline-none transition-all text-lg bg-white/80 font-medium placeholder:text-green-400 ${
                  errors.firstName 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-green-200 focus:border-[#399918]'
                }`}
                placeholder="نام فرزندتان را وارد کنید"
                style={{ direction: 'rtl' }}
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <span className="w-4 h-4 text-red-500">⚠</span>
                  {errors.firstName}
                </p>
              )}
            </div>
            {/* نام خانوادگی */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-green-700 mb-2">
                <User className="w-4 h-4" />
                نام خانوادگی *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={`w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-green-300/30 outline-none transition-all text-lg bg-white/80 font-medium placeholder:text-green-400 ${
                  errors.lastName 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-green-200 focus:border-[#399918]'
                }`}
                placeholder="نام خانوادگی فرزندتان را وارد کنید"
                style={{ direction: 'rtl' }}
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <span className="w-4 h-4 text-red-500">⚠</span>
                  {errors.lastName}
                </p>
              )}
            </div>
            {/* شماره تماس */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-green-700 mb-2">
                <Phone className="w-4 h-4" />
                شماره تماس والدین *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-green-300/30 outline-none transition-all text-lg bg-white/80 font-medium placeholder:text-green-400 ${
                  errors.phone 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-green-200 focus:border-[#399918]'
                }`}
                placeholder="مثال: 09123456789"
                style={{ direction: 'ltr', textAlign: 'right' }}
                maxLength="11"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <span className="w-4 h-4 text-red-500">⚠</span>
                  {errors.phone}
                </p>
              )}
            </div>
            {/* پایه تحصیلی */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-green-700 mb-2">
                <GraduationCap className="w-4 h-4" />
                پایه تحصیلی مورد نظر *
              </label>
              <div className="relative">
                <select
                  value={formData.grade}
                  onChange={(e) => handleInputChange('grade', e.target.value)}
                  className={`w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-green-300/30 outline-none transition-all text-lg appearance-none bg-white/80 font-medium text-green-800 placeholder:text-green-400 ${
                    errors.grade 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-green-200 focus:border-[#399918]'
                  }`}
                  style={{ direction: 'rtl' }}
                >
                  <option value="">پایه تحصیلی را انتخاب کنید</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
                {/* آیکون فلش */}
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {errors.grade && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <span className="w-4 h-4 text-red-500">⚠</span>
                  {errors.grade}
                </p>
              )}
            </div>
            {/* دکمه ثبت */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#399918] to-green-600 text-white py-4 px-8 rounded-2xl font-extrabold text-lg hover:from-green-600 hover:to-[#399918] transition-all duration-300 flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    در حال ثبت اطلاعات...
                  </>
                ) : (
                  <>
                    <Send className="w-6 h-6" />
                    ثبت درخواست پیش ثبت نام
                  </>
                )}
              </button>
            </div>
            {/* راهنما */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mt-8 shadow-sm">
              <h4 className="font-bold text-green-700 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                نکات مهم:
              </h4>
              <ul className="text-green-700 text-sm space-y-2 leading-relaxed">
                <li>• پس از ثبت درخواست، کارشناسان ما در اسرع وقت با شما تماس خواهند گرفت</li>
                <li>• مدرسه علم و هنر پذیرای دانش‌آموزان پایه‌های اول تا چهارم ابتدایی است</li>
              </ul>
            </div>
          </form>
        </div>
      </div>
    </div>
     );
}