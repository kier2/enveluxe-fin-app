import React from 'react';

export default function Preloader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/80 backdrop-blur-md fixed inset-0 z-[9999]">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulse */}
        <div className="absolute w-24 h-24 bg-emerald-400/20 rounded-full animate-ping"></div>
        {/* Inner spinning ring */}
        <div className="absolute w-20 h-20 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
        {/* Center Logo Icon */}
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm z-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
        </div>
      </div>
      <div className="mt-8 text-emerald-800 font-semibold tracking-widest uppercase text-sm flex items-center gap-1.5">
        <span>Loading</span>
        <span className="flex gap-1">
          <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
          <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
          <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
        </span>
      </div>
    </div>
  );
}
