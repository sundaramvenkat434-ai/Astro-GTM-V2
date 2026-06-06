'use client';

import { ReactNode } from 'react';

export function AnimatedBrowser({ children }: { children: ReactNode }) {
  return (
    <div className="relative rounded-2xl border border-violet-500/15 bg-[#0D0A1A]/80 backdrop-blur-xl shadow-2xl shadow-purple-900/20 overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-violet-500/10 bg-[#0A0714]/70">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400/50" />
        </div>

        {/* URL bar */}
        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#080510]/60 border border-violet-500/10">
          <svg className="w-3 h-3 text-violet-500/50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-[11px] text-slate-500 font-mono truncate">app.astrorank.ai/agent</span>
        </div>

        {/* Status */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-[10px] font-medium text-violet-400/80 hidden sm:inline">AI Agent Running</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        {children}
      </div>
    </div>
  );
}
