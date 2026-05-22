'use client';

import { useState } from 'react';
import { ChevronDown, MessageCircleQuestion } from 'lucide-react';

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <div className={`group rounded-xl transition-all duration-200 ${open ? 'bg-white shadow-sm border border-slate-200/80' : 'hover:bg-slate-50/80'}`}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left"
      >
        <div className="flex items-start gap-3 min-w-0">
          <span className={`mt-0.5 flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shrink-0 transition-colors duration-200 ${open ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-400'}`}>
            {index + 1}
          </span>
          <span className={`font-semibold text-sm leading-snug transition-colors duration-200 ${open ? 'text-slate-900' : 'text-slate-700'}`}>{q}</span>
        </div>
        <ChevronDown className={`w-4 h-4 mt-1 text-slate-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180 text-sky-500' : ''}`} />
      </button>
      <div
        className={`grid transition-all duration-200 ease-in-out ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-4 pl-[52px] text-[13px] text-slate-500 leading-[1.7]">
            {a}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FaqSection({ faqs }: { faqs: { q: string; a: string }[] }) {
  if (faqs.length === 0) return null;
  return (
    <section id="section-faq">
      <div className="mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-1 h-5 rounded-full shrink-0 bg-slate-400" />
          <h2 className="text-[15px] font-bold text-slate-900 tracking-tight">Frequently Asked Questions</h2>
        </div>
        <p className="text-[12px] text-slate-400 mt-1 ml-[14px]">Common questions about this tool</p>
      </div>
      <div className="bg-gradient-to-b from-slate-50/50 to-white border border-slate-200/60 rounded-2xl p-2 sm:p-3 space-y-1.5">
        {faqs.map((faq, i) => (
          <FaqItem key={i} q={faq.q} a={faq.a} index={i} />
        ))}
      </div>
    </section>
  );
}
