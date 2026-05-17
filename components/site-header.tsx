'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Mail, Send, Check, MailCheck, ArrowRight, Sparkles, Users, Zap } from 'lucide-react';

/* ── AstroGTM logo ──────────────────────────────────────────── */
export function AstroGTMLogo({ size = 32 }: { size?: number }) {
  const h = size;
  const w = Math.round(size * 3.4);
  // Mark is a 3×3 dot grid with top-right corner accent — clean, scalable
  const m = h * 0.72; // mark size
  const gap = m * 0.28;
  const dot = (m - gap * 2) / 3;
  const r = dot * 0.38;

  // dot positions on a 3×3 grid
  const dots: [number, number, number][] = []; // x, y, opacity
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      // skip top-right corner — becomes accent
      if (row === 0 && col === 2) continue;
      const x = col * (dot + gap) + dot / 2;
      const y = row * (dot + gap) + dot / 2 + (h - m) / 2;
      const fade = row === 2 || col === 0 ? 0.25 : row === 1 && col === 1 ? 0.55 : 1;
      dots.push([x, y, fade]);
    }
  }

  // accent dot top-right — slightly larger, sky blue
  const ax = 2 * (dot + gap) + dot / 2;
  const ay = 0 * (dot + gap) + dot / 2 + (h - m) / 2;

  const textX = m + gap * 2.5;
  const textY = h * 0.69;
  const fontSize = h * 0.52;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 3×3 dot grid mark */}
      {dots.map(([x, y, op], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#0f172a" fillOpacity={op} />
      ))}
      {/* Accent dot — sky */}
      <circle cx={ax} cy={ay} r={r * 1.15} fill="#0ea5e9" />

      {/* Wordmark */}
      <text
        x={textX}
        y={textY}
        fontFamily="'DM Sans', 'Inter', system-ui, sans-serif"
        fontWeight="700"
        fontSize={fontSize}
        letterSpacing="-0.03em"
        fill="#0f172a"
      >
        Astro<tspan fill="#0ea5e9" fontWeight="800">GTM</tspan>
      </text>
    </svg>
  );
}

/* ── Newsletter modal ───────────────────────────────────────── */
function NewsletterModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 200);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 transition-all duration-200"
      style={{ background: visible ? 'rgba(15,23,42,0.55)' : 'rgba(15,23,42,0)', backdropFilter: visible ? 'blur(4px)' : 'blur(0px)' }}
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative overflow-hidden transition-all duration-200"
        style={{ transform: visible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.97)', opacity: visible ? 1 : 0 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top gradient bar */}
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #0ea5e9, #38bdf8, #0ea5e9)' }} />

        {/* Close */}
        <button onClick={handleClose} className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors text-base leading-none">×</button>

        {done ? (
          <div className="px-8 py-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
              <MailCheck className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1.5">You&apos;re in!</h3>
            <p className="text-sm text-slate-500 leading-relaxed">First issue drops weekly. We&apos;ll surface tools before they go mainstream.</p>
          </div>
        ) : (
          <div className="px-6 pt-6 pb-7">
            {/* Badge */}
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-full mb-4">
              <Sparkles className="w-3 h-3" /> Weekly Newsletter
            </span>

            <h3 className="text-[18px] font-extrabold text-slate-900 leading-snug mb-1.5 tracking-tight">
              Find emerging AI tools first
            </h3>
            <p className="text-[13px] text-slate-500 leading-relaxed mb-5">
              Weekly digest for GTM, SEO &amp; growth teams — curated picks, free tiers, and early-access deals.
            </p>

            {/* Social proof row */}
            <div className="flex items-center gap-4 mb-5 text-[12px] text-slate-500">
              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-sky-500" /><strong className="text-slate-700 font-semibold">2,400+</strong> subscribers</span>
              <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-500" /><strong className="text-slate-700 font-semibold">Weekly</strong> drops</span>
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" />No spam</span>
            </div>

            <form onSubmit={e => { e.preventDefault(); if (email.trim()) setDone(true); }} className="space-y-2.5">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com" autoFocus
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-400 placeholder-slate-400 transition"
                />
              </div>
              <button type="submit"
                className="group w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
                Join the newsletter
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </form>

            <p className="text-center text-[11px] text-slate-400 mt-3">Unsubscribe anytime · No credit card needed</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Site header ────────────────────────────────────────────── */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className="bg-white/95 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-15 py-3">
            <Link href="/" className="flex items-center group">
              <AstroGTMLogo size={36} />
            </Link>
            <button onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 bg-slate-900 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-slate-800 active:scale-95 transition-all">
              <Mail className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Join Newsletter</span>
              <span className="sm:hidden">Subscribe</span>
            </button>
          </div>
        </div>
      </header>
      {open && <NewsletterModal onClose={() => setOpen(false)} />}
    </>
  );
}

/* ── Inner page header (breadcrumb) ─────────────────────────── */
interface BreadcrumbItem { label: string; href?: string }

export function InnerHeader({ crumbs }: { crumbs: BreadcrumbItem[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className="bg-white/95 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm min-w-0">
              <Link href="/" className="flex items-center text-slate-900 hover:text-sky-600 transition-colors shrink-0">
                <AstroGTMLogo size={28} />
              </Link>
              {crumbs.map((c, i) => (
                <span key={i} className="flex items-center gap-1.5 min-w-0">
                  <span className="text-slate-300">/</span>
                  {c.href ? (
                    <Link href={c.href} className="text-slate-500 hover:text-slate-900 transition-colors truncate">{c.label}</Link>
                  ) : (
                    <span className="text-slate-900 font-medium truncate max-w-[180px]">{c.label}</span>
                  )}
                </span>
              ))}
            </nav>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => setOpen(true)}
                className="hidden sm:inline-flex items-center gap-2 bg-slate-900 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
                <Mail className="w-3.5 h-3.5" />
                Newsletter
              </button>
            </div>
          </div>
        </div>
      </header>
      {open && <NewsletterModal onClose={() => setOpen(false)} />}
    </>
  );
}

/* ── Page-level breadcrumb bar (below header, inside page body) ── */
export function PageBreadcrumb({ crumbs }: { crumbs: BreadcrumbItem[] }) {
  return (
    <div className="bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 py-2.5 text-[13px] min-w-0 overflow-x-auto scrollbar-none">
          <Link href="/" className="text-slate-500 hover:text-slate-900 transition-colors shrink-0 whitespace-nowrap">
            Home
          </Link>
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1 min-w-0 shrink-0">
              <svg className="w-3 h-3 text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              {c.href ? (
                <Link href={c.href} className="text-slate-500 hover:text-slate-900 transition-colors whitespace-nowrap truncate max-w-[200px]">{c.label}</Link>
              ) : (
                <span className="text-slate-800 font-semibold whitespace-nowrap truncate max-w-[200px]">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>
    </div>
  );
}
