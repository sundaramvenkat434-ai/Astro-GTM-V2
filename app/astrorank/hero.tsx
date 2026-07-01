"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ArrowRight, Star, Sparkles, TrendingUp, Search, MousePointer, ArrowUp, Minus } from "lucide-react";

// ─── Platform cycler ─────────────────────────────────────────────────────────
const PLATFORMS = ["Google", "ChatGPT", "Gemini", "Claude", "Perplexity", "Copilot"];
function PlatformCycler() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIndex(i => (i + 1) % PLATFORMS.length), 2200);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="inline-block relative min-w-[100px]">
      <AnimatePresence mode="wait">
        <motion.span key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="inline-block bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
          {PLATFORMS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
type Article = { id: number; cat: string; catKey: string; title: string; slug: string; readTime: string };

const ARTICLES: Article[] = [
  { id: 1, cat: "SEO Strategy",    catKey: "blue",    title: "10 Best AI Tools for B2B Content Teams",           slug: "best-ai-tools-b2b",          readTime: "8 min" },
  { id: 2, cat: "How-To Guide",    catKey: "emerald", title: "Build a Keyword Strategy with AI Research",         slug: "keyword-strategy-ai",        readTime: "6 min" },
  { id: 3, cat: "Industry Trends", catKey: "violet",  title: "AI Content: The New SaaS Growth Lever",             slug: "ai-content-saas",            readTime: "5 min" },
  { id: 4, cat: "Growth",          catKey: "teal",    title: "Content Velocity: 50 Articles per Month",           slug: "content-velocity",           readTime: "7 min" },
  { id: 5, cat: "Comparison",      catKey: "sky",     title: "AstroRank vs Manual SEO: The Numbers",              slug: "astrorank-vs-manual",        readTime: "9 min" },
  { id: 6, cat: "SEO Strategy",    catKey: "blue",    title: "How to Rank for Competitor Keywords in 2025",       slug: "competitor-keywords",        readTime: "6 min" },
  { id: 7, cat: "How-To Guide",    catKey: "emerald", title: "Setting Up a Scalable Internal Linking Structure",  slug: "internal-linking",           readTime: "5 min" },
  { id: 8, cat: "Industry Trends", catKey: "violet",  title: "Answer Engine Optimization: The New SEO Frontier", slug: "answer-engine-optimization", readTime: "7 min" },
  { id: 9, cat: "Growth",          catKey: "teal",    title: "SaaS Content Moat: The 6-Month Blueprint",         slug: "content-moat",               readTime: "6 min" },
];

const CATS = [
  { id: "All",    label: "All"       },
  { id: "SEO",    label: "SEO"       },
  { id: "How-To", label: "How-To"    },
  { id: "Trends", label: "Trends"    },
  { id: "Growth", label: "Growth"    },
];

// catKey → active filter id
const KEY_TO_CAT: Record<string, string> = {
  blue: "SEO", emerald: "How-To", violet: "Trends", teal: "Growth", sky: "All", amber: "All",
};

const CAT_STYLES: Record<string, { bg: string; text: string }> = {
  blue:    { bg: "bg-blue-100",    text: "text-blue-700"    },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-700" },
  violet:  { bg: "bg-violet-100",  text: "text-violet-700"  },
  teal:    { bg: "bg-teal-100",    text: "text-teal-700"    },
  amber:   { bg: "bg-amber-100",   text: "text-amber-700"   },
  sky:     { bg: "bg-sky-100",     text: "text-sky-700"     },
};

const GRAD_HERO: Record<string, string> = {
  blue:    "from-blue-500 via-blue-400 to-indigo-400",
  emerald: "from-emerald-500 via-emerald-400 to-teal-400",
  violet:  "from-violet-500 via-violet-400 to-purple-400",
  teal:    "from-teal-500 via-teal-400 to-cyan-400",
  amber:   "from-amber-500 via-amber-400 to-orange-400",
  sky:     "from-sky-500 via-sky-400 to-blue-400",
};

const GRAD_LIGHT: Record<string, string> = {
  blue:    "from-blue-100 to-indigo-50",
  emerald: "from-emerald-100 to-teal-50",
  violet:  "from-violet-100 to-purple-50",
  teal:    "from-teal-100 to-cyan-50",
  amber:   "from-amber-100 to-orange-50",
  sky:     "from-sky-100 to-blue-50",
};

const HIGHLIGHT_BORDER: Record<string, string> = {
  blue: "border-blue-300", emerald: "border-emerald-300", violet: "border-violet-300",
  teal: "border-teal-300", amber: "border-amber-300", sky: "border-sky-300",
};

const TRAFFIC_DATA = [
  { month: "Jan", v: 190  },
  { month: "Feb", v: 380  },
  { month: "Mar", v: 740  },
  { month: "Apr", v: 1280 },
  { month: "May", v: 2100 },
  { month: "Jun", v: 2847 },
];

const KEYWORDS_DATA = [
  { kw: "best ai tools b2b",    pos: 3,  vol: "2.1K", up: true  },
  { kw: "ai content strategy",  pos: 7,  vol: "890",  up: true  },
  { kw: "b2b content velocity", pos: 12, vol: "450",  up: false },
  { kw: "saas content tools",   pos: 16, vol: "320",  up: true  },
];

// Phases:
// 0         : initial list (3 articles)
// 1-3       : filter cycling SEO → How-To → Trends  (~3 sec total)
// 4-9       : articles 3-8 appear one by one         (~4 sec total)
// 10        : focus on article 0
// 11        : open article view
// 12        : scan article                            (~2 sec)
// 13        : analytics dashboard                    (~3 sec)
// 14        : return to list
const PHASE_DUR = [
  500,  // 0
  1000, // 1  SEO
  1000, // 2  How-To
  1000, // 3  Trends
  660,  // 4  +art 3
  660,  // 5  +art 4
  660,  // 6  +art 5
  600,  // 7  +art 6
  600,  // 8  +art 7
  600,  // 9  +art 8
  450,  // 10 focus
  550,  // 11 open
  2200, // 12 scan
  3300, // 13 analytics
  600,  // 14 return
];

// ─── Animated counter ─────────────────────────────────────────────────────────
function AnimCounter({ target, run }: { target: number; run: boolean }) {
  const [v, setV] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    if (!run) { setV(0); return; }
    let t0: number | null = null;
    const tick = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / 1400, 1);
      setV(Math.floor((1 - (1 - p) ** 3) * target));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [run, target]);
  return <>{v.toLocaleString()}</>;
}

