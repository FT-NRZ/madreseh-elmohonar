'use client'

import { useState } from 'react'
import { User, BookOpen, Calendar, ClipboardList, FileText, Award, Image, MessageSquare, Users, ChevronRight, Menu, X, Bell } from 'lucide-react'

import ProfileCard from '../components/ProfileCard'
import MyClasses from '../components/MyClasses'
import WeeklySchedule from '../components/WeeklySchedule'
import AttendanceRegister from '../components/AttendanceRegister'
import ExamsList from '../components/ExamsList'
import ExamResults from '../components/ExamResults'
import ReportCards from '../components/ReportCards'
import Gallery from '../components/Gallery'
import SuggestionForm from '../components/SuggestionForm'

const teacherTabs = [
  { key: 'profile', label: 'پروفایل من', icon: User, color: 'from-[#399918] to-green-600' },
  { key: 'classes', label: 'کلاس‌های من', icon: Users, color: 'from-green-500 to-green-600' },
  { key: 'schedule', label: 'برنامه هفتگی', icon: Calendar, color: 'from-green-400 to-green-700' },
  { key: 'attendance', label: 'حضور و غیاب', icon: ClipboardList, color: 'from-lime-500 to-green-600' },
  { key: 'exams', label: 'آزمون‌ها', icon: FileText, color: 'from-green-700 to-[#399918]' },
  { key: 'examResults', label: 'نتایج آزمون', icon: Award, color: 'from-[#399918] to-lime-500' },
  { key: 'reportCards', label: 'کارنامه‌ها', icon: BookOpen, color: 'from-green-300 to-green-600' },
  { key: 'gallery', label: 'گالری کلاس', icon: Image, color: 'from-green-400 to-green-500' },
  { key: 'suggestion', label: 'ارسال پیام/پیشنهاد', icon: MessageSquare, color: 'from-green-600 to-[#399918]' },
]

