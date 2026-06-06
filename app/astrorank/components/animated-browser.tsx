'use client';

import { ReactNode } from 'react';

export function AnimatedBrowser({ children }: { children: ReactNode }) {
  return (
    <div className="relative rounded-2xl border border-emerald-500/15 bg-[#071F17]/80 backdrop-blur-xl shadow-2xl shadow-emerald-900/20 overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-emerald-500/10 bg-[#041A12]/60">
        {/* Window dots */}
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
          <div className="w-3 h-3 rounded-full bg-emerald-400/60" />
        </div>

        {/* URL bar */}
        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#02140F]/60 border border-emerald-500/10">
          <svg className="w-3.5 h-3.5 text-emerald-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-xs text-gray-500 font-mono">app.astrorank.ai/agent</span>
        </div>

        {/* Status */}
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-medium text-emerald-400/80 hidden sm:inline">AI Agent Running</span>
        </div>
      </div>

      {/* Content area */}
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}
