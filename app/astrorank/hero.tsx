"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ArrowRight, TrendingUp, Search, MousePointer, Zap } from "lucide-react";
import SpaceBg from "./space-bg";

// ─── Platform cycler ─────────────────────────────────────────────────────────
const PLATFORMS = [
  { name: "Google",     color: "#4285F4", icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
  )},
  { name: "ChatGPT",    color: "#10A37F", icon: (
    <svg width="14" height="14" viewBox="0 0 41 41" fill="none"><path d="M37.532 16.87a9.963 9.963 0 0 0-.856-8.184 10.078 10.078 0 0 0-10.855-4.835 9.964 9.964 0 0 0-6.75-3.001 10.079 10.079 0 0 0-9.612 6.977 9.967 9.967 0 0 0-6.63 4.811 10.079 10.079 0 0 0 1.24 11.817 9.965 9.965 0 0 0 .856 8.185 10.079 10.079 0 0 0 10.855 4.835 9.965 9.965 0 0 0 6.75 3.001 10.079 10.079 0 0 0 9.617-6.981 9.967 9.967 0 0 0 6.63-4.811 10.079 10.079 0 0 0-1.243-11.813zM22.498 37.886a7.474 7.474 0 0 1-4.799-1.735c.061-.033.168-.091.237-.134l7.964-4.6a1.294 1.294 0 0 0 .655-1.134V19.054l3.366 1.944a.12.12 0 0 1 .066.092v9.299a7.505 7.505 0 0 1-7.49 7.496zM6.392 31.006a7.471 7.471 0 0 1-.894-5.023c.06.036.162.099.237.141l7.964 4.6a1.297 1.297 0 0 0 1.308 0l9.724-5.614v3.888a.12.12 0 0 1-.048.103L16.5 33.569a7.505 7.505 0 0 1-10.108-2.563zm-1.961-16.118A7.474 7.474 0 0 1 8.343 11.2l-.033.2v9.195a1.295 1.295 0 0 0 .654 1.132l9.723 5.614-3.366 1.944a.12.12 0 0 1-.114.012L7.044 24.2a7.505 7.505 0 0 1-2.612-9.312zm27.688 6.437l-9.724-5.615 3.367-1.943a.121.121 0 0 1 .114-.012l8.163 4.71a7.504 7.504 0 0 1-1.158 13.528v-9.396a1.293 1.293 0 0 0-.762-1.272zm3.35-5.043c-.059-.037-.162-.099-.236-.141l-7.965-4.6a1.298 1.298 0 0 0-1.308 0l-9.723 5.614v-3.888a.12.12 0 0 1 .048-.103l8.167-4.714a7.505 7.505 0 0 1 11.017 7.831zm-21.063 6.929l-3.367-1.944a.12.12 0 0 1-.065-.092v-9.299a7.505 7.505 0 0 1 12.293-5.756 6.94 6.94 0 0 0-.236.134l-7.965 4.6a1.294 1.294 0 0 0-.654 1.132l-.006 11.225zm1.829-3.943l4.33-2.501 4.332 2.5v4.999l-4.331 2.5-4.331-2.5V19.268z" fill="currentColor"/></svg>
  )},
  { name: "Gemini",     color: "#1A73E8", icon: (
    <svg width="14" height="14" viewBox="0 0 28 28" fill="none"><path d="M14 28C14 26.0633 13.6267 24.2433 12.88 22.54C12.1567 20.8367 11.165 19.355 9.905 18.095C8.645 16.835 7.16333 15.8433 5.46 15.12C3.75667 14.3733 1.93667 14 0 14C1.93667 14 3.75667 13.6383 5.46 12.915C7.16333 12.1683 8.645 11.165 9.905 9.905C11.165 8.645 12.1567 7.16333 12.88 5.46C13.6267 3.75667 14 1.93667 14 0C14 1.93667 14.3617 3.75667 15.085 5.46C15.8317 7.16333 16.835 8.645 18.095 9.905C19.355 11.165 20.8367 12.1683 22.54 12.915C24.2433 13.6383 26.0633 14 28 14C26.0633 14 24.2433 14.3733 22.54 15.12C20.8367 15.8433 19.355 16.835 18.095 18.095C16.835 19.355 15.8317 20.8367 15.085 22.54C14.3617 24.2433 14 26.0633 14 28Z" fill="url(#gemini_grad)"/><defs><linearGradient id="gemini_grad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse"><stop stopColor="#1A73E8"/><stop offset="1" stopColor="#9C40EE"/></linearGradient></defs></svg>
  )},
  { name: "Claude",     color: "#D97706", icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 3c.828 0 1.5.672 1.5 1.5S12.828 8 12 8s-1.5-.672-1.5-1.5S11.172 5 12 5zm3.5 10.5h-7a.5.5 0 010-1h2.75v-5H9.5a.5.5 0 010-1h3a.5.5 0 01.5.5v5.5H15.5a.5.5 0 010 1z" fill="#D97706"/></svg>
  )},
  { name: "Perplexity", color: "#20B2AA", icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18L20 8.5v7L12 19.82 4 15.5v-7l8-4.32z" fill="#20B2AA"/><path d="M12 8v8M8 10l4-2 4 2M8 14l4 2 4-2" stroke="#20B2AA" strokeWidth="1.5" strokeLinecap="round"/></svg>
  )},
];

