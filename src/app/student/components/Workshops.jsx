'use client';
import { useEffect, useState } from 'react';
import { Palette, Loader2 } from 'lucide-react';

export default function Workshops() {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/workshops', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await res.json();
        if (data.success) {
          setWorkshops(data.workshops);
        }
      } catch (error) {
        console.error('Error fetching workshops:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshops();
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-lg p-6 border border-purple-200">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-lg p-6 border border-purple-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
          <Palette className="w-5 h-5 text-purple-600" />
        </div>
        <h3 className="text-lg font-bold text-purple-800">کارگاه‌های آموزشی</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workshops.map((workshop) => (
          <div
            key={workshop.id}
            className="bg-white rounded-xl p-4 shadow-md border border-purple-100 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="text-2xl">{workshop.icon}</div>
              <h4 className="font-bold text-purple-900">{workshop.workshop_name}</h4>
            </div>
            {workshop.description && (
              <p className="text-sm text-purple-600 mt-2">{workshop.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}