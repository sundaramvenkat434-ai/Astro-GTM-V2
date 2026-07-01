"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ArrowRight, Star, Sparkles, TrendingUp, Search, MousePointer, ArrowUp, Minus, Zap } from "lucide-react";

// ─── Platform cycler ─────────────────────────────────────────────────────────
const PLATFORMS = ["Google", "ChatGPT", "Gemini", "Claude", "Perplexity", "Copilot"];
function PlatformCycler() {
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI(v => (v + 1) % PLATFORMS.length), 2200); return () => clearInterval(t); }, []);
  return (
    <span className="inline-block relative min-w-[100px]">
      <AnimatePresence mode="wait">
        <motion.span key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="inline-block bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
          {PLATFORMS[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
type Article = { id: number; cat: string; catKey: string; title: string; slug: string; readTime: string };

const ARTICLES: Article[] = [
  { id: 1, cat: "SEO Strategy",    catKey: "blue",    title: "10 Best AI Tools for B2B Content Teams",          slug: "best-ai-tools-b2b",         readTime: "8 min" },
  { id: 2, cat: "How-To Guide",    catKey: "emerald", title: "Build a Keyword Strategy with AI Research",        slug: "keyword-strategy-ai",       readTime: "6 min" },
  { id: 3, cat: "Industry Trends", catKey: "violet",  title: "AI Content: The New SaaS Growth Lever",            slug: "ai-content-saas",           readTime: "5 min" },
  { id: 4, cat: "Growth",          catKey: "teal",    title: "Content Velocity: 50 Articles per Month",          slug: "content-velocity",          readTime: "7 min" },
  { id: 5, cat: "Comparison",      catKey: "sky",     title: "AstroRank vs Manual SEO: The Numbers",             slug: "astrorank-vs-manual",       readTime: "9 min" },
  { id: 6, cat: "SEO Strategy",    catKey: "blue",    title: "How to Rank for Competitor Keywords in 2025",      slug: "competitor-keywords",       readTime: "6 min" },
  { id: 7, cat: "How-To Guide",    catKey: "emerald", title: "Setting Up a Scalable Internal Linking Structure", slug: "internal-linking",          readTime: "5 min" },
  { id: 8, cat: "Industry Trends", catKey: "violet",  title: "Answer Engine Optimization: The New SEO Frontier",slug: "answer-engine-optimization",readTime: "7 min" },
  { id: 9, cat: "Growth",          catKey: "teal",    title: "SaaS Content Moat: The 6-Month Blueprint",         slug: "content-moat",              readTime: "6 min" },
];

const CATS = [
  { id: "All",    label: "All"    },
  { id: "SEO",    label: "SEO"    },
  { id: "How-To", label: "How-To" },
  { id: "Trends", label: "Trends" },
  { id: "Growth", label: "Growth" },
];

const KEY_TO_CAT: Record<string, string> = { blue: "SEO", emerald: "How-To", violet: "Trends", teal: "Growth", sky: "All" };

const CAT_STYLES: Record<string, { bg: string; text: string }> = {
  blue:    { bg: "bg-blue-100",    text: "text-blue-700"    },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-700" },
  violet:  { bg: "bg-violet-100",  text: "text-violet-700"  },
  teal:    { bg: "bg-teal-100",    text: "text-teal-700"    },
  amber:   { bg: "bg-amber-100",   text: "text-amber-700"   },
  sky:     { bg: "bg-sky-100",     text: "text-sky-700"     },
};

const GRAD_LIGHT: Record<string, string> = {
  blue:    "from-blue-100 to-indigo-50",
  emerald: "from-emerald-100 to-teal-50",
  violet:  "from-violet-100 to-purple-50",
  teal:    "from-teal-100 to-cyan-50",
  amber:   "from-amber-100 to-orange-50",
  sky:     "from-sky-100 to-blue-50",
};

const GRAD_HERO: Record<string, string> = {
  blue:    "from-blue-500 via-blue-400 to-indigo-400",
  emerald: "from-emerald-500 via-emerald-400 to-teal-400",
  violet:  "from-violet-500 via-violet-400 to-purple-400",
  teal:    "from-teal-500 via-teal-400 to-cyan-400",
  amber:   "from-amber-500 via-amber-400 to-orange-400",
  sky:     "from-sky-500 via-sky-400 to-blue-400",
};

const HBorder: Record<string, string> = {
  blue: "border-blue-300", emerald: "border-emerald-300", violet: "border-violet-300",
  teal: "border-teal-300", amber: "border-amber-300", sky: "border-sky-300",
};

const GEN_CATS = [
  { key: "blue",    label: "SEO Strategy"    },
  { key: "emerald", label: "How-To Guide"    },
  { key: "violet",  label: "Industry Trends" },
  { key: "teal",    label: "Growth"          },
  { key: "sky",     label: "Comparison"      },
];

// 0: initial grid | 1-3: filter cycling | 4-9: cards pop | 10: zoom | 11-12: article+scan | 13: SERP | 14: analytics | 15: return
const PHASE_DUR = [
  400,  // 0
  900,  // 1  SEO
  900,  // 2  How-To
  900,  // 3  Trends
  520,  // 4  art 4
  520,  // 5  art 5
  500,  // 6  art 6
  470,  // 7  art 7
  470,  // 8  art 8
  470,  // 9  art 9
  420,  // 10 zoom
  500,  // 11 open
  2700, // 12 scan (scores animate)
  4000, // 13 SERP
  4800, // 14 analytics (two graphs)
  550,  // 15 return
];

const KEYWORDS_DATA = [
  { kw: "best ai tools b2b",    pos: 2,  vol: "2.1K", up: true  },
  { kw: "ai content strategy",  pos: 4,  vol: "890",  up: true  },
  { kw: "b2b content velocity", pos: 9,  vol: "450",  up: true  },
  { kw: "saas content tools",   pos: 14, vol: "320",  up: false },
];

// Traffic line graph
const TRAFFIC_PATH = "M 12,61 C 29,61 37,57 54,57 C 71,57 79,50 96,50 C 113,50 121,39 138,39 C 155,39 163,23 180,23 C 197,23 205,8 222,8";
const TRAFFIC_AREA = TRAFFIC_PATH + " L 222,64 L 12,64 Z";
const TRAFFIC_PTS = [
  { x: 12,  y: 61, m: "Jan", v: "190"  },
  { x: 54,  y: 57, m: "Feb", v: "380"  },
  { x: 96,  y: 50, m: "Mar", v: "740"  },
  { x: 138, y: 39, m: "Apr", v: "1.3K" },
  { x: 180, y: 23, m: "May", v: "2.1K" },
  { x: 222, y: 8,  m: "Jun", v: "2.8K" },
];

// Searches line graph (emerald)
const SEARCH_PATH = "M 12,62 C 29,62 37,56 54,56 C 71,56 79,47 96,47 C 113,47 121,34 138,34 C 155,34 163,19 180,19 C 197,19 205,9 222,9";
const SEARCH_AREA = SEARCH_PATH + " L 222,64 L 12,64 Z";
const SEARCH_PTS = [
  { x: 12,  y: 62, m: "Jan", v: "1.2K" },
  { x: 54,  y: 56, m: "Feb", v: "3.4K" },
  { x: 96,  y: 47, m: "Mar", v: "7.8K" },
  { x: 138, y: 34, m: "Apr", v: "13K"  },
  { x: 180, y: 19, m: "May", v: "21K"  },
  { x: 222, y: 9,  m: "Jun", v: "31K"  },
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
  pts: { x: number; y: number; m: string; v: string }[];
  color: string; gradId: string; delay?: number;
}) {
  return (
    <svg viewBox="0 0 234 74" style={{ width: "100%", height: 62 }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
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
function ScoreBar({ label, from, to, run, color, delay }: {
  label: string; from: number; to: number; run: boolean; color: string; delay: number;
}) {
  const [val, setVal] = useState(from);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    if (!run) { setVal(from); return; }
    let t0: number | null = null;
    const tick = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / 1800, 1);
      setVal(Math.round(from + (to - from) * (1 - (1 - p) ** 2.5)));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    const id = setTimeout(() => { raf.current = requestAnimationFrame(tick); }, delay * 1000);
    return () => { clearTimeout(id); if (raf.current) cancelAnimationFrame(raf.current); };
  }, [run, from, to, delay]);

  const styles: Record<string, { bar: string; text: string; bg: string }> = {
    blue:    { bar: "bg-blue-500",    text: "text-blue-700",    bg: "bg-blue-100"    },
    emerald: { bar: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-100" },
    violet:  { bar: "bg-violet-500",  text: "text-violet-700",  bg: "bg-violet-100"  },
  };
  const s = styles[color];
  return (
    <div className="mb-1.5">
      <div className="flex items-center justify-between mb-[2px]">
        <span className="text-[6px] font-semibold text-slate-500">{label}</span>
        <span className={`text-[7px] font-extrabold tabular-nums ${s.text}`}>{val}</span>
      </div>
      <div className={`h-[3.5px] ${s.bg} rounded-full overflow-hidden`}>
        <div className={`h-full ${s.bar} rounded-full transition-all duration-75`} style={{ width: `${val}%` }} />
      </div>
    </div>
  );
}

function ScoresOverlay({ show }: { show: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 14, scale: 0.94 }}
      animate={{ opacity: show ? 1 : 0, x: show ? 0 : 14, scale: show ? 1 : 0.94 }}
      transition={{ duration: 0.32, delay: show ? 0.25 : 0 }}
      className="absolute right-2 top-2 bg-white/97 backdrop-blur-sm rounded-xl border border-slate-100 shadow-[0_4px_18px_rgba(15,23,42,0.1)] p-2 w-[90px] pointer-events-none"
    >
      <div className="flex items-center gap-1 mb-1.5">
        <Zap size={7} className="text-amber-500" />
        <p className="text-[6.5px] font-bold text-slate-700 uppercase tracking-wider">AI Quality</p>
      </div>
      <ScoreBar label="EEAT"       from={62} to={91} run={show} color="blue"    delay={0}   />
      <ScoreBar label="Lighthouse" from={74} to={97} run={show} color="emerald" delay={0.2} />
      <ScoreBar label="Grammarly"  from={68} to={95} run={show} color="violet"  delay={0.4} />
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
      const p = Math.min((ts - t0) / 3200, 1);
      setPct(Math.round(12 + 44 * (1 - (1 - p) ** 2)));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    const id = setTimeout(() => { raf.current = requestAnimationFrame(tick); }, 700);
    return () => { clearTimeout(id); if (raf.current) cancelAnimationFrame(raf.current); };
  }, [show]);

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-xl p-2">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[7px] font-semibold text-slate-500">Traffic Capture</p>
        <span className="text-[12px] font-extrabold text-slate-900 tabular-nums leading-none">
          {pct}<span className="text-[8px] text-slate-400">%</span>
        </span>
      </div>
      <div className="h-[5px] bg-slate-200 rounded-full overflow-hidden mb-1">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-75"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between">
        <span className="text-[5.5px] text-slate-400">of total search impressions</span>
        <span className="text-[5.5px] text-emerald-500 font-semibold">+44pp</span>
      </div>
    </div>
  );
}