function PlatformCycler() {
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI(v => (v + 1) % PLATFORMS.length), 2200); return () => clearInterval(t); }, []);
  const p = PLATFORMS[i];
  return (
    <span className="inline-flex items-center gap-1.5 align-middle" style={{ minWidth: "7.5rem" }}>
      <AnimatePresence mode="wait">
        <motion.span key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="inline-flex items-center gap-1.5 font-semibold"
          style={{ color: p.color }}>
          {p.icon}
          {p.name}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
type Article = { id: number; cat: string; catKey: string; title: string; slug: string; readTime: string };

const ARTICLES: Article[] = [
  { id: 1, cat: "SEO Strategy",    catKey: "blue",    title: "10 Best AI Tools for B2B Content Teams",          slug: "best-ai-tools-b2b",          readTime: "8 min" },
  { id: 2, cat: "How-To Guide",    catKey: "emerald", title: "Build a Keyword Strategy with AI Research",        slug: "keyword-strategy-ai",        readTime: "6 min" },
  { id: 3, cat: "Industry Trends", catKey: "violet",  title: "AI Content: The New SaaS Growth Lever",            slug: "ai-content-saas",            readTime: "5 min" },
  { id: 4, cat: "Growth",          catKey: "teal",    title: "Content Velocity: 50 Articles per Month",          slug: "content-velocity",           readTime: "7 min" },
  { id: 5, cat: "Comparison",      catKey: "sky",     title: "AstroRank vs Manual SEO: The Numbers",             slug: "astrorank-vs-manual",        readTime: "9 min" },
  { id: 6, cat: "SEO Strategy",    catKey: "blue",    title: "How to Rank for Competitor Keywords in 2025",      slug: "competitor-keywords",        readTime: "6 min" },
  { id: 7, cat: "How-To Guide",    catKey: "emerald", title: "Setting Up a Scalable Internal Linking Structure", slug: "internal-linking",           readTime: "5 min" },
  { id: 8, cat: "Industry Trends", catKey: "violet",  title: "Answer Engine Optimization: The New Frontier",    slug: "answer-engine-optimization", readTime: "7 min" },
  { id: 9, cat: "Growth",          catKey: "teal",    title: "SaaS Content Moat: The 6-Month Blueprint",         slug: "content-moat",               readTime: "6 min" },
];

const CATS = [
  { id: "All",    label: "All"    },
  { id: "SEO",    label: "SEO"    },
  { id: "How-To", label: "How-To" },
  { id: "Growth", label: "Growth" },
];

const KEY_TO_CAT: Record<string, string> = { blue: "SEO", emerald: "How-To", violet: "Trends", teal: "Growth", sky: "All" };

const CAT_STYLES: Record<string, { bg: string; text: string }> = {
  blue:    { bg: "bg-blue-100",    text: "text-blue-700"    },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-700" },
  violet:  { bg: "bg-violet-100",  text: "text-violet-700"  },
  teal:    { bg: "bg-teal-100",    text: "text-teal-700"    },
  sky:     { bg: "bg-sky-100",     text: "text-sky-700"     },
};

const GRAD_LIGHT: Record<string, string> = {
  blue:    "from-blue-100 to-indigo-50",
  emerald: "from-emerald-100 to-teal-50",
  violet:  "from-violet-100 to-purple-50",
  teal:    "from-teal-100 to-cyan-50",
  sky:     "from-sky-100 to-blue-50",
};

const GRAD_HERO: Record<string, string> = {
  blue:    "from-blue-500 via-blue-400 to-indigo-400",
  emerald: "from-emerald-500 via-emerald-400 to-teal-400",
  violet:  "from-violet-500 via-violet-400 to-purple-400",
  teal:    "from-teal-500 via-teal-400 to-cyan-400",
  sky:     "from-sky-500 via-sky-400 to-blue-400",
};

const HBorder: Record<string, string> = {
  blue: "border-blue-300", emerald: "border-emerald-300", violet: "border-violet-300",
  teal: "border-teal-300", sky: "border-sky-300",
};

const GEN_CATS = [
  { key: "blue",    label: "SEO Strategy"    },
  { key: "emerald", label: "How-To Guide"    },
  { key: "violet",  label: "Industry Trends" },
  { key: "teal",    label: "Growth"          },
  { key: "sky",     label: "Comparison"      },
];

// Phases:
// 0-8:  cards 0-8 write one by one (generating → settled after 280ms)
// 9-11: filter cycling SEO → How-To → Growth
// 12:   zoom card 0
// 13:   open article
// 14:   scan article (scores sticky overlay)
// 15:   Google SERP
// 16:   analytics
// 17:   return to full grid
const PHASE_DUR = [
  480,  // 0  card 0
  460,  // 1  card 1
  440,  // 2  card 2
  420,  // 3  card 3
  400,  // 4  card 4
  400,  // 5  card 5
  380,  // 6  card 6
  380,  // 7  card 7
  360,  // 8  card 8
  900,  // 9  SEO filter
  900,  // 10 How-To filter
  900,  // 11 Growth filter
  420,  // 12 zoom
  500,  // 13 open
  2700, // 14 scan
  4200, // 15 SERP
  4800, // 16 analytics
  600,  // 17 return
];

// Traffic line graph
const TRAFFIC_PATH = "M 12,61 C 29,61 37,57 54,57 C 71,57 79,50 96,50 C 113,50 121,39 138,39 C 155,39 163,23 180,23 C 197,23 205,8 222,8";
const TRAFFIC_AREA = TRAFFIC_PATH + " L 222,64 L 12,64 Z";
const TRAFFIC_PTS = [
  { x: 12, y: 61, m: "Jan" }, { x: 54, y: 57, m: "Feb" }, { x: 96, y: 50, m: "Mar" },
  { x: 138, y: 39, m: "Apr" }, { x: 180, y: 23, m: "May" }, { x: 222, y: 8, m: "Jun" },
];

// Searches line graph (emerald)
const SEARCH_PATH = "M 12,62 C 29,62 37,56 54,56 C 71,56 79,47 96,47 C 113,47 121,34 138,34 C 155,34 163,19 180,19 C 197,19 205,9 222,9";
const SEARCH_AREA = SEARCH_PATH + " L 222,64 L 12,64 Z";
const SEARCH_PTS = [
  { x: 12, y: 62, m: "Jan" }, { x: 54, y: 56, m: "Feb" }, { x: 96, y: 47, m: "Mar" },
  { x: 138, y: 34, m: "Apr" }, { x: 180, y: 19, m: "May" }, { x: 222, y: 9, m: "Jun" },
];

// ─── Animated counter ─────────────────────────────────────────────────────────
function AnimCounter({ target, run, duration = 1800 }: { target: number; run: boolean; duration?: number }) {
  const [v, setV] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    if (!run) { setV(0); return; }
    let t0: number | null = null;
    const tick = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      setV(Math.floor((1 - (1 - p) ** 3) * target));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [run, target, duration]);
  return <>{v.toLocaleString()}</>;
}

// ─── Cycling category badge ───────────────────────────────────────────────────
function CyclingCatBadge({ startIdx }: { startIdx: number }) {
  const [ci, setCi] = useState(startIdx % GEN_CATS.length);
  useEffect(() => {
    const t = setInterval(() => setCi(v => (v + 1) % GEN_CATS.length), 580);
    return () => clearInterval(t);
  }, []);
  const c = GEN_CATS[ci];
  return (
    <AnimatePresence mode="wait">
      <motion.span key={ci} initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }}
        transition={{ duration: 0.18 }}
        className={`text-[6px] font-bold px-1.5 py-[1.5px] rounded-full ${CAT_STYLES[c.key].bg} ${CAT_STYLES[c.key].text}`}>
        {c.label}
      </motion.span>
    </AnimatePresence>
  );
}

