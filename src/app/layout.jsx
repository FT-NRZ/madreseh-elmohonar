'use client'
import React, { useState } from 'react';
import './globals.css'
import Header from './components/Header'
import Footer from './components/Footer'
import SchoolLoginPage from './Login/page';
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }) {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <html lang="fa" dir="rtl">
      <body className="antialiased">
        <div className="min-h-screen flex flex-col">
          <Header onLoginClick={() => setShowLogin(true)} />
          <main className="flex-1">
            {children}
            <Toaster position="top-center" />
          </main>
          <Footer />
        </div>

        {showLogin && (
          <SchoolLoginPage onClose={() => setShowLogin(false)} />
        )}
      </body>
    </html>
  );
}