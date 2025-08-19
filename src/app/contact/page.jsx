'use client'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-400 flex items-center justify-center py-12 px-4">
      <div className="relative max-w-2xl w-full bg-white/90 rounded-3xl shadow-2xl p-8 md:p-12 border border-green-200 overflow-hidden">
        {/* تزئینات سبز */}
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-gradient-to-br from-green-400 via-green-500 to-green-700 rounded-full opacity-20 blur-2xl"></div>
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-gradient-to-tr from-green-300 via-green-400 to-green-600 rounded-full opacity-20 blur-2xl"></div>
        {/* محتوای اصلی */}
        <div className="relative z-10 text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center shadow-lg mb-6">
            <span className="text-white text-4xl font-bold">ارتـ</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-green-600 via-green-500 to-green-700 bg-clip-text text-transparent mb-4">
            ارتباط با ما
          </h1>
          <p className="text-green-800 text-lg font-medium mb-8">
            برای ارتباط با ما فرم زیر را پر کنید یا اطلاعات تماس خود را وارد نمایید.
          </p>
          <form className="space-y-5 max-w-md mx-auto">
            <input
              type="text"
              placeholder="نام شما"
              className="w-full px-5 py-3 rounded-xl border border-green-200 bg-white/80 focus:ring-2 focus:ring-green-400 outline-none text-green-800 font-medium placeholder:text-green-400 transition-all duration-200"
            />
            <input
              type="email"
              placeholder="ایمیل شما"
              className="w-full px-5 py-3 rounded-xl border border-green-200 bg-white/80 focus:ring-2 focus:ring-green-400 outline-none text-green-800 font-medium placeholder:text-green-400 transition-all duration-200"
            />
            <textarea
              rows={4}
              placeholder="متن پیام شما..."
              className="w-full px-5 py-3 rounded-xl border border-green-200 bg-white/80 focus:ring-2 focus:ring-green-400 outline-none text-green-800 font-medium placeholder:text-green-400 transition-all duration-200 resize-none"
            />
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-700 text-white font-bold text-lg shadow-lg hover:from-green-600 hover:to-green-800 transition-all duration-200"
              disabled
            >
              ارسال پیام
            </button>
          </form>
          <div className="mt-8 flex flex-col items-center gap-2">
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-xl shadow font-bold text-base">
              مدرسه علم و هنر
            </span>
            <span className="text-green-600 text-sm">اطلاعات تماس و شبکه‌های اجتماعی را اینجا قرار دهید</span>
          </div>
        </div>
         </div>
    </div>
  );
}