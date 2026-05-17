'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import {
  Mail, Check, MailCheck, ArrowRight, Sparkles, Users, Zap,
  ChevronDown, Rocket, FileSearch, Megaphone,
  Bell, BookOpen,
} from 'lucide-react';

/* ── AstroGTM logo ──────────────────────────────────────────── */
export function AstroGTMLogo({ size = 32 }: { size?: number }) {
  const VW = 158;
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
        <radialGradient id="lg-planet" cx="38%" cy="32%" r="65%">
          <stop offset="0%"   stopColor="#38bdf8" />
          <stop offset="40%"  stopColor="#0369a1" />
          <stop offset="100%" stopColor="#0c2340" />
        </radialGradient>
        <radialGradient id="lg-atmos" cx="50%" cy="50%" r="50%">
          <stop offset="72%"  stopColor="#0ea5e9" stopOpacity="0" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.55" />
        </radialGradient>
        <radialGradient id="lg-shine" cx="30%" cy="25%" r="45%">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lg-ring" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#7dd3fc" stopOpacity="0" />
          <stop offset="35%"  stopColor="#38bdf8" stopOpacity="0.9" />
          <stop offset="65%"  stopColor="#38bdf8" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="lg-gtm" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#0284c7" />
          <stop offset="55%"  stopColor="#0369a1" />
          <stop offset="100%" stopColor="#164e63" />
        </linearGradient>
      </defs>

      <circle cx={cx} cy={cy} r={pr + 3.5} fill="url(#lg-atmos)" />
      <circle cx={cx} cy={cy} r={pr} fill="url(#lg-planet)" />
      <ellipse cx={cx} cy={cy + 3} rx={pr} ry={pr * 0.28} fill="#0c2340" fillOpacity="0.35" />
      <ellipse cx={cx - 2} cy={cy - pr * 0.55} rx={pr * 0.38} ry={pr * 0.18} fill="#e0f2fe" fillOpacity="0.22" />
      <circle cx={cx} cy={cy} r={pr} fill="url(#lg-shine)" />
      <ellipse cx={cx} cy={cy} rx={pr + 7} ry={(pr + 7) * 0.3} stroke="url(#lg-ring)" strokeWidth="1.4" fill="none" transform={`rotate(-18 ${cx} ${cy})`} />
      <circle cx={cx + pr + 5.5} cy={cy - 3.5} r="2.4" fill="#bae6fd" />
      <circle cx={cx + pr + 4.8} cy={cy - 4.2} r="0.85" fill="white" fillOpacity="0.7" />

      <text x="40" y="25" fontFamily="'DM Sans', 'Inter', system-ui, sans-serif" fontSize="19.5" letterSpacing="-0.04em">
        <tspan fontWeight="700" fill="#0f172a">Astro</tspan>
        <tspan fontWeight="800" fill="url(#lg-gtm)" dx="2">GTM</tspan>
      </text>
    </svg>
  );
}

/* ── shared dropdown animation style ───────────────────────── */
const DROPDOWN_STYLE = `
  @keyframes dropdownIn {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
`;

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
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #0ea5e9, #38bdf8, #0ea5e9)' }} />
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
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-full mb-4">
              <Sparkles className="w-3 h-3" /> Newsletters
            </span>
            <h3 className="text-[18px] font-extrabold text-slate-900 leading-snug mb-1.5 tracking-tight">
              Find emerging AI tools first
            </h3>
            <p className="text-[13px] text-slate-500 leading-relaxed mb-5">
              Weekly digest for GTM, SEO &amp; growth teams — curated picks, free tiers, and early-access deals.
            </p>
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
                Subscribe
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

/* ── Submit Tool dropdown ────────────────────────────────────── */
const SUBMIT_OPTIONS = [
  {
    label: 'Product Launch',
    desc: 'Get early adopters organically',
    href: '/contact',
    icon: <Rocket className="w-3.5 h-3.5" />,
    accent: '#0369a1',
  },
  {
    label: 'Expert Review',
    desc: 'Get honest feedback from PMs',
    href: '/contact',
    icon: <FileSearch className="w-3.5 h-3.5" />,
    accent: '#0d9488',
  },
  {
    label: 'Advertise',
    desc: 'Get 10x traffic and sign-ups',
    href: '/contact',
    icon: <Megaphone className="w-3.5 h-3.5" />,
    accent: '#b45309',
  },
];

/* ── Newsletter dropdown ─────────────────────────────────────── */
const NEWSLETTER_OPTIONS = [
  {
    label: 'Top 3 Tools',
    desc: 'Best reviewed in each category',
    icon: <Sparkles className="w-3.5 h-3.5" />,
    accent: '#0369a1',
  },
  {
    label: 'Competitor Analysis',
    desc: 'Stay updated on similar tools',
    icon: <Bell className="w-3.5 h-3.5" />,
    accent: '#6d28d9',
  },
  {
    label: 'Founder Playbooks',
    desc: 'Real-world AI growth experiments',
    icon: <BookOpen className="w-3.5 h-3.5" />,
    accent: '#0d9488',
  },
];

