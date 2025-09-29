'use client';
import React, { createContext, useContext, useState } from 'react';

// کانتکست لودینگ
const LoadingContext = createContext();

export function LoadingProvider({ children }) {
  const [loading, setLoading] = useState(false);

  const startLoading = () => setLoading(true);
  const stopLoading = () => setLoading(false);

  return (
    <LoadingContext.Provider value={{ loading, startLoading, stopLoading }}>
      {children}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </LoadingContext.Provider>
  );
}

// هوک استفاده از لودینگ
export function useLoading() {
  return useContext(LoadingContext);
}