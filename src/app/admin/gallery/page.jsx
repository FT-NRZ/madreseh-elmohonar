'use client'
import React, { useState, useEffect } from 'react';
import {
  Image, FolderPlus, Upload, Trash2, Edit, Search, Plus, X,
  Users, GraduationCap, BarChart3, Settings, LogOut,
  Calendar, NewspaperIcon, FileText, Shield, LayoutGrid, GalleryHorizontalEnd, CalendarCheck, Target, Menu, Sparkles, CheckCircle, AlertCircle, Clock,
  BookOpen,
  Calendar1Icon,
  UserPlus,
  GalleryHorizontal
} from 'lucide-react';
import toast from 'react-hot-toast';

// منوهای سایدبار مثل داشبورد
const sidebarMenu = [
  { label: 'داشبورد', icon: LayoutGrid, href: '/admin/dashboard' },
  { label: 'مدیریت کاربران', icon: Users, href: '/admin/users' },
  { label: 'مدیریت کلاس‌ها', icon: GraduationCap, href: '/admin/classes' },
  { label: 'برنامه هفتگی', icon: Calendar1Icon, href: '/admin/weekly_schedule' },
  { label: 'برنامه غذایی', icon: GalleryHorizontalEnd, href: '/admin/food-schedule' },
  { label: 'حضور و غیاب', icon: CalendarCheck, href: '/admin/attendances' },
  { label: 'مدیریت گالری', icon: GalleryHorizontal, href: '/admin/gallery' },
  { label: 'مدیریت کارنامه ها', icon: BookOpen, href: '/admin/report_cards' },
  { label: 'مدیریت اخبار', icon: NewspaperIcon, href: '/admin/news' },
  { label: 'مدیریت بخشنامه ها', icon: FileText, href: '/admin/circular' },
  { label: 'پیش‌ثبت‌نام', icon: UserPlus, href: '/admin/pre-registrations' },
  { label: 'توبیخی و تشویقی', icon: Shield, href: '/admin/disciplinary' },
];

