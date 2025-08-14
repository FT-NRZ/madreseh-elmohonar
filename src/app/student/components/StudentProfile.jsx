'use client'
import React, { useEffect, useState } from 'react';
import { UserCircle } from 'lucide-react';

export default function StudentProfile({ studentId }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/student/${studentId}/profile`);
        const data = await res.json();
        setProfile(data.profile);
      } catch {
        setProfile(null);
      }
    }
    fetchProfile();
  }, [studentId]);

  if (!profile) return null;

  return (
    <div className="bg-white rounded-xl shadow border border-green-100 p-6 mb-6 flex items-center gap-6">
      <UserCircle className="w-16 h-16 text-green-600" />
      <div>
        <div className="font-bold text-lg text-green-700">{profile.firstName} {profile.lastName}</div>
        <div className="text-sm text-gray-500">کد دانش‌آموزی: {profile.studentCode}</div>
        <div className="text-sm text-gray-500">کلاس: {profile.className}</div>
        <div className="text-sm text-gray-500">پایه: {profile.grade}</div>
        <div className="text-sm text-gray-500">شماره والدین: {profile.parentPhone}</div>
      </div>
    </div>
  );
}