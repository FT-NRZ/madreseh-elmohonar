'use client'
import React from 'react';
import { Phone, Mail, MapPin, Instagram, Clock, Users, GraduationCap, Map, ExternalLink } from 'lucide-react';

export default function SchoolFooter() {
  return (
    <footer className="bg-white w-full">
      {/* Hero Section */}
      <div className="w-full bg-gradient-to-br from-[#399918] to-[#2d7a13] py-16">
        <div className="container mx-auto px-6 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
            <GraduationCap className="w-8 h-8 text-[#399918]" />
          </div>
          <h1 className="text-xl font-bold text-white mb-3">
            مدرسه پسرانه غیر دولتی علم و هنر
          </h1>
          <p className="text-white/90 mb-4 text-base">
            دوره اول دبستان - اول تا چهارم
          </p>
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 border border-white/30">
            <Users className="w-5 h-5 ml-3 text-white" />
            <span className="text-white font-semibold">اولین مدرسه بدون کیف در بجنورد</span>
          </div>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="w-full py-12 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
          
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="w-full py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            
            {/* Contact Information */}
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-[#399918] to-[#2d7a13] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Phone className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-8">اطلاعات تماس</h3>
              
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-center mb-2">
                    <Phone className="w-4 h-4 text-[#399918] ml-2" />
                    <p className="text-xs text-gray-500 font-medium">شماره تماس</p>
                  </div>
                  <p className="text-base font-bold text-gray-800 direction-ltr">09035259397</p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-center mb-2">
                    <Mail className="w-4 h-4 text-[#399918] ml-2" />
                    <p className="text-xs text-gray-500 font-medium">آدرس ایمیل</p>
                  </div>
                  <p className="text-base font-bold text-gray-800 direction-ltr">info@elmvahonar.edu.ir</p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-center mb-2">
                    <MapPin className="w-4 h-4 text-[#399918] ml-2" />
                    <p className="text-xs text-gray-500 font-medium">نشانی</p>
                  </div>
                  <p className="text-sm font-bold text-gray-800 leading-6">
                    خراسان شمالی، بجنورد<br />
                    خیابان نواب صفوی، نواب ۱۸، پلاک ۱۲
                  </p>
                </div>
              </div>
            </div>

            {/* Working Hours & Social */}
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-[#399918] to-[#2d7a13] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-8">ساعات کاری</h3>
              
              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-200 last:border-0">
                    <span className="font-semibold text-gray-800">شنبه تا چهارشنبه</span>
                    <span className="font-bold text-[#399918] bg-green-50 px-3 py-1 rounded-lg">۸:۰۰ - ۱۴:۳۰</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="font-semibold text-gray-800">پنج‌شنبه</span>
                    <span className="font-bold text-red-500 bg-red-50 px-3 py-1 rounded-lg">تعطیل</span>
                  </div>
                </div>
              </div>
              
              <a 
                href="#" 
                className="inline-flex items-center bg-gradient-to-r from-[#399918] to-[#2d7a13] hover:from-[#2d7a13] hover:to-[#1f5a0e] rounded-xl px-6 py-4 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Instagram className="w-5 h-5 text-white ml-3" />
                <div className="text-right">
                  <p className="text-white font-bold">دنبال کنید</p>
                  <p className="text-white/90 text-sm">@elm.va.honar</p>
                </div>
              </a>
            </div>

            {/* Location */}
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-[#399918] to-[#2d7a13] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Map className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-8">موقعیت مکانی</h3>
              
              <div className="space-y-6">
                <div className="rounded-2xl overflow-hidden shadow-xl mx-auto border-4 border-gray-100">
                  <img 
                    src="/photos/naghshe.png"    
                    alt="نقشه مدرسه علم و هنر" 
                    className="w-full h-40 object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
                
                <a 
                  href="https://maps.app.goo.gl/fUvmXQK65KkW8K4p6" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-gradient-to-r from-[#399918] to-[#2d7a13] hover:from-[#2d7a13] hover:to-[#1f5a0e] rounded-xl px-6 py-4 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <MapPin className="w-5 h-5 text-white ml-3" />
                  <span className="text-white font-bold">مشاهده در گوگل مپ</span>
                  <ExternalLink className="w-4 h-4 text-white mr-2" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

    
      {/* Bottom Accent */}
      <div className="w-full h-1 bg-gradient-to-r from-[#399918] to-[#2d7a13]"></div>
    </footer>
  );
}