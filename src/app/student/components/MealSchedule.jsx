'use client'
import React, { useEffect, useState } from 'react';
import { Utensils } from 'lucide-react';

export default function MealSchedule({ studentId }) {
  const [meals, setMeals] = useState([]);

  useEffect(() => {
    async function fetchMeals() {
      try {
        const res = await fetch(`/api/student/${studentId}/meals`);
        const data = await res.json();
        setMeals(data.meals || []);
      } catch {
        setMeals([]);
      }
    }
    fetchMeals();
  }, [studentId]);

  if (!meals.length) return null;

  return (
    <div className="bg-white rounded-xl shadow border border-green-100 p-6 mb-6">
      <h2 className="text-lg font-bold text-green-700 mb-4 flex items-center gap-2">
        <Utensils className="w-6 h-6" />
        برنامه غذایی مدرسه
      </h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-green-50 text-green-700">
            <th className="py-2 px-2">روز</th>
            <th className="py-2 px-2">وعده</th>
            <th className="py-2 px-2">غذا</th>
          </tr>
        </thead>
        <tbody>
          {meals.map((meal, idx) => (
            <tr key={idx} className="border-b last:border-b-0">
              <td className="py-2 px-2">{meal.day}</td>
              <td className="py-2 px-2">{meal.type}</td>
              <td className="py-2 px-2">{meal.food}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}