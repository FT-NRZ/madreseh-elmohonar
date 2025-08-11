'use client'
import React, { useState, useEffect } from 'react';
import { 
  Image, FolderPlus, Upload, Trash2, Edit, Search, Plus, X, 
  ChevronDown, ChevronRight, AlertCircle, CheckCircle, Filter, Pencil,
  Users, UserPlus, GraduationCap, BookOpen, BarChart3, Settings, LogOut, 
  Eye, EyeOff, Menu, Bell, Calendar, Clock, TrendingUp, Award, FileText, Home,
  MoreVertical, Star
} from 'lucide-react';

export default function AdminGallery() {
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showUploadImage, setShowUploadImage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [imageToEdit, setImageToEdit] = useState(null);
  const [showEditImage, setShowEditImage] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('gallery');

  const menuItems = [
    { id: 'overview', label: 'داشبورد', icon: Home, color: 'blue' },
    { id: 'users', label: 'مدیریت کاربران', icon: Users, color: 'green' },
    { id: 'classes', label: 'مدیریت کلاس‌ها', icon: GraduationCap, color: 'purple' },
    { id: 'gallery', label: 'گالری تصاویر', icon: Image, color: 'pink' },
    { id: 'schedule', label: 'برنامه هفتگی', icon: Calendar, color: 'orange' },
    { id: 'reports', label: 'گزارش‌ها', icon: BarChart3, color: 'indigo' },
    { id: 'settings', label: 'تنظیمات', icon: Settings, color: 'gray' }
  ];

  const handleDeleteImage = async (imageId) => {
    if (!confirm('آیا از حذف این تصویر اطمینان دارید؟')) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/gallery?id=${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setImages(prev => prev.filter(img => img.id !== imageId));
        alert('تصویر با موفقیت حذف شد');
      } else {
        console.error('Error deleting image:', data.message);
        alert(`خطا در حذف تصویر: ${data.message}`);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('خطا در برقراری ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  // بررسی احراز هویت
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      window.location.href = '/';
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'admin') {
        window.location.href = '/';
        return;
      }
      setUser(parsedUser);
    } catch (error) {
      console.error('Error parsing user data:', error);
      window.location.href = '/';
    }
  }, []);

  // دریافت دسته‌بندی‌ها و تصاویر
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
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([
        { id: 1, name: 'رویدادهای مدرسه', description: 'تصاویر رویدادهای مدرسه', parent_id: null },
        { id: 2, name: 'مراسم‌ها', description: 'تصاویر مراسم‌های مدرسه', parent_id: 1 },
        { id: 3, name: 'کلاس‌ها', description: 'تصاویر کلاس‌ها', parent_id: null },
        { id: 4, name: 'آزمایشگاه', description: 'تصاویر آزمایشگاه مدرسه', parent_id: 3 },
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
      if (selectedCategory) {
        url += `?categoryId=${selectedCategory}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setImages(data.images || []);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      setImages([
        { id: 1, title: 'جشن پایان سال', category_id: 2, image_path: '/photos/naghshe.png', description: 'تصویر جشن پایان سال تحصیلی' },
        { id: 2, title: 'آزمایشگاه فیزیک', category_id: 4, image_path: '/photos/naghshe.png', description: 'دانش‌آموزان در آزمایشگاه فیزیک' },
        { id: 3, title: 'روز معلم', category_id: 1, image_path: '/photos/naghshe.png', description: 'مراسم روز معلم' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getChildCategories = (parentId) => {
    return categories.filter(category => category.parent_id === parentId);
  };

  const getRootCategories = () => {
    return categories.filter(category => category.parent_id === null);
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories({
      ...expandedCategories,
      [categoryId]: !expandedCategories[categoryId]
    });
  };

  const filteredImages = images.filter(image => 
    image.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'دسته‌بندی نشده';
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const handleNavigation = (tab) => {
    if (tab === 'gallery') {
      setActiveTab(tab);
    } else {
      const routes = {
        overview: '/admin/dashboard',
        users: '/admin/users',
        classes: '/admin/classes',
        schedule: '/admin/weekly_schedule',
        reports: '/admin/reports',
        settings: '/admin/settings'
      };
      window.location.href = routes[tab] || '/admin/dashboard';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">در حال بررسی دسترسی...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - دقیقاً مثل داشبورد */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-white shadow-xl flex flex-col transition-all duration-300 border-l border-gray-200`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${!sidebarOpen && 'justify-center'}`}>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              {sidebarOpen && (
                <div className="mr-3">
                  <h2 className="font-bold text-gray-800 text-lg">مدرسه علم و هنر</h2>
                  <p className="text-sm text-gray-500">پنل مدیریت</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 flex-1 px-4">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`w-full flex items-center px-4 py-3 mb-2 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <IconComponent className={`w-5 h-5 ${sidebarOpen ? 'ml-3' : 'mx-auto'}`} />
                {sidebarOpen && (
                  <span className="font-medium">{item.label}</span>
                )}
                {isActive && sidebarOpen && (
                  <div className="mr-auto w-2 h-2 bg-white rounded-full"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-100">
          <div className={`flex items-center ${!sidebarOpen ? 'justify-center' : 'mb-4'}`}>
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">
                {user?.firstName?.[0]}{user?.lastName?.[0] || user?.first_name?.[0]}{user?.last_name?.[0]}
              </span>
            </div>
            {sidebarOpen && (
              <div className="mr-3 flex-1">
                <p className="font-semibold text-gray-800">
                  {user?.firstName || user?.first_name} {user?.lastName || user?.last_name}
                </p>
                <p className="text-sm text-gray-500">مدیر سیستم</p>
              </div>
            )}
            {sidebarOpen && (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={logout}
              className="w-full flex items-center justify-center py-3 px-4 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium"
            >
              <LogOut className="w-4 h-4 ml-2" />
              خروج از سیستم
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">🖼️ مدیریت گالری تصاویر</h1>
              <p className="text-gray-600 mt-1">
                آپلود و مدیریت تصاویر و دسته‌بندی‌ها
              </p>
            </div>
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors relative">
                <Bell className="w-6 h-6 text-gray-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </button>
              <div className="text-right">
                <p className="text-sm text-gray-500">خوش آمدید</p>
                <p className="font-semibold text-gray-800">
                  {user?.firstName || user?.first_name} {user?.lastName || user?.last_name}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Header Buttons */}
        <div className="bg-white px-8 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-4 justify-end">
            <button 
              onClick={() => setShowAddCategory(true)}
              className="flex items-center px-4 py-2 bg-[#DAE2B6] text-green-800 rounded-lg hover:bg-[#DBE4C9] transition-colors"
            >
              <FolderPlus className="w-5 h-5 ml-2" />
              افزودن دسته‌بندی
            </button>
            <button 
              onClick={() => setShowUploadImage(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Upload className="w-5 h-5 ml-2" />
              آپلود تصویر
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Categories Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-5 border border-[#EAEBD8]">
                <h2 className="text-lg font-bold text-green-800 mb-4 flex items-center">
                  <FolderPlus className="w-5 h-5 ml-2" />
                  دسته‌بندی‌ها
                </h2>
                
                <div className="mt-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full text-right py-2 px-3 rounded-md mb-1 flex items-center ${
                      selectedCategory === null 
                        ? 'bg-[#DAE2B6] text-green-800 font-medium'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Image className="w-4 h-4 ml-2" />
                    همه تصاویر
                  </button>

                  {loading ? (
                    <div className="flex justify-center py-4">
                      <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {getRootCategories().map(category => (
                        <CategoryItem 
                          key={category.id}
                          category={category}
                          categories={categories}
                          selectedCategory={selectedCategory}
                          expandedCategories={expandedCategories}
                          toggleCategory={toggleCategory}
                          setSelectedCategory={setSelectedCategory}
                          getChildCategories={getChildCategories}
                          level={0}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Images Grid */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-md p-6 border border-[#EAEBD8] mb-6">
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
                      className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : filteredImages.length === 0 ? (
                  <div className="text-center py-12 bg-[#EAEBD8] bg-opacity-30 rounded-xl">
                    <Image className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-1">هیچ تصویری یافت نشد</h3>
                    <p className="text-gray-500">می‌توانید با کلیک روی دکمه «آپلود تصویر» تصاویر جدید اضافه کنید</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredImages.map(image => (
                      <ImageCard
                        key={image.id}
                        image={image}
                        categoryName={getCategoryName(image.category_id)}
                        onDelete={handleDeleteImage}
                        onEdit={(image) => {
                          setImageToEdit(image);
                          setShowEditImage(true);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
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

      {showEditImage && imageToEdit && (
        <EditImageModal
          onClose={() => {
            setShowEditImage(false);
            setImageToEdit(null);
          }}
          onSuccess={() => {
            setShowEditImage(false);
            setImageToEdit(null);
            fetchImages();
          }}
          categories={categories}
          image={imageToEdit}
        />
      )}
    </div>
  );
}

// کامپوننت نمایش دسته‌بندی در سایدبار
function CategoryItem({ 
  category, 
  categories,
  selectedCategory, 
  expandedCategories, 
  toggleCategory, 
  setSelectedCategory, 
  getChildCategories,
  level 
}) {
  const childCategories = getChildCategories(category.id);
  const hasChildren = childCategories.length > 0;
  const isExpanded = expandedCategories[category.id];
  const isSelected = selectedCategory === category.id;
  
  return (
    <div className={`mr-${level > 0 ? level * 3 : 0}`}>
      <button
        onClick={() => {
          setSelectedCategory(category.id);
          if (hasChildren) {
            toggleCategory(category.id);
          }
        }}
        className={`w-full text-right py-2 px-3 rounded-md mb-1 flex items-center justify-between ${
          isSelected 
            ? 'bg-[#DAE2B6] text-green-800 font-medium'
            : 'hover:bg-gray-100 text-gray-700'
        }`}
      >
        <div className="flex items-center">
          <FolderPlus className="w-4 h-4 ml-2" />
          <span className="truncate">{category.name}</span>
        </div>
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleCategory(category.id);
            }}
            className="p-1 hover:bg-gray-200 rounded-full"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}
      </button>
      
      {hasChildren && isExpanded && (
        <div className="mr-4 border-r border-gray-200 pr-2">
          {childCategories.map(childCategory => (
            <CategoryItem
              key={childCategory.id}
              category={childCategory}
              categories={categories}
              selectedCategory={selectedCategory}
              expandedCategories={expandedCategories}
              toggleCategory={toggleCategory}
              setSelectedCategory={setSelectedCategory}
              getChildCategories={getChildCategories}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// کامپوننت کارت نمایش تصویر
function ImageCard({ image, categoryName, onDelete, onEdit }) {
  const [showImageDetail, setShowImageDetail] = useState(false);
  
  return (
    <>
      <div className="bg-[#EAEBD8] bg-opacity-40 rounded-xl overflow-hidden shadow-sm border border-[#DBE4C9] hover:shadow-md transition-all transform hover:-translate-y-1">
        <div className="relative aspect-[4/3] bg-gray-100">
          <img 
            src={image.image_path} 
            alt={image.alt_text || image.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2">
            <span className="bg-[#DAE2B6] text-green-800 px-2 py-1 text-xs rounded-md">
              {categoryName}
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-green-800 mb-1 truncate">{image.title}</h3>
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">{image.description}</p>
          <div className="flex justify-between items-center">
            <button 
              onClick={() => setShowImageDetail(true)}
              className="text-green-700 hover:text-green-900 text-sm font-medium"
            >
              جزئیات بیشتر
            </button>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <button 
            onClick={() => onEdit(image)}
            className="p-1 text-gray-500 hover:text-green-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(image.id)}
            className="p-1 text-gray-500 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
          </div>
        </div>
      </div>

      {/* مودال جزئیات تصویر */}
      {showImageDetail && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm bg-white/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b bg-gradient-to-r from-green-500 to-[#DAE2B6]">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">{image.title}</h2>
                <button onClick={() => setShowImageDetail(false)} className="text-white hover:text-gray-200">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <img 
                  src={image.image_path} 
                  alt={image.alt_text || image.title} 
                  className="w-full h-auto rounded-lg mb-4"
                />
                <div className="bg-[#EAEBD8] bg-opacity-50 p-4 rounded-lg">
                  <p className="text-gray-800 mb-2">{image.description}</p>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-semibold ml-2">دسته‌بندی:</span>
                    <span>{categoryName}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button 
                  onClick={() => setShowImageDetail(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  بستن
                </button>
                <button 
                onClick={() => {
                    setShowImageDetail(false);
                    onEdit(image);
                }} 
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                ویرایش تصویر
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// مودال افزودن دسته‌بندی
function AddCategoryModal({ onClose, onSuccess, categories }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_id: '',
    is_active: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // دریافت دسته‌های اصلی
  const getRootCategories = () => {
    return categories.filter(category => category.parent_id === null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/gallery_categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          parent_id: formData.parent_id === '' ? null : parseInt(formData.parent_id)
        })
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
      } else {
        setError(data.message || 'خطا در ایجاد دسته‌بندی');
      }
    } catch (err) {
      console.error('Error creating category:', err);
      setError('خطا در برقراری ارتباط با سرور');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm bg-white/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b bg-gradient-to-r from-green-500 to-[#DAE2B6]">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">افزودن دسته‌بندی جدید</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">نام دسته‌بندی</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">توضیحات</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 h-24"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="is_active" className="mr-2 block text-sm text-gray-700">
              فعال
            </label>
          </div>

          {error && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 ml-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-4 rtl:space-x-reverse pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'در حال ذخیره...' : 'ایجاد دسته‌بندی'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// مودال آپلود تصویر
function UploadImageModal({ onClose, onSuccess, categories, selectedCategory }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: selectedCategory || '',
    class_id: '',
    alt_text: '',
    is_featured: false
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    // پاک کردن مقدار input فایل
    const fileInput = document.getElementById('image-upload');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('لطفا یک تصویر انتخاب کنید');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      // ایجاد فرم دیتا برای آپلود فایل
      const formDataToSend = new FormData();
      formDataToSend.append('image', selectedFile);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category_id', formData.category_id);
      formDataToSend.append('alt_text', formData.alt_text);
      formDataToSend.append('is_featured', formData.is_featured);
      
      if (formData.class_id) {
        formDataToSend.append('class_id', formData.class_id);
      }

      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
      } else {
        setError(data.message || 'خطا در آپلود تصویر');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('خطا در برقراری ارتباط با سرور');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm bg-white/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b bg-green-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">آپلود تصویر جدید</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">عنوان تصویر</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">دسته‌بندی</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">انتخاب دسته‌بندی</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="is_featured" className="mr-2 block text-sm text-gray-700">
                  نمایش در اسلایدر (ویژه)
                </label>
              </div>
            </div>

            <div className="md:col-span-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">توضیحات</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 h-32"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">انتخاب تصویر</label>
                <div className="flex items-center justify-center w-full">
                  {!previewUrl ? (
                    // نمایش بخش آپلود اگر تصویری انتخاب نشده باشد
                    <label 
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-medium">انتخاب فایل</span> یا کشیدن و رها کردن
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG یا JPEG (حداکثر 5MB)</p>
                      </div>
                      <input 
                        id="image-upload"
                        type="file" 
                        accept="image/*" 
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  ) : (
                    // نمایش تصویر آپلود شده با دکمه حذف
                    <div className="relative w-full">
                      <img 
                        src={previewUrl} 
                        alt="تصویر انتخاب شده" 
                        className="w-full h-48 object-contain rounded-lg border border-gray-200" 
                      />
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                        title="حذف تصویر"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 ml-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'در حال آپلود...' : 'آپلود تصویر'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
// مودال ویرایش تصویر
function EditImageModal({ onClose, onSuccess, categories, image }) {
  const [formData, setFormData] = useState({
    title: image.title || '',
    description: image.description || '',
    category_id: image.category_id || '',
    class_id: image.class_id || '',
    alt_text: image.alt_text || '',
    is_featured: image.is_featured || false
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(image.image_path || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    // اگر تصویر قبلی وجود داشته باشد، به آن برمی‌گردیم
    setPreviewUrl(image.image_path || '');
    // پاک کردن مقدار input فایل
    const fileInput = document.getElementById('edit-image-upload');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      // ایجاد فرم دیتا برای آپلود فایل
      const formDataToSend = new FormData();
      
      // اگر فایل جدید انتخاب شده باشد، آن را اضافه می‌کنیم
      if (selectedFile) {
        formDataToSend.append('image', selectedFile);
      }
      
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category_id', formData.category_id);
      formDataToSend.append('alt_text', formData.alt_text);
      formDataToSend.append('is_featured', formData.is_featured);
      
      if (formData.class_id) {
        formDataToSend.append('class_id', formData.class_id);
      }

      const response = await fetch(`/api/gallery?id=${image.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
      } else {
        setError(data.message || 'خطا در بروزرسانی تصویر');
      }
    } catch (err) {
      console.error('Error updating image:', err);
      setError('خطا در برقراری ارتباط با سرور');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm bg-white/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b bg-green-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">ویرایش تصویر</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">عنوان تصویر</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">دسته‌بندی</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">انتخاب دسته‌بندی</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="edit_is_featured"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="edit_is_featured" className="mr-2 block text-sm text-gray-700">
                  نمایش در اسلایدر (ویژه)
                </label>
              </div>
            </div>

            <div className="md:col-span-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">توضیحات</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 h-32"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">تصویر</label>
                <div className="flex items-center justify-center w-full">
                  {!previewUrl ? (
                    // نمایش بخش آپلود اگر تصویری انتخاب نشده باشد
                    <label 
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-medium">انتخاب فایل</span> یا کشیدن و رها کردن
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG یا JPEG (حداکثر 5MB)</p>
                      </div>
                      <input 
                        id="edit-image-upload"
                        type="file" 
                        accept="image/*" 
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  ) : (
                    // نمایش تصویر با دکمه حذف
                    <div className="relative w-full">
                      <img 
                        src={previewUrl} 
                        alt="تصویر انتخاب شده" 
                        className="w-full h-48 object-contain rounded-lg border border-gray-200" 
                      />
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                        title="حذف تصویر"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 ml-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'در حال ذخیره...' : 'بروزرسانی تصویر'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}