// ─── Traffic chart ─────────────────────────────────────────────────────────────
const CHART_H = 52;
function TrafficChart({ show }: { show: boolean }) {
  const max = TRAFFIC_DATA[TRAFFIC_DATA.length - 1].v;
  return (
    <div className="flex items-end gap-1.5" style={{ height: CHART_H + 16 }}>
      {TRAFFIC_DATA.map((d, i) => (
        <div key={d.month} className="flex-1 flex flex-col items-center gap-0.5">
          <div className="w-full relative flex items-end" style={{ height: CHART_H }}>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: show ? Math.max(3, Math.round((d.v / max) * CHART_H)) : 0 }}
              transition={{ delay: show ? 0.3 + i * 0.09 : 0, duration: 0.55, ease: "easeOut" }}
              className="absolute bottom-0 left-0 right-0 rounded-t-sm"
              style={{ background: `linear-gradient(to top, rgb(29 78 216), rgba(96,165,250,${0.6 + (i / TRAFFIC_DATA.length) * 0.4}))` }}
            />
          </div>
          <span className="text-[6px] text-slate-400">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Analytics panel ──────────────────────────────────────────────────────────
function StatsPanel({ show }: { show: boolean }) {
  function posBadge(pos: number) {
    if (pos <= 3)  return "bg-emerald-100 text-emerald-700";
    if (pos <= 10) return "bg-amber-100 text-amber-700";
    return "bg-slate-100 text-slate-500";
  }
  return (
    <div className="p-3 overflow-hidden h-full flex flex-col gap-0">
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-2.5">
        <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-50 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[8.5px] font-semibold text-slate-700 truncate">{ARTICLES[0].title}</p>
          <p className="text-[7px] text-slate-400">Analytics · Last 6 months</p>
        </div>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}
          className="flex items-center gap-0.5 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full shrink-0">
          <TrendingUp size={7} className="text-emerald-500" />
          <span className="text-[7.5px] font-bold text-emerald-600">+127%</span>
        </motion.div>
      </div>

      {/* Traffic chart */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[7px] font-semibold text-slate-500 uppercase tracking-wider">Organic Traffic</p>
          <p className="text-[8.5px] font-bold text-blue-600 tabular-nums">
            <AnimCounter target={2847} run={show} /><span className="text-[7px] font-normal text-slate-400">/mo</span>
          </p>
        </div>
        <TrafficChart show={show} />
      </div>

      <div className="h-px bg-slate-100 mb-2" />

      {/* Ranking keywords */}
      <p className="text-[7px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Ranking Keywords</p>
      <div className="flex items-center gap-1.5 px-1.5 mb-1">
        <span className="flex-1 text-[6.5px] text-slate-400">Keyword</span>
        <span className="w-7 text-[6.5px] text-slate-400 text-center">Pos.</span>
        <span className="w-8 text-[6.5px] text-slate-400 text-right">Vol.</span>
        <span className="w-4 text-[6.5px] text-slate-400 text-center">↑</span>
      </div>
      <div className="flex flex-col gap-1 mb-2">
        {KEYWORDS_DATA.map((kw, i) => (
          <motion.div key={kw.kw}
            initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: show ? 0.5 + i * 0.1 : 0, duration: 0.22 }}
            className="flex items-center gap-1.5 bg-slate-50 rounded-lg px-1.5 py-1">
            <span className="flex-1 text-[7.5px] text-slate-700 truncate">{kw.kw}</span>
            <span className={`w-7 text-center text-[6.5px] font-bold px-0.5 py-[1px] rounded-full ${posBadge(kw.pos)}`}>#{kw.pos}</span>
            <span className="w-8 text-right text-[7px] text-slate-500 font-medium tabular-nums">{kw.vol}</span>
            <div className="w-4 flex justify-center">
              {kw.up ? <ArrowUp size={8} className="text-emerald-500" /> : <Minus size={8} className="text-slate-400" />}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="h-px bg-slate-100 mb-2" />

      {/* Summary */}
      <div className="grid grid-cols-2 gap-1.5">
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: show ? 1.0 : 0, duration: 0.25 }}
          className="bg-violet-50 border border-violet-100 rounded-xl p-2">
          <div className="flex items-center gap-1 mb-0.5">
            <Search size={8} className="text-violet-500" />
            <p className="text-[7px] text-violet-600 font-semibold">Avg. Position</p>
          </div>
          <p className="text-[17px] font-extrabold text-violet-900 leading-none tabular-nums">4.2</p>
          <p className="text-[6.5px] text-violet-400 mt-0.5">across all keywords</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: show ? 1.1 : 0, duration: 0.25 }}
          className="bg-emerald-50 border border-emerald-100 rounded-xl p-2">
          <div className="flex items-center gap-1 mb-0.5">
            <MousePointer size={8} className="text-emerald-500" />
            <p className="text-[7px] text-emerald-600 font-semibold">Conversions</p>
          </div>
          <p className="text-[17px] font-extrabold text-emerald-900 leading-none tabular-nums">
            <AnimCounter target={127} run={show} />
          </p>
          <p className="text-[6.5px] text-emerald-400 mt-0.5">per month</p>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Article list item ────────────────────────────────────────────────────────
function ArticleListItem({
  article, generating, highlighted, focused,
}: {
  article: Article; generating: boolean; highlighted: boolean; focused: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className={`flex items-center rounded-xl border overflow-hidden bg-white transition-shadow ${
        focused
          ? "border-blue-300 shadow-[0_0_0_2px_rgba(59,130,246,0.18),0_2px_8px_rgba(59,130,246,0.12)]"
          : highlighted
          ? HIGHLIGHT_BORDER[article.catKey]
          : "border-slate-100"
      }`}
      style={{ height: 52, minHeight: 52 }}
    >
      <AnimatePresence mode="wait">
        {generating ? (
          <motion.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }} className="flex items-center gap-2.5 px-2.5 w-full">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
                className="w-[11px] h-[11px] border-[1.5px] border-slate-200 border-t-blue-500 rounded-full"
              />
            </div>
            <div className="flex-1">
              <div className="h-[7px] bg-slate-100 rounded-full mb-1.5 animate-pulse" style={{ width: "58%" }} />
              <div className="h-[6px] bg-slate-100 rounded-full animate-pulse" style={{ width: "36%" }} />
            </div>
            <span className="text-[7px] text-blue-500 font-semibold shrink-0 pr-2.5">writing…</span>
          </motion.div>
        ) : (
          <motion.div key="loaded" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }} className="flex items-center gap-2.5 px-2.5 w-full">
            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${GRAD_HERO[article.catKey]} shrink-0`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-[3px]">
                <span className={`text-[6px] font-bold px-1 py-[1.5px] rounded-full ${CAT_STYLES[article.catKey].bg} ${CAT_STYLES[article.catKey].text}`}>
                  {article.cat}
                </span>
                <span className="text-[6px] text-slate-400">{article.readTime} read</span>
              </div>
              <p className="text-[8px] font-semibold text-slate-800 truncate leading-tight">{article.title}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Article page content (SEO) ───────────────────────────────────────────────
function SkeletonLines({ widths }: { widths: number[] }) {
  return (
    <>
      {widths.map((w, i) =>
        w === 0 ? <div key={i} className="h-1.5" /> :
        <div key={i} className="h-[5px] rounded-full bg-slate-100 mb-1.5" style={{ width: `${w}%` }} />
      )}
    </>
  );
}

function ArticlePageSEO() {
  const a = ARTICLES[0];
  const cat = CAT_STYLES[a.catKey];
  return (
    <>
      {/* Hero gradient */}
      <div className={`h-[46px] bg-gradient-to-br ${GRAD_HERO[a.catKey]} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
          <span className="text-[6.5px] font-bold px-1.5 py-[1.5px] rounded-full bg-white/25 text-white backdrop-blur-sm">{a.cat}</span>
          <span className="text-[6.5px] text-white/70">{a.readTime} read</span>
        </div>
      </div>
      <div className="px-3 pt-2.5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 mb-1.5">
          <span className="text-[7px] text-slate-400">Articles</span>
          <span className="text-[7px] text-slate-300">/</span>
          <span className={`text-[7px] font-medium ${cat.text}`}>{a.cat}</span>
        </div>
        {/* Title */}
        <h3 className="text-[11px] font-extrabold text-slate-900 leading-tight mb-1.5">{a.title}</h3>
        {/* Meta */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-br ${GRAD_LIGHT[a.catKey]}`} />
          <span className="text-[7.5px] text-slate-400">AstroRank AI &nbsp;·&nbsp; {a.readTime} read &nbsp;·&nbsp; Mar 2025</span>
        </div>
        <div className="h-px bg-slate-100 mb-2.5" />
        {/* TOC */}
        <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-2.5 mb-2.5">
          <p className="text-[7.5px] font-bold text-blue-700 mb-1.5">In this article</p>
          {["What counts as an AI content tool?", "Evaluation criteria & scoring", "Our top 10 picks for 2025", "Final verdict & recommendations"].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 mb-1">
              <span className="text-[6.5px] font-bold text-blue-400 w-3">{i + 1}.</span>
              <span className="text-[7.5px] text-blue-600 leading-none">{item}</span>
            </div>
          ))}
        </div>
        <p className="text-[8.5px] font-bold text-slate-900 mb-1.5">Overview</p>
        <SkeletonLines widths={[98, 93, 100, 87, 0]} />
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-2 mb-2">
          <div className="flex items-center gap-1 mb-0.5">
            <span className="text-[8px]">💡</span>
            <span className="text-[7.5px] font-bold text-amber-700">Pro Tip</span>
          </div>
          <p className="text-[7.5px] text-amber-700 leading-snug">Teams using AI content tools publish 4.7× more content with the same headcount.</p>
        </div>
        <SkeletonLines widths={[95, 88, 100, 82, 96, 0]} />
        <p className="text-[8.5px] font-bold text-slate-900 mb-1.5">AI Tool Comparison</p>
        <SkeletonLines widths={[100, 91, 95, 84, 98, 0]} />
        <p className="text-[8.5px] font-bold text-slate-900 mb-1.5">Final Verdict</p>
        <SkeletonLines widths={[93, 100, 88, 95]} />
      </div>
    </>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────
const ITEM_H  = 56; // list item height + gap
const MAX_VIS = 5;  // max items visible in list at once

function ContentLibraryPanel() {
  const [phase,   setPhase]   = useState(0);
  const [mounted, setMounted] = useState(false);
  const [settled, setSettled] = useState(() => new Set<number>([0, 1, 2]));

  // Mount guard (SSR safety)
  useEffect(() => setMounted(true), []);

  // Advance phase
  useEffect(() => {
    if (!mounted) return;
    const t = setTimeout(() => setPhase(p => (p + 1) % PHASE_DUR.length), PHASE_DUR[phase]);
    return () => clearTimeout(t);
  }, [phase, mounted]);

  // Reset settled on loop restart; mark article as settled 350ms after it appears
  useEffect(() => {
    if (!mounted) return;
    if (phase === 0) { setSettled(new Set([0, 1, 2])); return; }
    if (phase >= 4 && phase <= 9) {
      const idx = phase - 1; // phase4→3, phase5→4, …, phase9→8
      const t = setTimeout(() => setSettled(prev => { const next = new Set(prev); next.add(idx); return next; }), 350);
      return () => clearTimeout(t);
    }
  }, [phase, mounted]);

  // Derived state
  const numVisible  = phase < 4 ? 3 : Math.min(9, phase);
  const activeCat   = phase === 1 ? "SEO" : phase === 2 ? "How-To" : phase === 3 ? "Trends" : "All";
  const isGenerating = phase >= 4 && phase <= 9;
  const isListPhase  = phase < 11 || phase === 14;
  const focusedIdx   = phase === 10 ? 0 : -1;
  const inArticle    = phase >= 11 && phase <= 12;
  const scanning     = phase === 12;
  const showStats    = phase === 13;

  // List scroll: keep latest article in view
  const listScrollY = isListPhase && phase !== 14
    ? Math.max(0, (numVisible - MAX_VIS) * ITEM_H)
    : 0;

  const url =
    inArticle || phase === 10 ? `yourwebsite.com/articles/${ARTICLES[0].slug}` :
    showStats                  ? "yourwebsite.com/analytics/overview" :
    "yourwebsite.com/articles";

  // SSR placeholder
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
        <div className="rounded-xl border border-slate-100 bg-white" style={{ minHeight: 370 }}>
          <div className="p-3">
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <p className="text-[10.5px] font-bold text-slate-900 mb-0.5">Content Library</p>
                <p className="text-[8px] text-slate-400">3 articles published</p>
              </div>
              <div className="flex gap-1">
                {CATS.slice(0, 3).map((c, i) => (
                  <span key={c.id} className={`text-[7px] font-semibold px-2 py-[2.5px] rounded-full ${i === 0 ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"}`}>{c.label}</span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              {ARTICLES.slice(0, 3).map(a => (
                <div key={a.id} className="flex items-center gap-2.5 px-2.5 border border-slate-100 rounded-xl bg-white" style={{ height: 52 }}>
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${GRAD_HERO[a.catKey]} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-[3px]">
                      <span className={`text-[6px] font-bold px-1 py-[1.5px] rounded-full ${CAT_STYLES[a.catKey].bg} ${CAT_STYLES[a.catKey].text}`}>{a.cat}</span>
                      <span className="text-[6px] text-slate-400">{a.readTime} read</span>
                    </div>
                    <p className="text-[8px] font-semibold text-slate-800 truncate">{a.title}</p>
                  </div>
                </div>
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
      <div className="relative rounded-xl border border-slate-100 bg-white overflow-hidden" style={{ minHeight: 370 }}>
        <AnimatePresence mode="wait">

          {/* ── LIST VIEW ──────────────────────────────────────── */}
          {isListPhase && (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }} className="absolute inset-0 p-3">

              {/* Header row */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-[10.5px] font-bold text-slate-900 leading-none mb-0.5">Content Library</p>
                  <p className="text-[8px] text-slate-400 tabular-nums">{numVisible} articles published</p>
                </div>
                {isGenerating ? (
                  <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 px-2 py-1 rounded-full">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
                      className="w-2.5 h-2.5 border-[1.5px] border-blue-200 border-t-blue-500 rounded-full"
                    />
                    <span className="text-[7px] font-semibold text-blue-600 whitespace-nowrap">AstroRank is writing…</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    {CATS.map(cat => (
                      <motion.span key={cat.id}
                        animate={{ backgroundColor: activeCat === cat.id ? "#0f172a" : "#f1f5f9", color: activeCat === cat.id ? "#ffffff" : "#64748b" }}
                        transition={{ duration: 0.32 }}
                        className="text-[7px] font-semibold px-2 py-[2.5px] rounded-full shrink-0 whitespace-nowrap"
                      >
                        {cat.label}
                      </motion.span>
                    ))}
                  </div>
                )}
              </div>

              {/* Scrollable article list */}
              <div className="overflow-hidden" style={{ height: MAX_VIS * ITEM_H }}>
                <motion.div
                  animate={{ y: -listScrollY }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="flex flex-col gap-1"
                >
                  {ARTICLES.slice(0, numVisible).map((a, i) => {
                    const generating  = !settled.has(i);
                    const highlighted = activeCat !== "All" && KEY_TO_CAT[a.catKey] === activeCat;
                    const focused     = i === focusedIdx;
                    return (
                      <ArticleListItem
                        key={a.id}
                        article={a}
                        generating={generating}
                        highlighted={highlighted}
                        focused={focused}
                      />
                    );
                  })}
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ── ARTICLE + STATS ──────────────────────────────── */}
          {!isListPhase && (
            <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }} className="absolute inset-0">
              <AnimatePresence>
                {/* Article view */}
                {!showStats && (
                  <motion.div key="article" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.22 }} className="absolute inset-0 overflow-hidden">
                    <motion.div
                      animate={{ y: scanning ? -120 : 0 }}
                      transition={{ duration: 2.2, ease: "easeInOut" }}
                    >
                      <ArticlePageSEO />
                    </motion.div>
                    {/* Scan line */}
                    <AnimatePresence>
                      {scanning && (
                        <motion.div key="scan"
                          initial={{ top: "6%" }}
                          animate={{ top: "85%" }}
                          transition={{ duration: 2.2, ease: "easeInOut" }}
                          className="absolute left-3 right-3 h-px pointer-events-none"
                          style={{ background: "linear-gradient(to right, transparent, rgba(59,130,246,0.6) 20%, rgba(59,130,246,0.6) 80%, transparent)" }}
                        />
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* Analytics / stats */}
                {showStats && (
                  <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }} className="absolute inset-0 bg-white overflow-hidden">
                    <StatsPanel show={showStats} />
                  </motion.div>
                )}
              </AnimatePresence>
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

          {/* Left: copy */}
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
              Give your brand an
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-violet-600 bg-clip-text text-transparent">
                unfair SEO
              </span>{" "}advantage.
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
                Join Early Access
                <ArrowRight size={14} strokeWidth={2.25} />
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

          {/* Right: product mockup */}
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
