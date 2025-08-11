'use client'
import React from 'react';
import { Phone, Mail, MapPin, Instagram, Clock, Users, GraduationCap, Map, ExternalLink } from 'lucide-react';

export default function SchoolFooter() {
  return (
    <footer className="bg-gradient-to-br from-gray-50 to-gray-100 w-full z-10">
      {/* Hero Section */}
      <div className="w-full bg-gradient-to-br from-[#399918] to-[#2d7a13] py-16">
        <div className="container mx-auto px-6 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <GraduationCap className="w-8 h-8 text-[#399918]" />
          </div>
          <h1 className="text-xl font-bold text-white mb-3">
            مدرسه پسرانه غیر دولتی علم و هنر
          </h1>
          <p className="text-white/90 mb-4 text-sm">
            دوره اول دبستان - اول تا چهارم
          </p>
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 border border-white/30">
            <Users className="w-5 h-5 ml-2 text-white" />
            <span className="text-white font-bold text-sm">اولین مدرسه بدون کیف در بجنورد</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid with Cards */}
      <div className="w-full py-16">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
            
            {/* Contact Information Card */}
            <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[#399918] to-[#2d7a13] rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">اطلاعات تماس</h3>
              </div>
              
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-center mb-2">
                    <Phone className="w-4 h-4 text-[#399918] ml-2" />
                    <p className="text-xs text-gray-600 font-medium">شماره تماس</p>
                  </div>
                  <p className="text-sm font-bold text-gray-800 text-center direction-ltr">09035259397</p>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-center mb-2">
                    <Mail className="w-4 h-4 text-blue-600 ml-2" />
                    <p className="text-xs text-gray-600 font-medium">آدرس ایمیل</p>
                  </div>
                  <p className="text-sm font-bold text-gray-800 text-center direction-ltr">info@elmvahonar.edu.ir</p>
                </div>
                
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-center mb-2">
                    <MapPin className="w-4 h-4 text-orange-600 ml-2" />
                    <p className="text-xs text-gray-600 font-medium">نشانی</p>
                  </div>
                  <p className="text-sm font-bold text-gray-800 leading-5 text-center">
                    خراسان شمالی، بجنورد<br />
                    خیابان نواب صفوی، نواب ۱۸، پلاک ۱۲
                  </p>
                </div>
              </div>
            </div>

            {/* Working Hours & Social Card */}
            <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[#399918] to-[#2d7a13] rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">ساعات کاری</h3>
              </div>
              
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 mb-6 border border-gray-200">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                    <span className="font-bold text-gray-800 text-sm">شنبه تا چهارشنبه</span>
                    <span className="font-bold text-[#399918] bg-green-100 px-3 py-1 rounded-md border border-green-200 text-xs">۸:۰۰ - ۱۴:۳۰</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                    <span className="font-bold text-gray-800 text-sm">پنج‌شنبه</span>
                    <span className="font-bold text-red-600 bg-red-100 px-3 py-1 rounded-md border border-red-200 text-xs">تعطیل</span>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <a 
                  href="#" 
                  className="inline-flex items-center bg-gradient-to-r from-[#399918] to-[#2d7a13] hover:from-[#2d7a13] hover:to-[#1f5a0e] rounded-lg px-6 py-4 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border border-green-700"
                >
                  <Instagram className="w-5 h-5 text-white ml-2" />
                  <div className="text-right">
                    <p className="text-white font-bold text-sm">دنبال کنید</p>
                    <p className="text-white/90 text-xs">@elm.va.honar</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 md:col-span-2 lg:col-span-1">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[#399918] to-[#2d7a13] rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Map className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">موقعیت مکانی</h3>
              </div>
              
              <div className="space-y-4">
                <div className="rounded-xl overflow-hidden shadow-lg border-2 border-gray-200 hover:border-[#399918] transition-all duration-300">
                  <img 
                    src="/photos/naghshe.png"    
                    alt="نقشه مدرسه علم و هنر" 
                    className="w-full h-32 object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
                
                <div className="text-center">
                  <a 
                    href="https://maps.app.goo.gl/fUvmXQK65KkW8K4p6" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-gradient-to-r from-[#399918] to-[#2d7a13] hover:from-[#2d7a13] hover:to-[#1f5a0e] rounded-lg px-6 py-4 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border border-green-700"
                  >
                    <MapPin className="w-5 h-5 text-white ml-2" />
                    <span className="text-white font-bold text-sm">مشاهده در گوگل مپ</span>
                    <ExternalLink className="w-4 h-4 text-white mr-2" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="bg-gradient-to-r from-[#399918] to-[#2d7a13] py-4">
        
      </div>
    </footer>
  );
}