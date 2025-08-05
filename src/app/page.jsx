'use client'
import React, { useState } from 'react';
import SchoolLoginPage from './Login/page';

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div>
      {/* صفحه لاگین که روی محتوا قرار می‌گیرد */}
      {showLogin && (
        <SchoolLoginPage onClose={() => setShowLogin(false)} />
      )}
    </div>
  );
}