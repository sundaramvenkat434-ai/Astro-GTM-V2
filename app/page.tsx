'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { SiteHeader } from '@/components/site-header';
import { UpvoteButton } from '@/components/upvote-button';
import { SiteFooter } from '@/components/site-footer';
import {
  Search, TrendingUp, Users, Megaphone, Star, ArrowRight,
  LayoutGrid, Gift, ExternalLink,
  Zap, Share2, ChevronRight, LogIn, Scan, RefreshCw,
} from 'lucide-react';

/* ─── types ─────────────────────────────────────────────────── */
interface ToolPage {
  id: string; slug: string; name: string; tagline: string;
  description: string; category: string; tags: string[];
  badge: string | null; rating: number; rating_count: string;
  users: string; upvotes: number; use_cases: string[];
}

/* ─── tokens ─────────────────────────────────────────────────── */
const SECTION_ORDER = ['seo-content', 'lead-generation', 'sales-outreach', 'social-media', 'paid-marketing', 'analytics-insights'];
const SECTION_LABELS: Record<string, string> = {
  'seo-content':        'Content & SEO',
  'lead-generation':    'Lead Generation',
  'sales-outreach':     'Sales Outreach',
  'social-media':       'Social Media',
  'paid-marketing':     'Paid Marketing',
  'analytics-insights': 'Analytics & Insights',
};

/* Pastel fill per category — used for card tint, pill bg, icon bg */
const CATEGORY_PASTEL: Record<string, string> = {
  'seo-content':        '#dbeafe', // blue-100
  'lead-generation':    '#dcfce7', // green-100
  'sales-outreach':     '#fef9c3', // yellow-100
  'social-media':       '#fce7f3', // pink-100
  'paid-marketing':     '#ffedd5', // orange-100
  'analytics-insights': '#ede9fe', // violet-100 — only violet use in this file
};

/* Dot / icon / border accent per category */
const CATEGORY_PASTEL_DARK: Record<string, string> = {
  'seo-content':        '#2563eb', // blue-600
  'lead-generation':    '#16a34a', // green-600
  'sales-outreach':     '#ca8a04', // yellow-600
  'social-media':       '#db2777', // pink-600
  'paid-marketing':     '#ea580c', // orange-600
  'analytics-insights': '#7c3aed', // violet-600
};

const CATEGORY_ACCENT: Record<string, string> = {
  'seo-content':        '#2563eb',
  'lead-generation':    '#16a34a',
  'sales-outreach':     '#ca8a04',
  'social-media':       '#db2777',
  'paid-marketing':     '#ea580c',
  'analytics-insights': '#7c3aed',
};

const CARD_GRADIENTS: Record<string, string> = {
  'seo-content':        'linear-gradient(145deg, #dbeafe30 0%, rgba(255,255,255,1) 50%)',
  'lead-generation':    'linear-gradient(145deg, #dcfce730 0%, rgba(255,255,255,1) 50%)',
  'sales-outreach':     'linear-gradient(145deg, #fef9c330 0%, rgba(255,255,255,1) 50%)',
  'social-media':       'linear-gradient(145deg, #fce7f330 0%, rgba(255,255,255,1) 50%)',
  'paid-marketing':     'linear-gradient(145deg, #ffedd530 0%, rgba(255,255,255,1) 50%)',
  'analytics-insights': 'linear-gradient(145deg, #ede9fe30 0%, rgba(255,255,255,1) 50%)',
};

const CARD_BTN_GRADIENT: Record<string, string> = {
  'seo-content':        'linear-gradient(145deg, #dbeafe 0%, #bfdbfe 100%)',
  'lead-generation':    'linear-gradient(145deg, #dcfce7 0%, #bbf7d0 100%)',
  'sales-outreach':     'linear-gradient(145deg, #fef9c3 0%, #fef08a 100%)',
  'social-media':       'linear-gradient(145deg, #fce7f3 0%, #fbcfe8 100%)',
  'paid-marketing':     'linear-gradient(145deg, #ffedd5 0%, #fed7aa 100%)',
  'analytics-insights': 'linear-gradient(145deg, #ede9fe 0%, #ddd6fe 100%)',
};