// ─── Line graph ───────────────────────────────────────────────────────────────
function LineGraph({ show, linePath, areaPath, pts, color, gradId, delay = 0 }: {
  show: boolean; linePath: string; areaPath: string;
  pts: { x: number; y: number; m: string }[];
  color: string; gradId: string; delay?: number;
}) {
  return (
    <svg viewBox="0 0 234 74" className="w-full" style={{ height: 66 }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {[64, 48, 32, 16].map(y => (
        <line key={y} x1="12" y1={y} x2="222" y2={y} stroke="rgb(241,245,249)" strokeWidth="0.75" />
      ))}
      <motion.path d={areaPath} fill={`url(#${gradId})`}
        initial={{ opacity: 0 }} animate={{ opacity: show ? 1 : 0 }}
        transition={{ duration: 0.6, delay: show ? delay + 0.5 : 0 }} />
      <motion.path d={linePath} fill="none" stroke={color} strokeWidth="1.75"
        strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: show ? 1 : 0 }}
        transition={{ duration: 2.8, ease: "easeInOut", delay: show ? delay + 0.15 : 0 }} />
      {pts.map((p, i) => (
        <motion.circle key={i} cx={p.x} cy={p.y} r="2.6"
          fill="white" stroke={color} strokeWidth="1.5"
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: show ? 1 : 0, opacity: show ? 1 : 0 }}
          transition={{ delay: show ? delay + 0.3 + i * 0.38 : 0, duration: 0.2 }} />
      ))}
      {pts.map((p, i) => (
        <text key={i} x={p.x} y="73" textAnchor="middle" fontSize="5" fill="rgb(148,163,184)">{p.m}</text>
      ))}
    </svg>
  );
}

// ─── AI quality score bar ─────────────────────────────────────────────────────
type ScoreColor = "blue" | "emerald" | "violet";
const SCORE_STYLES: Record<ScoreColor, { bar: string; text: string; bg: string; border: string }> = {
  blue:    { bar: "bg-blue-500",    text: "text-blue-700",    bg: "bg-blue-50",    border: "border-blue-100"    },
  emerald: { bar: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" },
  violet:  { bar: "bg-violet-500",  text: "text-violet-700",  bg: "bg-violet-50",  border: "border-violet-100"  },
};

function ScoreRow({ label, from, to, run, color, delay }: {
  label: string; from: number; to: number; run: boolean; color: ScoreColor; delay: number;
}) {
  const [val, setVal] = useState(from);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    if (!run) { setVal(from); return; }
    let t0: number | null = null;
    const tick = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / 1900, 1);
      setVal(Math.round(from + (to - from) * (1 - (1 - p) ** 2.5)));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    const id = setTimeout(() => { raf.current = requestAnimationFrame(tick); }, delay * 1000);
    return () => { clearTimeout(id); if (raf.current) cancelAnimationFrame(raf.current); };
  }, [run, from, to, delay]);

  const s = SCORE_STYLES[color];
  return (
    <div className={`${s.bg} border ${s.border} rounded-lg px-2 py-1.5`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[7px] font-semibold text-slate-500">{label}</span>
        <span className={`text-[9px] font-extrabold tabular-nums ${s.text}`}>{val}<span className="text-[6px] opacity-70">/100</span></span>
      </div>
      <div className="h-[4px] bg-white/70 rounded-full overflow-hidden">
        <div className={`h-full ${s.bar} rounded-full transition-all duration-75`} style={{ width: `${val}%` }} />
      </div>
    </div>
  );
}

// ─── Sticky scores overlay ────────────────────────────────────────────────────
function ScoresOverlay({ show }: { show: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16, scale: 0.93 }}
      animate={{ opacity: show ? 1 : 0, x: show ? 0 : 16, scale: show ? 1 : 0.93 }}
      transition={{ duration: 0.35, delay: show ? 0.22 : 0 }}
      className="absolute right-2 top-12 w-[96px] bg-white/98 backdrop-blur-sm rounded-xl border border-slate-100 shadow-[0_6px_24px_rgba(15,23,42,0.12)] p-2 pointer-events-none z-10"
    >
      <div className="flex items-center gap-1 mb-2">
        <Zap size={8} className="text-amber-500" />
        <p className="text-[6.5px] font-bold text-slate-600 uppercase tracking-wider">AI Quality Check</p>
      </div>
      <div className="flex flex-col gap-1.5">
        <ScoreRow label="EEAT"       from={62} to={91} run={show} color="blue"    delay={0}   />
        <ScoreRow label="Lighthouse" from={74} to={97} run={show} color="emerald" delay={0.25} />
        <ScoreRow label="Grammarly"  from={68} to={95} run={show} color="violet"  delay={0.5} />
      </div>
    </motion.div>
  );
}

// ─── Traffic capture % ────────────────────────────────────────────────────────
function TrafficCapture({ show }: { show: boolean }) {
  const [pct, setPct] = useState(12);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    if (!show) { setPct(12); return; }
    let t0: number | null = null;
    const tick = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / 3400, 1);
      setPct(Math.round(12 + 44 * (1 - (1 - p) ** 2)));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    const id = setTimeout(() => { raf.current = requestAnimationFrame(tick); }, 600);
    return () => { clearTimeout(id); if (raf.current) cancelAnimationFrame(raf.current); };
  }, [show]);

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-xl p-2">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[7px] font-semibold text-slate-500 uppercase tracking-wider">Traffic Capture</p>
        <span className="text-[13px] font-extrabold text-slate-900 tabular-nums leading-none">
          {pct}<span className="text-[8px] text-slate-400">%</span>
        </span>
      </div>
      <div className="h-[5px] bg-slate-200 rounded-full overflow-hidden mb-1">
        <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-75"
          style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[6px] text-slate-400">of total impressions captured</span>
        <span className="text-[6px] text-emerald-500 font-bold">+44pp</span>
      </div>
    </div>
  );
}

