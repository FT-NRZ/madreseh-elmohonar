'use client'
import React, { useState, useEffect } from 'react';
import { Shield, Database, CheckCircle, XCircle, AlertCircle, Eye, EyeOff, ArrowRight, Home } from 'lucide-react';

export default function SetupPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [adminCreated, setAdminCreated] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // بررسی وضعیت اولیه
  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    try {
      // تست اتصال دیتابیس
      const dbResponse = await fetch('/api/auth/test');
      const dbData = await dbResponse.json();
      setConnectionStatus(dbData.database === 'connected');

      // بررسی وجود ادمین
      const adminResponse = await fetch('/api/admin/check');
      if (adminResponse.ok) {
        const adminData = await adminResponse.json();
        setAdminCreated(adminData.hasAdmin);
        if (adminData.hasAdmin) {
          setStep(3); // اگر ادمین وجود دارد، به مرحله نهایی بروید
        }
      }
    } catch (error) {
      console.error('Error checking system status:', error);
      setConnectionStatus(false);
    }
  };

  const testDatabaseConnection = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/test');
      const data = await response.json();
      
      if (data.database === 'connected') {
        setConnectionStatus(true);
        setStep(2);
      } else {
        setConnectionStatus(false);
        setError('اتصال به دیتابیس برقرار نشد. لطفاً تنظیمات دیتابیس را بررسی کنید.');
      }
    } catch (error) {
      setConnectionStatus(false);
      setError('خطا در ارتباط با سرور. لطفاً اطمینان حاصل کنید که سرور در حال اجرا است.');
    } finally {
      setIsLoading(false);
    }
  };

  const createAdminUser = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setAdminCredentials(data.credentials);
        setAdminCreated(true);
        setStep(3);
      } else {
        setError(data.message || 'خطا در ایجاد مدیر سیستم');
      }
    } catch (error) {
      setError('خطا در ایجاد مدیر سیستم. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // نمایش پیام کپی شدن
      const originalText = event.target.textContent;
      event.target.textContent = '✓ کپی شد';
      setTimeout(() => {
        event.target.textContent = originalText;
      }, 2000);
    });
  };

  const goToLogin = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">مدرسه علم و هنر</h1>
          <p className="text-gray-600">راه‌اندازی اولیه سیستم مدیریت آموزشی</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-center items-center space-x-4 rtl:space-x-reverse">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  step >= stepNumber 
                    ? 'bg-green-500 text-white shadow-lg transform scale-110' 
                    : step === stepNumber - 1
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > stepNumber ? <CheckCircle className="w-5 h-5" /> : stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-16 h-1 mx-2 transition-all duration-300 ${
                    step > stepNumber ? 'bg-green-500' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-full shadow-sm">
              مرحله {step} از 3
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Step 1: Database Connection */}
          {step === 1 && (
            <div className="p-8">
              <div className="text-center mb-6">
                <Database className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">بررسی اتصال دیتابیس</h2>
                <p className="text-gray-600">ابتدا باید اتصال به دیتابیس PostgreSQL را بررسی کنیم</p>
              </div>

              {connectionStatus === null && (
                <div className="text-center">
                  <button
                    onClick={testDatabaseConnection}
                    disabled={isLoading}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                        در حال بررسی...
                      </>
                    ) : (
                      <>
                        <Database className="w-5 h-5 ml-2" />
                        تست اتصال دیتابیس
                      </>
                    )}
                  </button>
                </div>
              )}

              {connectionStatus === true && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-green-800 mb-2">✅ اتصال موفق</h3>
                  <p className="text-green-700 mb-4">دیتابیس با موفقیت متصل شد</p>
                  <button
                    onClick={() => setStep(2)}
                    className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    ادامه به مرحله بعد
                    <ArrowRight className="w-5 h-5 mr-2" />
                  </button>
                </div>
              )}

              {connectionStatus === false && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-red-800 mb-2">❌ خطا در اتصال</h3>
                  <p className="text-red-700 mb-4">اتصال به دیتابیس برقرار نشد</p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4 text-right">
                    <h4 className="font-semibold text-yellow-800 mb-2">راهنمای رفع مشکل:</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• PostgreSQL نصب و اجرا شده باشد</li>
                      <li>• اطلاعات دیتابیس در فایل .env.local صحیح باشد</li>
                      <li>• دیتابیس madreseh-elmohonar ایجاد شده باشد</li>
                      <li>• رمز عبور PostgreSQL صحیح باشد</li>
                    </ul>
                  </div>
                  <button
                    onClick={testDatabaseConnection}
                    disabled={isLoading}
                    className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-all duration-300"
                  >
                    تلاش مجدد
                  </button>
                </div>
              )}

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 ml-2" />
                    <span className="text-red-700">{error}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Create Admin */}
          {step === 2 && (
            <div className="p-8">
              <div className="text-center mb-6">
                <Shield className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">ایجاد مدیر سیستم</h2>
                <p className="text-gray-600">حالا باید حساب مدیر اولیه را برای مدیریت سیستم ایجاد کنیم</p>
              </div>

              {!adminCreated && (
                <div className="text-center">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                    <h3 className="font-semibold text-blue-800 mb-2">اطلاعات مدیر پیش‌فرض:</h3>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p><strong>نام:</strong> مدیر سیستم</p>
                      <p><strong>کد ملی:</strong> 1234567890</p>
                      <p><strong>رمز عبور:</strong> admin123</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={createAdminUser}
                    disabled={isLoading}
                    className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                        در حال ایجاد...
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5 ml-2" />
                        ایجاد مدیر سیستم
                      </>
                    )}
                  </button>
                </div>
              )}

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 ml-2" />
                    <span className="text-red-700">{error}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Setup Complete */}
          {step === 3 && (
            <div className="p-8">
              <div className="text-center mb-6">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">🎉 راه‌اندازی کامل شد!</h2>
                <p className="text-gray-600">سیستم مدیریت مدرسه با موفقیت راه‌اندازی شد</p>
              </div>

              {adminCredentials && (
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-6 mb-6">
                  <div className="flex items-center mb-4">
                    <AlertCircle className="w-5 h-5 text-yellow-600 ml-2" />
                    <h3 className="font-semibold text-yellow-800">اطلاعات ورود مدیر سیستم</h3>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-yellow-200">
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">نام کاربری:</span>
                        <div className="flex items-center">
                          <code className="bg-gray-100 px-2 py-1 rounded text-gray-800">
                            {adminCredentials.username}
                          </code>
                          <button
                            onClick={(e) => copyToClipboard(adminCredentials.username)}
                            className="mr-2 text-blue-600 hover:text-blue-800 text-xs"
                          >
                            کپی
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">رمز عبور:</span>
                        <div className="flex items-center">
                          <code className="bg-gray-100 px-2 py-1 rounded text-gray-800">
                            {showPassword ? adminCredentials.password : '********'}
                          </code>
                          <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="mr-2 text-gray-600 hover:text-gray-800"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={(e) => copyToClipboard(adminCredentials.password)}
                            className="mr-1 text-blue-600 hover:text-blue-800 text-xs"
                          >
                            کپی
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">نقش:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded text-gray-800">
                          {adminCredentials.role}
                        </code>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-red-50 rounded border border-red-200">
                    <p className="text-xs text-red-700">
                      ⚠️ <strong>مهم:</strong> این اطلاعات را در جای امن نگهداری کنید و بعد از ورود، رمز عبور را تغییر دهید.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">مراحل بعدی:</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>✓ ورود به سیستم با اطلاعات بالا</li>
                    <li>✓ تغییر رمز عبور پیش‌فرض</li>
                    <li>✓ ایجاد کاربران جدید (دانش‌آموزان و معلمان)</li>
                    <li>✓ تنظیم کلاس‌ها و دروس</li>
                  </ul>
                </div>

                <div className="text-center">
                  <button
                    onClick={goToLogin}
                    className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <Home className="w-5 h-5 ml-2" />
                    ورود به سیستم
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>سیستم مدیریت آموزشی مدرسه علم و هنر</p>
          <p className="mt-1">نسخه 1.0.0</p>
        </div>
      </div>
    </div>
  );
}