'use client';
import React, { useState } from 'react';
import './globals.css';
import Header from './components/Header';
import Footer from './components/Footer';
import SchoolLoginPage from './Login/page';
import { Toaster } from 'react-hot-toast';
import { LoadingProvider } from './components/LoadingProvider';

export default function RootLayout({ children }) {
  const [showLogin, setShowLogin] = useState(false);

  // تابع بستن لاگین
  const handleCloseLogin = () => {
    setShowLogin(false);
  };

  return (
    <html lang="fa" dir="rtl">
      <body className="antialiased">
        <LoadingProvider>
          <div className="min-h-screen flex flex-col">
            <Header onLoginClick={() => setShowLogin(true)} />
            <main className="flex-1">
              {children}
              <Toaster
                position="top-center"
                toastOptions={{
                  style: { marginTop: '80px' },
                }}
              />
            </main>
            <Footer />
            {showLogin && (
              <SchoolLoginPage onClose={handleCloseLogin} />
            )}
          </div>
        </LoadingProvider>
      </body>
    </html>
  );
}