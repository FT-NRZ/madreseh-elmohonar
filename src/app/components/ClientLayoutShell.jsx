'use client';
import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import SchoolLoginPage from '../Login/page';
import { Toaster } from 'react-hot-toast';
import { LoadingProvider } from './LoadingProvider';

export default function ClientLayoutShell({ children }) {
  const [showLogin, setShowLogin] = useState(false);
  return (
    <LoadingProvider>
      <div className="min-h-screen flex flex-col">
        <Header onLoginClick={() => setShowLogin(true)} />
        <main className="flex-1">
          {children}
          <Toaster position="bottom-center" toastOptions={{ duration: 3500 }} />
        </main>
        <Footer />
        {showLogin && <SchoolLoginPage onClose={() => setShowLogin(false)} />}
      </div>
    </LoadingProvider>
  );
}