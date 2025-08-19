'use client'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-400 flex items-center justify-center py-12 px-4">
      <div className="relative max-w-2xl w-full bg-white/90 rounded-3xl shadow-2xl p-8 md:p-12 border border-green-200 overflow-hidden">
        {/* سبزهای تزئینی */}
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-gradient-to-br from-green-400 via-green-500 to-green-700 rounded-full opacity-20 blur-2xl"></div>
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-gradient-to-tr from-green-300 via-green-400 to-green-600 rounded-full opacity-20 blur-2xl"></div>
        {/* محتوای اصلی */}
        <div className="relative z-10 text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center shadow-lg mb-6">
            <span className="text-white text-4xl font-bold">مـ</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-green-600 via-green-500 to-green-700 bg-clip-text text-transparent mb-4">
            درباره ما
          </h1>
          <p className="text-green-800 text-lg font-medium mb-6">
            این بخش درباره ماست. شما می‌توانید متن دلخواه خود را اینجا قرار دهید.
          </p>
          <div className="flex flex-col items-center gap-2">
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-xl shadow font-bold text-base">
              مدرسه علم و هنر
            </span>
            <span className="text-green-600 text-sm">نسخه آزمایشی</span>
          </div>
        </div>
      </div>
    </div>
  );
  }