'use client';

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 font-sans" id="notfound-container">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-extrabold text-indigo-600 mb-4" id="notfound-title">404</h1>
        <h2 className="text-2xl font-bold text-slate-800 mb-2" id="notfound-subtitle">Page Not Found</h2>
        <p className="text-slate-500 mb-6" id="notfound-description">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md active:scale-95"
          id="notfound-home-link"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}
