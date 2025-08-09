'use client'
import React, { useState } from 'react';
import { X, MessageCircle, Send, Phone, Mail, Clock } from 'lucide-react';

export default function TicketModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    priority: 'متوسط',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // شبیه‌سازی ارسال تیکت
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    alert('تیکت شما با موفقیت ارسال شد!');
    setIsSubmitting(false);
    onClose();
    
    // ریست کردن فرم
    setFormData({
      name: '',
      phone: '',
      email: '',
      subject: '',
      priority: 'متوسط',
      message: ''
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#399918] to-green-600 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">تیکت پشتیبانی</h2>
            <p className="text-white/90">سوال یا مشکل خود را با ما در میان بگذارید</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          
          {/* اطلاعات تماس سریع */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 rounded-xl p-4 text-center border border-green-200">
              <Phone className="w-6 h-6 text-[#399918] mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-800">09035259397</p>
              <p className="text-xs text-gray-600">تماس مستقیم</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-200">
              <Mail className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-800">info@elmvahonar.edu.ir</p>
              <p className="text-xs text-gray-600">ایمیل</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 text-center border border-orange-200">
              <Clock className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-800">۸:۰۰ - ۱۴:۳۰</p>
              <p className="text-xs text-gray-600">ساعت پاسخگویی</p>
            </div>
          </div>

          {/* فرم تیکت */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* نام و تلفن */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">نام و نام خانوادگی *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[#399918] focus:ring-2 focus:ring-[#399918]/20 outline-none transition-all"
                  placeholder="نام کامل خود را وارد کنید"
                  style={{ direction: 'rtl' }}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">شماره تماس *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[#399918] focus:ring-2 focus:ring-[#399918]/20 outline-none transition-all"
                  placeholder="09xxxxxxxxx"
                  style={{ direction: 'ltr' }}
                />
              </div>
            </div>

            {/* ایمیل */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">آدرس ایمیل</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[#399918] focus:ring-2 focus:ring-[#399918]/20 outline-none transition-all"
                placeholder="example@email.com"
                style={{ direction: 'ltr' }}
              />
            </div>

            {/* موضوع و اولویت */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">موضوع تیکت *</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[#399918] focus:ring-2 focus:ring-[#399918]/20 outline-none transition-all"
                  placeholder="خلاصه مشکل یا سوال خود"
                  style={{ direction: 'rtl' }}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">اولویت</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[#399918] focus:ring-2 focus:ring-[#399918]/20 outline-none transition-all"
                  style={{ direction: 'rtl' }}
                >
                  <option value="کم">کم</option>
                  <option value="متوسط">متوسط</option>
                  <option value="زیاد">زیاد</option>
                  <option value="فوری">فوری</option>
                </select>
              </div>
            </div>

            {/* پیام */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">شرح کامل مشکل یا سوال *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[#399918] focus:ring-2 focus:ring-[#399918]/20 outline-none transition-all resize-none"
                placeholder="لطفاً مشکل یا سوال خود را به طور کامل شرح دهید..."
                style={{ direction: 'rtl' }}
              />
            </div>

            {/* دکمه ارسال */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-[#399918] to-green-600 text-white py-4 rounded-xl font-bold hover:from-green-600 hover:to-[#399918] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    در حال ارسال...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    ارسال تیکت
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all duration-300"
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}