// ─── Stats panel ──────────────────────────────────────────────────────────────
function StatsPanel({ show }: { show: boolean }) {
  return (
    <div className="p-3 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-2 shrink-0">
        <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-50 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[8px] font-semibold text-slate-700 truncate">{ARTICLES[0].title}</p>
          <p className="text-[6.5px] text-slate-400">Analytics · Last 6 months</p>
        </div>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}
          className="flex items-center gap-0.5 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full shrink-0">
          <TrendingUp size={7} className="text-emerald-500" />
          <span className="text-[7px] font-bold text-emerald-600">+1,375%</span>
        </motion.div>
      </div>

      {/* Two graphs side by side */}
      <div className="grid grid-cols-2 gap-1.5 mb-2 shrink-0">
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: show ? 0.1 : 0 }}
          className="bg-slate-50 rounded-xl p-2 border border-slate-100">
          <p className="text-[6px] font-semibold text-slate-400 uppercase tracking-wider">Monthly Searches</p>
          <p className="text-[11px] font-extrabold text-emerald-600 tabular-nums leading-none mt-0.5 mb-1">
            <AnimCounter target={31200} run={show} duration={2800} />
          </p>
          <LineGraph show={show} linePath={SEARCH_PATH} areaPath={SEARCH_AREA} pts={SEARCH_PTS}
            color="rgb(16,185,129)" gradId="areaGradSearch" delay={0} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: show ? 0.2 : 0 }}
          className="bg-slate-50 rounded-xl p-2 border border-slate-100">
          <p className="text-[6px] font-semibold text-slate-400 uppercase tracking-wider">Monthly Traffic</p>
          <p className="text-[11px] font-extrabold text-blue-600 tabular-nums leading-none mt-0.5 mb-1">
            <AnimCounter target={2847} run={show} duration={2800} />
          </p>
          <LineGraph show={show} linePath={TRAFFIC_PATH} areaPath={TRAFFIC_AREA} pts={TRAFFIC_PTS}
            color="rgb(59,130,246)" gradId="areaGradTraffic" delay={0.15} />
        </motion.div>
      </div>

      {/* Traffic capture */}
      <div className="shrink-0 mb-2">
        <TrafficCapture show={show} />
      </div>

      <div className="h-px bg-slate-100 shrink-0 mb-2" />

      {/* Bottom stat cards */}
      <div className="grid grid-cols-2 gap-1.5 shrink-0">
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: show ? 1.1 : 0 }}
          className="bg-violet-50 border border-violet-100 rounded-xl p-2">
          <div className="flex items-center gap-1 mb-0.5">
            <Search size={7} className="text-violet-500" />
            <p className="text-[6.5px] text-violet-600 font-semibold">Avg. Position</p>
          </div>
          <p className="text-[18px] font-extrabold text-violet-900 leading-none tabular-nums">3.0</p>
          <p className="text-[6px] text-violet-400 mt-0.5">across all keywords</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: show ? 1.2 : 0 }}
          className="bg-emerald-50 border border-emerald-100 rounded-xl p-2">
          <div className="flex items-center gap-1 mb-0.5">
            <MousePointer size={7} className="text-emerald-500" />
            <p className="text-[6.5px] text-emerald-600 font-semibold">CTA Conversions</p>
          </div>
          <p className="text-[18px] font-extrabold text-emerald-900 leading-none tabular-nums">
            <AnimCounter target={284} run={show} duration={2200} />
          </p>
          <p className="text-[6px] text-emerald-400 mt-0.5">signups / month</p>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Grid card ────────────────────────────────────────────────────────────────
function ArticleGridCard({ article, generating, highlighted, focused }: {
  article: Article; generating: boolean; highlighted: boolean; focused: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.82, y: 6 }}
      animate={{ opacity: 1, scale: focused ? 1.05 : 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-xl border overflow-hidden bg-white h-full ${
        focused
          ? "border-blue-400 shadow-[0_0_0_2px_rgba(59,130,246,0.2),0_4px_14px_rgba(59,130,246,0.15)]"
          : highlighted
          ? HBorder[article.catKey] + " shadow-sm"
          : "border-slate-100 shadow-[0_1px_4px_rgba(15,23,42,0.05)]"
      }`}
    >
      <AnimatePresence mode="wait">
        {generating ? (
          <motion.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
            <div className="h-10 bg-slate-100 animate-pulse" />
            <div className="p-1.5">
              <div className="flex items-center justify-between mb-1">
                <CyclingCatBadge startIdx={article.id} />
                <div className="flex items-center gap-0.5">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
                    className="w-2 h-2 border border-slate-200 border-t-blue-400 rounded-full" />
                  <span className="text-[5.5px] text-blue-400 font-semibold">writing…</span>
                </div>
              </div>
              <div className="h-[4.5px] bg-slate-100 animate-pulse rounded-full mb-1" style={{ width: "86%" }} />
              <div className="h-[4.5px] bg-slate-100 animate-pulse rounded-full mb-[5px]" style={{ width: "60%" }} />
              <div className="flex gap-1">
                <div className="h-[5px] w-[22px] bg-slate-100 animate-pulse rounded-full" />
                <div className="h-[5px] w-[16px] bg-slate-100 animate-pulse rounded-full" />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="loaded" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <div className={`h-10 bg-gradient-to-br ${GRAD_LIGHT[article.catKey]}`} />
            <div className="p-1.5">
              <div className="mb-1">
                <span className={`text-[6px] font-bold px-1.5 py-[1.5px] rounded-full ${CAT_STYLES[article.catKey].bg} ${CAT_STYLES[article.catKey].text}`}>
                  {article.cat}
                </span>
              </div>
              <div className="h-[4.5px] bg-slate-200 rounded-full mb-1" style={{ width: "90%" }} />
              <div className="h-[4.5px] bg-slate-200 rounded-full mb-[5px]" style={{ width: "66%" }} />
              <div className="flex gap-1">
                <div className="h-[5px] w-[22px] bg-slate-100 rounded-full" />
                <div className="h-[5px] w-[16px] bg-slate-100 rounded-full" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Article page ─────────────────────────────────────────────────────────────
function ArticlePageSEO() {
  const a = ARTICLES[0];
  const cat = CAT_STYLES[a.catKey];
  return (
    <>
      <div className={`h-[44px] bg-gradient-to-br ${GRAD_HERO[a.catKey]} relative overflow-hidden shrink-0`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
          <span className="text-[6.5px] font-bold px-1.5 py-[1.5px] rounded-full bg-white/25 text-white backdrop-blur-sm">{a.cat}</span>
          <span className="text-[6.5px] text-white/70">{a.readTime} read</span>
        </div>
      </div>
      <div className="px-3 pt-2.5">
        <div className="flex items-center gap-1 mb-1">
          <span className="text-[7px] text-slate-400">Articles</span>
          <span className="text-[7px] text-slate-300">/</span>
          <span className={`text-[7px] font-medium ${cat.text}`}>{a.cat}</span>
        </div>
        <h3 className="text-[11px] font-extrabold text-slate-900 leading-tight mb-1.5">{a.title}</h3>
        <div className="flex items-center gap-1.5 mb-2">
          <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-br ${GRAD_LIGHT[a.catKey]}`} />
          <span className="text-[7px] text-slate-400">AstroRank AI &nbsp;·&nbsp; {a.readTime} read &nbsp;·&nbsp; Mar 2025</span>
        </div>
        <div className="h-px bg-slate-100 mb-2" />

        {/* Image placeholder */}
        <div className="h-[48px] bg-gradient-to-br from-slate-100 to-blue-50/40 rounded-xl mb-2 flex items-center justify-center border border-slate-100">
          <div className="flex items-center gap-2 opacity-35">
            <div className="w-8 h-6 bg-slate-300 rounded-md" />
            <div className="flex flex-col gap-1">
              <div className="w-14 h-1.5 bg-slate-200 rounded-full" />
              <div className="w-10 h-1.5 bg-slate-200 rounded-full" />
            </div>
          </div>
        </div>

        {/* TOC */}
        <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-2 mb-2">
          <p className="text-[7px] font-bold text-blue-700 mb-1">In this article</p>
          {["What counts as an AI content tool?", "Evaluation criteria & scoring", "Our top 10 picks for 2025", "Final verdict"].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 mb-[3px]">
              <span className="text-[6px] font-bold text-blue-400 w-3">{i + 1}.</span>
              <span className="text-[7px] text-blue-600">{item}</span>
            </div>
          ))}
        </div>

        <p className="text-[8.5px] font-bold text-slate-900 mb-1">Overview</p>
        {[98, 93, 100, 87].map((w, i) => <div key={i} className="h-[5px] rounded-full bg-slate-100 mb-1.5" style={{ width: `${w}%` }} />)}

        <div className="bg-amber-50 border border-amber-100 rounded-xl p-2 mb-2">
          <div className="flex items-center gap-1 mb-0.5">
            <span className="text-[8px]">💡</span>
            <span className="text-[7.5px] font-bold text-amber-700">Pro Tip</span>
          </div>
          <p className="text-[7px] text-amber-700 leading-snug">Teams using AI content tools publish 4.7× more content with the same headcount.</p>
        </div>

        {[95, 88, 100, 82].map((w, i) => <div key={i} className="h-[5px] rounded-full bg-slate-100 mb-1.5" style={{ width: `${w}%` }} />)}

        {/* CTA block */}
        <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-r from-blue-600 to-indigo-600 p-3 mb-2">
          <p className="text-[8px] font-extrabold text-white mb-1">Ready to rank like this?</p>
          <p className="text-[7px] text-blue-100 mb-1.5 leading-snug">Join 500+ teams publishing SEO content at scale with AstroRank AI.</p>
          <div className="flex items-center gap-1">
            <div className="flex-1 h-5 bg-white/20 rounded-lg" />
            <div className="h-5 px-2 bg-white rounded-lg flex items-center">
              <span className="text-[7px] font-bold text-blue-600">Start Free →</span>
            </div>
          </div>
        </div>

        <p className="text-[8.5px] font-bold text-slate-900 mb-1">AI Tool Comparison</p>
        {[100, 91, 95, 84, 96].map((w, i) => <div key={i} className="h-[5px] rounded-full bg-slate-100 mb-1.5" style={{ width: `${w}%` }} />)}
      </div>
    </>
  );
}

