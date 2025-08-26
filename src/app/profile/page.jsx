'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import { motion, AnimatePresence } from 'framer-motion';

function formatJalaliFromISO(iso) {
  if (!iso) return '---';
  const d = new Date(iso);
  if (isNaN(d)) return '---';
  return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  }
};

const cardHoverVariants = {
  hover: {
    y: -5,
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 15
    }
  }
};

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [user, setUser] = useState(null);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDateISO: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [tempProfileImage, setTempProfileImage] = useState(null); // برای حالت ویرایش موقت
  const [birthPickerValue, setBirthPickerValue] = useState(null);
  const [originalUserData, setOriginalUserData] = useState(null); // برای ذخیره داده اصلی

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/login');
      return;
    }
    (async () => {
      try {
        const res = await fetch('/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!data.success) {
          router.push('/login');
          return;
        }
        const u = data.user;
        setUser(u);
        setOriginalUserData(u); // ذخیره داده اصلی
        setForm({
          firstName: u.firstName || '',
          lastName: u.lastName || '',
          email: u.email || '',
          phone: u.phone || '',
          birthDateISO: u.birthDate || '',
        });
        setProfileImage(u.profileImage || null);
        if (u.birthDate) setBirthPickerValue(new Date(u.birthDate));
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const headerName = useMemo(() => {
    if (!user) return '';
    const roleFa =
      user.role === 'student' ? 'دانش‌آموز' :
      user.role === 'teacher' ? 'معلم' :
      user.role === 'admin' ? 'مدیر' : '';
    return `${user.firstName ?? ''} ${user.lastName ?? ''} ${roleFa ? `(${roleFa})` : ''}`;
  }, [user]);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onBirthChange = (val) => {
    setBirthPickerValue(val);
    const js = val?.toDate ? val.toDate() : val instanceof Date ? val : null;
    const iso = js
      ? new Date(js.getTime() - js.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
      : '';
    setForm((p) => ({ ...p, birthDateISO: iso }));
  };

  const onImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setTempProfileImage(reader.result);
    reader.readAsDataURL(file);
  };

  const onSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email || null,
      phone: form.phone || null,
      birthDate: form.birthDateISO || null,
      profileImage: tempProfileImage || profileImage || null,
    };

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setProfileImage(tempProfileImage || profileImage);
        setOriginalUserData(data.user); // به روز رسانی داده اصلی
        setEditMode(false);
        setTempProfileImage(null); // پاک کردن عکس موقت
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const onCancel = () => {
    // بازگرداندن داده‌ها به حالت اصلی
    if (originalUserData) {
      setForm({
        firstName: originalUserData.firstName || '',
        lastName: originalUserData.lastName || '',
        email: originalUserData.email || '',
        phone: originalUserData.phone || '',
        birthDateISO: originalUserData.birthDate || '',
      });
      setProfileImage(originalUserData.profileImage || null);
      if (originalUserData.birthDate) setBirthPickerValue(new Date(originalUserData.birthDate));
    }
    setTempProfileImage(null);
    setEditMode(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <motion.div 
          className="animate-spin w-16 h-16 border-4 border-green-300 border-t-green-600 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        ></motion.div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 font-[Vazir]">
      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6">
        {/* Header با دکمه ویرایش در سمت چپ */}
        <motion.div
          className="flex flex-col lg:flex-row items-center bg-white shadow-xl rounded-3xl p-6 mb-8 overflow-hidden relative"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
        >
          {/* دکمه ویرایش در سمت چپ برای دسکتاپ */}
          <div className="absolute top-4 left-4 hidden lg:block">
            {!editMode ? (
              <motion.button
                className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEditMode(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </motion.button>
            ) : (
              <motion.button
                className="p-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCancel}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            )}
          </div>

          {/* دکمه ویرایش برای موبایل */}
          <div className="self-end mb-4 lg:hidden">
            {!editMode ? (
              <motion.button
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEditMode(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                ویرایش
              </motion.button>
            ) : (
              <motion.button
                className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCancel}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                انصراف
              </motion.button>
            )}
          </div>

          <div className="flex flex-col md:flex-row items-center w-full">
            <motion.div 
              className="relative mb-4 md:mb-0 md:ml-6"
              whileHover={{ scale: editMode ? 1.05 : 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              {(tempProfileImage || profileImage) ? (
                <Image
                  src={tempProfileImage || profileImage}
                  alt="Profile"
                  width={120}
                  height={120}
                  className="rounded-full border-4 border-green-500 shadow-lg"
                />
              ) : (
                <div className="w-28 h-28 flex items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-emerald-600 border-4 border-green-500 text-4xl text-white font-bold shadow-lg">
                  {user.firstName?.[0] || user.lastName?.[0] || '👤'}
                </div>
              )}
              {editMode && (
                <motion.label 
                  className="absolute bottom-0 right-0 bg-green-600 text-white rounded-full p-2 cursor-pointer shadow-md"
                  whileHover={{ scale: 1.1, backgroundColor: "#059669" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="image/*" 
                    onChange={onImageChange} 
                  />
                  <span className="text-lg">📷</span>
                </motion.label>
              )}
            </motion.div>
            
            <div className="text-center md:text-right md:mr-6 flex-1">
              <motion.h1 
                className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {headerName}
              </motion.h1>
              <motion.p 
                className="text-green-600 mt-2 text-sm md:text-base"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                خوش آمدید
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Info Box با چیدمان فشرده‌تر */}
        <motion.div
          className="bg-white rounded-3xl shadow-xl p-6 mb-8 overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <motion.div variants={itemVariants} className="md:col-span-1">
              <ProfileField label="نام" name="firstName" value={form.firstName} onChange={onChange} editMode={editMode} />
            </motion.div>
            
            <motion.div variants={itemVariants} className="md:col-span-1">
              <ProfileField label="نام خانوادگی" name="lastName" value={form.lastName} onChange={onChange} editMode={editMode} />
            </motion.div>
            
            <motion.div variants={itemVariants} className="md:col-span-1">
              <ProfileField label="ایمیل" name="email" value={form.email} onChange={onChange} editMode={editMode} />
            </motion.div>
            
            <motion.div variants={itemVariants} className="md:col-span-1">
              <ProfileField label="شماره تماس" name="phone" value={form.phone} onChange={onChange} editMode={editMode} />
            </motion.div>
            
            <motion.div variants={itemVariants} className="md:col-span-2">
              <label className="font-semibold text-green-800 mb-2 block">تاریخ تولد</label>
              {editMode ? (
                <motion.div whileFocus={{ scale: 1.02 }}>
                  <DatePicker
                    value={birthPickerValue}
                    onChange={onBirthChange}
                    calendar={persian}
                    locale={persian_fa}
                    calendarPosition="bottom-right"
                    format="YYYY/MM/DD"
                    className="green-date-picker"
                  />
                </motion.div>
              ) : (
                <p className="p-3 bg-green-50 rounded-lg border border-green-200 transition-all duration-300 hover:bg-green-100">
                  {formatJalaliFromISO(form.birthDateISO)}
                </p>
              )}
            </motion.div>
          </div>

          {editMode && (
            <motion.div 
              className="mt-6 flex gap-4 justify-end"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.button
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all text-sm md:text-base"
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(5, 150, 105, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                onClick={onSave}
              >
                ذخیره تغییرات
              </motion.button>
              <motion.button
                className="px-6 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl shadow-md text-sm md:text-base"
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(75, 85, 99, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                onClick={onCancel}
              >
                انصراف
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* Extra Sections با چیدمان فشرده‌تر */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <SectionCard title="درس‌ها" icon="📚" />
          <SectionCard title="برنامه هفتگی" icon="📅" />
          <SectionCard title="گالری" icon="🖼️" />
        </motion.div>
      </div>

      <style jsx global>{`
        .green-date-picker {
          width: 100%;
        }
        .green-date-picker .rmdp-input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1fae5;
          border-radius: 0.75rem;
          background-color: #f0fdf4;
          text-align: right;
          direction: rtl;
        }
        .green-date-picker .rmdp-input:focus {
          outline: none;
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
        }
        .rmdp-ep-arrow::after {
          background-color: #10b981;
        }
        .rmdp-day.rmdp-selected span {
          background-color: #10b981;
        }
        .rmdp-day.rmdp-today span {
          color: #10b981;
        }
      `}</style>
    </div>
  );
}

function ProfileField({ label, name, value, onChange, editMode }) {
  return (
    <div className="mb-4">
      <label className="block font-semibold text-green-800 mb-2 text-sm md:text-base">{label}</label>
      {editMode ? (
        <motion.input
          type="text"
          name={name}
          value={value || ''}
          onChange={onChange}
          className="w-full p-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm md:text-base"
          whileFocus={{ scale: 1.02 }}
        />
      ) : (
        <motion.p 
          className="p-3 bg-green-50 rounded-lg border border-green-200 transition-all duration-300 hover:bg-green-100 text-sm md:text-base"
          whileHover={{ x: 5 }}
        >
          {value || '---'}
        </motion.p>
      )}
    </div>
  );
}

function SectionCard({ title, icon }) {
  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg p-4 text-center cursor-pointer overflow-hidden group relative"
      variants={cardHoverVariants}
      whileHover="hover"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-700 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      <div className="relative z-10">
        <motion.div 
          className="text-3xl mb-3"
          whileHover={{ rotate: 10, scale: 1.2 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {icon}
        </motion.div>
        <h3 className="text-lg font-bold text-green-800 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">برای مشاهده {title} کلیک کنید</p>
        <motion.div 
          className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-green-400 to-emerald-600 mt-3 mx-auto transition-all duration-500"
          initial={{ width: 0 }}
          whileHover={{ width: "100%" }}
        ></motion.div>
      </div>
    </motion.div>
  );
}