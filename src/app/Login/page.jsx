'use client'
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, User, Lock, GraduationCap, Users, BookOpen, AlertCircle, X, Phone, ArrowLeft, MessageCircle } from 'lucide-react';

export default function SchoolLoginPage({ onClose }) {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('student');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  // استیت‌های مربوط به فراموشی رمز عبور
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPhone, setForgotPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [showVerificationStep, setShowVerificationStep] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // ریدایرکت اگر قبلاً لاگین شده بود
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        if (user.role === 'admin') {
          window.location.href = '/admin/dashboard';
        } else if (user.role === 'teacher') {
          window.location.href = '/teacher/dashboard';
        } else {
          window.location.href = '/student/dashboard';
        }
      } catch {
        // اگر اطلاعات خراب بود، هیچ کاری نکن
      }
    }
  }, []);

  // تایمر شمارش معکوس
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // تابع اصلی لاگین
  const handleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      if (!username || !password) {
        setError('لطفاً نام کاربری و رمز عبور را وارد کنید.');
        setIsLoading(false);
        return;
      }
      if (!userType) {
        setError('لطفاً نوع کاربری خود را انتخاب کنید.');
        setIsLoading(false);
        return;
      }
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
          userType: userType
        }),
      });
      const data = await response.json();
      if (data.success && data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (onClose) onClose();
        if (data.user.role === 'admin') {
          window.location.href = '/admin/dashboard';
        } else if (data.user.role === 'teacher') {
          window.location.href = '/teacher/dashboard';
        } else {
          window.location.href = '/student/dashboard';
        }
      } else {
        setError(data.message || 'خطا در ورود به سامانه');
      }
    } catch (err) {
      setError('خطا در ارتباط با سرور');
    } finally {
      setIsLoading(false);
    }
  };

  // تابع ارسال کد تایید برای فراموشی رمز
  const handleSendVerificationCode = async () => {
    setIsResetLoading(true);
    setResetMessage('');
    try {
      if (!forgotPhone) {
        setResetMessage('لطفاً شماره موبایل خود را وارد کنید.');
        setIsResetLoading(false);
        return;
      }
      if (!/^09\d{9}$/.test(forgotPhone)) {
        setResetMessage('شماره موبایل نامعتبر است. (مثال: 09123456789)');
        setIsResetLoading(false);
        return;
      }
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: forgotPhone,
          userType: userType
        }),
      });
      const data = await response.json();
      if (data.success) {
        setShowVerificationStep(true);
        setCountdown(120);
        setResetMessage('کد تایید به شماره شما ارسال شد.');
      } else {
        setResetMessage(data.message || 'خطا در ارسال کد تایید.');
      }
    } catch (err) {
      setResetMessage('خطا در ارسال کد. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsResetLoading(false);
    }
  };

  // تابع تایید کد و بازیابی رمز
  const handleVerifyCode = async () => {
    setIsResetLoading(true);
    setResetMessage('');
    try {
      if (!verificationCode) {
        setResetMessage('لطفاً کد تایید را وارد کنید.');
        setIsResetLoading(false);
        return;
      }
      if (verificationCode.length !== 6) {
        setResetMessage('کد تایید باید 6 رقم باشد.');
        setIsResetLoading(false);
        return;
      }
      const response = await fetch('/api/auth/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: forgotPhone,
          verificationCode: verificationCode,
          userType: userType
        }),
      });
      const data = await response.json();
      if (data.success) {
        setResetMessage('کد تایید شد! رمز عبور جدید به شماره شما ارسال خواهد شد.');
        setTimeout(() => {
          resetForgotPasswordForm();
        }, 3000);
      } else {
        setResetMessage(data.message || 'کد تایید نامعتبر است.');
      }
    } catch (err) {
      setResetMessage('خطا در تایید کد. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsResetLoading(false);
    }
  };

  // تابع ارسال مجدد کد
  const handleResendCode = async () => {
    if (countdown > 0) return;
    setIsResetLoading(true);
    try {
      const response = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: forgotPhone,
          userType: userType
        }),
      });
      const data = await response.json();
      if (data.success) {
        setCountdown(120);
        setResetMessage('کد تایید مجدداً ارسال شد.');
      } else {
        setResetMessage(data.message || 'خطا در ارسال مجدد کد.');
      }
    } catch (err) {
      setResetMessage('خطا در ارسال مجدد کد.');
    } finally {
      setIsResetLoading(false);
    }
  };

  // تابع ریست کردن فرم فراموشی رمز
  const resetForgotPasswordForm = () => {
    setShowForgotPassword(false);
    setShowVerificationStep(false);
    setResetMessage('');
    setForgotPhone('');
    setVerificationCode('');
    setCountdown(0);
  };

  // تابع مدیریت کلید Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (!showForgotPassword) {
        handleLogin();
      } else if (!showVerificationStep) {
        handleSendVerificationCode();
      } else {
        handleVerifyCode();
      }
    }
  };

  const userTypes = [
    { id: 'student', label: 'دانش‌آموز', icon: GraduationCap },
    { id: 'teacher', label: 'معلم', icon: BookOpen },
    { id: 'admin', label: 'مدیریت', icon: Users }
  ];

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex justify-center items-start overflow-y-auto p-4 py-10 animate-fade-in">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-5 left-5 z-20 w-11 h-11 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
      >
        <X className="w-6 h-6" />
      </button>

      <div 
        className="w-full max-w-md bg-gradient-to-br from-gray-50 to-slate-100 rounded-3xl shadow-2xl overflow-hidden relative z-10"
        onKeyPress={handleKeyPress}
      >
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#399918] to-green-600 p-8 text-center relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
            <div className="relative">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl border-4 border-green-400/50">
                    {showForgotPassword ? (
                      <MessageCircle className="w-10 h-10 text-[#399918]" />
                    ) : (
                      <GraduationCap className="w-10 h-10 text-[#399918]" />
                    )}
                </div>
                <h1 className="text-2xl font-bold text-white mb-1">مدرسه علم و هنر</h1>
                <p className="text-white/80 text-sm font-medium">
                  {showForgotPassword ? 'بازیابی رمز عبور' : 'سامانه مدیریت آموزشی'}
                </p>
            </div>
        </div>

        {/* Form Section */}
        <div className="p-8">
          {!showForgotPassword ? (
            // فرم ورود اصلی
            <>
              {/* User Type Selection */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-3 text-center">نوع کاربری خود را انتخاب کنید</p>
                <div className="grid grid-cols-3 gap-3">
                  {userTypes.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setUserType(type.id)}
                        className={`p-3 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
                          userType === type.id
                            ? 'border-[#399918] bg-green-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <IconComponent className={`w-6 h-6 mx-auto mb-2 transition-colors ${
                          userType === type.id ? 'text-[#399918]' : 'text-gray-400'
                        }`} />
                        <span className={`text-xs font-bold ${
                          userType === type.id ? 'text-[#399918]' : 'text-gray-600'
                        }`}>
                          {type.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Login Form */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">نام کاربری</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pr-10 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#399918] focus:border-[#399918] outline-none transition-all duration-200 text-right placeholder-gray-400"
                      placeholder="نام کاربری یا کد ملی خود را وارد کنید"
                      dir="ltr"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">رمز عبور</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pr-10 pl-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#399918] focus:border-[#399918] outline-none transition-all duration-200 text-right placeholder-gray-400"
                      placeholder="رمز عبور خود را وارد کنید"
                      dir="ltr"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                {error && (
                  <div className="flex items-center p-3 bg-red-50 border-l-4 border-red-400 rounded-lg animate-shake">
                    <AlertCircle className="w-5 h-5 text-red-500 ml-2 flex-shrink-0" />
                    <span className="text-sm text-red-700 font-medium">{error}</span>
                  </div>
                )}
                
                {/* یادآوری و فراموشی رمز */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-[#399918] border-gray-300 rounded focus:ring-[#399918]"
                      disabled={isLoading}
                    />
                    <span className="mr-2 text-sm text-gray-600">مرا به خاطر بسپار</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-[#399918] hover:text-green-700 font-medium hover:underline transition-colors disabled:opacity-50"
                    disabled={isLoading}
                  >
                    فراموشی رمز عبور؟
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#399918] to-green-600 hover:from-green-700 hover:to-green-800 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.03] shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                      <span>در حال ورود...</span>
                    </div>
                  ) : (
                    'ورود به سامانه'
                  )}
                </button>
              </div>
            </>
          ) : (
            // فرم فراموشی رمز عبور
            <>
              {!showVerificationStep ? (
                // مرحله اول: وارد کردن شماره موبایل
                <>
                  <div className="mb-6 text-center">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Phone className="w-8 h-8 text-orange-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">فراموشی رمز عبور</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      شماره موبایل خود را وارد کنید تا کد تایید برای شما ارسال شود.
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">شماره موبایل</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          value={forgotPhone}
                          onChange={(e) => setForgotPhone(e.target.value)}
                          className="w-full pr-10 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-200 text-right placeholder-gray-400"
                          placeholder="09123456789"
                          dir="ltr"
                          maxLength="11"
                          disabled={isResetLoading}
                        />
                      </div>
                    </div>

                    {resetMessage && (
                      <div className={`flex items-center p-3 rounded-lg border-l-4 ${
                        resetMessage.includes('ارسال شد') 
                          ? 'bg-green-50 border-green-400' 
                          : 'bg-red-50 border-red-400'
                      }`}>
                        <AlertCircle className={`w-5 h-5 ml-2 ${
                          resetMessage.includes('ارسال شد') ? 'text-green-500' : 'text-red-500'
                        }`} />
                        <span className={`text-sm font-medium ${
                          resetMessage.includes('ارسال شد') ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {resetMessage}
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleSendVerificationCode}
                      disabled={isResetLoading}
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.03] shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isResetLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                          <span>در حال ارسال...</span>
                        </div>
                      ) : (
                        'ارسال کد تایید'
                      )}
                    </button>
                  </div>
                </>
              ) : (
                // مرحله دوم: وارد کردن کد تایید
                <>
                  <div className="mb-6 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">تایید کد</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      کد تایید 6 رقمی که به شماره 
                      <span className="font-bold text-gray-800 mx-1">{forgotPhone}</span>
                      ارسال شد را وارد کنید.
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">کد تایید</label>
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-center text-2xl font-bold tracking-widest placeholder-gray-400"
                        placeholder="000000"
                        maxLength="6"
                        disabled={isResetLoading}
                      />
                    </div>

                    {resetMessage && (
                      <div className={`flex items-center p-3 rounded-lg border-l-4 ${
                        resetMessage.includes('تایید شد') || resetMessage.includes('ارسال شد')
                          ? 'bg-green-50 border-green-400' 
                          : 'bg-red-50 border-red-400'
                      }`}>
                        <AlertCircle className={`w-5 h-5 ml-2 ${
                          resetMessage.includes('تایید شد') || resetMessage.includes('ارسال شد') ? 'text-green-500' : 'text-red-500'
                        }`} />
                        <span className={`text-sm font-medium ${
                          resetMessage.includes('تایید شد') || resetMessage.includes('ارسال شد') ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {resetMessage}
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleVerifyCode}
                      disabled={isResetLoading}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.03] shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isResetLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                          <span>در حال تایید...</span>
                        </div>
                      ) : (
                        'تایید کد'
                      )}
                    </button>

                    {/* ارسال مجدد کد */}
                    <div className="text-center">
                      {countdown > 0 ? (
                        <p className="text-sm text-gray-600">
                          ارسال مجدد کد تا 
                          <span className="font-bold text-orange-600 mx-1">{formatTime(countdown)}</span>
                          دیگر
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendCode}
                          disabled={isResetLoading}
                          className="text-sm text-orange-600 hover:text-orange-700 font-medium hover:underline transition-colors disabled:opacity-50"
                        >
                          ارسال مجدد کد
                        </button>
                      )}
                    </div>

                    {/* تغییر شماره */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowVerificationStep(false);
                        setVerificationCode('');
                        setResetMessage('');
                        setCountdown(0);
                      }}
                      className="w-full text-center py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors text-sm"
                      disabled={isResetLoading}
                    >
                      تغییر شماره موبایل
                    </button>
                  </div>
                </>
              )}

              <button
                type="button"
                onClick={resetForgotPasswordForm}
                className="w-full flex items-center justify-center py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors mt-5"
                disabled={isResetLoading}
              >
                <ArrowLeft className="w-4 h-4 ml-2" />
                <span>بازگشت به صفحه ورود</span>
              </button>
            </>
          )}

          {/* Help Section - فقط در صفحه ورود اصلی نمایش داده می‌شود */}
          {!showForgotPassword && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 ml-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-800 mb-1">راهنمای ورود</h4>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      نام کاربری و رمز عبور شما توسط ادمین مدرسه تعیین شده است. در صورت مشکل با دفتر مدرسه تماس بگیرید.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
          20%, 40%, 60%, 80% { transform: translateX(3px); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}