function NavDropdown({
  trigger,
  items,
  onItemClick,
  highlight = false,
}: {
  trigger: React.ReactNode;
  items: { label: string; desc: string; href?: string; icon: React.ReactNode; accent: string }[];
  onItemClick?: (label: string) => void;
  highlight?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const baseBtn = highlight
    ? `inline-flex items-center gap-1.5 text-[13px] font-semibold px-3 py-1.5 rounded-md border transition-all duration-150 ${
        open
          ? 'bg-sky-100 border-sky-300 text-sky-800'
          : 'bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100 hover:border-sky-300'
      }`
    : `inline-flex items-center gap-1.5 text-[13px] font-medium px-2.5 py-1.5 rounded-md transition-all duration-150 ${
        open ? 'text-slate-900 bg-slate-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
      }`;

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(v => !v)} className={baseBtn}>
        {trigger}
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-60 bg-white rounded-lg z-50 overflow-hidden"
          style={{
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(15,23,42,0.10), 0 1px 3px rgba(15,23,42,0.06)',
            animation: 'dropdownIn 0.12s ease-out',
          }}
        >
          <style>{DROPDOWN_STYLE}</style>
          {items.map((opt, idx) => {
            const row = (
              <button
                key={opt.label}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors text-left group"
                style={{ borderTop: idx > 0 ? '1px solid #f1f5f9' : undefined }}
                onClick={() => { setOpen(false); onItemClick?.(opt.label); }}
              >
                <span
                  className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                  style={{ background: opt.accent + '15', color: opt.accent }}
                >
                  {opt.icon}
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold text-slate-800 leading-snug">{opt.label}</span>
                  <span className="block text-[11px] text-slate-400 leading-snug">{opt.desc}</span>
                </span>
              </button>
            );
            return opt.href ? (
              <Link key={opt.label} href={opt.href} onClick={() => setOpen(false)}>
                {row}
              </Link>
            ) : row;
          })}
        </div>
      )}
    </div>
  );
}

/* ── Site header ────────────────────────────────────────────── */
export function SiteHeader() {
  const [newsletterOpen, setNewsletterOpen] = useState(false);

  return (
    <>
      <header className="bg-white/95 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-3">
            <Link href="/" className="flex items-center group shrink-0">
              <AstroGTMLogo size={34} />
            </Link>

            <nav className="flex items-center gap-0.5">
              {/* Submit Tool dropdown */}
              <NavDropdown
                trigger={<><Rocket className="w-3.5 h-3.5 shrink-0 text-slate-500" /><span className="hidden sm:inline">Submit Tool</span></>}
                items={SUBMIT_OPTIONS}
              />

              {/* Newsletters — highlighted pill trigger */}
              <NavDropdown
                trigger={
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: '#0284c7' }} />
                    <span className="hidden sm:inline font-semibold" style={{ color: '#0369a1' }}>Newsletters</span>
                  </span>
                }
                items={NEWSLETTER_OPTIONS}
                onItemClick={() => setNewsletterOpen(true)}
                highlight
              />
            </nav>
          </div>
        </div>
      </header>
      {newsletterOpen && <NewsletterModal onClose={() => setNewsletterOpen(false)} />}
    </>
  );
}

/* ── Inner page header (breadcrumb) ─────────────────────────── */
interface BreadcrumbItem { label: string; href?: string }

export function InnerHeader({ crumbs }: { crumbs: BreadcrumbItem[] }) {
  const [newsletterOpen, setNewsletterOpen] = useState(false);
  return (
    <>
      <header className="bg-white/95 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-3">
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
            <nav className="flex items-center gap-0.5 shrink-0">
              <NavDropdown
                trigger={<><Rocket className="w-3.5 h-3.5 shrink-0 text-slate-500" /><span className="hidden sm:inline">Submit Tool</span></>}
                items={SUBMIT_OPTIONS}
              />
              <NavDropdown
                trigger={
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: '#0284c7' }} />
                    <span className="hidden sm:inline font-semibold" style={{ color: '#0369a1' }}>Newsletters</span>
                  </span>
                }
                items={NEWSLETTER_OPTIONS}
                onItemClick={() => setNewsletterOpen(true)}
                highlight
              />
            </nav>
          </div>
        </div>
      </header>
      {newsletterOpen && <NewsletterModal onClose={() => setNewsletterOpen(false)} />}
    </>
  );
}

/* ── Page-level breadcrumb bar ─────────────────────────────── */
export function PageBreadcrumb({ crumbs }: { crumbs: BreadcrumbItem[] }) {
  return (
    <div className="bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 py-2.5 text-[13px] min-w-0 overflow-x-auto scrollbar-none">
          <Link href="/" className="text-slate-500 hover:text-slate-900 transition-colors shrink-0 whitespace-nowrap">Home</Link>
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
