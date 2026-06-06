'use client';

import { ReactNode } from 'react';

export function AnimatedBrowser({ children }: { children: ReactNode }) {
  return (
    <div className="relative rounded-xl border border-emerald-500/20 bg-[#0a1f16] shadow-2xl shadow-black/30 overflow-hidden">
      {/* Chrome bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-emerald-500/10 bg-[#081a12]">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>

        <div className="flex-1 flex items-center gap-2 px-3 py-1 rounded-md bg-[#071510] border border-emerald-500/10">
          <svg className="w-3 h-3 text-emerald-500/40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-[11px] text-emerald-300/40 font-mono truncate">app.astrorank.ai/dashboard</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-medium text-emerald-400/70 hidden sm:inline">Live</span>
        </div>
      </div>

      {/* Content area */}
      <div className="p-3 sm:p-4">
        {children}
      </div>
    </div>
  );
}
