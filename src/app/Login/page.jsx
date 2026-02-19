'use client'
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, User, Lock, GraduationCap, Users, BookOpen, AlertCircle, X, Phone, ArrowLeft, MessageCircle, Shield } from 'lucide-react';

export default function SchoolLoginPage({ onClose }) {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('student');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotPhone, setForgotPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [showVerificationStep, setShowVerificationStep] = useState(false);
  const [countdown, setCountdown] = useState(0);

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
          window.location.href = '/';
        } else if (data.user.role === 'teacher') {
          window.location.href = '/';
        } else {
          window.location.href = '/';
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

  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    } else {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = '/';
      }
    }
  };

  const userTypes = [
    { id: 'student', label: 'دانش‌آموز', icon: GraduationCap, color: 'blue' },
    { id: 'teacher', label: 'معلم', icon: BookOpen, color: 'green' },
    { id: 'admin', label: 'مدیریت', icon: Users, color: 'purple' }
  ];


  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex justify-center items-center p-2 sm:p-4">
      {/* Close Button */}
      <button
        type="button"
        onClick={handleClose}
        className="absolute top-2 left-2 sm:top-6 sm:left-6 z-20 w-9 h-9 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 group"
      >
        <X className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      <div 
        className="w-full max-w-6xl max-h-[95vh] sm:h-[700px] bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden relative flex flex-col lg:flex-row"
        onKeyPress={handleKeyPress}
      >
        {/* Header Section - Mobile Only */}
        <div className="lg:hidden w-full bg-gradient-to-r from-emerald-400 via-green-500 to-green-600 relative overflow-hidden py-4 px-4">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute top-1 right-1 w-12 h-12 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-1 left-1 w-8 h-8 bg-white/10 rounded-full blur-lg"></div>
          </div>
          
          <div className="relative z-10 text-center text-white">
            {/* Logo */}
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center mx-auto mb-2 shadow-xl border border-white/30">          
                <GraduationCap className="w-6 h-6 text-white" />
            </div>
            
            {/* Title */}
            <h1 className="text-lg font-black mb-1 tracking-tight">
              مدرسه علم و هنر
            </h1>
            <div className="w-8 h-0.5 bg-white/60 rounded-full mx-auto mb-1"></div>
          </div>
        </div>

        {/* Right Section - Desktop Only */}
        <div className="hidden lg:block w-1/2 bg-gradient-to-br from-emerald-400 via-green-500 to-green-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute top-20 right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute top-1/2 right-10 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          </div>
          
          <div className="relative z-10 h-full flex flex-col justify-center items-center text-white p-12 text-center">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mb-8 shadow-2xl border border-white/30">

                <GraduationCap className="w-12 h-12 text-white" />
            </div>
            
            <h1 className="text-5xl font-black mb-4 tracking-tight">
              مدرسه علم و هنر
            </h1>
            <div className="w-16 h-1 bg-white/60 rounded-full mb-6"></div>
            
          </div>
        </div>

        {/* Form Section */}
        <div className="flex-1 lg:w-1/2 bg-gradient-to-br from-gray-50 to-white relative overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 min-h-0 flex flex-col justify-center">
              <>
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">خوش آمدید! 👋</h2>
                </div>

                {/* User Type Selection */}
                <div className="mb-4 sm:mb-5">
                  <p className="text-xs font-bold text-gray-800 mb-2">نوع کاربری</p>
                  <div className="grid grid-cols-3 gap-2">
                    {userTypes.map((type) => {
                      const IconComponent = type.icon;
                      return (
                        <button
                          key={type.id}
                          onClick={() => setUserType(type.id)}
                          className={`p-2.5 rounded-lg border-2 transition-all duration-300 ${
                            userType === type.id
                              ? `border-${type.color}-500 bg-${type.color}-50 shadow-lg`
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <IconComponent className={`w-5 h-5 mx-auto mb-1 ${
                            userType === type.id ? `text-${type.color}-600` : 'text-gray-400'
                          }`} />
                          <span className={`text-xs font-bold block ${
                            userType === type.id ? `text-${type.color}-700` : 'text-gray-600'
                          }`}>
                            {type.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Login Form */}
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1">نام کاربری</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pr-10 pl-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none transition-all duration-200 text-right placeholder-gray-400 text-sm bg-white"
                        placeholder="نام کاربری یا کد ملی"
                        dir="ltr"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1">رمز عبور</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pr-10 pl-12 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none transition-all duration-200 text-right placeholder-gray-400 text-sm bg-white"
                        placeholder="رمز عبور"
                        dir="ltr"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  {error && (
                    <div className="flex items-start p-2.5 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 ml-2 flex-shrink-0" />
                      <span className="text-xs text-red-700 font-medium">{error}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleLogin}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-2.5 px-6 rounded-lg transition-all duration-300 shadow-lg disabled:opacity-60 text-sm"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                        <span>در حال ورود...</span>
                      </div>
                    ) : (
                      'ورود به سامانه'
                    )}
                  </button>
                </div>

                {/* Help Section - فقط در دسکتاپ */}
                <div className="mt-4 sm:mt-5 pt-3 border-t border-gray-200 hidden sm:block">
                  <div className="bg-blue-50 rounded-lg p-2.5 border border-blue-100">
                    <div className="flex items-start">
                      <AlertCircle className="w-3.5 h-3.5 text-blue-500 mt-0.5 ml-2 flex-shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-blue-800 mb-0.5">راهنمای ورود</h4>
                        <p className="text-[11px] text-blue-700 leading-relaxed">
                          نام کاربری و رمز عبور توسط ادمین مدرسه تعیین شده است.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
          

          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
          20%, 40%, 60%, 80% { transform: translateX(3px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}