// ─── Google SERP panel ────────────────────────────────────────────────────────
const AI_CHUNKS = [
  "The best AI content tools for B2B teams in 2025 combine automated keyword research, long-form writing, and on-page SEO scoring.",
  "Teams using dedicated platforms report 4.7× content velocity with the same headcount.",
  "Key evaluation factors: integration depth, content quality scoring, and built-in publishing workflows.",
];

function GoogleSerpPanel({ scrolled }: { scrolled: boolean }) {
  const [chunkIdx, setChunkIdx] = useState(-1);
  useEffect(() => {
    const timers = AI_CHUNKS.map((_, i) => setTimeout(() => setChunkIdx(i), 200 + i * 460));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-white">
      <motion.div
        animate={{ y: scrolled ? -148 : 0 }}
        transition={{ duration: 1.4, ease: "easeInOut" }}
        className="px-3 py-2"
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[12px] font-bold tracking-tight leading-none">
            <span style={{ color: "#4285F4" }}>G</span><span style={{ color: "#EA4335" }}>o</span>
            <span style={{ color: "#FBBC05" }}>o</span><span style={{ color: "#4285F4" }}>g</span>
            <span style={{ color: "#34A853" }}>l</span><span style={{ color: "#EA4335" }}>e</span>
          </span>
          <div className="flex-1 flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-2.5 py-1 shadow-[0_1px_6px_rgba(32,33,36,0.1)]">
            <span className="text-[7.5px] text-slate-700 flex-1 truncate">best ai tools b2b content teams</span>
            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
              <Search size={7} className="text-white" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-3 mb-1.5 border-b border-slate-100 pb-1">
          {["All", "Images", "News", "Shopping"].map((t, i) => (
            <span key={t} className={`text-[7px] pb-1 ${i === 0 ? "font-semibold text-blue-600 border-b-2 border-blue-600" : "text-slate-400"}`}>{t}</span>
          ))}
        </div>
        <p className="text-[6px] text-slate-400 mb-1.5">About 1,240,000 results (0.42 seconds)</p>

        {/* AI Overview */}
        <div className="rounded-xl overflow-hidden mb-1.5" style={{ background: "linear-gradient(135deg,#4285F4,#EA4335,#FBBC05,#34A853)", padding: "1.5px" }}>
          <div className="bg-white rounded-[10px] p-2">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="flex gap-[3px]">
                {["#4285F4","#EA4335","#FBBC05","#34A853"].map((c, i) => (
                  <div key={i} className="w-[5px] h-[5px] rounded-full" style={{ background: c }} />
                ))}
              </div>
              <span className="text-[7.5px] font-bold text-slate-700">AI Overview</span>
            </div>
            <div className="space-y-1 mb-1.5 min-h-[42px]">
              {AI_CHUNKS.map((chunk, i) => (
                <motion.p key={i}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: chunkIdx >= i ? 1 : 0, y: chunkIdx >= i ? 0 : 4 }}
                  transition={{ duration: 0.32 }}
                  className="text-[7px] text-slate-700 leading-snug">
                  {chunk}
                </motion.p>
              ))}
            </div>
            <div className="flex gap-1 flex-wrap">
              <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 shadow-[0_0_0_1.5px_rgba(59,130,246,0.15)]">
                <div className="w-2.5 h-2.5 rounded-sm bg-gradient-to-br from-blue-500 to-indigo-400 shrink-0" />
                <span className="text-[6.5px] font-semibold text-blue-600">yourwebsite.com</span>
              </motion.div>
              {["semrush.com", "backlinko.com"].map((s, i) => (
                <motion.div key={s} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 + i * 0.1 }}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded-full border border-slate-100 bg-slate-50">
                  <div className="w-2 h-2 rounded-sm bg-slate-200 shrink-0" />
                  <span className="text-[6.5px] text-slate-500">{s}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Sponsored */}
        <div className="mb-1.5 pb-1.5 border-b border-slate-100">
          <div className="flex items-center gap-1 mb-0.5">
            <span className="text-[5.5px] border border-slate-300 text-slate-500 px-0.5 rounded">Sponsored</span>
            <span className="text-[6px] text-slate-400">contentai.io › start-free</span>
          </div>
          <p className="text-[7.5px] text-blue-700 font-medium mb-0.5">AI Content Platform — Start Free Today</p>
          <p className="text-[6.5px] text-slate-500">Create 100+ SEO articles per month. Trusted by 10,000+ marketers.</p>
        </div>

        {/* OUR article — Rank #2 */}
        <motion.div
          animate={scrolled ? {
            borderColor: "rgb(59,130,246)",
            boxShadow: "0 0 0 2px rgba(59,130,246,0.12)",
            backgroundColor: "rgb(239,246,255)",
          } : { borderColor: "rgba(0,0,0,0)", boxShadow: "none", backgroundColor: "rgb(255,255,255)" }}
          transition={{ duration: 0.45, delay: scrolled ? 0.5 : 0 }}
          className="rounded-xl border-2 p-2 mb-1.5"
        >
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-gradient-to-br from-blue-500 to-indigo-400 shrink-0" />
              <span className="text-[6px] text-emerald-600">yourwebsite.com › articles</span>
            </div>
            <AnimatePresence>
              {scrolled && (
                <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.65, duration: 0.25 }}
                  className="flex items-center gap-0.5 bg-blue-600 px-1.5 py-[2px] rounded-full">
                  <TrendingUp size={5} className="text-white" />
                  <span className="text-[6px] font-bold text-white">Rank #2</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <p className="text-[8px] font-semibold text-blue-700 leading-tight mb-0.5">10 Best AI Tools for B2B Content Teams [2025 Guide]</p>
          <p className="text-[6.5px] text-slate-500">Hands-on comparison of the top AI content tools for B2B teams — pricing, features, real data.</p>
        </motion.div>

        {/* Competitor #1 */}
        <motion.div animate={{ opacity: scrolled ? 1 : 0.4 }} transition={{ duration: 0.4, delay: scrolled ? 0.75 : 0 }}
          className="mb-1.5 pb-1.5 border-b border-slate-100">
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-sm bg-slate-200 shrink-0" />
              <span className="text-[6px] text-slate-400">writesonic.com › blog</span>
            </div>
            <AnimatePresence>
              {scrolled && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.88 }}
                  className="text-[5.5px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-[2px] rounded-full">
                  Competitor #1
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <p className="text-[7.5px] text-blue-600 font-medium mb-0.5">15 Best AI Writing Tools for Content Marketing in 2025</p>
          <p className="text-[6.5px] text-slate-500">A comprehensive guide to AI writing assistants for content teams.</p>
        </motion.div>

        {/* Competitor #2 */}
        <motion.div animate={{ opacity: scrolled ? 1 : 0.2 }} transition={{ duration: 0.4, delay: scrolled ? 0.9 : 0 }}
          className="mb-1.5 pb-1.5 border-b border-slate-100">
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-sm bg-slate-200 shrink-0" />
              <span className="text-[6px] text-slate-400">ahrefs.com › blog</span>
            </div>
            <AnimatePresence>
              {scrolled && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}
                  className="text-[5.5px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-[2px] rounded-full">
                  Competitor #2
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <p className="text-[7.5px] text-blue-600 font-medium mb-0.5">AI Content Tools: Complete B2B Buyer's Guide (2025)</p>
          <p className="text-[6.5px] text-slate-500">Expert analysis of 20+ AI writing tools ranked by ROI for B2B teams.</p>
        </motion.div>

        {/* Competitor #3 */}
        <motion.div animate={{ opacity: scrolled ? 0.9 : 0.1 }} transition={{ duration: 0.4, delay: scrolled ? 1.05 : 0 }}
          className="mb-1.5 pb-1.5 border-b border-slate-100">
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-sm bg-slate-200 shrink-0" />
              <span className="text-[6px] text-slate-400">hubspot.com › marketing</span>
            </div>
            <AnimatePresence>
              {scrolled && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.12 }}
                  className="text-[5.5px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-[2px] rounded-full">
                  Competitor #3
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <p className="text-[7.5px] text-blue-600 font-medium mb-0.5">12 Best AI Content Creation Tools for Marketers</p>
          <p className="text-[6.5px] text-slate-500">HubSpot's curated list of AI tools that improve content quality and speed.</p>
        </motion.div>

        {/* People also ask */}
        <motion.div animate={{ opacity: scrolled ? 0.75 : 0.05 }} transition={{ duration: 0.4, delay: scrolled ? 1.2 : 0 }}
          className="bg-slate-50 rounded-xl p-2">
          <p className="text-[7px] font-semibold text-slate-600 mb-1.5">People also ask</p>
          {["What is the best AI tool for B2B content?", "How does AI content help SEO rankings?", "Is AstroRank better than manual SEO?"].map((q, i) => (
            <div key={i} className="flex items-center justify-between py-[3px] border-b border-slate-100 last:border-0">
              <span className="text-[6.5px] text-slate-600">{q}</span>
              <span className="text-[8px] text-slate-400">+</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────
const CARD_H = 96;

function ContentLibraryPanel() {
  const [phase,        setPhase]        = useState(0);
  const [mounted,      setMounted]      = useState(false);
  const [settled,      setSettled]      = useState<Set<number>>(() => new Set<number>());
  const [serpScrolled, setSerpScrolled] = useState(false);
  const [genLabelIdx,  setGenLabelIdx]  = useState(0);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const t = setTimeout(() => setPhase(p => (p + 1) % PHASE_DUR.length), PHASE_DUR[phase]);
    return () => clearTimeout(t);
  }, [phase, mounted]);

  useEffect(() => {
    if (!mounted) return;
    // Writing phases: settle each card after 280ms
    if (phase <= 8) {
      if (phase === 0) setSettled(new Set<number>());
      const t = setTimeout(() => setSettled(prev => { const n = new Set(prev); n.add(phase); return n; }), 280);
      return () => clearTimeout(t);
    }
    // Return phase: show full settled grid briefly
    if (phase === 17) {
      const s = new Set<number>(); for (let i = 0; i < 9; i++) s.add(i);
      setSettled(s);
      return;
    }
    // SERP scroll trigger
    if (phase === 15) {
      setSerpScrolled(false);
      const t = setTimeout(() => setSerpScrolled(true), 1600);
      return () => clearTimeout(t);
    }
    setSerpScrolled(false);
  }, [phase, mounted]);

  // Cycle the writing badge label during generation
  useEffect(() => {
    if (phase > 8) return;
    const t = setInterval(() => setGenLabelIdx(v => (v + 1) % GEN_CATS.length), 680);
    return () => clearInterval(t);
  }, [phase]);

  // Phase → derived state
  const numVisible   = phase <= 8 ? phase + 1 : 9;
  const isGenerating = phase <= 8;
  const activeCat    = phase === 9 ? "SEO" : phase === 10 ? "How-To" : phase === 11 ? "Growth" : "All";
  const isGridPhase  = phase <= 12 || phase === 17;
  const focusedIdx   = phase === 12 ? 0 : -1;
  const inArticle    = phase === 13 || phase === 14;
  const scanning     = phase === 14;
  const isSerp       = phase === 15;
  const showStats    = phase === 16;

  const url =
    phase >= 12 && phase <= 14 ? `yourwebsite.com/articles/${ARTICLES[0].slug}` :
    isSerp                     ? "google.com/search?q=best+ai+tools+b2b" :
    showStats                  ? "yourwebsite.com/analytics" :
    "yourwebsite.com/articles";

  // SSR placeholder
  if (!mounted) {
    return (
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 mb-3">
          <div className="w-[11px] h-[11px] rounded-full bg-[#FF5F57]" />
          <div className="w-[11px] h-[11px] rounded-full bg-[#FEBC2E]" />
          <div className="w-[11px] h-[11px] rounded-full bg-[#28C840]" />
          <div className="flex-1 mx-2 h-5 rounded-md bg-slate-100 flex items-center px-2.5">
            <span className="text-[9.5px] text-slate-400 font-mono">yourwebsite.com/articles</span>
          </div>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white" style={{ minHeight: 380 }}>
          <div className="p-3">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[10.5px] font-bold text-slate-900">Content Library</p>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {ARTICLES.slice(0, 3).map(a => (
                <div key={a.id} className="rounded-xl border border-slate-100 bg-slate-50" style={{ height: CARD_H }} />
              ))}
              {[0,1,2,3,4,5].map(i => (
                <div key={i} className="rounded-xl border border-dashed border-slate-100 bg-slate-50/30" style={{ height: CARD_H }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 mb-3">
        <div className="w-[11px] h-[11px] rounded-full bg-[#FF5F57]" />
        <div className="w-[11px] h-[11px] rounded-full bg-[#FEBC2E]" />
        <div className="w-[11px] h-[11px] rounded-full bg-[#28C840]" />
        <div className="flex-1 mx-2 h-5 rounded-md bg-slate-100 flex items-center px-2.5 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.span key={url} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }} className="text-[9.5px] text-slate-400 font-mono truncate">
              {url}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Viewport */}
      <div className="relative rounded-xl border border-slate-100 bg-white overflow-hidden" style={{ minHeight: 390 }}>
        <AnimatePresence mode="wait">

          {/* ── GRID ─────────────────────────────────────────── */}
          {isGridPhase && (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }} className="absolute inset-0 p-3">
              <div className="flex items-center justify-between mb-2 min-h-[28px]">
                <div>
                  <p className="text-[10.5px] font-bold text-slate-900 leading-none mb-0.5">Content Library</p>
                  <p className="text-[7.5px] text-slate-400">{numVisible} articles published</p>
                </div>
                {isGenerating ? (
                  <div className="flex items-center gap-1 bg-blue-50 border border-blue-100 px-2 py-1 rounded-full">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
                      className="w-2.5 h-2.5 border-[1.5px] border-blue-200 border-t-blue-500 rounded-full shrink-0" />
                    <span className="text-[7px] font-semibold text-blue-600 whitespace-nowrap">Writing </span>
                    <AnimatePresence mode="wait">
                      <motion.span key={genLabelIdx}
                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        className={`text-[7px] font-bold whitespace-nowrap ${CAT_STYLES[GEN_CATS[genLabelIdx].key].text}`}>
                        {GEN_CATS[genLabelIdx].label}
                      </motion.span>
                    </AnimatePresence>
                    <span className="text-[7px] font-semibold text-blue-600">…</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-0.5 flex-wrap justify-end">
                    {CATS.map(cat => (
                      <motion.span key={cat.id}
                        animate={{ backgroundColor: activeCat === cat.id ? "#0f172a" : "#f1f5f9", color: activeCat === cat.id ? "#ffffff" : "#64748b" }}
                        transition={{ duration: 0.3 }}
                        className="text-[7px] font-semibold px-1.5 py-[2.5px] rounded-full shrink-0 whitespace-nowrap"
                      >{cat.label}</motion.span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {ARTICLES.map((article, i) => {
                  const visible     = i < numVisible;
                  const generating  = visible && !settled.has(i);
                  const highlighted = !isGenerating && activeCat !== "All" && KEY_TO_CAT[article.catKey] === activeCat;
                  const focused     = i === focusedIdx;
                  return (
                    <div key={article.id} style={{ height: CARD_H }}>
                      {visible ? (
                        <ArticleGridCard article={article} generating={generating} highlighted={highlighted} focused={focused} />
                      ) : (
                        <div className="rounded-xl border border-dashed border-slate-100 bg-slate-50/30 h-full" />
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── ARTICLE ──────────────────────────────────────── */}
          {inArticle && (
            <motion.div key="article" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }} className="absolute inset-0 overflow-hidden">
              {/* Scrolling content — scores overlay is NOT inside this */}
              <motion.div animate={{ y: scanning ? -152 : 0 }} transition={{ duration: 2.7, ease: "easeInOut" }}>
                <ArticlePageSEO />
              </motion.div>
              {/* Scan line */}
              <AnimatePresence>
                {scanning && (
                  <motion.div key="scan"
                    initial={{ top: "5%" }} animate={{ top: "88%" }}
                    transition={{ duration: 2.7, ease: "easeInOut" }}
                    className="absolute left-3 right-3 h-px pointer-events-none z-10"
                    style={{ background: "linear-gradient(to right,transparent,rgba(59,130,246,0.5) 20%,rgba(59,130,246,0.5) 80%,transparent)" }}
                  />
                )}
              </AnimatePresence>
              {/* Sticky scores — outside scrolling div, always in viewport */}
              <ScoresOverlay show={scanning} />
            </motion.div>
          )}

          {/* ── GOOGLE SERP ──────────────────────────────────── */}
          {isSerp && (
            <motion.div key="serp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.28 }} className="absolute inset-0">
              <GoogleSerpPanel scrolled={serpScrolled} />
            </motion.div>
          )}

          {/* ── ANALYTICS ────────────────────────────────────── */}
          {showStats && (
            <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.28 }} className="absolute inset-0 bg-white overflow-hidden">
              <StatsPanel show={showStats} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Rating widget ────────────────────────────────────────────────────────────
const LINKEDIN_AVATARS = [
  { photo: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1" },
  { photo: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1" },
  { photo: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1"   },
  { photo: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1"   },
  { photo: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1" },
];

function RatingWidget() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-1.5">
        {LINKEDIN_AVATARS.map((av, idx) => (
          <div key={idx} className="w-7 h-7 rounded-full border-2 border-white overflow-hidden z-10 relative">
            <img src={av.photo} alt="User" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-[2px]">
        <div className="flex items-center gap-1.5">
          <div className="flex gap-[2px]">
            {[1,2,3,4].map(i => (
              <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            ))}
            {/* Half star: grey base + amber left half via clip */}
            <span className="relative inline-block w-[13px] h-[13px]">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#D1D5DB"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <span className="absolute inset-0 overflow-hidden" style={{ width: "65%" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              </span>
            </span>
          </div>
          <span className="text-[12px] font-bold text-slate-800">4.6</span>
          <span className="text-[11px] text-slate-400 font-medium">· 340+ reviews</span>
        </div>
        <span className="text-[10.5px] text-slate-400">Trusted by 1,200+ content teams</span>
      </div>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
export default function AstroRankHero() {
  const [email, setEmail] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) { inputRef.current?.focus(); return; }
    setEmail("");
  }
  return (
    <section className="relative flex items-center overflow-hidden bg-slate-50 pt-[64px]">
      <SpaceBg />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-100/40 via-sky-50/30 to-transparent blur-[90px]" />
        <div className="absolute bottom-0 -left-32 w-[440px] h-[440px] rounded-full bg-gradient-to-tr from-slate-100/60 to-transparent blur-[80px]" />
      </div>
      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-5 md:px-8 lg:px-10 py-10 md:py-14 lg:py-20 flex items-center">
        <div className="w-full grid md:grid-cols-2 lg:grid-cols-[54fr_46fr] gap-10 xl:gap-20 items-center">

          {/* Left: copy */}
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }} className="flex flex-col items-start">
            <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="font-extrabold leading-[1.08] tracking-[-0.025em] text-slate-900 mb-5 md:text-[3.5rem] lg:text-[4rem] xl:text-[4.5rem]"
              style={{ fontSize: 'clamp(2rem, 8vw, 3rem)' }}>
              Give your brand an<br />
              <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-violet-600 bg-clip-text text-transparent">astronomical SEO</span> advantage.
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.55 }}
              className="text-slate-500 leading-relaxed mb-6 max-w-[500px]"
              style={{ fontSize: 'clamp(1rem, 4.5vw, 1.125rem)' }}>
              Scale high-quality SEO content with AI and publish hundreds of research-backed articles designed to{" "}
              <span className="whitespace-nowrap">perform on <PlatformCycler />.</span>
            </motion.p>

            {/* Mobile only: animation panel between subtext and CTA */}
            <motion.div initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.28, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden w-full mb-6">
              <div className="relative bg-white rounded-[20px] border border-slate-200/80 shadow-[0_8px_48px_rgba(15,23,42,0.1),0_2px_8px_rgba(15,23,42,0.06)] p-4 overflow-hidden" style={{ minHeight: "340px" }}>
                <ContentLibraryPanel />
              </div>
            </motion.div>

            <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="w-full max-w-[460px] flex flex-col sm:flex-row gap-2.5 mb-6">
              <input ref={inputRef} type="text" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="yourwebsite.com"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-[14px] placeholder:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 shadow-sm transition-all duration-200" />
              <button type="submit"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white text-[14px] font-semibold shadow-md shadow-blue-600/25 hover:bg-blue-700 active:scale-[0.98] transition-all duration-150 whitespace-nowrap ring-1 ring-blue-700/20">
                Get FREE Audit <ArrowRight size={14} strokeWidth={2.5} />
              </button>
            </motion.form>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.46, duration: 0.4 }}>
              <RatingWidget />
            </motion.div>
          </motion.div>

          {/* Right: animation panel — hidden on mobile (shown inline above) */}
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="hidden md:block relative w-full max-w-[520px] mx-auto md:mx-0 md:max-w-none lg:max-w-[520px] lg:mx-0">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-blue-100/50 via-violet-100/30 to-sky-100/50 blur-2xl pointer-events-none" />
            <div className="relative bg-white rounded-[20px] border border-slate-200/80 shadow-[0_8px_48px_rgba(15,23,42,0.1),0_2px_8px_rgba(15,23,42,0.06)] p-4 md:p-5 overflow-hidden">
              <ContentLibraryPanel />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

// ─── Metrics strip ────────────────────────────────────────────────────────────
const METRICS = [
  {
    value: "95+",
    label: "Lighthouse Score",
    sublabel: "Google PageSpeed",
    color: "text-orange-500",
    bg: "bg-orange-50",
    border: "border-orange-100",
    Icon: () => (
      /* Google Lighthouse "lighthouse" icon — orange beacon */
      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
        <svg width="26" height="26" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 4L30 16H42L32 24L36 36L24 29L12 36L16 24L6 16H18L24 4Z" fill="#F97316" opacity="0.18"/>
          <path d="M24 6L29.5 17H41L32 24.5L35.5 35L24 28.5L12.5 35L16 24.5L7 17H18.5L24 6Z" fill="none" stroke="#F97316" strokeWidth="2" strokeLinejoin="round"/>
          <circle cx="24" cy="20" r="3.5" fill="#F97316"/>
          <line x1="24" y1="20" x2="20" y2="12" stroke="#F97316" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
    ),
  },
  {
    value: "85+",
    label: "E-E-A-T Score",
    sublabel: "Google AI Search",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
    Icon: () => (
      /* Google multicolour "G" mark */
      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
        <svg width="24" height="24" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
          <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.32-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
          <path fill="#FBBC05" d="M11.68 28.18A13.9 13.9 0 0 1 10.8 24c0-1.45.25-2.86.68-4.18v-5.7H4.34A23.93 23.93 0 0 0 .08 24c0 3.87.93 7.53 2.56 10.77l7.04-5.59z" transform="translate(.2)"/>
          <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.34 5.7C13.42 14.62 18.27 10.75 24 10.75z"/>
        </svg>
      </div>
    ),
  },
  {
    value: "95%",
    label: "Originality Score",
    sublabel: "Grammarly AI Detection",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    Icon: () => (
      /* Grammarly "G" mark — green circle with inner arc */
      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
        <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="22" fill="#15A34A"/>
          <path d="M33 20.5h-9v4h5.2c-.6 2.8-3.1 4.8-5.9 4.8a6.8 6.8 0 0 1 0-13.6c1.7 0 3.2.6 4.4 1.7l2.8-2.8A11 11 0 0 0 24 12a11.8 11.8 0 1 0 9 19.5V20.5z" fill="white"/>
        </svg>
      </div>
    ),
  },
];

export function MetricsStrip() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <section ref={ref} className="w-full bg-white border-y border-slate-100">
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5 }}
        className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 py-6 sm:py-7"
      >
        {/* Mobile: horizontal scroll · Desktop: flex row */}
        <div className="flex items-center gap-0 overflow-x-auto scrollbar-none sm:justify-center sm:divide-x sm:divide-slate-100 -mx-5 px-5 sm:mx-0 sm:px-0">
          {METRICS.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 6 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex items-center gap-3 sm:px-8 lg:px-12 shrink-0 sm:shrink py-1 pr-6 sm:pr-0"
            >
              <m.Icon />
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[10px] font-medium text-slate-400 leading-none">Avg</span>
                  <span className={`text-[1.45rem] sm:text-[1.6rem] font-extrabold leading-none tracking-tight tabular-nums ${m.color}`}>
                    {m.value}
                  </span>
                  <span className="text-[12px] font-semibold text-slate-700 leading-none">{m.label}</span>
                </div>
                <span className="text-[10.5px] text-slate-400 leading-tight mt-[3px]">{m.sublabel}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
