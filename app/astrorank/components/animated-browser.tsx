'use client';

import { ReactNode } from 'react';

export function AnimatedBrowser({ children }: { children: ReactNode }) {
  return (
    <div className="relative rounded-2xl border border-gray-200/80 bg-white shadow-2xl shadow-black/20 overflow-hidden">
      {/* Real browser chrome */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 bg-[#f8fafb]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>

        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-200 shadow-inner shadow-gray-50">
          <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-xs text-gray-500 font-mono truncate">app.astrorank.ai/dashboard</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-semibold text-emerald-600 hidden sm:inline">Live</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 bg-[#f9fbfc]">
        {children}
      </div>
    </div>
  );
}
