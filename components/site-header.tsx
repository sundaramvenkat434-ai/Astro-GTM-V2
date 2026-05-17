'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Mail, Send, Check, MailCheck, ArrowRight, Sparkles, Users, Zap } from 'lucide-react';

/* ── AstroGTM logo ──────────────────────────────────────────── */
export function AstroGTMLogo({ size = 32 }: { size?: number }) {
  // Fixed viewBox — scale via width/height only
  const VW = 152;
  const VH = 36;
  const cx = 18;
  const cy = 18;
  const pr = 13;

  return (
    <svg
      width={Math.round((size / VH) * VW)}
      height={size}
      viewBox={`0 0 ${VW} ${VH}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Planet body */}
        <radialGradient id="lg-planet" cx="38%" cy="32%" r="65%">
          <stop offset="0%"   stopColor="#38bdf8" />
          <stop offset="40%"  stopColor="#0369a1" />
          <stop offset="100%" stopColor="#0c2340" />
        </radialGradient>

        {/* Atmospheric rim glow */}
        <radialGradient id="lg-atmos" cx="50%" cy="50%" r="50%">
          <stop offset="72%"  stopColor="#0ea5e9" stopOpacity="0" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.55" />
        </radialGradient>

        {/* Specular shine */}
        <radialGradient id="lg-shine" cx="30%" cy="25%" r="45%">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>

        {/* Orbit ring */}
        <linearGradient id="lg-ring" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#7dd3fc" stopOpacity="0" />
          <stop offset="35%"  stopColor="#38bdf8" stopOpacity="0.9" />
          <stop offset="65%"  stopColor="#38bdf8" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0" />
        </linearGradient>

        {/* GTM gradient — deeper, richer range: mid-blue → dark teal */}
        <linearGradient id="lg-gtm" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#0284c7" />
          <stop offset="55%"  stopColor="#0369a1" />
          <stop offset="100%" stopColor="#164e63" />
        </linearGradient>
      </defs>

      {/* Atmosphere glow */}
      <circle cx={cx} cy={cy} r={pr + 3.5} fill="url(#lg-atmos)" />
      {/* Planet body */}
      <circle cx={cx} cy={cy} r={pr} fill="url(#lg-planet)" />
      {/* Equatorial band */}
      <ellipse cx={cx} cy={cy + 3} rx={pr} ry={pr * 0.28} fill="#0c2340" fillOpacity="0.35" />
      {/* Polar ice cap */}
      <ellipse cx={cx - 2} cy={cy - pr * 0.55} rx={pr * 0.38} ry={pr * 0.18} fill="#e0f2fe" fillOpacity="0.22" />
      {/* Shine */}
      <circle cx={cx} cy={cy} r={pr} fill="url(#lg-shine)" />

      {/* Orbit ring */}
      <ellipse
        cx={cx} cy={cy}
        rx={pr + 7} ry={(pr + 7) * 0.3}
        stroke="url(#lg-ring)"
        strokeWidth="1.4"
        fill="none"
        transform={`rotate(-18 ${cx} ${cy})`}
      />

      {/* Moon */}
      <circle cx={cx + pr + 5.5} cy={cy - 3.5} r="2.4" fill="#bae6fd" />
      <circle cx={cx + pr + 4.8} cy={cy - 4.2} r="0.85" fill="white" fillOpacity="0.7" />

      {/* Wordmark — single <text> so "Astro" and "GTM" are flush with no gap */}
      <text
        x="40" y="25"
        fontFamily="'DM Sans', 'Inter', system-ui, sans-serif"
        fontSize="19.5"
        letterSpacing="-0.04em"
      >
        <tspan fontWeight="700" fill="#0f172a">Astro</tspan><tspan fontWeight="800" fill="url(#lg-gtm)">GTM</tspan>
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
