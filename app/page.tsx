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
  LayoutGrid, Gift,
  Zap, Share2, ChevronRight, LogIn, Scan, RefreshCw,
} from 'lucide-react';

/* ─── types ─────────────────────────────────────────────────── */
type ToolPage = ToolCardData;

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

    // Stars — layered depth with warm + cool tones
    const STARS = Array.from({ length: 400 }, () => {
      const layer = Math.random();
      return {
        x: Math.random(), y: Math.random(),
        r: layer < 0.6 ? 0.2 + Math.random() * 0.8 : 0.8 + Math.random() * 2.0,
        twinkleSpeed: 0.008 + Math.random() * 0.04,
        twinkleOffset: Math.random() * Math.PI * 2,
        baseOpacity: layer < 0.6 ? 0.15 + Math.random() * 0.3 : 0.3 + Math.random() * 0.5,
        hue: layer < 0.3 ? '14,165,233' : layer < 0.55 ? '20,184,166' : layer < 0.75 ? '56,189,248' : layer < 0.9 ? '186,230,253' : '255,255,255',
      };
    });

    // Nebula orbs — larger, more colorful, with pulsing
    const ORBS = [
      { x: 0.78, y: 0.18, r: 0.40, color: '14,165,233', vx:  0.00008, vy:  0.00005, pulse: 0.003 },
      { x: 0.12, y: 0.55, r: 0.32, color: '20,184,166', vx: -0.00006, vy: -0.00004, pulse: 0.002 },
      { x: 0.45, y: 0.85, r: 0.28, color: '6,182,212',  vx:  0.00005, vy:  0.00007, pulse: 0.004 },
      { x: 0.92, y: 0.65, r: 0.22, color: '56,189,248', vx: -0.00009, vy:  0.00003, pulse: 0.0025 },
      { x: 0.35, y: 0.15, r: 0.26, color: '34,211,238', vx:  0.00004, vy: -0.00006, pulse: 0.0035 },
      { x: 0.60, y: 0.45, r: 0.18, color: '8,145,178',  vx: -0.00007, vy:  0.00008, pulse: 0.005 },
    ];

    // Floating particles — more numerous, varied sizes
    const DUST = Array.from({ length: 80 }, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00018,
      vy: -0.00012 - Math.random() * 0.00025,
      r: 0.8 + Math.random() * 2.8,
      opacity: 0.05 + Math.random() * 0.15,
      color: Math.random() < 0.6 ? '14,165,233' : '20,184,166',
    }));

    // Shooting stars
    type Shooter = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; active: boolean; width: number };
    const SHOOTERS: Shooter[] = Array.from({ length: 6 }, () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1, active: false, width: 1.5 }));
    function spawnShooter(s: Shooter) {
      s.x = Math.random() * 0.7; s.y = Math.random() * 0.35;
      const angle = Math.PI / 7 + (Math.random() - 0.5) * 0.5;
      const speed = 0.005 + Math.random() * 0.005;
      s.vx = Math.cos(angle) * speed; s.vy = Math.sin(angle) * speed;
      s.maxLife = 40 + Math.random() * 60; s.life = 0; s.active = true;
      s.width = 1.2 + Math.random() * 1.5;
    }
    spawnShooter(SHOOTERS[0]);
    setTimeout(() => spawnShooter(SHOOTERS[1]), 1200);
    setTimeout(() => spawnShooter(SHOOTERS[2]), 3000);

    // Orbital rings
    const RINGS = [
      { cx: 0.82, cy: 0.18, rx: 0.11, ry: 0.04,  angle: 0,   speed:  0.002, opacity: 0.10, color: '14,165,233' },
      { cx: 0.15, cy: 0.22, rx: 0.08, ry: 0.03,  angle: 1.2, speed: -0.0015, opacity: 0.08, color: '20,184,166' },
      { cx: 0.55, cy: 0.75, rx: 0.06, ry: 0.022, angle: 2.5, speed:  0.0025, opacity: 0.06, color: '56,189,248' },
    ];

    // Grid mesh lines
    const GRID_SPACING = 60;
    const GRID_OPACITY_BASE = 0.025;

    function draw() {
      if (!ctx || !canvas) return;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      t++;

      // Subtle animated grid mesh
      const gridShift = (t * 0.15) % GRID_SPACING;
      ctx.strokeStyle = `rgba(14,165,233,${GRID_OPACITY_BASE})`;
      ctx.lineWidth = 0.5;
      for (let x = -GRID_SPACING + gridShift; x < W + GRID_SPACING; x += GRID_SPACING) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = -GRID_SPACING + gridShift * 0.5; y < H + GRID_SPACING; y += GRID_SPACING) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Nebula orbs with pulsing
      for (const o of ORBS) {
        o.x += o.vx; o.y += o.vy;
        if (o.x < -0.15) o.x = 1.15; if (o.x > 1.15) o.x = -0.15;
        if (o.y < -0.15) o.y = 1.15; if (o.y > 1.15) o.y = -0.15;
        const pulse = 1 + Math.sin(t * o.pulse) * 0.15;
        const radius = o.r * pulse;
        const g = ctx.createRadialGradient(o.x*W, o.y*H, 0, o.x*W, o.y*H, radius*W);
        g.addColorStop(0, `rgba(${o.color},0.22)`);
        g.addColorStop(0.3, `rgba(${o.color},0.12)`);
        g.addColorStop(0.6, `rgba(${o.color},0.04)`);
        g.addColorStop(1, `rgba(${o.color},0)`);
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      }

      // Stars with depth-based rendering
      for (const s of STARS) {
        const flicker = Math.sin(t * s.twinkleSpeed + s.twinkleOffset) * 0.5 + 0.5;
        ctx.globalAlpha = s.baseOpacity * flicker;
        ctx.beginPath(); ctx.arc(s.x*W, s.y*H, s.r, 0, Math.PI*2);
        ctx.fillStyle = `rgb(${s.hue})`; ctx.fill();
        // Glow effect for larger stars
        if (s.r > 1.2) {
          const glow = ctx.createRadialGradient(s.x*W, s.y*H, 0, s.x*W, s.y*H, s.r * 3);
          glow.addColorStop(0, `rgba(${s.hue},${s.baseOpacity * flicker * 0.4})`);
          glow.addColorStop(1, `rgba(${s.hue},0)`);
          ctx.fillStyle = glow;
          ctx.beginPath(); ctx.arc(s.x*W, s.y*H, s.r * 3, 0, Math.PI*2); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // Floating dust particles
      for (const d of DUST) {
        d.x += d.vx; d.y += d.vy;
        if (d.y < -0.03) { d.y = 1.03; d.x = Math.random(); }
        if (d.x < -0.02) d.x = 1.02; if (d.x > 1.02) d.x = -0.02;
        const breathe = 0.7 + Math.sin(t * 0.02 + d.x * 10) * 0.3;
        ctx.globalAlpha = d.opacity * breathe;
        const dg = ctx.createRadialGradient(d.x*W, d.y*H, 0, d.x*W, d.y*H, d.r);
        dg.addColorStop(0, `rgba(${d.color},0.9)`); dg.addColorStop(1, `rgba(${d.color},0)`);
        ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(d.x*W, d.y*H, d.r, 0, Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Orbital rings
      for (const ring of RINGS) {
        ring.angle += ring.speed;
        const ringPulse = 0.8 + Math.sin(t * 0.01 + ring.cx * 5) * 0.2;
        ctx.save();
        ctx.translate(ring.cx*W, ring.cy*H);
        ctx.rotate(ring.angle);
        ctx.scale(1, ring.ry / ring.rx);
        ctx.beginPath(); ctx.arc(0, 0, ring.rx*W, 0, Math.PI*2);
        ctx.restore();
        ctx.strokeStyle = `rgba(${ring.color},${ring.opacity * ringPulse})`;
        ctx.lineWidth = 1.2; ctx.stroke();
      }

      // Shooting stars — spawn more frequently
      if (t % 70 === 0) {
        const idle = SHOOTERS.find(s => !s.active);
        if (idle) spawnShooter(idle);
      }
      for (const s of SHOOTERS) {
        if (!s.active) continue;
        s.x += s.vx; s.y += s.vy; s.life++;
        if (s.life > s.maxLife || s.x > 1.2 || s.y > 1.2) { s.active = false; continue; }
        const prog = s.life / s.maxLife;
        const alpha = prog < 0.1 ? prog / 0.1 : prog > 0.7 ? (1 - prog) / 0.3 : 1;
        const tailLen = 120 + prog * 80;
        const speed = Math.sqrt(s.vx*s.vx + s.vy*s.vy);
        const nx = s.vx / speed;
        const ny = s.vy / speed;
        const grd = ctx.createLinearGradient(s.x*W - nx*tailLen, s.y*H - ny*tailLen, s.x*W, s.y*H);
        grd.addColorStop(0, 'rgba(14,165,233,0)');
        grd.addColorStop(0.5, `rgba(56,189,248,${alpha*0.3})`);
        grd.addColorStop(0.85, `rgba(186,230,253,${alpha*0.7})`);
        grd.addColorStop(1, `rgba(255,255,255,${alpha*0.95})`);
        ctx.strokeStyle = grd; ctx.lineWidth = s.width;
        ctx.beginPath();
        ctx.moveTo(s.x*W - nx*tailLen, s.y*H - ny*tailLen);
        ctx.lineTo(s.x*W, s.y*H); ctx.stroke();
        // Bright head
        ctx.beginPath(); ctx.arc(s.x*W, s.y*H, 2.5, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,255,255,${alpha*0.95})`; ctx.fill();
        // Head glow
        const headGlow = ctx.createRadialGradient(s.x*W, s.y*H, 0, s.x*W, s.y*H, 8);
        headGlow.addColorStop(0, `rgba(186,230,253,${alpha*0.5})`);
        headGlow.addColorStop(1, 'rgba(186,230,253,0)');
        ctx.fillStyle = headGlow;
        ctx.beginPath(); ctx.arc(s.x*W, s.y*H, 8, 0, Math.PI*2); ctx.fill();
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
        className="relative overflow-hidden border-b border-cyan-900/30"
        style={{ background: 'linear-gradient(160deg, #020817 0%, #0a1628 25%, #071c2e 45%, #051b24 65%, #030f1a 85%, #010814 100%)' }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-80" aria-hidden />
        {/* Top edge glow */}
        <div className="absolute left-0 right-0 top-0 h-px pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent 5%, rgba(6,182,212,0.4) 25%, rgba(14,165,233,0.6) 45%, rgba(20,184,166,0.6) 60%, rgba(34,211,238,0.4) 80%, transparent 95%)' }} />
        {/* Top radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 55% at 50% 0%, rgba(14,165,233,0.18) 0%, rgba(6,182,212,0.06) 50%, transparent 80%)' }} />
        {/* Side accent glows */}
        <div className="absolute top-1/4 -left-20 w-[400px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(circle at center, rgba(20,184,166,0.08) 0%, transparent 70%)' }} />
        <div className="absolute top-1/3 -right-20 w-[350px] h-[350px] pointer-events-none"
          style={{ background: 'radial-gradient(circle at center, rgba(14,165,233,0.06) 0%, transparent 70%)' }} />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(2,8,23,0.95) 0%, rgba(2,8,23,0.4) 50%, transparent 100%)' }} />

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
            Discover new, proven{' '}
            <span className="text-white font-medium">AI growth tools</span>{' '}
            across SEO, lead gen, sales outreach, social media, and more,{' '}
            <span className="text-emerald-400 font-semibold">tested by experts</span>.
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">

          {/* Section header with integrated search */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Explore Tools</h2>
                <p className="text-[13px] text-slate-500 mt-0.5">
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
                  className="w-full pl-10 pr-4 py-2.5 text-[13px] border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 placeholder-slate-400 transition shadow-sm"
                />
              </div>
            </div>

            {/* Category tabs — visible on all screen sizes */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {categories.map(cat => {
                const active = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveCategory(cat.id); setQuery(''); }}
                    className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12.5px] font-semibold border transition-all ${
                      active
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`transition-colors ${active ? 'text-white/70' : 'text-slate-400'}`}>
                      {CATEGORY_ICONS[cat.id] ?? CATEGORY_ICONS['all']}
                    </span>
                    {cat.label}
                    <span className={`text-[10px] tabular-nums ml-0.5 px-1.5 py-0.5 rounded-full ${
                      active ? 'bg-white/20 text-white/80' : 'bg-slate-100 text-slate-400'
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
              <p className="text-slate-400 text-[13px]">Try a different search or category.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {sections.map(cat => {
                const sectionTools = sortedFiltered.filter(t => t.category === cat);
                if (!sectionTools.length) return null;
                const totalCount  = sectionTools.length;
                const visibleTools = sectionTools.slice(0, 9);
                return (
                  <section key={cat} id={`section-${cat}`}>
                    {/* Section header */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 bg-white border border-slate-200 shadow-sm"
                        >
                          {CATEGORY_ICONS[cat]}
                        </span>
                        <div>
                          <h3 className="text-[15px] font-bold text-slate-900 leading-tight">{SECTION_LABELS[cat]}</h3>
                          <p className="text-[11px] text-slate-400 font-medium">{totalCount} tool{totalCount !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <Link
                        href={`/category/${cat}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold text-sky-600 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors"
                      >
                        View All <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                    {/* Tools grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                      {visibleTools.map(tool => <ToolCard key={tool.id} tool={tool} views={viewCounts[tool.id]} />)}
                    </div>
                    {totalCount > 9 && (
                      <div className="mt-4 flex justify-center">
                        <Link
                          href={`/category/${cat}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all"
                        >
                          See all {totalCount} tools in {SECTION_LABELS[cat]} <ChevronRight className="w-3.5 h-3.5" />
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