// ─── Stats panel ──────────────────────────────────────────────────────────────
function StatsPanel({ show }: { show: boolean }) {
  return (
    <div className="p-3 h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-50 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[8.5px] font-semibold text-slate-700 truncate">{ARTICLES[0].title}</p>
          <p className="text-[7px] text-slate-400">Analytics · Last 6 months</p>
        </div>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}
          className="flex items-center gap-0.5 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full shrink-0">
          <TrendingUp size={7} className="text-emerald-500" />
          <span className="text-[7.5px] font-bold text-emerald-600">+1,375%</span>
        </motion.div>
      </div>

      {/* Two graphs side by side */}
      <div className="grid grid-cols-2 gap-1.5 mb-2">
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: show ? 0.1 : 0 }}
          className="bg-slate-50 rounded-xl p-2 border border-slate-100">
          <p className="text-[6px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Monthly Searches</p>
          <p className="text-[10px] font-extrabold text-emerald-600 tabular-nums leading-none mb-0.5">
            <AnimCounter target={31200} run={show} duration={2800} />
          </p>
          <LineGraph show={show} linePath={SEARCH_PATH} areaPath={SEARCH_AREA} pts={SEARCH_PTS}
            color="rgb(16,185,129)" gradId="areaGradSearch" delay={0} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: show ? 0.2 : 0 }}
          className="bg-slate-50 rounded-xl p-2 border border-slate-100">
          <p className="text-[6px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Monthly Traffic</p>
          <p className="text-[10px] font-extrabold text-blue-600 tabular-nums leading-none mb-0.5">
            <AnimCounter target={2847} run={show} duration={2800} />
          </p>
          <LineGraph show={show} linePath={TRAFFIC_PATH} areaPath={TRAFFIC_AREA} pts={TRAFFIC_PTS}
            color="rgb(59,130,246)" gradId="areaGradTraffic" delay={0.15} />
        </motion.div>
      </div>

      {/* Traffic capture */}
      <TrafficCapture show={show} />

      <div className="h-px bg-slate-100 my-2" />

      {/* Bottom stat cards */}
      <div className="grid grid-cols-2 gap-1.5">
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: show ? 1.1 : 0, duration: 0.25 }}
          className="bg-violet-50 border border-violet-100 rounded-xl p-2">
          <div className="flex items-center gap-1 mb-0.5">
            <Search size={8} className="text-violet-500" />
            <p className="text-[7px] text-violet-600 font-semibold">Avg. Position</p>
          </div>
          <p className="text-[17px] font-extrabold text-violet-900 leading-none tabular-nums">3.0</p>
          <p className="text-[6.5px] text-violet-400 mt-0.5">across all keywords</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: show ? 1.2 : 0, duration: 0.25 }}
          className="bg-emerald-50 border border-emerald-100 rounded-xl p-2">
          <div className="flex items-center gap-1 mb-0.5">
            <MousePointer size={8} className="text-emerald-500" />
            <p className="text-[7px] text-emerald-600 font-semibold">CTA Conversions</p>
          </div>
          <p className="text-[17px] font-extrabold text-emerald-900 leading-none tabular-nums">
            <AnimCounter target={284} run={show} duration={2200} />
          </p>
          <p className="text-[6.5px] text-emerald-400 mt-0.5">signups / month</p>
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
      className={`rounded-xl border overflow-hidden bg-white h-full transition-shadow ${
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
            <div className="h-11 bg-slate-100 animate-pulse" />
            <div className="p-1.5">
              <div className="flex items-center justify-between mb-1">
                <CyclingCatBadge startIdx={article.id} />
                <div className="flex items-center gap-0.5">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
                    className="w-2 h-2 border border-slate-200 border-t-blue-400 rounded-full" />
                  <span className="text-[5.5px] text-blue-400 font-semibold">writing…</span>
                </div>
              </div>
              <div className="h-[4.5px] bg-slate-100 rounded-full animate-pulse mb-1" style={{ width: "88%" }} />
              <div className="h-[4.5px] bg-slate-100 rounded-full animate-pulse mb-[5px]" style={{ width: "62%" }} />
              <div className="flex gap-1">
                <div className="h-[5px] w-[22px] bg-slate-100 animate-pulse rounded-full" />
                <div className="h-[5px] w-[16px] bg-slate-100 animate-pulse rounded-full" />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="loaded" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <div className={`h-11 bg-gradient-to-br ${GRAD_LIGHT[article.catKey]}`} />
            <div className="p-1.5">
              <div className="mb-1">
                <span className={`text-[6px] font-bold px-1.5 py-[1.5px] rounded-full ${CAT_STYLES[article.catKey].bg} ${CAT_STYLES[article.catKey].text}`}>
                  {article.cat}
                </span>
              </div>
              <div className="h-[4.5px] bg-slate-200 rounded-full mb-1" style={{ width: "92%" }} />
              <div className="h-[4.5px] bg-slate-200 rounded-full mb-[5px]" style={{ width: "68%" }} />
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
function ArticlePageSEO({ scanning }: { scanning: boolean }) {
  const a = ARTICLES[0];
  const cat = CAT_STYLES[a.catKey];
  return (
    <>
      <div className={`h-[44px] bg-gradient-to-br ${GRAD_HERO[a.catKey]} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
          <span className="text-[6.5px] font-bold px-1.5 py-[1.5px] rounded-full bg-white/25 text-white backdrop-blur-sm">{a.cat}</span>
          <span className="text-[6.5px] text-white/70">{a.readTime} read</span>
        </div>
      </div>
      <div className="px-3 pt-2.5 relative">
        <div className="flex items-center gap-1 mb-1.5">
          <span className="text-[7px] text-slate-400">Articles</span>
          <span className="text-[7px] text-slate-300">/</span>
          <span className={`text-[7px] font-medium ${cat.text}`}>{a.cat}</span>
        </div>
        <h3 className="text-[11px] font-extrabold text-slate-900 leading-tight mb-1.5">{a.title}</h3>
        <div className="flex items-center gap-1.5 mb-2">
          <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-br ${GRAD_LIGHT[a.catKey]}`} />
          <span className="text-[7.5px] text-slate-400">AstroRank AI &nbsp;·&nbsp; {a.readTime} read &nbsp;·&nbsp; Mar 2025</span>
        </div>
        <div className="h-px bg-slate-100 mb-2" />

        {/* Image placeholder */}
        <div className="h-[52px] bg-gradient-to-br from-slate-100 to-blue-50/40 rounded-xl mb-2 flex items-center justify-center border border-slate-100">
          <div className="flex items-center gap-2 opacity-40">
            <div className="w-8 h-6 bg-slate-300 rounded-md" />
            <div className="flex flex-col gap-1">
              <div className="w-14 h-1.5 bg-slate-200 rounded-full" />
              <div className="w-10 h-1.5 bg-slate-200 rounded-full" />
            </div>
          </div>
        </div>

        {/* TOC */}
        <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-2 mb-2">
          <p className="text-[7.5px] font-bold text-blue-700 mb-1.5">In this article</p>
          {["What counts as an AI content tool?", "Evaluation criteria & scoring", "Our top 10 picks for 2025", "Final verdict"].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 mb-1">
              <span className="text-[6.5px] font-bold text-blue-400 w-3">{i + 1}.</span>
              <span className="text-[7.5px] text-blue-600 leading-none">{item}</span>
            </div>
          ))}
        </div>

        <p className="text-[8.5px] font-bold text-slate-900 mb-1.5">Overview</p>
        {[98, 93, 100, 87].map((w, i) => <div key={i} className="h-[5px] rounded-full bg-slate-100 mb-1.5" style={{ width: `${w}%` }} />)}

        {/* Pro tip */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-2 mb-2">
          <div className="flex items-center gap-1 mb-0.5">
            <span className="text-[8px]">💡</span>
            <span className="text-[7.5px] font-bold text-amber-700">Pro Tip</span>
          </div>
          <p className="text-[7.5px] text-amber-700 leading-snug">Teams using AI content tools publish 4.7× more content with the same headcount.</p>
        </div>
        {[95, 88, 100, 82].map((w, i) => <div key={i} className="h-[5px] rounded-full bg-slate-100 mb-1.5" style={{ width: `${w}%` }} />)}

        {/* CTA block — highlighted during scanning */}
        <motion.div
          animate={scanning ? {
            borderColor: "rgb(59,130,246)",
            boxShadow: "0 0 0 2.5px rgba(59,130,246,0.14), 0 2px 14px rgba(59,130,246,0.1)",
          } : { borderColor: "rgb(219,234,254)", boxShadow: "none" }}
          transition={{ duration: 0.5, delay: scanning ? 0.55 : 0 }}
          className="rounded-xl border-2 bg-gradient-to-r from-blue-600 to-indigo-600 p-3 mb-2"
        >
          <p className="text-[8px] font-extrabold text-white mb-1">Ready to rank like this?</p>
          <p className="text-[7px] text-blue-100 mb-2 leading-snug">Join 500+ teams publishing SEO content at scale with AstroRank AI.</p>
          <div className="flex items-center gap-1">
            <div className="flex-1 h-5 bg-white/20 rounded-lg" />
            <div className="h-5 px-2 bg-white rounded-lg flex items-center">
              <span className="text-[7px] font-bold text-blue-600">Start Free →</span>
            </div>
          </div>
        </motion.div>

        <p className="text-[8.5px] font-bold text-slate-900 mb-1.5">AI Tool Comparison</p>
        {[100, 91, 95, 84].map((w, i) => <div key={i} className="h-[5px] rounded-full bg-slate-100 mb-1.5" style={{ width: `${w}%` }} />)}

        {/* Scores overlay */}
        <ScoresOverlay show={scanning} />
      </div>
    </>
  );
}

// ─── Google SERP panel ────────────────────────────────────────────────────────
const AI_CHUNKS = [
  "The best AI content tools for B2B teams in 2025 combine automated keyword research, long-form writing, and on-page SEO scoring.",
  "Teams using dedicated platforms report 4.7× content velocity.",
  "Key evaluation factors: integration depth, content quality scoring, and built-in publishing workflows.",
];

function GoogleSerpPanel({ scrolled }: { scrolled: boolean }) {
  const [chunkIdx, setChunkIdx] = useState(-1);
  useEffect(() => {
    const timers = AI_CHUNKS.map((_, i) => setTimeout(() => setChunkIdx(i), 200 + i * 450));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-white">
      <motion.div
        animate={{ y: scrolled ? -140 : 0 }}
        transition={{ duration: 1.4, ease: "easeInOut" }}
        className="px-3 py-2.5"
      >
        {/* Google header */}
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
            <span key={t} className={`text-[7px] pb-1 ${i === 0 ? "font-semibold text-blue-600 border-b-2 border-blue-600" : "text-slate-500"}`}>{t}</span>
          ))}
        </div>
        <p className="text-[6.5px] text-slate-400 mb-1.5">About 1,240,000 results (0.42 seconds)</p>

        {/* AI Overview */}
        <div className="rounded-xl overflow-hidden mb-2" style={{ background: "linear-gradient(135deg,#4285F4,#EA4335,#FBBC05,#34A853)", padding: "1.5px" }}>
          <div className="bg-white rounded-[10px] p-2">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="flex gap-[3px]">
                {["#4285F4","#EA4335","#FBBC05","#34A853"].map((c, i) => (
                  <div key={i} className="w-[5px] h-[5px] rounded-full" style={{ background: c }} />
                ))}
              </div>
              <span className="text-[7.5px] font-bold text-slate-700">AI Overview</span>
            </div>
            <div className="space-y-1 mb-1.5 min-h-[36px]">
              {AI_CHUNKS.map((chunk, i) => (
                <motion.p key={i}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: chunkIdx >= i ? 1 : 0, y: chunkIdx >= i ? 0 : 4 }}
                  transition={{ duration: 0.35 }}
                  className="text-[7px] text-slate-700 leading-snug">
                  {chunk}
                </motion.p>
              ))}
            </div>
            {/* Source chips */}
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
            <span className="text-[6.5px] text-slate-400">contentai.io › start-free</span>
          </div>
          <p className="text-[8px] text-blue-700 font-medium leading-tight mb-0.5">AI Content Platform — Start Free Today</p>
          <p className="text-[6.5px] text-slate-500 leading-snug">Create 100+ SEO articles per month. Trusted by 10,000+ marketers.</p>
        </div>

        {/* OUR article — Rank #2 */}
        <motion.div
          animate={scrolled ? {
            borderColor: "rgb(59,130,246)",
            boxShadow: "0 0 0 2px rgba(59,130,246,0.12), 0 2px 10px rgba(59,130,246,0.08)",
            backgroundColor: "rgb(239,246,255)",
          } : { borderColor: "rgba(0,0,0,0)", boxShadow: "none", backgroundColor: "rgb(255,255,255)" }}
          transition={{ duration: 0.45, delay: scrolled ? 0.55 : 0 }}
          className="rounded-xl border-2 p-2 mb-1.5"
        >
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-gradient-to-br from-blue-500 to-indigo-400 shrink-0" />
              <span className="text-[6.5px] text-emerald-600">yourwebsite.com › articles</span>
            </div>
            <AnimatePresence>
              {scrolled && (
                <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7, duration: 0.25 }}
                  className="flex items-center gap-0.5 bg-blue-600 px-1.5 py-[2px] rounded-full">
                  <TrendingUp size={5} className="text-white" />
                  <span className="text-[6px] font-bold text-white">Rank #2</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <p className="text-[8.5px] font-semibold text-blue-700 leading-tight mb-0.5">
            10 Best AI Tools for B2B Content Teams [2025 Guide]
          </p>
          <p className="text-[6.5px] text-slate-500 leading-snug">
            Hands-on comparison of the top AI content tools for B2B teams — pricing, features, real-world data.
          </p>
        </motion.div>

        {/* Competitor #1 */}
        <motion.div
          animate={{ opacity: scrolled ? 1 : 0.45 }}
          transition={{ duration: 0.4, delay: scrolled ? 0.8 : 0 }}
          className="mb-1.5 pb-1.5 border-b border-slate-100"
        >
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-slate-200 shrink-0" />
              <span className="text-[6.5px] text-slate-400">writesonic.com › blog</span>
            </div>
            <AnimatePresence>
              {scrolled && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
                  className="text-[5.5px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-[2px] rounded-full">
                  Competitor #1
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <p className="text-[7.5px] text-blue-600 font-medium leading-tight mb-0.5">15 Best AI Writing Tools for Content Marketing in 2025</p>
          <p className="text-[6.5px] text-slate-500 leading-snug">A comprehensive guide to AI writing assistants for content teams.</p>
        </motion.div>

        {/* Competitor #2 */}
        <motion.div
          animate={{ opacity: scrolled ? 1 : 0.2 }}
          transition={{ duration: 0.4, delay: scrolled ? 0.95 : 0 }}
          className="mb-1.5 pb-1.5 border-b border-slate-100"
        >
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-slate-200 shrink-0" />
              <span className="text-[6.5px] text-slate-400">ahrefs.com › blog</span>
            </div>
            <AnimatePresence>
              {scrolled && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.05 }}
                  className="text-[5.5px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-[2px] rounded-full">
                  Competitor #2
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <p className="text-[7.5px] text-blue-600 font-medium leading-tight mb-0.5">AI Content Tools: Complete B2B Buyer's Guide (2025)</p>
          <p className="text-[6.5px] text-slate-500 leading-snug">Expert analysis of 20+ AI writing tools ranked by ROI for B2B teams.</p>
        </motion.div>

        {/* Competitor #3 */}
        <motion.div
          animate={{ opacity: scrolled ? 0.85 : 0.1 }}
          transition={{ duration: 0.4, delay: scrolled ? 1.1 : 0 }}
        >
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-slate-200 shrink-0" />
              <span className="text-[6.5px] text-slate-400">hubspot.com › marketing</span>
            </div>
            <AnimatePresence>
              {scrolled && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.15 }}
                  className="text-[5.5px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-[2px] rounded-full">
                  Competitor #3
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <p className="text-[7.5px] text-blue-600 font-medium leading-tight mb-0.5">The 12 Best AI Content Creation Tools for Marketers</p>
          <p className="text-[6.5px] text-slate-500 leading-snug">HubSpot's curated list of AI tools that improve content quality and speed.</p>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────
const CARD_H = 100;

function ContentLibraryPanel() {
  const [phase,        setPhase]        = useState(0);
  const [mounted,      setMounted]      = useState(false);
  const [settled,      setSettled]      = useState<Set<number>>(() => { const s = new Set<number>(); s.add(0); s.add(1); s.add(2); return s; });
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
    if (phase === 0) {
      const next = new Set<number>(); next.add(0); next.add(1); next.add(2);
      setSettled(next);
      return;
    }
    if (phase >= 4 && phase <= 9) {
      const idx = phase - 1;
      const t = setTimeout(() => setSettled(prev => { const n = new Set(prev); n.add(idx); return n; }), 360);
      return () => clearTimeout(t);
    }
    if (phase === 13) {
      setSerpScrolled(false);
      const t = setTimeout(() => setSerpScrolled(true), 1500);
      return () => clearTimeout(t);
    } else {
      setSerpScrolled(false);
    }
  }, [phase, mounted]);

  useEffect(() => {
    if (!(phase >= 4 && phase <= 9)) return;
    const t = setInterval(() => setGenLabelIdx(v => (v + 1) % GEN_CATS.length), 680);
    return () => clearInterval(t);
  }, [phase]);

  const numVisible    = phase < 4 ? 3 : Math.min(9, phase);
  const activeCat     = phase === 1 ? "SEO" : phase === 2 ? "How-To" : phase === 3 ? "Trends" : "All";
  const isGenerating  = phase >= 4 && phase <= 9;
  const isGridPhase   = phase <= 10 || phase === 15;
  const focusedIdx    = phase === 10 ? 0 : -1;
  const inArticle     = phase === 11 || phase === 12;
  const scanning      = phase === 12;
  const isSerp        = phase === 13;
  const showStats     = phase === 14;

  const url =
    phase >= 10 && phase <= 12 ? `yourwebsite.com/articles/${ARTICLES[0].slug}` :
    isSerp                     ? "google.com/search?q=best+ai+tools+b2b" :
    showStats                  ? "yourwebsite.com/analytics" :
    "yourwebsite.com/articles";

  if (!mounted) {
    return (
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 mb-3.5">
          <div className="w-[11px] h-[11px] rounded-full bg-[#FF5F57]" />
          <div className="w-[11px] h-[11px] rounded-full bg-[#FEBC2E]" />
          <div className="w-[11px] h-[11px] rounded-full bg-[#28C840]" />
          <div className="flex-1 mx-2.5 h-5 rounded-md bg-slate-100 flex items-center px-2.5">
            <span className="text-[9.5px] text-slate-400 font-mono">yourwebsite.com/articles</span>
          </div>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white" style={{ minHeight: 410 }}>
          <div className="p-3">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[10.5px] font-bold text-slate-900">Content Library</p>
              <div className="flex gap-1">
                {CATS.slice(0, 3).map((c, i) => (
                  <span key={c.id} className={`text-[7px] font-semibold px-2 py-[2.5px] rounded-full ${i === 0 ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"}`}>{c.label}</span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {ARTICLES.slice(0, 3).map(a => (
                <div key={a.id} className="rounded-xl border border-slate-100 overflow-hidden" style={{ height: CARD_H }}>
                  <div className={`h-11 bg-gradient-to-br ${GRAD_LIGHT[a.catKey]}`} />
                  <div className="p-1.5">
                    <span className={`text-[6px] font-bold px-1.5 py-[1.5px] rounded-full ${CAT_STYLES[a.catKey].bg} ${CAT_STYLES[a.catKey].text}`}>{a.cat}</span>
                  </div>
                </div>
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
      <div className="flex items-center gap-1.5 mb-3.5">
        <div className="w-[11px] h-[11px] rounded-full bg-[#FF5F57]" />
        <div className="w-[11px] h-[11px] rounded-full bg-[#FEBC2E]" />
        <div className="w-[11px] h-[11px] rounded-full bg-[#28C840]" />
        <div className="flex-1 mx-2.5 h-5 rounded-md bg-slate-100 flex items-center px-2.5 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.span key={url} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }} className="text-[9.5px] text-slate-400 font-mono truncate">
              {url}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Viewport */}
      <div className="relative rounded-xl border border-slate-100 bg-white overflow-hidden" style={{ minHeight: 410 }}>
        <AnimatePresence mode="wait">

          {/* ── GRID ─────────────────────────────────────────── */}
          {isGridPhase && (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }} className="absolute inset-0 p-3">
              <div className="flex items-center justify-between mb-2.5">
                <div>
                  <p className="text-[10.5px] font-bold text-slate-900 leading-none mb-0.5">Content Library</p>
                  <p className="text-[8px] text-slate-400 tabular-nums">{numVisible} articles published</p>
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
                  <div className="flex items-center gap-0.5">
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
              <motion.div animate={{ y: scanning ? -148 : 0 }} transition={{ duration: 2.7, ease: "easeInOut" }}>
                <ArticlePageSEO scanning={scanning} />
              </motion.div>
              <AnimatePresence>
                {scanning && (
                  <motion.div key="scan"
                    initial={{ top: "5%" }} animate={{ top: "88%" }}
                    transition={{ duration: 2.7, ease: "easeInOut" }}
                    className="absolute left-3 right-3 h-px pointer-events-none"
                    style={{ background: "linear-gradient(to right,transparent,rgba(59,130,246,0.5) 20%,rgba(59,130,246,0.5) 80%,transparent)" }}
                  />
                )}
              </AnimatePresence>
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
              transition={{ duration: 0.28 }} className="absolute inset-0 bg-white">
              <StatsPanel show={showStats} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Avatar row ───────────────────────────────────────────────────────────────
const AVATAR_COLORS = ["bg-blue-400", "bg-violet-400", "bg-teal-400", "bg-indigo-400", "bg-sky-400"];
function AvatarRow() {
  return (
    <div className="flex -space-x-1.5">
      {AVATAR_COLORS.map((c, i) => (
        <div key={i} className={`w-7 h-7 rounded-full border-2 border-white ${c} flex items-center justify-center text-white text-[9px] font-bold`}>
          {String.fromCharCode(65 + i)}
        </div>
      ))}
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
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white pt-[60px]">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[680px] h-[680px] rounded-full bg-gradient-to-br from-blue-50/80 via-violet-50/50 to-transparent blur-[80px]" />
        <div className="absolute bottom-0 -left-32 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-sky-50/70 to-transparent blur-[80px]" />
        <div className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: "linear-gradient(rgba(15,23,42,1) 1px,transparent 1px),linear-gradient(90deg,rgba(15,23,42,1) 1px,transparent 1px)", backgroundSize: "56px 56px" }} />
      </div>
      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6 lg:px-12 py-20 lg:py-0 lg:min-h-screen flex items-center">
        <div className="w-full grid lg:grid-cols-[54fr_46fr] gap-14 xl:gap-20 items-center">
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }} className="flex flex-col items-start">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.08, duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-200/70 bg-blue-50/80 text-[13px] font-medium text-blue-700 mb-7">
              <Sparkles size={13} className="text-blue-500" />
              <span>Early Access</span>
              <span className="w-px h-3.5 bg-blue-200" />
              <span className="font-semibold">First 10 pages free</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-[2.75rem] sm:text-[3.25rem] lg:text-[3.5rem] xl:text-[3.85rem] font-extrabold leading-[1.08] tracking-[-0.025em] text-slate-900 mb-5">
              Give your brand an<br />
              <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-violet-600 bg-clip-text text-transparent">unfair SEO</span>{" "}advantage.
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.55 }}
              className="text-[17px] text-slate-500 leading-relaxed mb-9 max-w-[460px]">
              Scale high-quality content with AI and publish hundreds of research-backed articles designed to rank on{" "}
              <PlatformCycler />.
            </motion.p>
            <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="w-full max-w-[460px] flex flex-col sm:flex-row gap-2.5 mb-3.5">
              <input ref={inputRef} type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Enter your work email"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-[14px] placeholder:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 shadow-sm transition-all duration-200" />
              <button type="submit"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white text-[14px] font-semibold shadow-sm shadow-blue-200/80 hover:bg-blue-500 active:scale-[0.98] transition-all duration-150 whitespace-nowrap">
                Join Early Access <ArrowRight size={14} strokeWidth={2.25} />
              </button>
            </motion.form>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="text-[12px] text-slate-400 mb-10">
              No credit card required &nbsp;·&nbsp; Cancel anytime
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.46, duration: 0.4 }} className="flex items-center gap-3.5">
              <AvatarRow />
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} className="fill-amber-400 text-amber-400" />)}
                </div>
                <span className="text-[12px] text-slate-400">Trusted by growing teams</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-blue-100/50 via-violet-100/30 to-sky-100/50 blur-2xl pointer-events-none" />
            <div className="relative bg-white rounded-[20px] border border-slate-200/80 shadow-[0_8px_48px_rgba(15,23,42,0.1),0_2px_8px_rgba(15,23,42,0.06)] p-5 overflow-hidden">
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
  { value: "95+", label: "Lighthouse Score",    color: "text-blue-600"    },
  { value: "85+", label: "EEAT Score",          color: "text-amber-500"   },
  { value: "95%", label: "Content Originality", color: "text-emerald-600" },
];
export function MetricsStrip() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <section ref={ref} className="w-full bg-white border-y border-slate-100">
      <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.5 }}
        className="max-w-[1280px] mx-auto px-6 lg:px-12 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-0 sm:divide-x sm:divide-slate-100">
          {METRICS.map((m, i) => (
            <motion.div key={m.label} initial={{ opacity: 0, y: 8 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="flex items-center gap-2.5 sm:px-10 lg:px-14">
              <span className={`text-[1.55rem] font-extrabold leading-none tracking-tight tabular-nums ${m.color}`}>{m.value}</span>
              <span className="text-[12px] font-medium text-slate-500 leading-snug">{m.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
