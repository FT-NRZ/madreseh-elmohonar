'use client'
import React, { useState, useEffect } from 'react';
import {
  Image, FolderPlus, Upload, Trash2, Edit, Search, Plus, X,
  ChevronDown, ChevronRight, AlertCircle, Users, UserPlus, GraduationCap, BookOpen, BarChart3, Settings, LogOut,
  Eye, EyeOff, Menu, Calendar, Clock, TrendingUp, Zap, Crown, Target, RefreshCw, ChevronLeft, Activity, Sparkles, LayoutGrid, CheckCircle
} from 'lucide-react';

// منوهای سایدبار مثل داشبورد
const sidebarMenu = [
  { label: 'داشبورد', icon: LayoutGrid, href: '/admin/dashboard' },
  { label: 'مدیریت کاربران', icon: Users, href: '/admin/users' },
  { label: 'مدیریت کلاس‌ها', icon: GraduationCap, href: '/admin/classes' },
  { label: 'برنامه هفتگی', icon: Calendar, href: '/admin/weekly_schedule' },
  { label: 'مدیریت گالری', icon: Image, href: '/admin/gallery' },
  { label: 'گزارش‌ها', icon: BarChart3, href: '/admin/reports' },
  { label: 'تنظیمات', icon: Settings, href: '/admin/settings' }
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
  }, [user, selectedCategory]);

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

  const fetchImages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = '/api/gallery';
      if (selectedCategory) url += `?categoryId=${selectedCategory}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setImages(data.images || []);
      }
    } catch {
      setImages([
        { id: 1, title: 'جشن پایان سال', category_id: 2, image_path: '/photos/naghshe.png', description: 'تصویر جشن پایان سال تحصیلی' }
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
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-xl shadow-xl border-b border-green-200/50 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Menu Button */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="group flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-2xl hover:from-green-700 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Menu className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
                <span className="font-medium">پنل مدیریت</span>
                <Sparkles className="w-4 h-4 opacity-70" />
              </button>
            </div>
            {/* User Profile */}
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="flex items-center space-x-3 bg-gradient-to-r from-green-50 to-white rounded-2xl p-4 shadow-lg border border-green-200">
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-green-600 font-medium">مدیر سیستم</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-gradient-to-b from-white via-green-50 to-green-100 shadow-2xl z-50 transform transition-all duration-500 ease-out ${
        sidebarOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Sidebar Header */}
        <div className="bg-gradient-to-r from-green-600 via-green-500 to-green-600 text-white p-6 pt-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-lg">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-xl">پنل کنترل</h2>
                  <p className="text-white/80 text-sm">مدیریت هوشمند</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-3 bg-white/20 backdrop-blur-lg rounded-xl hover:bg-white/30 transition-all duration-300 shadow-lg"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4 text-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{categories.length}</p>
                <p className="text-xs text-white/80">دسته‌بندی‌ها</p>
              </div>
              <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4 text-center shadow-lg">
                <Zap className="w-6 h-6 text-white mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{images.length}</p>
                <p className="text-xs text-white/80">تصاویر</p>
              </div>
            </div>
          </div>
        </div>
        {/* Menu Items */}
        <div className="p-6 space-y-4 overflow-y-auto" style={{ height: 'calc(100vh - 220px)' }}>
          {/* افزودن تصویر */}
          <button
            onClick={() => setShowUploadImage(true)}
            className="w-full flex items-center space-x-3 rtl:space-x-reverse p-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-2xl hover:from-green-700 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium flex-1 text-right">آپلود تصویر جدید</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
          {/* منوهای اصلی مدیریت */}
          <div className="space-y-3 pt-2">
            {sidebarMenu.map((item, idx) => (
              <button
                key={item.label}
                onClick={() => window.location.href = item.href}
                className="w-full flex items-center space-x-3 rtl:space-x-reverse p-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-2xl hover:from-green-700 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium flex-1 text-right">{item.label}</span>
              </button>
            ))}
          </div>
          {/* خروج */}
          <div className="pt-4">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center space-x-3 rtl:space-x-reverse p-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">خروج از سیستم</span>
            </button>
          </div>
        </div>
      </div>
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Title */}
        <div className="relative bg-gradient-to-r from-green-600 via-green-500 to-green-600 rounded-3xl p-8 text-white shadow-2xl overflow-hidden mb-8">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
                  مدیریت گالری تصاویر مدرسه
                </h2>
                <p className="text-white/90 mb-6 text-lg">افزودن، ویرایش و حذف تصاویر و دسته‌بندی‌ها</p>
                <div className="flex items-center space-x-6 text-white/80">
                  <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-lg rounded-xl px-4 py-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">{new Date().toLocaleDateString('fa-IR')}</span>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse bg-white/20 backdrop-blur-lg rounded-xl px-4 py-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">{new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
              <div className="w-32 h-32 bg-white/20 backdrop-blur-lg rounded-3xl flex items-center justify-center shadow-2xl">
                <Image className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-end md:flex-row gap-4 mb-8">
          <button
            onClick={() => setShowAddCategory(true)}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-400 text-white rounded-xl shadow-lg hover:from-green-600 hover:to-green-500 transition-all duration-300"
          >
            <FolderPlus className="w-5 h-5 ml-2" />
            افزودن دسته‌بندی
          </button>
          <button
            onClick={() => setShowUploadImage(true)}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl shadow-lg hover:from-green-700 hover:to-green-600 transition-all duration-300"
          >
            <Upload className="w-5 h-5 ml-2" />
            آپلود تصویر
          </button>
        </div>

        {/* دسته‌بندی‌ها و تصاویر */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* دسته‌بندی‌ها */}
          <div className="md:col-span-1">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-green-200 p-6">
              <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center">
                <FolderPlus className="w-5 h-5 ml-2" />
                دسته‌بندی‌ها
              </h3>
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full text-right py-2 px-3 rounded-md mb-1 flex items-center ${
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
                      className={`w-full text-right py-2 px-3 rounded-md mb-1 flex items-center ${
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
              )}
            </div>
          </div>
          {/* تصاویر */}
          <div className="md:col-span-3">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-green-200 p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-green-800 flex items-center">
                  <Image className="w-6 h-6 ml-2" />
                  {selectedCategory ? `تصاویر دسته ${getCategoryName(selectedCategory)}` : 'همه تصاویر'}
                </h2>
                <div className="relative w-full md:w-64">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="جستجو در تصاویر..."
                    className="w-full pr-10 pl-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : filteredImages.length === 0 ? (
                <div className="text-center py-12 bg-green-50 bg-opacity-30 rounded-xl">
                  <Image className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-1">هیچ تصویری یافت نشد</h3>
                  <p className="text-gray-500">می‌توانید با کلیک روی دکمه «آپلود تصویر» تصاویر جدید اضافه کنید</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredImages.map(image => (
                    <div key={image.id} className="bg-green-50 rounded-xl overflow-hidden shadow-sm border border-green-100 hover:shadow-md transition-all transform hover:-translate-y-1">
                      <div className="relative aspect-[4/3] bg-gray-100">
                        <img
                          src={image.image_path}
                          alt={image.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <span className="bg-green-100 text-green-800 px-2 py-1 text-xs rounded-md">
                            {getCategoryName(image.category_id)}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-green-800 mb-1 truncate">{image.title}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{image.description}</p>
                        <div className="flex justify-end space-x-2 rtl:space-x-reverse">
                          <button
                            className="p-1 text-gray-500 hover:text-green-700 transition-colors"
                            onClick={() => setEditImage(image)}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                            onClick={async () => {
                              if (confirm('آیا از حذف این تصویر اطمینان دارید؟')) {
                                try {
                                  const token = localStorage.getItem('token');
                                  const response = await fetch(`/api/gallery?id=${image.id}`, {
                                    method: 'DELETE',
                                    headers: { 'Authorization': `Bearer ${token}` }
                                  });
                                  if (response.ok) {
                                    fetchImages();
                                    alert('تصویر با موفقیت حذف شد');
                                  } else {
                                    alert('خطا در حذف تصویر');
                                  }
                                } catch {
                                  alert('خطا در برقراری ارتباط با سرور');
                                }
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
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
        onSuccess();
      } else {
        setError(data.message || 'خطا در ایجاد دسته‌بندی');
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
function UploadImageModal({ onClose, onSuccess, categories, selectedCategory }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: selectedCategory || ''
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
        alert('تصویر با موفقیت آپلود شد');
        onSuccess();
      } else {
        setError(data.message || 'خطا در آپلود تصویر');
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
function EditImageModal({ onClose, onSuccess, categories, image }) {
  const [formData, setFormData] = useState({
    title: image.title || '',
    description: image.description || '',
    category_id: image.category_id || ''
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
        alert('تصویر با موفقیت حذف شد');
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.message || 'خطا در حذف تصویر');
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
        // اگر فایل جدید انتخاب شده، از FormData استفاده کنیم
        const formDataToSend = new FormData();
        formDataToSend.append('image', newFile); // نام فیلد 'image'
        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('category_id', formData.category_id);
        
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
          alert('تصویر با موفقیت بروزرسانی شد');
          onSuccess();
        } else {
          setError(data.message || 'خطا در ویرایش تصویر');
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
            category_id: formData.category_id
          })
        });
        
        const data = await response.json();
        console.log('Update response (no file):', data);
        
        if (response.ok) {
          alert('تصویر با موفقیت بروزرسانی شد');
          onSuccess();
        } else {
          setError(data.message || 'خطا در ویرایش تصویر');
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
              className="px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium flex items-center"
              disabled={loading}
            >
              <Trash2 className="w-4 h-4 ml-2" />
              حذف تصویر
            </button>

            <div className="flex space-x-4">
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