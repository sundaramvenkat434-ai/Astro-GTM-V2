'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ToolCard, SECTION_ORDER, SECTION_LABELS } from '@/components/tool-card';
import type { ToolCardData } from '@/components/tool-card';
import {
  Search, TrendingUp, Users, Megaphone, Star, ArrowRight,
  LayoutGrid, Gift, Trophy, Calendar,
  Zap, Share2, ChevronRight, ChevronDown, ChevronUp, LogIn, Scan, RefreshCw,
} from 'lucide-react';

/* ─── types ─────────────────────────────────────────────────── */
type ToolPage = ToolCardData;

interface TopXPageSummary {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: string;
  tool_ids: string[];
  published_at: string;
}

/* ─── tokens ─────────────────────────────────────────────────── */
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  all:                  <LayoutGrid className="w-4 h-4" />,
  'seo-content':        <TrendingUp className="w-4 h-4" />,
  'lead-generation':    <Users className="w-4 h-4" />,
  'sales-outreach':     <Megaphone className="w-4 h-4" />,
  'social-media':       <Share2 className="w-4 h-4" />,
  'paid-marketing':     <Zap className="w-4 h-4" />,
  'analytics-insights': <Star className="w-4 h-4" />,
};



/* ─── page ───────────────────────────────────────────────────── */
export default function HomePage() {
  const [tools, setTools]               = useState<ToolPage[]>([]);
  const [viewCounts, setViewCounts]     = useState<Record<string, number>>({});
  const [loading, setLoading]           = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [query, setQuery]               = useState('');
  const canvasRef                       = useRef<HTMLCanvasElement>(null);
  const [heroVisible, setHeroVisible]   = useState(false);
  const [creditsHover, setCreditsHover] = useState(false);
  const [topXPages, setTopXPages]       = useState<TopXPageSummary[]>([]);
  const [topXToolInfo, setTopXToolInfo] = useState<Record<string, { name: string; rating: number; tagline: string }>>({});

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
      .select('id, slug, name, tagline, description, category, tags, badge, rating, rating_count, users, upvotes, use_cases, updated_at, logo_url, logo_alt')
      .eq('status', 'published')
      .order('updated_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          setTools(data as ToolPage[]);
          const ids = (data as ToolPage[]).map(t => t.id);
          if (ids.length > 0) {
            supabase.from('page_views')
              .select('page_id')
              .in('page_id', ids)
              .then(({ data: views }) => {
                if (views) {
                  const counts: Record<string, number> = {};
                  for (const row of views) {
                    counts[row.page_id] = (counts[row.page_id] ?? 0) + 1;
                  }
                  setViewCounts(counts);
                }
              });
          }
        }
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    supabase.from('top_x_pages')
      .select('id, slug, name, tagline, category, tool_ids, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(6)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setTopXPages(data as TopXPageSummary[]);
          const allToolIds = Array.from(new Set(data.flatMap((p: TopXPageSummary) => p.tool_ids || [])));
          if (allToolIds.length > 0) {
            supabase.from('tool_pages')
              .select('id, name, rating, tagline')
              .in('id', allToolIds)
              .then(({ data: toolData }) => {
                if (toolData) {
                  const infoMap: Record<string, { name: string; rating: number; tagline: string }> = {};
                  for (const t of toolData) infoMap[t.id] = { name: t.name, rating: t.rating, tagline: t.tagline };
                  setTopXToolInfo(infoMap);
                }
              });
          }
        }
      });
  }, []);

  const filtered = (() => {
    const q = query.trim().toLowerCase();
    const catFiltered = tools.filter(t => activeCategory === 'all' || t.category === activeCategory);
    if (!q) return catFiltered;

    return catFiltered.filter(t => {
      const haystack = [
        t.name,
        t.tagline ?? '',
        t.description ?? '',
        ...((t.use_cases as string[]) ?? []),
      ].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  })();

  const categoryCounts = tools.reduce<Record<string, number>>((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1; return acc;
  }, {});

  const categories = [
    { id: 'all', label: 'All Tools', count: tools.length },
    ...SECTION_ORDER.filter(c => categoryCounts[c]).map(c => ({ id: c, label: SECTION_LABELS[c], count: categoryCounts[c] })),
  ];

  const sortedFiltered = query
    ? filtered
    : [...filtered].sort((a, b) => (b.upvotes ?? 0) - (a.upvotes ?? 0));

  const sections = activeCategory === 'all'
    ? SECTION_ORDER.filter(c => sortedFiltered.some(t => t.category === c))
    : [activeCategory];

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col">
      <SiteHeader />

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden border-b border-slate-800/50"
        style={{ background: 'linear-gradient(160deg, #050c1a 0%, #091525 30%, #071a24 60%, #040d18 100%)' }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-80" aria-hidden />
        {/* Top edge glow */}
        <div className="absolute left-0 right-0 top-0 h-px pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent 5%, rgba(14,165,233,0.6) 30%, rgba(56,189,248,0.7) 50%, rgba(20,184,166,0.6) 70%, transparent 95%)' }} />
        {/* Upper radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 65% 55% at 50% 0%, rgba(14,165,233,0.14) 0%, transparent 70%)' }} />
        {/* Side accent glows */}
        <div className="absolute top-1/3 left-0 w-[350px] h-[350px] pointer-events-none"
          style={{ background: 'radial-gradient(circle at 0% 50%, rgba(20,184,166,0.07) 0%, transparent 60%)' }} />
        <div className="absolute top-1/4 right-0 w-[350px] h-[350px] pointer-events-none"
          style={{ background: 'radial-gradient(circle at 100% 50%, rgba(56,189,248,0.05) 0%, transparent 60%)' }} />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(4,13,24,0.95) 0%, transparent 100%)' }} />

        <div className={`relative max-w-3xl mx-auto px-6 sm:px-8 lg:px-10 pt-14 pb-14 sm:pt-32 sm:pb-32 lg:pt-32 lg:pb-32 text-center transition-all duration-700 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>

          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-700/60 bg-slate-800/40 backdrop-blur-sm mb-5 sm:mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-[13px] text-slate-300 font-medium tracking-wide">
              Added This Week — <span className="text-emerald-400 font-semibold">20+ Tools</span>
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-[2rem] sm:text-5xl lg:text-[3.5rem] font-extrabold text-white leading-[1.08] tracking-[-0.025em] mb-4 sm:mb-5">
            Stop Shipping Features.
            <br />
            <span className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(95deg, #7dd3fc 0%, #38bdf8 30%, #2dd4bf 65%, #34d399 100%)' }}>
              Start Creating Demand.
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="font-sans text-[15px] sm:text-lg font-normal text-slate-400 leading-[1.65] max-w-[540px] mx-auto mb-7 sm:mb-8 tracking-[0.005em]">
            Find tools that work for you, {' '}
            <span className="text-white font-medium">fast.</span>{' '}
            Curated AI tools across SEO, lead gen, sales outreach, social media, and more, {' '}
            <span className="text-emerald-400 font-semibold">by experts</span>.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-7 sm:mb-9 w-full">
            {/* Browse Top Tools */}
            <button
              onClick={() => document.getElementById('tools-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="group relative overflow-hidden inline-flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3.5 rounded-lg font-bold tracking-tight text-[14px] text-white transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
              style={{
                background: 'linear-gradient(135deg, #01497c 0%, #0264a0 50%, #0284c7 100%)',
                boxShadow: '0 0 0 1.5px rgba(2,132,199,0.8), 0 8px 28px rgba(1,73,124,0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
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
              className="relative inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-7 py-3.5 rounded-lg font-bold tracking-tight text-[14px] transition-all duration-300 overflow-hidden hover:scale-[1.03] active:scale-[0.97]"
              style={{
                background: 'linear-gradient(145deg, #0f1729 0%, #162032 50%, #0f1729 100%)',
                border: creditsHover ? '1.5px solid rgba(56,189,248,0.6)' : '1.5px solid rgba(56,189,248,0.25)',
                color: 'rgba(255,255,255,0.9)',
                boxShadow: creditsHover
                  ? '0 0 0 1px rgba(56,189,248,0.3), 0 8px 28px rgba(14,165,233,0.15), inset 0 1px 0 rgba(56,189,248,0.1)'
                  : '0 0 0 1px rgba(56,189,248,0.1), 0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
                letterSpacing: '-0.01em',
                transition: 'all 0.3s ease',
              }}
            >
              <Gift
                className="w-4 h-4 shrink-0 transition-all duration-300"
                style={{
                  color: creditsHover ? '#7dd3fc' : '#38bdf8',
                  transform: creditsHover ? 'rotate(-12deg) scale(1.15)' : 'none',
                  filter: creditsHover ? 'drop-shadow(0 0 4px rgba(56,189,248,0.4))' : 'none',
                }}
              />
              <span className="text-white font-bold">FREE</span>
              <span
                className="font-bold transition-all duration-300"
                style={{ color: creditsHover ? '#7dd3fc' : '#38bdf8' }}
              >
                $50 Credits
              </span>
              {creditsHover && (
                <span className="absolute inset-0 translate-x-[-100%] animate-[shimmer_0.8s_ease_forwards] bg-gradient-to-r from-transparent via-sky-300/15 to-transparent pointer-events-none" />
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
                <span className="flex items-center gap-1.5 text-[12.5px] text-slate-500 tracking-[0.01em]">
                  <Icon className="w-3 h-3 text-emerald-500/80 shrink-0" />
                  {item}
                </span>
                {i < arr.length - 1 && <span className="w-px h-3.5 bg-slate-700/70 ml-4 sm:ml-7" />}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Top X Rankings (moved above tools) ── */}
      {topXPages.length > 0 && (() => {
        const VISIBLE_COUNT = 3;
        const hasMore = topXPages.length > VISIBLE_COUNT;
        return (
          <TopXRankingsSection
            topXPages={topXPages}
            topXToolInfo={topXToolInfo}
            visibleCount={VISIBLE_COUNT}
            hasMore={hasMore}
          />
        );
      })()}

      {/* ── All Tools Directory ── */}
      <section id="tools-section" className="bg-[#f8f9fb] flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">

          {/* Section header with integrated search */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Explore Tools</h2>
                <p className="text-sm text-slate-600 mt-1">
                  {loading
                    ? 'Loading...'
                    : `${sortedFiltered.length} tools${activeCategory !== 'all' ? ` in ${SECTION_LABELS[activeCategory]}` : ' across all categories'}`}
                </p>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="search"
                  placeholder="Search tools, use cases..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 placeholder-slate-400 transition shadow-sm"
                />
              </div>
            </div>

            {/* Category tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {categories.map(cat => {
                const active = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveCategory(cat.id); setQuery(''); }}
                    className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                      active
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`transition-colors ${active ? 'text-white/70' : 'text-slate-400'}`}>
                      {CATEGORY_ICONS[cat.id] ?? CATEGORY_ICONS['all']}
                    </span>
                    {cat.label}
                    <span className={`text-xs tabular-nums ml-0.5 px-1.5 py-0.5 rounded-full ${
                      active ? 'bg-white/20 text-white/80' : 'bg-slate-100 text-slate-500'
                    }`}>{cat.count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center py-24 gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-200 animate-pulse" />
              <p className="text-sm text-slate-400">Loading tools...</p>
            </div>
          ) : sortedFiltered.length === 0 ? (
            <div className="flex flex-col items-center py-24 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-slate-700 font-semibold mb-1">No tools found</p>
              <p className="text-slate-400 text-sm">Try a different search or category.</p>
            </div>
          ) : (
            <div className="space-y-14">
              {sections.map(cat => {
                const sectionTools = sortedFiltered.filter(t => t.category === cat);
                if (!sectionTools.length) return null;
                const totalCount  = sectionTools.length;
                const visibleTools = sectionTools.slice(0, 9);
                return (
                  <section key={cat} id={`section-${cat}`}>
                    {/* Section header */}
                    <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200/70">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-sky-50 to-sky-100/80 border border-sky-200/60 text-sky-600">
                          {CATEGORY_ICONS[cat] ?? CATEGORY_ICONS['all']}
                        </span>
                        <div>
                          <h3 className="text-base font-bold text-slate-900 tracking-tight">{SECTION_LABELS[cat]}</h3>
                          <span className="text-xs text-slate-500 font-medium">{totalCount} tool{totalCount !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <Link
                        href={`/category/${cat}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 border border-sky-200/60 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        View All <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                    {/* Tools grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {visibleTools.map(tool => <ToolCard key={tool.id} tool={tool} views={viewCounts[tool.id]} />)}
                    </div>
                    {totalCount > 9 && (
                      <div className="mt-6 flex justify-center">
                        <Link
                          href={`/category/${cat}`}
                          className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:border-sky-200 hover:bg-sky-50/50 hover:text-sky-800 hover:shadow-sm transition-all"
                        >
                          See all {totalCount} tools in {SECTION_LABELS[cat]} <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

/* ─── Top X Rankings section with expand/collapse ─── */
function TopXRankingsSection({
  topXPages,
  topXToolInfo,
  visibleCount,
  hasMore,
}: {
  topXPages: TopXPageSummary[];
  topXToolInfo: Record<string, { name: string; rating: number; tagline: string }>;
  visibleCount: number;
  hasMore: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const displayPages = expanded ? topXPages : topXPages.slice(0, visibleCount);

  return (
    <section
      className="border-b border-sky-100"
      style={{ background: 'linear-gradient(175deg, #f0f9ff 0%, #f5fbff 40%, #f8fcff 70%, #ffffff 100%)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">

        {/* Section header */}
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Top Rankings</h2>
          <p className="text-sm text-slate-500 mt-1">Curated comparisons of the best tools</p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayPages.map(page => (
            <Link
              key={page.id}
              href={`/category/${page.category}/${page.slug}`}
              className="group flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-sky-300 hover:shadow-lg shadow-sm transition-all duration-200"
            >
              <div className="p-5 sm:p-6 flex-1 flex flex-col">
                {/* Category */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-sky-600">
                    {SECTION_LABELS[page.category] || page.category}
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    {(page.tool_ids || []).length} tools compared
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-slate-900 leading-snug mb-4 group-hover:text-sky-700 transition-colors line-clamp-2">
                  {page.name}
                </h3>

                {/* Rankings list */}
                <div className="space-y-3">
                  {(page.tool_ids || []).slice(0, 3).map((toolId, idx) => {
                    const info = topXToolInfo[toolId];
                    return (
                      <div key={toolId} className="flex items-start gap-3">
                        <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0 ${
                          idx === 0 ? 'bg-sky-100 text-sky-700' :
                          idx === 1 ? 'bg-slate-100 text-slate-600' :
                          'bg-slate-50 text-slate-500'
                        }`}>
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-800 truncate">
                              {info?.name || '...'}
                            </span>
                            {info?.rating && (
                              <span className="shrink-0 flex items-center gap-0.5">
                                <Star className="w-3.5 h-3.5 fill-sky-500 text-sky-500" />
                                <span className="text-xs font-bold text-slate-600">{info.rating}</span>
                              </span>
                            )}
                          </div>
                          {info?.tagline && (
                            <p className="text-xs text-slate-500 leading-snug truncate mt-0.5">{info.tagline}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">
                  {new Date(page.published_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 opacity-70 group-hover:opacity-100 transition-opacity">
                  View ranking <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Expand/Collapse button */}
        {hasMore && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-sky-700 bg-white border border-sky-200 rounded-xl hover:bg-sky-50 hover:border-sky-300 shadow-sm transition-all active:scale-[0.97]"
            >
              {expanded ? (
                <>Show Less <ChevronUp className="w-4 h-4" /></>
              ) : (
                <>Show {topXPages.length - visibleCount} More Rankings <ChevronDown className="w-4 h-4" /></>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
