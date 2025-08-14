'use client'
import React, { useEffect, useState } from 'react';
import { Image } from 'lucide-react';

export default function Gallery({ studentId }) {
  const [images, setImages] = useState([]);

  useEffect(() => {
    async function fetchImages() {
      try {
        const res = await fetch(`/api/student/${studentId}/gallery`);
        const data = await res.json();
        setImages(data.images || []);
      } catch {
        setImages([]);
      }
    }
    fetchImages();
  }, [studentId]);

  if (!images.length) return null;

  return (
    <div className="bg-white rounded-xl shadow border border-green-100 p-6 mb-6">
      <h2 className="text-lg font-bold text-green-700 mb-4 flex items-center gap-2">
        <Image className="w-6 h-6" />
        گالری کلاس
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((img, idx) => (
          <div key={idx} className="rounded-xl overflow-hidden border border-green-100">
            <img src={img.url} alt={img.title} className="w-full h-32 object-cover" />
            <div className="p-2 text-xs text-gray-600">{img.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}