'use client'
import React from 'react';
import { Phone, Mail, MapPin, Instagram, Clock, GraduationCap, Map, ExternalLink, Heart, Award, BookOpen } from 'lucide-react';

export default function SchoolFooter() {
  return (
    <footer className="bg-white w-full z-10 border-t-4 border-[#399918]">
      {/* Top Decorative Wave */}
      <div className="w-full h-1.5 bg-gradient-to-r from-[#399918] via-[#4db526] to-[#399918]"></div>
      
      {/* Hero Section with Overlay Pattern */}
      <div className="relative w-full bg-gradient-to-br from-[#2d7a13] via-[#399918] to-[#4db526] py-12 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          {/* Logo Badge */}
          <div className="inline-block mb-4 relative">
            <div className="absolute inset-0 bg-white/20 rounded-full blur-xl"></div>
            <div className="relative w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl ring-4 ring-white/50">
              <GraduationCap className="w-8 h-8 text-[#399918]" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-black text-white mb-3 drop-shadow-lg">
            مدرسه پسرانه غیر دولتی علم و هنر
          </h1>
          
          {/* Subtitle */}
          <div className="inline-flex items-center bg-white/95 backdrop-blur-md rounded-full px-6 py-2 mb-3 shadow-lg border border-white/50">
            <BookOpen className="w-4 h-4 ml-2 text-[#399918]" />
            <span className="text-gray-800 font-bold text-sm">دوره اول دبستان - اول تا چهارم</span>
          </div>

          {/* Award Badge */}
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center bg-amber-500/20 backdrop-blur-sm rounded-full px-5 py-2 border-2 border-amber-400/50 shadow-md">
              <Award className="w-4 h-4 ml-2 text-amber-300" />
              <span className="text-white font-bold text-xs">اولین مدرسه بدون کیف در بجنورد</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Elegant Cards */}
      <div className="w-full py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Contact Card */}
            <div className="group">
              <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-500 border border-gray-100 h-full relative overflow-hidden">
                {/* Decorative Corner */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#399918]/10 to-transparent rounded-bl-full"></div>
                
                <div className="relative">
                  {/* Header */}
                  <div className="flex items-center mb-6">
                    <div className="w-11 h-11 bg-gradient-to-br from-[#399918] to-[#4db526] rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-gray-800 mr-3">اطلاعات تماس</h3>
                  </div>
                  
                  {/* Contact Items */}
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-r-4 border-[#399918] hover:shadow-sm transition-all duration-300 hover:translate-x-1">
                      <div className="flex items-center mb-1">
                        <Phone className="w-4 h-4 text-[#399918] ml-2" />
                        <p className="text-xs text-gray-600 font-semibold">شماره تماس</p>
                      </div>
                      <p className="text-base font-black text-gray-800 direction-ltr">۰۹۰۳۵۲۵۹۳۹۷</p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border-r-4 border-blue-500 hover:shadow-sm transition-all duration-300 hover:translate-x-1">
                      <div className="flex items-center mb-1">
                        <Mail className="w-4 h-4 text-blue-600 ml-2" />
                        <p className="text-xs text-gray-600 font-semibold">آدرس ایمیل</p>
                      </div>
                      <p className="text-base font-black text-gray-800 direction-ltr break-all">info@elmvahonar.edu.ir</p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border-r-4 border-orange-500 hover:shadow-sm transition-all duration-300 hover:translate-x-1">
                      <div className="flex items-center mb-1">
                        <MapPin className="w-4 h-4 text-orange-600 ml-2" />
                        <p className="text-xs text-gray-600 font-semibold">نشانی</p>
                      </div>
                      <p className="text-sm font-bold text-gray-800 leading-6">
                        خراسان شمالی، بجنورد<br />
                        خیابان نواب صفوی، نواب ۱۸، پلاک ۱۲
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Working Hours & Social Card */}
            <div className="group">
              <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-500 border border-gray-100 h-full relative overflow-hidden">
                {/* Decorative Corner */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-[#399918]/10 to-transparent rounded-br-full"></div>
                
                <div className="relative">
                  {/* Header */}
                  <div className="flex items-center mb-6">
                    <div className="w-11 h-11 bg-gradient-to-br from-[#399918] to-[#4db526] rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-gray-800 mr-3">ساعات کاری</h3>
                  </div>
                  
                  {/* Schedule */}
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 mb-6 border border-gray-200 shadow-inner">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border-r-4 border-[#399918] hover:shadow-md transition-all">
                        <span className="font-bold text-gray-800 text-sm">شنبه تا چهارشنبه</span>
                        <span className="font-black text-[#399918] bg-green-100 px-3 py-1.5 rounded-lg border border-green-300 text-sm">۸:۰۰ - ۱۴:۳۰</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border-r-4 border-red-500 hover:shadow-md transition-all">
                        <span className="font-bold text-gray-800 text-sm">پنج‌شنبه و جمعه</span>
                        <span className="font-black text-red-600 bg-red-100 px-3 py-1.5 rounded-lg border border-red-300 text-sm">تعطیل</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Social Button - اصلاح شده */}
                  <a 
                    href="https://www.instagram.com/elm.va.honar" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/btn block relative overflow-hidden bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-center">
                      <Instagram className="w-5 h-5 text-white ml-2" />
                      <div className="text-right">
                        <p className="text-white font-black text-base">دنبال کنید در اینستاگرام</p>
                        <p className="text-white/90 text-xs font-semibold">@elm.va.honar</p>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Location Card */}
            <div className="group">
              <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-500 border border-gray-100 h-full relative overflow-hidden">
                {/* Decorative Corner */}
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tr from-[#399918]/10 to-transparent rounded-tl-full"></div>
                
                <div className="relative">
                  {/* Header */}
                  <div className="flex items-center mb-6">
                    <div className="w-11 h-11 bg-gradient-to-br from-[#399918] to-[#4db526] rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                      <Map className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-gray-800 mr-3">موقعیت مکانی</h3>
                  </div>
                  
                  {/* Map Image */}
                  <div className="rounded-xl overflow-hidden shadow-lg border-4 border-gray-100 hover:border-[#399918] transition-all duration-500 mb-4 group-hover:shadow-xl">
                    <img 
                      src="/photos/naghshe.png"    
                      alt="نقشه مدرسه علم و هنر" 
                      className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  
                  {/* Map Button */}
                  <a 
                    href="https://maps.app.goo.gl/fUvmXQK65KkW8K4p6" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group/btn block relative overflow-hidden bg-gradient-to-r from-[#399918] to-[#4db526] rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#2d7a13] to-[#399918] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-white ml-2" />
                      <span className="text-white font-black text-base">مشاهده در گوگل مپ</span>
                      <ExternalLink className="w-4 h-4 text-white mr-2" />
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright - Simple & Elegant */}
      <div className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center gap-2 text-gray-600">
          </div>
        </div>
      </div>

      {/* Bottom Decorative Line */}
      <div className="w-full h-1.5 bg-gradient-to-r from-[#399918] via-[#4db526] to-[#399918]"></div>
    </footer>
  );
}