/* Category pill colors — inline style driven by pastel tokens */
const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  'seo-content':        { bg: '', text: '', border: '', dot: '' },
  'lead-generation':    { bg: '', text: '', border: '', dot: '' },
  'sales-outreach':     { bg: '', text: '', border: '', dot: '' },
  'social-media':       { bg: '', text: '', border: '', dot: '' },
  'paid-marketing':     { bg: '', text: '', border: '', dot: '' },
  'analytics-insights': { bg: '', text: '', border: '', dot: '' },
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  all:                  <LayoutGrid className="w-4 h-4" />,
  'seo-content':        <TrendingUp className="w-4 h-4" />,
  'lead-generation':    <Users className="w-4 h-4" />,
  'sales-outreach':     <Megaphone className="w-4 h-4" />,
  'social-media':       <Share2 className="w-4 h-4" />,
  'paid-marketing':     <Zap className="w-4 h-4" />,
  'analytics-insights': <Star className="w-4 h-4" />,
};

const BADGE_STYLES: Record<string, string> = {
  new:     'bg-sky-50 text-sky-700 border-sky-200',
  popular: 'bg-amber-50 text-amber-700 border-amber-200',
  free:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  hot:     'bg-rose-50 text-rose-700 border-rose-200',
};

/* ─── category pill ─────────────────────────────────────────── */
function CategoryPill({ category }: { category: string }) {
  const bg   = CATEGORY_PASTEL[category];
  const dark = CATEGORY_PASTEL_DARK[category];
  if (!bg) return null;
  return (
    <Link
      href={`/category/${category}`}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-opacity hover:opacity-75 shrink-0"
      style={{ backgroundColor: bg, color: dark, borderColor: dark + '40' }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dark }} />
      {SECTION_LABELS[category] ?? category}
    </Link>
  );
}

/* ─── star rating with editor count ─────────────────────────── */
function seededInt(seed: string, min: number, max: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  return min + Math.floor(((Math.abs(h) % 1000) / 1000) * (max - min + 1));
}

function MiniStarRating({ rating, toolId }: { rating: number; toolId: string }) {
  const count = seededInt(toolId, 3, 10);
  return (
    <span className="inline-flex items-center gap-1">
      <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
      <span className="text-[11.5px] font-bold text-slate-800">{rating}</span>
      <span className="text-[10px] text-slate-400 font-medium">({count})</span>
    </span>
  );
}

