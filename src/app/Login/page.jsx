'use client'
import React, { useState } from 'react';
import { Eye, EyeOff, User, Lock, GraduationCap, Users, BookOpen, AlertCircle, X } from 'lucide-react';

export default function SchoolLoginPage({ onClose }) {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('student');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (!username || !password) {
        setError('لطفاً نام کاربری و رمز عبور را وارد کنید.');
        return;
      }
      console.log('Login successful:', { username, userType });
      onClose();
    } catch (err) {
      setError('خطا در ورود. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsLoading(false);
    }
  };

  const userTypes = [
    { id: 'student', label: 'دانش‌آموز', icon: GraduationCap },
    { id: 'teacher', label: 'معلم', icon: BookOpen },
    { id: 'admin', label: 'مدیریت', icon: Users }
  ];

  return (
    // به این بخش overflow-y-auto اضافه شده تا در صورت نیاز اسکرول فعال شود
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex justify-center items-start overflow-y-auto p-4 py-10 animate-fade-in">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-5 left-5 z-20 w-11 h-11 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="w-full max-w-md bg-gradient-to-br from-gray-50 to-slate-100 rounded-3xl shadow-2xl overflow-hidden relative z-10">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#399918] to-green-600 p-8 text-center relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
            <div className="relative">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl border-4 border-green-400/50">
                    <GraduationCap className="w-10 h-10 text-[#399918]" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-1">مدرسه علم و هنر</h1>
                <p className="text-white/80 text-sm font-medium">سامانه مدیریت آموزشی</p>
            </div>
        </div>

        {/* Form Section */}
        <div className="p-8">
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
                  placeholder="نام کاربری خود را وارد کنید"
                  dir="ltr"
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
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            {error && (
              <div className="flex items-center p-3 bg-red-50 border-l-4 border-red-400 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 ml-2" />
                <span className="text-sm text-red-700 font-medium">{error}</span>
              </div>
            )}
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-[#399918] border-gray-300 rounded focus:ring-[#399918]" />
                <span className="mr-2 text-sm text-gray-600">مرا به خاطر بسپار</span>
              </label>
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

          {/* Help Section */}
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
        </div>
      </div>
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}