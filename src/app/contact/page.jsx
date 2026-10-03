'use client'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-16 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* هدر صفحه */}
        <div className="text-center mb-8 md:mb-16">
          <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-[#399918] rounded-full mb-4 md:mb-6">
            <span className="text-white text-xl md:text-2xl">📞</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            ارتباط با ما
          </h1>
          <div className="w-16 h-0.5 bg-[#399918] mx-auto"></div>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-sm md:text-base px-4 md:px-0">
            برای دریافت اطلاعات بیشتر، ثبت‌نام یا هماهنگی بازدید از مدرسه، می‌توانید از راه‌های زیر با ما در تماس باشید
          </p>
        </div>

        {/* اطلاعات تماس */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-8 md:mb-12">
          
          {/* کارت آدرس */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📍</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-base md:text-lg mb-3">آدرس مدرسه</h3>
                <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                  خراسان شمالی، بجنورد
                  <br />
                  ابتدای ملاصدرا، نواب صفوی ۸
                  <br />
                </p>
                <button 
                  onClick={() => window.open('https://maps.google.com/?q=بجنورد+نواب+صفوی+نواب+18+پلاک+12', '_blank')}
                  className="mt-4 inline-flex items-center gap-2 text-[#399918] hover:text-green-700 font-medium text-sm transition-colors"
                >
                  <span>مشاهده در نقشه</span>
                  <span>🗺️</span>
                </button>
              </div>
            </div>
          </div>

          {/* کارت تلفن */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📞</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-base md:text-lg mb-3">شماره تماس</h3>
                <p className="text-lg md:text-2xl font-bold text-[#399918] mb-3 tracking-wider" dir="ltr">
                  ۰۹۰۳۵۲۵۹۳۹۷
                </p>
                <button 
                  onClick={() => window.open('tel:09035259397')}
                  className="inline-flex items-center gap-2 bg-[#399918] hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                >
                  <span>تماس فوری</span>
                  <span>📲</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* کارت اینستاگرام */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow mb-8 md:mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📸</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base md:text-lg mb-2">اینستاگرام</h3>
                <p className="text-base md:text-lg font-mono text-[#399918] mb-2">@elm.va.honar</p>
                <p className="text-gray-600 text-sm">
                  تصاویر روزانه فعالیت‌ها و اخبار مدرسه را در اینستاگرام ببینید
                </p>
              </div>
            </div>
            <button 
              onClick={() => window.open('https://instagram.com/elm.va.honar', '_blank')}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 text-sm md:text-base w-full sm:w-auto justify-center"
            >
              <span>دنبال کنید</span>
              <span>🚀</span>
            </button>
          </div>
        </div>

        {/* پیام پایانی */}
        <div className="bg-[#399918] rounded-2xl p-6 md:p-8 text-center">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
            منتظر شنیدن صدای شما هستیم
          </h2>
          <p className="text-green-100 leading-relaxed mb-6 text-sm md:text-base">
            ما با خوشحالی پاسخگوی پرسش‌های شما هستیم و منتظریم تا خانواده‌ی بزرگ علم و هنر را به شما معرفی کنیم
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="inline-flex items-center gap-2 bg-white text-[#399918] px-4 py-2 rounded-lg font-semibold text-sm">
              <span>مدرسه علم و هنر</span>
              <span className="text-lg">🏫</span>
            </div>
            <div className="text-green-100 text-sm">
              آماده پذیرایی از شما هستیم
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}