/* ─── tool card ─────────────────────────────────────────────── */
function ToolCard({ tool }: { tool: ToolPage }) {
  const btnGrad   = CARD_BTN_GRADIENT[tool.category] ?? 'linear-gradient(135deg, #334155 0%, #475569 100%)';
  const bgGrad    = CARD_GRADIENTS[tool.category];
  const accent    = CATEGORY_ACCENT[tool.category] ?? '#64748b';
  const useCases  = (tool.use_cases as string[]) ?? [];

  return (
    <div
      className="group flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 hover:shadow-md hover:shadow-slate-200/50 transition-all duration-200"
      style={bgGrad ? { background: bgGrad } : undefined}
    >
      <div className="flex gap-3 p-3.5 flex-1">
        {/* Gradient avatar */}
        <div
          className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center font-bold text-[14px] shadow-sm mt-0.5 border border-sky-200"
          style={{ background: btnGrad, color: '#0369a1' }}
        >
          {tool.name.charAt(0)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          <Link href={`/category/${tool.category}/${tool.slug}`} className="block">
            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
              <span className="type-card-title group-hover:text-sky-700 transition-colors">
                {tool.name}
              </span>
              {tool.badge && (
                <span className={`inline-flex items-center px-1.5 py-px rounded text-[9px] font-bold uppercase tracking-wider border ${BADGE_STYLES[tool.badge] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                  {tool.badge}
                </span>
              )}
            </div>
            <p className="type-card-body line-clamp-2 mb-2">
              {tool.tagline || tool.description}
            </p>
          </Link>

          {/* Use cases — horizontal scroll, no scrollbar */}
          {useCases.length > 0 && (
            <div className="flex gap-1 overflow-x-auto scrollbar-none mt-auto pb-0.5">
              {useCases.map(uc => (
                <Link
                  key={uc}
                  href={`/category/${tool.category}/${tool.slug}#use-cases`}
                  className="shrink-0 text-[9.5px] font-medium px-2 py-0.5 rounded-full border bg-white/80 text-slate-500 border-slate-200 hover:border-current transition-colors whitespace-nowrap"
                  style={{ ['--hover-color' as string]: accent }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.color = accent;
                    (e.currentTarget as HTMLElement).style.borderColor = accent + '60';
                    (e.currentTarget as HTMLElement).style.background = accent + '0f';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.color = '';
                    (e.currentTarget as HTMLElement).style.borderColor = '';
                    (e.currentTarget as HTMLElement).style.background = '';
                  }}
                >
                  {uc}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-3.5 py-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <MiniStarRating rating={tool.rating} toolId={tool.id} />
          <UpvoteButton toolId={tool.id} initialCount={tool.upvotes ?? 0} />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span
            className="hidden sm:inline text-[10px] font-medium px-1.5 py-0.5 rounded"
            style={{
              color: CATEGORY_PASTEL_DARK[tool.category] ?? '#64748b',
              background: CATEGORY_PASTEL[tool.category] ? CATEGORY_PASTEL[tool.category] + '55' : '#f1f5f9',
            }}
          >
            {SECTION_LABELS[tool.category] ?? tool.category}
          </span>
          <Link
            href={`/category/${tool.category}/${tool.slug}`}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-800 bg-white border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50 hover:border-slate-400 active:scale-[0.97] transition-all shadow-sm"
          >
            View Tool <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── page ───────────────────────────────────────────────────── */
export default function HomePage() {
  const [tools, setTools]               = useState<ToolPage[]>([]);
  const [loading, setLoading]           = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [query, setQuery]               = useState('');
  const canvasRef                       = useRef<HTMLCanvasElement>(null);
  const [heroVisible, setHeroVisible]   = useState(false);
  const [creditsHover, setCreditsHover] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  /* ── canvas animation ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf: number;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    let t = 0;

    const STARS = Array.from({ length: 300 }, () => ({
      x: Math.random(), y: Math.random(),
      r: 0.3 + Math.random() * 1.6,
      twinkleSpeed: 0.012 + Math.random() * 0.05,
      twinkleOffset: Math.random() * Math.PI * 2,
      baseOpacity: 0.2 + Math.random() * 0.5,
      hue: Math.random() < 0.5 ? '14,165,233' : Math.random() < 0.5 ? '20,184,166' : '100,116,139',
    }));

    const ORBS = [
      { x: 0.75, y: 0.22, r: 0.34, color: '56,189,248',  vx:  0.00010, vy:  0.00007 },
      { x: 0.15, y: 0.58, r: 0.28, color: '20,184,166',  vx: -0.00008, vy: -0.00005 },
      { x: 0.50, y: 0.88, r: 0.24, color: '125,211,252', vx:  0.00006, vy:  0.00009 },
      { x: 0.92, y: 0.70, r: 0.20, color: '56,189,248',  vx: -0.00010, vy:  0.00004 },
    ];

    const DUST = Array.from({ length: 50 }, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00022,
      vy: -0.00018 - Math.random() * 0.00028,
      r: 1.2 + Math.random() * 2.2,
      opacity: 0.07 + Math.random() * 0.12,
    }));

    type Shooter = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; active: boolean };
    const SHOOTERS: Shooter[] = Array.from({ length: 5 }, () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1, active: false }));
    function spawnShooter(s: Shooter) {
      s.x = 0.05 + Math.random() * 0.55; s.y = 0.02 + Math.random() * 0.4;
      const angle = Math.PI / 6 + (Math.random() - 0.5) * 0.4;
      const speed = 0.004 + Math.random() * 0.004;
      s.vx = Math.cos(angle) * speed; s.vy = Math.sin(angle) * speed;
      s.maxLife = 50 + Math.random() * 50; s.life = 0; s.active = true;
    }
    spawnShooter(SHOOTERS[0]);
    setTimeout(() => spawnShooter(SHOOTERS[1]), 1800);

    const RINGS = [
      { cx: 0.85, cy: 0.15, rx: 0.09, ry: 0.035, angle: 0,   speed:  0.003, opacity: 0.12 },
      { cx: 0.12, cy: 0.2,  rx: 0.07, ry: 0.025, angle: 1.2, speed: -0.002, opacity: 0.09 },
    ];

    function draw() {
      if (!ctx || !canvas) return;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      t++;

      for (const o of ORBS) {
        o.x += o.vx; o.y += o.vy;
        if (o.x < -0.1) o.x = 1.1; if (o.x > 1.1) o.x = -0.1;
        if (o.y < -0.1) o.y = 1.1; if (o.y > 1.1) o.y = -0.1;
        const g = ctx.createRadialGradient(o.x*W, o.y*H, 0, o.x*W, o.y*H, o.r*W);
        g.addColorStop(0, `rgba(${o.color},0.18)`);
        g.addColorStop(0.5, `rgba(${o.color},0.07)`);
        g.addColorStop(1, `rgba(${o.color},0)`);
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      }

      for (const s of STARS) {
        const flicker = Math.sin(t * s.twinkleSpeed + s.twinkleOffset) * 0.45 + 0.55;
        ctx.globalAlpha = s.baseOpacity * flicker;
        ctx.beginPath(); ctx.arc(s.x*W, s.y*H, s.r, 0, Math.PI*2);
        ctx.fillStyle = `rgb(${s.hue})`; ctx.fill();
      }
      ctx.globalAlpha = 1;

      for (const d of DUST) {
        d.x += d.vx; d.y += d.vy;
        if (d.y < -0.02) { d.y = 1.02; d.x = Math.random(); }
        if (d.x < 0) d.x = 1; if (d.x > 1) d.x = 0;
        ctx.globalAlpha = d.opacity;
        const dg = ctx.createRadialGradient(d.x*W, d.y*H, 0, d.x*W, d.y*H, d.r);
        dg.addColorStop(0, 'rgba(14,165,233,0.9)'); dg.addColorStop(1, 'rgba(14,165,233,0)');
        ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(d.x*W, d.y*H, d.r, 0, Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha = 1;

      for (const ring of RINGS) {
        ring.angle += ring.speed;
        ctx.save();
        ctx.translate(ring.cx*W, ring.cy*H);
        ctx.rotate(ring.angle);
        ctx.scale(1, ring.ry / ring.rx);
        ctx.beginPath(); ctx.arc(0, 0, ring.rx*W, 0, Math.PI*2);
        ctx.restore();
        ctx.strokeStyle = `rgba(14,165,233,${ring.opacity})`;
        ctx.lineWidth = 1; ctx.stroke();
      }

      if (t % 90 === 0) {
        const idle = SHOOTERS.find(s => !s.active);
        if (idle) spawnShooter(idle);
      }
      for (const s of SHOOTERS) {
        if (!s.active) continue;
        s.x += s.vx; s.y += s.vy; s.life++;
        if (s.life > s.maxLife || s.x > 1.2 || s.y > 1.2) { s.active = false; continue; }
        const prog = s.life / s.maxLife;
        const alpha = prog < 0.15 ? prog / 0.15 : prog > 0.75 ? (1 - prog) / 0.25 : 1;
        const tailLen = 100 + prog * 60;
        const nx = s.vx / Math.sqrt(s.vx*s.vx + s.vy*s.vy);
        const ny = s.vy / Math.sqrt(s.vx*s.vx + s.vy*s.vy);
        const grd = ctx.createLinearGradient(s.x*W - nx*tailLen, s.y*H - ny*tailLen, s.x*W, s.y*H);
        grd.addColorStop(0, 'rgba(14,165,233,0)');
        grd.addColorStop(0.7, `rgba(56,189,248,${alpha*0.5})`);
        grd.addColorStop(1, `rgba(255,255,255,${alpha*0.95})`);
        ctx.strokeStyle = grd; ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(s.x*W - nx*tailLen, s.y*H - ny*tailLen);
        ctx.lineTo(s.x*W, s.y*H); ctx.stroke();
        ctx.beginPath(); ctx.arc(s.x*W, s.y*H, 2, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,255,255,${alpha*0.9})`; ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    supabase.from('tool_pages')
      .select('id, slug, name, tagline, description, category, tags, badge, rating, rating_count, users, upvotes, use_cases')
      .eq('status', 'published')
      .order('upvotes', { ascending: false })
      .then(({ data }) => { if (data) setTools(data as ToolPage[]); setLoading(false); });
  }, []);

  const filtered = tools.filter(t => {
    const matchCat = activeCategory === 'all' || t.category === activeCategory;
    const q = query.toLowerCase();
    const matchQ = !q ||
      t.name.toLowerCase().includes(q) ||
      (t.tagline || t.description).toLowerCase().includes(q) ||
      (t.tags as string[])?.some(tag => tag.toLowerCase().includes(q)) ||
      (t.use_cases as string[])?.some(uc => uc.toLowerCase().includes(q));
    return matchCat && matchQ;
  });

  const categoryCounts = tools.reduce<Record<string, number>>((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1; return acc;
  }, {});

  const categories = [
    { id: 'all', label: 'All Tools', count: tools.length },
    ...SECTION_ORDER.filter(c => categoryCounts[c]).map(c => ({ id: c, label: SECTION_LABELS[c], count: categoryCounts[c] })),
  ];

  const sections = activeCategory === 'all'
    ? SECTION_ORDER.filter(c => filtered.some(t => t.category === c))
    : [activeCategory];

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col">
      <SiteHeader />

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden border-b border-slate-800/50"
        style={{ background: 'linear-gradient(160deg, #060d1f 0%, #0a1628 45%, #071820 75%, #040d18 100%)' }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-70" aria-hidden />
        <div className="absolute left-0 right-0 top-0 h-px pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent 10%, rgba(14,165,233,0.5) 40%, rgba(20,184,166,0.5) 60%, transparent 90%)' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 0%, rgba(14,165,233,0.13) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(4,13,24,0.9) 0%, transparent 100%)' }} />

        <div className={`relative max-w-3xl mx-auto px-6 sm:px-6 lg:px-8 pt-12 pb-12 sm:pt-20 sm:pb-20 text-center transition-all duration-700 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>

          {/* Eyebrow pill */}
          <div className="inline-flex items-center gap-2 mb-5 sm:mb-6 px-3.5 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.04]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="type-eyebrow leading-none">
              20+ New Tools Added
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-[2rem] sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-[-0.02em] mb-4 sm:mb-5">
            Stop Shipping Features.
            <br />
            <span className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #93c5fd 0%, #38bdf8 35%, #2dd4bf 70%, #34d399 100%)' }}>
              Start Creating Demand.
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="font-sans text-[15px] sm:text-lg font-normal text-slate-400 leading-[1.65] max-w-[520px] mx-auto mb-7 sm:mb-9 tracking-[0.005em]">
            Discover top, tested{' '}
            <span className="text-white font-medium">AI Growth Tools</span>{' '}
            across SEO, Lead Gen, Sales Outreach, Social Media, and more, with{' '}
            <span className="text-emerald-400 font-semibold">FREE Plans</span>.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-3 mb-7 sm:mb-9 w-full">
            {/* Browse Top Tools */}
            <button
              onClick={() => document.getElementById('tools-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="group relative overflow-hidden inline-flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3.5 rounded-lg font-bold tracking-tight text-[14px] text-white transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
              style={{
                background: 'linear-gradient(135deg, #01497c 0%, #0264a0 50%, #0277bd 100%)',
                boxShadow: '0 0 0 1.5px rgba(2,100,160,0.9), 0 6px 20px rgba(1,73,124,0.55), inset 0 1px 0 rgba(255,255,255,0.12)',
                letterSpacing: '-0.01em',
              }}
            >
              <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
              <Zap className="w-4 h-4 shrink-0 relative" />
              <span className="relative">Browse Top Tools</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200 shrink-0 relative" />
            </button>

            {/* FREE $50 Credits */}
            <button
              onClick={() => document.getElementById('tools-section')?.scrollIntoView({ behavior: 'smooth' })}
              onMouseEnter={() => setCreditsHover(true)}
              onMouseLeave={() => setCreditsHover(false)}
              className="relative inline-flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3.5 rounded-lg font-bold tracking-tight text-[14px] transition-all duration-300 overflow-hidden hover:scale-[1.03] active:scale-[0.97]"
              style={{
                background: 'rgba(15,23,42,0.85)',
                border: creditsHover ? '1.5px solid rgba(251,191,36,0.55)' : '1.5px solid rgba(255,255,255,0.14)',
                color: 'rgba(255,255,255,0.9)',
                boxShadow: creditsHover ? '0 0 0 1.5px rgba(251,191,36,0.2), 0 6px 20px rgba(251,191,36,0.12)' : '0 0 0 1.5px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.3)',
                letterSpacing: '-0.01em',
                transition: 'all 0.3s ease',
              }}
            >
              <Gift
                className="w-4 h-4 shrink-0 transition-all duration-300"
                style={{
                  color: creditsHover ? '#fbbf24' : '#f59e0b',
                  transform: creditsHover ? 'rotate(-12deg) scale(1.2)' : 'none',
                }}
              />
              <span className="text-white font-bold">FREE</span>
              <span
                className="font-bold transition-all duration-300"
                style={{ color: creditsHover ? '#fde68a' : '#fbbf24' }}
              >
                $50 Credits
              </span>
              {creditsHover && (
                <span className="absolute inset-0 translate-x-[-100%] animate-[shimmer_0.8s_ease_forwards] bg-gradient-to-r from-transparent via-amber-300/10 to-transparent pointer-events-none" />
              )}
            </button>
          </div>

          {/* Trust strip */}
          <div className="flex items-center justify-center gap-4 sm:gap-7 flex-wrap">
            {([
              { label: 'No login required', Icon: LogIn },
              { label: 'Zero ads',          Icon: Scan },
              { label: 'Weekly updates',    Icon: RefreshCw },
            ] as const).map(({ label: item, Icon }, i, arr) => (
              <span key={item} className="flex items-center gap-1.5">
                <span className="flex items-center gap-1.5 text-[12.5px] sm:text-[12.5px] text-slate-500 tracking-[0.01em]">
                  <Icon className="w-3 h-3 text-emerald-500/80 shrink-0" />
                  {item}
                </span>
                {i < arr.length - 1 && <span className="w-px h-3.5 bg-slate-700/80 ml-4 sm:ml-7" />}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── All Tools Directory ── */}
      <section id="tools-section" className="bg-[#f8f9fb] flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-[10.5px] font-bold text-sky-600 uppercase tracking-[0.14em] mb-1.5">Directory</p>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">All Tools</h2>
              <p className="text-[13px] text-slate-500 mt-1 font-medium">
                {loading
                  ? 'Loading…'
                  : `${filtered.length} tool${filtered.length !== 1 ? 's' : ''}${activeCategory !== 'all' ? ` in ${SECTION_LABELS[activeCategory]}` : ''}`}
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="search"
                placeholder="Search by name, use-case or description…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-[13.5px] border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 placeholder-slate-400 transition shadow-sm"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center py-24 gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-200 animate-pulse" />
              <p className="text-sm text-slate-400">Loading tools…</p>
            </div>
          ) : (
            <div className="flex gap-6 items-start">
              {/* Desktop sidebar */}
              {categories.length > 1 && (
                <aside className="hidden lg:block w-52 shrink-0 self-start sticky top-20">
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Filter by Category</p>
                    </div>
                    <nav className="p-2 space-y-0.5">
                      {categories.map(cat => {
                        const active = activeCategory === cat.id;
                        const dotColor = CATEGORY_PASTEL_DARK[cat.id];
                        return (
                          <button
                            key={cat.id}
                            onClick={() => { setActiveCategory(cat.id); setQuery(''); }}
                            className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                              active ? 'bg-slate-900 text-white' : 'text-slate-900 hover:bg-slate-50'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: active ? 'rgba(255,255,255,0.7)' : (dotColor ?? '#2563eb') }}
                              />
                              {cat.label}
                            </span>
                            <span className={`text-[11px] tabular-nums px-1.5 py-0.5 rounded-full ${
                              active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                            }`}>{cat.count}</span>
                          </button>
                        );
                      })}
                    </nav>
                  </div>

                  <div className="mt-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Quick Stats</p>
                    {[
                      { label: 'Total Tools', value: tools.length },
                      { label: 'Categories',  value: SECTION_ORDER.filter(c => categoryCounts[c]).length },
                      { label: 'Free Tiers',  value: tools.filter(t => t.badge === 'free').length },
                    ].map(s => (
                      <div key={s.label} className="flex items-center justify-between">
                        <span className="text-[12.5px] text-slate-500">{s.label}</span>
                        <span className="text-[13.5px] font-bold text-slate-800">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </aside>
              )}

              <main className="flex-1 min-w-0">
                {/* Mobile category pills */}
                {categories.length > 1 && (
                  <div className="flex lg:hidden gap-2 overflow-x-auto pb-3 mb-5 scrollbar-hide">
                    {categories.map(cat => {
                      const active = activeCategory === cat.id;
                      const pastel = CATEGORY_PASTEL[cat.id];
                      const dark   = CATEGORY_PASTEL_DARK[cat.id];
                      return (
                        <button
                          key={cat.id}
                          onClick={() => { setActiveCategory(cat.id); setQuery(''); }}
                          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-all"
                          style={active
                            ? { background: '#0f172a', color: '#fff', borderColor: '#0f172a' }
                            : { background: '#fff', color: '#0f172a', borderColor: '#e2e8f0' }
                          }
                        >
                          {pastel && (
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: active ? 'rgba(255,255,255,0.7)' : (dark ?? '#2563eb') }}
                            />
                          )}
                          {cat.label}
                          <span className="text-[10px] opacity-65">{cat.count}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center py-24 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-4">
                      <Search className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-slate-700 font-semibold mb-1">No tools found</p>
                    <p className="text-slate-400 text-[13px]">Try a different search or category.</p>
                  </div>
                ) : (
                  <div className="space-y-10">
                    {sections.map(cat => {
                      const sectionTools = filtered.filter(t => t.category === cat);
                      if (!sectionTools.length) return null;
                      const cc = CATEGORY_COLORS[cat];
                      const accent = CATEGORY_ACCENT[cat];
                      return (
                        <section key={cat} id={`section-${cat}`}>
                          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-200">
                            <span
                              className="w-8 h-8 rounded-lg flex items-center justify-center border"
                              style={{
                                backgroundColor: CATEGORY_PASTEL[cat] ?? '#f1f5f9',
                                color: CATEGORY_PASTEL_DARK[cat] ?? '#475569',
                                borderColor: CATEGORY_PASTEL_DARK[cat] ? CATEGORY_PASTEL_DARK[cat] + '40' : '#e2e8f0',
                              }}
                            >
                              {CATEGORY_ICONS[cat]}
                            </span>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-display text-[15px] font-bold text-slate-900 leading-snug tracking-tight">{SECTION_LABELS[cat]}</h3>
                              <p className="type-card-body font-medium text-slate-400">{sectionTools.length} tool{sectionTools.length !== 1 ? 's' : ''}</p>
                            </div>
                            <div className="hidden sm:block h-1 w-12 rounded-full opacity-40" style={{ background: accent }} />
                            <Link href={`/category/${cat}`} className="hidden sm:inline-flex items-center gap-1 text-[12.5px] font-semibold text-sky-600 hover:text-sky-800 transition-colors">
                              Browse all <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 auto-rows-fr gap-3">
                            {sectionTools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                )}
              </main>
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
