'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';

// ── Bio expand/collapse ──────────────────────────────────────────────────────

export function AuthorBioToggle({ bio }: { bio: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="mt-4 pt-4 border-t border-slate-100">
      <p className={`text-[13px] text-slate-600 leading-relaxed ${!expanded ? 'line-clamp-2' : ''}`}>
        {bio}
      </p>
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-1.5 text-[12px] font-medium text-sky-600 hover:text-sky-800 transition-colors"
      >
        {expanded ? 'Show less' : 'Read more'}
      </button>
    </div>
  );
}

// ── Updated date with exact-date tooltip on hover ───────────────────────────
// The visible text "Updated Apr 2026" is rendered by the SERVER component as a
// plain <span>; this component only adds the hover tooltip layer on top of it.

export function UpdatedDateTooltip({ short, exact }: { short: string; exact: string }) {
  const [show, setShow] = useState(false);
  return (
    <span
      className="relative inline-flex items-center gap-1 cursor-default"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <RefreshCw className="w-3 h-3 text-slate-400" aria-hidden="true" />
      {/* This text is the SSR-visible date — rendered in raw HTML source */}
      <span className="text-[11px] text-slate-500">Updated {short}</span>
      {show && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded-md bg-slate-800 text-white text-[11px] px-2.5 py-1 shadow-lg pointer-events-none z-10"
        >
          {exact}
        </span>
      )}
    </span>
  );
}