export default function TeacherDashboardPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileCard />
      case 'classes':
        return <MyClasses />
      case 'schedule':
        return <WeeklySchedule />
      case 'attendance':
        return <AttendanceRegister />
      case 'exams':
        return <ExamsList />
      case 'examResults':
        return <ExamResults />
      case 'reportCards':
        return <ReportCards />
      case 'gallery':
        return <Gallery />
      case 'suggestion':
        return <SuggestionForm />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200">
      {/* تزئینات پس‌زمینه */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#399918] rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      {/* هدر موبایل */}
      <div className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-2xl border-b border-green-100 shadow-lg">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            className="relative p-3 rounded-2xl bg-gradient-to-r from-[#399918] to-green-600 text-white shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="باز کردن منو"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 bg-gradient-to-r from-[#399918] to-green-600 px-5 py-3 rounded-2xl shadow-lg">
              <span className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-sm backdrop-blur">م</span>
              <span className="font-bold text-white text-base">پنل معلم</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-3 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors shadow-sm">
              <Bell size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* سایدبار دسکتاپ */}
        <aside className="hidden lg:block sticky top-8 h-[calc(100vh-2rem)] w-80 bg-white/95 backdrop-blur-xl shadow-2xl z-50 border-l border-green-200 overflow-y-auto" style={{ minHeight: 'calc(100vh - 2rem)' }}>
          <div className="p-6 bg-gradient-to-r from-[#399918] via-green-600 to-green-700 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                  <span className="font-bold text-lg">م</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold">پنل معلم</h2>
                  <p className="text-green-100 text-sm">مدرسه علم و هنر</p>
                </div>
              </div>
            </div>
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="w-20 h-20 bg-white rounded-full absolute -top-10 -right-10"></div>
              <div className="w-16 h-16 bg-white rounded-full absolute -bottom-8 -left-8"></div>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto p-4 space-y-2" style={{ maxHeight: 'calc(100vh - 8rem)' }}>
            {teacherTabs.map(tab => {
              const IconComponent = tab.icon
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`group w-full text-right p-4 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-between relative overflow-hidden ${
                    activeTab === tab.key
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-xl scale-[1.02] transform`
                      : 'text-green-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:shadow-lg hover:scale-[1.01]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl ${activeTab === tab.key ? 'bg-white/20' : 'bg-green-100'}`}>
                      <IconComponent size={18} />
                    </div>
                    <span className="text-sm">{tab.label}</span>
                  </div>
                  {activeTab === tab.key && (
                    <ChevronRight size={18} className="animate-pulse" />
                  )}
                </button>
              )
            })}
          </nav>
        </aside>

        {/* سایدبار موبایل */}
        {isSidebarOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            ></div>
            <aside className="fixed top-0 right-0 h-full w-80 bg-white/98 backdrop-blur-2xl shadow-2xl z-50 border-l border-green-200 overflow-hidden lg:hidden transform transition-transform duration-300">
              <div className="p-6 bg-gradient-to-br from-[#399918] via-green-600 to-green-700 text-white relative overflow-hidden">
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur">
                      <span className="font-bold text-xl">م</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">پنل معلم</h2>
                      <p className="text-green-100 text-sm">مدرسه علم و هنر</p>
                    </div>
                  </div>
                  <button
                    className="p-3 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur transition-all duration-200 hover:scale-105"
                    onClick={() => setIsSidebarOpen(false)}
                    aria-label="بستن منو"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="absolute top-0 left-0 w-full h-full opacity-20">
                  <div className="w-32 h-32 bg-white rounded-full absolute -top-16 -right-16"></div>
                  <div className="w-24 h-24 bg-white rounded-full absolute -bottom-12 -left-12"></div>
                </div>
              </div>
              <div className="h-full overflow-y-auto pb-20">
                <nav className="p-4 space-y-2">
                  {teacherTabs.map(tab => {
                    const IconComponent = tab.icon
                    return (
                      <button
                        key={tab.key}
                        onClick={() => {
                          setActiveTab(tab.key)
                          setIsSidebarOpen(false)
                        }}
                        className={`group w-full text-right p-4 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-between relative overflow-hidden ${
                          activeTab === tab.key
                            ? `bg-gradient-to-r ${tab.color} text-white shadow-xl scale-[1.02] transform`
                            : 'text-green-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:shadow-lg hover:scale-[1.01] active:scale-95'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-xl transition-all ${activeTab === tab.key ? 'bg-white/20' : 'bg-green-100 group-hover:bg-green-200'}`}>
                            <IconComponent size={18} />
                          </div>
                          <span className="text-sm font-medium">{tab.label}</span>
                        </div>
                        {activeTab === tab.key && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            <ChevronRight size={16} />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </nav>
                <div className="p-4 mt-6">
                  <div className="bg-gradient-to-r from-green-100 to-green-50 rounded-2xl p-4 border border-green-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#399918] to-green-600 rounded-xl flex items-center justify-center">
                        <User size={14} className="text-white" />
                      </div>
                      <span className="font-bold text-green-800 text-sm">استاد محمدی</span>
                    </div>
                    <p className="text-xs text-green-600">معلم ریاضی پایه سوم</p>
                  </div>
                </div>
              </div>
            </aside>
          </>
        )}

        {/* محتوای اصلی */}
        <main className="flex-1 relative">
          <div className="lg:py-8 py-4 px-4 lg:px-6">
            <div className="max-w-6xl mx-auto">
              <div className="hidden lg:flex items-center gap-4 mb-8">
                <div className={`w-12 h-12 bg-gradient-to-r ${teacherTabs.find(tab => tab.key === activeTab)?.color || 'from-[#399918] to-green-600'} rounded-2xl flex items-center justify-center shadow-lg`}>
                  {(() => {
                    const tab = teacherTabs.find(tab => tab.key === activeTab)
                    if (tab?.icon) {
                      const IconComponent = tab.icon
                      return <IconComponent size={24} className="text-white" />
                    }
                    return null
                  })()}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-green-800">
                    {teacherTabs.find(tab => tab.key === activeTab)?.label}
                  </h1>
                  <p className="text-green-600 text-sm mt-1">مدیریت و کنترل امور آموزشی</p>
                </div>
              </div>
              <div className="space-y-6">
                {renderContent()}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}