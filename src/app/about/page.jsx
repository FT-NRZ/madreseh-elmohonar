'use client'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* هدر کوچک و شیک */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#399918] rounded-full mb-6">
            <span className="text-white text-2xl">🏫</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            درباره مدرسه علم و هنر
          </h1>
          <div className="w-16 h-0.5 bg-[#399918] mx-auto"></div>
        </div>

        {/* متن معرفی */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-12 border border-gray-100">
          <p className="text-lg text-gray-700 leading-relaxed text-center font-medium">
            مدرسه ما با نگاهی نوین به آموزش و پرورش، محیطی ایمن، شاد و پویا را برای رشد همه‌جانبه‌ی کودکان فراهم کرده است.
            <br />
            <span className="text-[#399918] font-semibold">اینجا جایی است که آرامش والدین و شادی فرزندان در کنار هم معنا پیدا می‌کند.</span>
          </p>
        </div>

        {/* ویژگی‌های کوچک و منظم */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">⏳</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">هماهنگ با والدین</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              ساعت‌های کاری منطبق با نیازهای والدین شاغل
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">کارگاه‌های تخصصی</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              آموزش کامپیوتر، آشپزی، هنر، خوشنویسی و تئاتر
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🎒</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">بدون تکلیف خانگی</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              تمام آموزش‌ها در مدرسه، زمان بیشتر برای خانواده
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🍽️</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">تغذیه سالم</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              وعده‌های غذایی تازه و متناسب با سن کودکان
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-pink-50 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">👩‍🏫</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">کادر متخصص</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              معلمان جوان، مجرب و به‌روز با روش‌های نوین
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">فضای شخصی</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              کمد اختصاصی برای هر دانش‌آموز و احترام به حریم
            </p>
          </div>

        </div>

        {/* پیام نهایی ساده و کلاسیک */}
        <div className="bg-[#399918] rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            اینجا‌ واقعا خانه دوم فرزندان شماست

          </h2>
          <p className="text-green-100 leading-relaxed mb-4">
            جایی برای کشف استعدادها، ساختن دوستی‌های پایدار و تجربه‌ی لذت واقعی یادگیری
          </p>
          <div className="inline-flex items-center gap-2 bg-white text-[#399918] px-4 py-2 rounded-lg font-semibold text-sm">
            <span>مدرسه علم و هنر</span>
            <span className="text-lg">✨</span>
          </div>
        </div>

      </div>
    </div>
  );
}