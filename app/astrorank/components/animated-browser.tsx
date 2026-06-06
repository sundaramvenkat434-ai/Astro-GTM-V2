'use client';

import { ReactNode } from 'react';

export function AnimatedBrowser({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {/* Green glow behind browser */}
      <div className="absolute -inset-4 rounded-3xl pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(16,185,129,0.08) 0%, transparent 70%)' }} />

      <div className="relative rounded-2xl border border-emerald-500/15 overflow-hidden shadow-2xl shadow-black/30" style={{ background: 'linear-gradient(170deg, rgba(240,253,244,0.97) 0%, rgba(255,255,255,0.98) 30%, rgba(236,253,245,0.96) 100%)' }}>
        {/* Chrome bar with green tint */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-emerald-100/60" style={{ background: 'linear-gradient(180deg, #f0fdf4 0%, #ecfdf5 100%)' }}>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>

          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/80 border border-emerald-200/50 shadow-inner shadow-emerald-50">
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

        {/* Content with subtle green tint */}
        <div className="p-4 sm:p-5" style={{ background: 'linear-gradient(180deg, #f9fefb 0%, #f5fbf8 50%, #f0faf5 100%)' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
