'use client'
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowRight, Calendar, Clock, BookOpen, Target, CheckCircle2,
  Star, ChevronUp, Award, MapPin
} from 'lucide-react';

export default function WorkshopDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  const workshops = {
    '1': {
      id: 1,
      name: 'ورزش',
      icon: '🏃‍♂️',
      description: 'کارگاه ورزش برای تقویت آمادگی جسمانی',
      color: 'from-green-500 to-emerald-500',
      location: 'سالن ورزشی'
    },
    '2': {
      id: 2,
      name: 'کامپیوتر', 
      icon: '💻',
      description: 'آموزش کامپیوتر و برنامه‌نویسی',
      color: 'from-green-600 to-green-500',
      location: 'آزمایشگاه کامپیوتر'
    },
    '3': {
      id: 3,
      name: 'هنر',
      icon: '🎨', 
      description: 'کارگاه هنر و خلاقیت',
      color: 'from-emerald-600 to-green-500',
      location: 'اتاق هنر'
    },
    '4': {
      id: 4,
      name: 'آشپزی',
      icon: '👨‍🍳', 
      description: 'کارگاه آشپزی و تغذیه سالم',
      color: 'from-green-500 to-green-600',
      location: 'آشپزخانه آموزشی'
    },
    '5': {
      id: 5,
      name: 'تئاتر',
      icon: '🎭', 
      description: 'آموزش بازیگری و بیان از طریق تئاتر',
      color: 'from-emerald-500 to-green-600',
      location: 'سالن تئاتر'
    },
    '6': {
      id: 6,
      name: 'خوشنویسی',
      icon: '✍️', 
      description: 'یادگیری هنر خوشنویسی و تقویت دست‌خط',
      color: 'from-green-600 to-emerald-600',
      location: 'کلاس خوشنویسی'
    },
    '7': {
      id: 7,
      name: 'شاهنامه‌خوانی',
      icon: '📜',
      description: 'آموزش هنر زیبای شاهنامه‌خوانی',
      color: 'from-green-700 to-green-500',
      location: 'کلاس ادبیات'
    }
  };

  const workshop = workshops[params.workshopId];

  if (!workshop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-green-100 max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">😕</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-3">کارگاه یافت نشد</h1>
          <p className="text-gray-600 mb-6 text-sm">کارگاه مورد نظر شما وجود ندارد</p>
          <button 
            onClick={() => router.push('/workshops')}
            className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors font-medium"
          >
            بازگشت به لیست کارگاه‌ها
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-br from-green-300 via-green-500 to-green-600 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-32 h-32 bg-white/10 rounded-full animate-pulse delay-700"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Back Button */}
          <button
            onClick={() => router.push('/workshops')}
            className="flex items-center text-white/90 hover:text-white mb-8 transition-colors bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl"
          >
            <ArrowRight className="w-5 h-5 ml-2" />
            <span className="font-light md:font-medium">بازگشت به لیست کارگاه‌ها</span>
          </button>

          <div className="flex flex-col md:flex-row items-center gap-8 text-white">
            {/* Icon */}
            <div className={`w-24 hidden md:flex h-24 bg-gradient-to-br ${workshop.color} rounded-2xl flex items-center justify-center shadow-2xl border border-white/20`}>
              <span className="text-4xl">{workshop.icon}</span>
            </div>

            {/* Title */}
            <div className="flex-1 text-center md:text-right">
              <h1 className="text-3xl md:text-4xl font-bold mb-3 drop-shadow-lg">
                کارگاه {workshop.name}
              </h1>
              <p className="text-white/90 text-lg mb-4">
                {workshop.description}
              </p>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 border border-white/30">
                  <span className="text-sm font-medium">{workshop.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* About Workshop */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-500 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mr-3">درباره کارگاه</h2>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <p className="text-gray-700 leading-7 text-sm">
                    {getWorkshopFullDescription(workshop.name)}
                  </p>
                </div>
              </div>

              {/* What You'll Learn */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-500 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mr-3">چه چیزهایی یاد می‌گیرید؟</h2>
                </div>
                <div className="space-y-3">
                  {getWorkshopLearnings(workshop.name).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-green-50 rounded-xl p-3 border border-green-100 hover:border-green-300 transition-colors">
                      <div className="w-5 h-5 bg-gradient-to-br from-green-600 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-gray-800 text-sm leading-6">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Workshop Info */}
              <div className="bg-gradient-to-br from-green-600 via-green-500 to-emerald-500 rounded-2xl p-6 shadow-lg text-white sticky top-8">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
                  <Calendar className="w-5 h-5" />
                  اطلاعات کارگاه
                </h3>
                <div className="space-y-4">
                  <div className="bg-white/15 rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">روزهای برگزاری</span>
                    </div>
                    <p className="font-bold">شنبه تا چهارشنبه</p>
                  </div>
                  <div className="bg-white/15 rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">زمان برگزاری</span>
                    </div>
                    <p className="font-bold">14:30 - 16:00</p>
                  </div>
                  <div className="bg-white/15 rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-3 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm font-medium">مکان برگزاری</span>
                    </div>
                    <p className="font-bold">{workshop.location}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll to Top Button */}
      {isMounted && (
        <button 
          onClick={scrollToTop}
          className={`fixed bottom-8 left-8 w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-500 rounded-full shadow-lg flex items-center justify-center text-white z-40 transition-all duration-300 hover:shadow-xl hover:scale-110 ${
            isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
          }`}
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}

// متن‌های کامل کارگاه‌ها (کوتاه‌تر شده)
function getWorkshopFullDescription(name) {
  const descriptions = {
    'ورزش': 'در کارگاه ورزش، دانش‌آموزان با انواع بازی‌ها و تمرینات ورزشی، آمادگی جسمانی خود را تقویت می‌کنند. این کارگاه شامل آموزش ورزش‌های گروهی، تقویت تعادل و چابکی، و پرورش روحیه کار تیمی است.',
    
    'کامپیوتر': 'کارگاه کامپیوتر شامل آموزش کار با رایانه، تایپ، مدیریت فایل و برنامه‌نویسی با اسکرچ است. دانش‌آموزان یاد می‌گیرند چگونه بازی و داستان‌های تعاملی بسازند و تفکر منطقی خود را تقویت کنند.',
    
    'هنر': 'در کارگاه هنر، کودکان با انواع مواد هنری کار می‌کنند و خلاقیت خود را بروز می‌دهند. این کارگاه شامل نقاشی، کاردستی، و آموزش تکنیک‌های مختلف هنری برای بیان احساسات و ایده‌ها است.',
    
    'آشپزی': 'کارگاه آشپزی به کودکان اصول تغذیه سالم، آشنایی با مواد غذایی، و تکنیک‌های پایه آشپزی را آموزش می‌دهد. در این کارگاه بهداشت، خلاقیت در تزیین غذا و کار تیمی تقویت می‌شود.',
    
    'تئاتر': 'کارگاه تئاتر به تقویت اعتماد به نفس، بیان کلامی و بازیگری کمک می‌کند. دانش‌آموزان یاد می‌گیرند چگونه احساسات خود را از طریق بازی نقش بیان کنند و مهارت‌های ارتباطی خود را تقویت کنند.',
    
    'خوشنویسی': 'در کارگاه خوشنویسی، دانش‌آموزان با اصول و تکنیک‌های خوشنویسی آشنا می‌شوند. این کارگاه تمرکز، دقت، صبر و زیبایی نوشتار را تقویت می‌کند و حس نظم و توجه به جزئیات را پرورش می‌دهد.',
    
    'شاهنامه‌خوانی': 'کارگاه شاهنامه‌خوانی دانش‌آموزان را با زیبایی زبان فارسی و داستان‌های حماسی شاهنامه فردوسی آشنا می‌کند. این کارگاه شیوه صحیح خواندن اشعار، آشنایی با فرهنگ و ادب ایران، و تقویت اعتماد به نفس در بیان مقابل جمع را به دانش‌آموزان می‌آموزد.'
  };
  return descriptions[name] || 'توضیحات کارگاه';
}

function getWorkshopLearnings(name) {
  const learnings = {
    'ورزش': [
      'تقویت آمادگی جسمانی و سلامت',
      'یادگیری مهارت‌های تعادل و چابکی', 
      'افزایش سرعت و استقامت',
      'پرورش روحیه کار تیمی'
    ],
    'کامپیوتر': [
      'یادگیری کار با رایانه',
      'برنامه‌نویسی با اسکرچ', 
      'ساخت بازی و داستان',
      'تقویت تفکر منطقی'
    ],
    'هنر': [
      'کار با مواد هنری مختلف',
      'یادگیری تکنیک‌های نقاشی',
      'ساخت کاردستی‌های خلاقانه',
      'بیان احساسات از طریق هنر'
    ],
    'آشپزی': [
      'یادگیری اصول تغذیه سالم',
      'آشنایی با مواد غذایی',
      'آموزش تکنیک‌های آشپزی',
      'رعایت اصول بهداشت'
    ],
    'تئاتر': [
      'تقویت اعتماد به نفس',
      'یادگیری بازیگری',
      'تمرین تمرکز و توجه',
      'بیان احساسات از طریق نقش'
    ],
    'خوشنویسی': [
      'یادگیری اصول خوشنویسی',
      'تقویت دقت و تمرکز',
      'بهبود زیبایی دست‌خط',
      'تقویت حس نظم'
    ],
    'شاهنامه‌خوانی': [
      'آشنایی با داستان‌های شاهنامه فردوسی',
      'تقویت زیبایی زبان فارسی',
      'آشنایی با فرهنگ و ادب ایران',
      'تقویت اعتماد به نفس در بیان مقابل جمع'
    ]
  };
  return learnings[name] || ['مهارت‌های عملی'];
}