export default function AdminGallery() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showUploadImage, setShowUploadImage] = useState(false);
  const [editImage, setEditImage] = useState(null);
  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState('');

  const fetchImages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = '/api/gallery';
      const params = new URLSearchParams();

      if (selectedCategory) {
        params.append('categoryId', selectedCategory);
      }
      if (selectedGrade && selectedGrade !== 'all' && selectedGrade !== '') {
        params.append('gradeId', selectedGrade);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setImages(data.images || []);
      }
    } catch (error) {
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/grades', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setGrades(data.grades || []);
        }
      } catch {
        setGrades([]);
      }
    };
    fetchGrades();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      window.location.href = '/login';
      return;
    }
    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'admin') {
        window.location.href = '/dashboard';
        return;
      }
      setUser(parsedUser);
    } catch {
      window.location.href = '/login';
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchCategories();
      fetchImages();
    }
  }, [user, selectedCategory, selectedGrade]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/gallery_categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch {
      setCategories([
        { id: 1, name: 'رویدادهای مدرسه', description: '', parent_id: null },
        { id: 2, name: 'مراسم‌ها', description: '', parent_id: 1 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const handleDeleteImage = async (imageId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/gallery?id=${imageId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchImages();
        toast.success('تصویر با موفقیت حذف شد');
      } else {
        const data = await response.json();
        toast.error(data.message || 'خطا در حذف تصویر');
      }
    } catch {
      toast.error('خطا در برقراری ارتباط با سرور');
    }
  };

  const getGradeName = (gradeId) => {
    if (!gradeId) return 'همه پایه‌ها';
    const grade = grades.find(g => g.id === gradeId);
    return grade ? grade.grade_name : 'نامشخص';
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'دسته‌بندی نشده';
  };

  const filteredImages = images.filter(image =>
    image.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
        <div className="text-center p-8 bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-green-200">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700">در حال بررسی دسترسی...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <div className="flex flex-col md:flex-row">

        {/* Main Content - ریسپانسیو */}
        <main className="flex-1 p-4 md:p-6 space-y-4 md:space-y-8">
          {/* Welcome Card - ریسپانسیو */}
          <div className="relative bg-gradient-to-r from-green-600 via-green-500 to-green-600 rounded-2xl md:rounded-3xl p-4 md:p-8 text-white shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-white/10 rounded-full -translate-y-16 md:-translate-y-32 translate-x-16 md:translate-x-32"></div>
            <div className="relative z-10">
              <div className="flex flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg md:text-4xl font-bold mb-2 md:mb-3 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
                    مدیریت گالری تصاویر مدرسه
                  </h2>
                  <p className="text-white/90 mb-3 md:mb-6 text-xs md:text-lg">افزودن، ویرایش و حذف تصاویر و دسته‌بندی‌ها</p>
                  <div className="flex flex-row items-start md:items-center gap-2 md:gap-6 text-white/80">
                    <div className="flex items-center gap-1 md:gap-2 bg-white/20 backdrop-blur-lg rounded-lg md:rounded-xl px-2 md:px-4 py-1 md:py-2">
                      <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="text-xs md:text-sm font-medium">{new Date().toLocaleDateString('fa-IR')}</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2 bg-white/20 backdrop-blur-lg rounded-lg md:rounded-xl px-2 md:px-4 py-1 md:py-2">
                      <Clock className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="text-xs md:text-sm font-medium">{new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
                <div className="w-16 h-16 md:w-32 md:h-32 bg-white/20 backdrop-blur-lg rounded-2xl md:rounded-3xl flex items-center justify-center shadow-2xl">
                  <Image className="w-8 h-8 md:w-16 md:h-16 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions - ریسپانسیو */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
            <button
              onClick={() => setShowAddCategory(true)}
              className="bg-gradient-to-r from-green-600 to-green-500 text-white rounded-2xl md:rounded-3xl p-4 md:p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105 text-right relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3 md:mb-6">
                  <div className="w-10 h-10 md:w-14 md:h-14 bg-white/20 backdrop-blur-lg rounded-xl md:rounded-2xl hidden md:flex items-center justify-center shadow-lg">
                    <FolderPlus className="w-5 h-5 md:w-7 md:h-7 text-white" />
                  </div>
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white/70" />
                </div>
                <h4 className="text-sm md:text-xl font-bold mb-1 md:mb-3">افزودن دسته‌بندی جدید</h4>
                <p className="text-white/90 text-xs md:text-base">ایجاد دسته‌بندی برای سازماندهی تصاویر</p>
              </div>
            </button>
            <button
              onClick={() => setShowUploadImage(true)}
              className="bg-gradient-to-r from-green-500 to-green-400 text-white rounded-2xl md:rounded-3xl p-4 md:p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105 text-right relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3 md:mb-6">
                  <div className="w-10 h-10 md:w-14 md:h-14 bg-white/20 backdrop-blur-lg rounded-xl md:rounded-2xl hidden md:flex items-center justify-center shadow-lg">
                    <Upload className="w-5 h-5 md:w-7 md:h-7 text-white" />
                  </div>
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white/70" />
                </div>
                <h4 className="text-sm md:text-xl font-bold mb-1 md:mb-3">آپلود تصویر جدید</h4>
                <p className="text-white/90 text-xs md:text-base">افزودن تصاویر جدید به گالری</p>
              </div>
            </button>
          </div>

          {/* دسته‌بندی‌ها و تصاویر - ریسپانسیو */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
            {/* دسته‌بندی‌ها - ریسپانسیو */}
            <div className="md:col-span-1">
              <div className="mb-4 md:mb-6">
                <label className="block text-xs md:text-sm font-bold text-green-700 mb-2">فیلتر بر اساس پایه تحصیلی</label>
                <div className="relative">
                  <GraduationCap className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-400 w-4 h-4 md:w-5 md:h-5" />
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="w-full pr-8 md:pr-10 pl-3 md:pl-4 py-2 md:py-3 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/50 font-medium text-green-700 text-xs md:text-sm"
                  >
                    <option value="">همه پایه‌ها</option>
                    {grades.map((grade) => (
                      <option key={grade.id} value={grade.id}>
                        {grade.grade_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {/* دسته‌بندی‌ها: موبایل دراپ‌داون، دسکتاپ لیست دکمه‌ها */}
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-xl border border-green-200 p-4 md:p-6">
                <h3 className="text-sm md:text-xl font-bold text-green-800 mb-3 md:mb-4 flex items-center">
                  <FolderPlus className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                  دسته‌بندی‌ها
                </h3>
                {/* موبایل: دراپ‌داون */}
                <div className="block md:hidden mb-2">
                  <select
                    value={selectedCategory || ''}
                    onChange={e => setSelectedCategory(e.target.value || null)}
                    className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/50 text-xs font-medium"
                  >
                    <option value="">همه تصاویر</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                {/* دسکتاپ: لیست دکمه‌ها */}
                <div className="hidden md:block space-y-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full text-right py-2 px-3 rounded-md mb-1 flex items-center text-sm ${
                      selectedCategory === null
                        ? 'bg-green-100 text-green-800 font-medium'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Image className="w-4 h-4 ml-2" />
                    همه تصاویر
                  </button>
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-right py-2 px-3 rounded-md mb-1 flex items-center text-sm ${
                        selectedCategory === category.id
                          ? 'bg-green-100 text-green-800 font-medium'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <FolderPlus className="w-4 h-4 ml-2" />
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* تصاویر - ریسپانسیو */}
            <div className="md:col-span-3">
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-xl border border-green-200 p-4 md:p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-3 md:gap-4">
                  <h2 className="text-sm md:text-xl font-bold text-green-800 flex items-center">
                    <Image className="w-4 h-4 md:w-6 md:h-6 ml-2" />
                    {selectedCategory ? `تصاویر دسته ${getCategoryName(selectedCategory)}` : 'همه تصاویر'}
                  </h2>
                  <div className="relative w-full md:w-64">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="جستجو در تصاویر..."
                      className="w-full pr-8 md:pr-10 pl-3 md:pl-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-xs md:text-sm"
                    />
                  </div>
                </div>
                {loading ? (
                  <div className="flex justify-center py-8 md:py-12">
                    <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : filteredImages.length === 0 ? (
                  <div className="text-center py-8 md:py-12 bg-green-50 bg-opacity-30 rounded-xl">
                    <Image className="w-12 h-12 md:w-16 md:h-16 mx-auto text-gray-400 mb-3 md:mb-4" />
                    <h3 className="text-sm md:text-lg font-medium text-gray-600 mb-1">هیچ تصویری یافت نشد</h3>
                    <p className="text-gray-500 text-xs md:text-sm">می‌توانید با کلیک روی دکمه «آپلود تصویر» تصاویر جدید اضافه کنید</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                    {filteredImages.map(image => (
                      <div key={image.id} className="bg-green-50 rounded-xl overflow-hidden shadow-sm border border-green-100 hover:shadow-md transition-all transform hover:-translate-y-1">
                        <div className="relative aspect-[4/3] bg-gray-100">
                          <img src={image.image_path} alt={image.title} className="w-full h-full object-cover" />
                          <div className="absolute top-2 right-2">
                            <span className="bg-green-100 text-green-800 px-2 py-1 text-xs rounded-md">
                              {getCategoryName(image.category_id)}
                            </span>
                          </div>
                        </div>
                        <div className="p-3 md:p-4">
                          <h3 className="font-semibold text-green-800 mb-2 truncate text-xs md:text-sm">{image.title}</h3>
                          <p 
                            className="text-gray-600 text-xs mb-2 md:mb-3 truncate" 
                            title={image.description}
                          >
                            {image.description}
                          </p>
                          <p className="text-xs text-blue-700 font-medium mb-2 md:mb-3 flex items-center">
                            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full ml-1"></span>
                            پایه: {getGradeName(image.grade_id)}
                          </p>
                          <div className="flex justify-end space-x-2 rtl:space-x-reverse">
                            <button
                              className="p-1 text-gray-500 hover:text-green-700 transition-colors"
                              onClick={() => setEditImage(image)}
                            >
                              <Edit className="w-3 h-3 md:w-4 md:h-4" />
                            </button>
                            <button
                              className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                              onClick={() => {
                                toast((t) => (
                                  <div className="flex flex-col items-center p-4">
                                    <p className="mb-4 text-gray-800 font-medium text-xs md:text-sm">آیا از حذف این تصویر اطمینان دارید؟</p>
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => {
                                          toast.dismiss(t.id);
                                          handleDeleteImage(image.id);
                                        }}
                                        className="px-3 md:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs md:text-sm"
                                      >
                                        حذف
                                      </button>
                                      <button
                                        onClick={() => toast.dismiss(t.id)}
                                        className="px-3 md:px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-xs md:text-sm"
                                      >
                                        انصراف
                                      </button>
                                    </div>
                                  </div>
                                ), {
                                  duration: Infinity,
                                  position: 'top-center'
                                })
                              }}
                            >
                              <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* مودال افزودن دسته‌بندی */}
      {showAddCategory && (
        <AddCategoryModal
          onClose={() => setShowAddCategory(false)}
          onSuccess={() => {
            setShowAddCategory(false);
            fetchCategories();
          }}
          categories={categories}
        />
      )}

      {/* مودال آپلود تصویر */}
      {showUploadImage && (
        <UploadImageModal
          onClose={() => setShowUploadImage(false)}
          onSuccess={() => {
            setShowUploadImage(false);
            fetchImages();
          }}
          categories={categories}
          selectedCategory={selectedCategory}
          grades={grades}
        />
      )}

      {/* مودال ویرایش تصویر */}
      {editImage && (
        <EditImageModal
          onClose={() => setEditImage(null)}
          onSuccess={() => {
            setEditImage(null);
            fetchImages();
          }}
          categories={categories}
          grades={grades}
          image={editImage}
        />
      )}
    </div>
  );
}

// کامپوننت مودال افزودن دسته‌بندی
function AddCategoryModal({ onClose, onSuccess, categories }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('نام دسته‌بندی اجباری است');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/gallery_categories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          parent_id: formData.parent_id || null
        })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('دسته‌بندی با موفقیت ایجاد شد');
        onSuccess();
      } else {
        toast.error(data.message || 'خطا در ایجاد دسته‌بندی');
      }
    } catch {
      setError('خطا در برقراری ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl w-full max-w-md border border-green-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-green-800 flex items-center">
            <FolderPlus className="w-6 h-6 ml-2" />
            افزودن دسته‌بندی جدید
          </h2>
          <button 
            onClick={onClose}
            className="p-2 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-red-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-green-700 mb-2">نام دسته‌بندی</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/30"
              placeholder="نام دسته‌بندی را وارد کنید..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-green-700 mb-2">توضیحات</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/30 h-24 resize-none"
              placeholder="توضیحات دسته‌بندی..."
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-green-700 mb-2">دسته‌بندی والد</label>
            <select
              value={formData.parent_id}
              onChange={(e) => setFormData({...formData, parent_id: e.target.value})}
              className="w-full px-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/30"
            >
              <option value="">هیچ (دسته‌بندی اصلی)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl p-3 flex items-center">
              <AlertCircle className="w-4 h-4 ml-2" />
              {error}
            </div>
          )}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              disabled={loading}
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition-all duration-300 shadow-lg disabled:opacity-50 font-medium"
              disabled={loading}
            >
              {loading ? 'در حال ایجاد...' : 'ایجاد دسته‌بندی'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// کامپوننت مودال آپلود تصویر
function UploadImageModal({ onClose, onSuccess, categories, selectedCategory, grades }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: selectedCategory || '',
    grade_id: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('حجم فایل نباید بیش از 5 مگابایت باشد');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('فقط فایل‌های تصویری مجاز هستند');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('عنوان تصویر اجباری است');
      return;
    }
    if (!selectedFile) {
      setError('انتخاب فایل اجباری است');
      return;
    }
    if (!formData.category_id) {
      setError('انتخاب دسته‌بندی اجباری است');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      // نام فیلد باید 'image' باشد نه 'file'
      formDataToSend.append('image', selectedFile);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category_id', formData.category_id);
      formDataToSend.append('grade_id', formData.grade_id);
      
      console.log('Sending form data:', {
        image: selectedFile.name,
        title: formData.title,
        description: formData.description,
        category_id: formData.category_id
      });
      
      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });
      
      const data = await response.json();
      console.log('Upload response:', data);
      
      if (response.ok) {
        toast.success('تصویر با موفقیت آپلود شد');
        onSuccess();
      } else {
        toast.error('خطا در آپلود تصویر');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('خطا در برقراری ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl w-full max-w-md border border-green-200 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-green-800 flex items-center">
            <Upload className="w-6 h-6 ml-2" />
            آپلود تصویر جدید
          </h2>
          <button 
            onClick={onClose}
            className="p-2 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-red-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-green-700 mb-2">انتخاب فایل</label>
            <div
              className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                dragActive 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-green-300 bg-green-50/30'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required
              />
              {selectedFile ? (
                <div className="space-y-2">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto" />
                  <p className="text-green-700 font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-green-600 mx-auto" />
                  <p className="text-green-700 font-medium">فایل را اینجا بکشید یا کلیک کنید</p>
                  <p className="text-sm text-gray-500">حداکثر 5 مگابایت</p>
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-green-700 mb-2">عنوان تصویر</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/30"
              placeholder="عنوان تصویر را وارد کنید..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-green-700 mb-2">توضیحات</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/30 h-24 resize-none"
              placeholder="توضیحات تصویر..."
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-green-700 mb-2">دسته‌بندی</label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({...formData, category_id: e.target.value})}
              className="w-full px-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/30"
              required
            >
              <option value="">انتخاب دسته‌بندی</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-green-700 mb-2">پایه تحصیلی</label>
            <select
              value={formData.grade_id}
              onChange={(e) => setFormData({ ...formData, grade_id: e.target.value })}
              className="w-full px-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/30"
              required
            >
              <option value="">انتخاب پایه</option>
              <option value="all">همه پایه‌ها</option>
              {grades.map((grade) => (
                <option key={grade.id} value={grade.id}>
                  {grade.grade_name}
                </option>
              ))}
            </select>
          </div>
          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl p-3 flex items-center">
              <AlertCircle className="w-4 h-4 ml-2" />
              {error}
            </div>
          )}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              disabled={loading}
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition-all duration-300 shadow-lg disabled:opacity-50 font-medium"
              disabled={loading}
            >
              {loading ? 'در حال آپلود...' : 'آپلود تصویر'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// کامپوننت مودال ویرایش تصویر
function EditImageModal({ onClose, onSuccess, categories, grades, image }) {
  const [formData, setFormData] = useState({
    title: image.title || '',
    description: image.description || '',
    category_id: image.category_id || '',
    grade_id: image.grade_id || ''
  });
  const [newFile, setNewFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('حجم فایل نباید بیش از 5 مگابایت باشد');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('فقط فایل‌های تصویری مجاز هستند');
        return;
      }
      setNewFile(file);
      setError('');
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/gallery?id=${image.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        toast.success('تصویر با موفقیت حذف شد');
        onSuccess();
      } else {
        const data = await response.json();
        toast.error(data.message || 'خطا در حذف تصویر');
      }
    } catch {
      setError('خطا در برقراری ارتباط با سرور');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('عنوان تصویر اجباری است');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      if (newFile) {
        const formDataToSend = new FormData();
        formDataToSend.append('image', newFile); 
        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('category_id', formData.category_id);
        formDataToSend.append('grade_id', formData.grade_id); 

        console.log('Updating with new file:', {
          image: newFile.name,
          title: formData.title,
          description: formData.description,
          category_id: formData.category_id
        });
        
        const response = await fetch(`/api/gallery?id=${image.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formDataToSend
        });
        
        const data = await response.json();
        console.log('Update response:', data);
        
        if (response.ok) {
          toast.success('تصویر با موفقیت بروزرسانی شد');
          onSuccess();
        } else {
          const data = await response.json();
          toast.error(data.message || 'خطا در ویرایش تصویر');
        }
      } else {
        // اگر فقط اطلاعات تغییر کرده
        const response = await fetch(`/api/gallery?id=${image.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            category_id: formData.category_id,
            grade_id: formData.grade_id 
          })
        });
        
        const data = await response.json();
        console.log('Update response (no file):', data);
        
        if (response.ok) {
          toast.success('تصویر با موفقیت بروزرسانی شد');
          onSuccess();
        } else {
          toast.error(data.message || 'خطا در ویرایش تصویر');
        }
      }
    } catch (err) {
      console.error('Update error:', err);
      setError('خطا در برقراری ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl w-full max-w-md border border-green-200 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-green-800 flex items-center">
            <Edit className="w-6 h-6 ml-2" />
            ویرایش تصویر
          </h2>
          <button 
            onClick={onClose}
            className="p-2 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-red-600" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* نمایش تصویر فعلی */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-green-700 mb-2">تصویر فعلی</label>
            <div className="relative">
              <img
                src={newFile ? URL.createObjectURL(newFile) : image.image_path}
                alt={image.title}
                className="w-full h-40 object-cover rounded-xl border border-green-200"
              />
              {newFile && (
                <div className="absolute top-2 right-2 bg-green-100 text-green-800 px-2 py-1 rounded-lg text-xs font-medium">
                  تصویر جدید
                </div>
              )}
            </div>
          </div>

          {/* تغییر فایل */}
          <div>
            <label className="block text-sm font-bold text-green-700 mb-2">تغییر تصویر (اختیاری)</label>
            <div className="relative border-2 border-dashed border-green-300 rounded-xl p-4 text-center bg-green-50/30">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-green-700">
                {newFile ? newFile.name : 'برای تغییر تصویر کلیک کنید'}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-green-700 mb-2">عنوان تصویر</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/30"
              placeholder="عنوان تصویر..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-green-700 mb-2">توضیحات</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/30 h-24 resize-none"
              placeholder="توضیحات تصویر..."
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-green-700 mb-2">دسته‌بندی</label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({...formData, category_id: e.target.value})}
              className="w-full px-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/30"
            >
              <option value="">انتخاب دسته‌بندی</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
            <div>
              <label className="block text-sm font-bold text-green-700 mb-2">پایه تحصیلی</label>
              <select
                value={formData.grade_id}
                onChange={(e) => setFormData({...formData, grade_id: e.target.value})}
                className="w-full px-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/30"
              >
                <option value="">انتخاب پایه</option>
                {grades.map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.grade_name}
                  </option>
                ))}
              </select>
            </div>
          
          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl p-3 flex items-center">
              <AlertCircle className="w-4 h-4 ml-2" />
              {error}
            </div>
          )}

          <div className="flex justify-between pt-6">
            {/* دکمه حذف */}
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium flex items-center"
              disabled={loading}
            >
              <Trash2 className="w-4 h-4 ml-2" />
              حذف تصویر
            </button>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="p-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                disabled={loading}
              >
                انصراف
              </button>
              <button
                type="submit"
                className="p-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition-all duration-300 shadow-lg disabled:opacity-50 font-medium"
                disabled={loading}
              >
                {loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
              </button>
            </div>
          </div>
        </form>

        {/* مودال تأیید حذف */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4">
              <h3 className="text-lg font-bold text-red-700 mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 ml-2" />
                تأیید حذف
              </h3>
              <p className="text-gray-600 mb-6">
                آیا از حذف این تصویر اطمینان دارید؟ این عمل قابل بازگشت نیست.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  انصراف
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'در حال حذف...' : 'حذف'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}