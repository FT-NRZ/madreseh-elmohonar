'use client';
import dynamic from 'next/dynamic';

// Dynamic import برای جلوگیری از خطاهای SSR
const FoodScheduleAdmin = dynamic(
  () => import('../components/FoodScheduleAdmin'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-700 font-medium">در حال بارگذاری...</p>
        </div>
      </div>
    )
  }
);

export default function FoodSchedulePage() {
  return <FoodScheduleAdmin />;
}