"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  ArrowRight, Star, Sparkles, TrendingUp, Search, MousePointer,
} from "lucide-react";

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
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="inline-block bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent"
        >
          {PLATFORMS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// ─── Content library animation ────────────────────────────────────────────────

type LibraryArticle = { id: number; cat: string; catKey: string; title: string; slug: string };

const LIBRARY_ARTICLES: LibraryArticle[] = [
  { id: 1, cat: "SEO Strategy",    catKey: "blue",    title: "10 Best AI Tools for B2B Content Teams",     slug: "best-ai-tools-b2b"   },
  { id: 2, cat: "How-To Guide",    catKey: "emerald", title: "Build a Keyword Strategy with AI Research",  slug: "keyword-strategy-ai" },
  { id: 3, cat: "Industry Trends", catKey: "violet",  title: "AI Content: The New SaaS Growth Lever",      slug: "ai-content-saas"     },
  { id: 4, cat: "Growth",          catKey: "teal",    title: "Content Velocity: 50 Articles per Month",    slug: "content-velocity"    },
  { id: 5, cat: "Case Study",      catKey: "amber",   title: "From 0 to 10K Organic Visits in 90 Days",    slug: "zero-to-10k"         },
  { id: 6, cat: "Comparison",      catKey: "sky",     title: "AstroRank vs Manual SEO: The Numbers",       slug: "astrorank-vs-manual" },
];

const CAT_STYLES: Record<string, { bg: string; text: string }> = {
  blue:    { bg: "bg-blue-100",    text: "text-blue-700"    },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-700" },
  violet:  { bg: "bg-violet-100",  text: "text-violet-700"  },
  teal:    { bg: "bg-teal-100",    text: "text-teal-700"    },
  amber:   { bg: "bg-amber-100",   text: "text-amber-700"   },
  sky:     { bg: "bg-sky-100",     text: "text-sky-700"     },
};

const GRAD: Record<string, string> = {
  blue:    "from-blue-100 to-indigo-50",
  emerald: "from-emerald-100 to-teal-50",
  violet:  "from-violet-100 to-purple-50",
  teal:    "from-teal-100 to-cyan-50",
  amber:   "from-amber-100 to-orange-50",
  sky:     "from-sky-100 to-blue-50",
};

const ANALYTICS = [
  { label: "Organic Traffic",   value: 2847, suffix: "/mo", Icon: TrendingUp,  cc: "text-blue-600 bg-blue-50"      },
  { label: "Ranking Keywords",  value: 124,  suffix: "",    Icon: Search,      cc: "text-violet-600 bg-violet-50"  },
  { label: "AI Visibility",     value: 89,   suffix: "%",   Icon: Sparkles,    cc: "text-amber-600 bg-amber-50"    },
  { label: "CTA Clicks",        value: 342,  suffix: "/mo", Icon: MousePointer,cc: "text-emerald-600 bg-emerald-50"},
];

// phase durations in ms
// 0:grid-3  1:+4  2:+5  3:+6  4:hold  5:zoom  6:open  7:read  8:stats  9:return
const PHASE_DUR = [700, 430, 430, 430, 1100, 650, 650, 2300, 3100, 650];

function AnimCounter({ target, run }: { target: number; run: boolean }) {
  const [v, setV] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    if (!run) { setV(0); return; }
    let t0: number | null = null;
    const dur = 1400;
    const tick = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / dur, 1);
      setV(Math.floor((1 - (1 - p) ** 3) * target));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [run, target]);
  return <>{v.toLocaleString()}</>;
}

function ContentLibraryPanel() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setPhase(p => (p + 1) % PHASE_DUR.length), PHASE_DUR[phase]);
    return () => clearTimeout(t);
  }, [phase]);

  const numVisible  = phase <= 0 ? 3 : phase === 1 ? 4 : phase === 2 ? 5 : 6;
  const zoomedIdx   = phase === 5 ? 0 : -1;
  const inArticle   = phase >= 6 && phase <= 8;
  const readScroll  = phase === 7;
  const showStats   = phase === 8;
  const focused     = LIBRARY_ARTICLES[0];
  const url         = inArticle
    ? `yourwebsite.com/articles/${focused.slug}`
    : "yourwebsite.com/articles";

  return (
    <div className="flex flex-col">
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 mb-3.5">
        <div className="w-[11px] h-[11px] rounded-full bg-[#FF5F57]" />
        <div className="w-[11px] h-[11px] rounded-full bg-[#FEBC2E]" />
        <div className="w-[11px] h-[11px] rounded-full bg-[#28C840]" />
        <div className="flex-1 mx-2.5 h-5 rounded-md bg-slate-100 flex items-center px-2.5 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.span
              key={url}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="text-[9.5px] text-slate-400 font-mono truncate"
            >
              {url}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Browser viewport */}
      <div
        className="relative rounded-xl border border-slate-100 bg-white overflow-hidden"
        style={{ minHeight: 310 }}
      >
        <AnimatePresence mode="wait">
          {/* ── GRID VIEW ─────────────────────────────────────── */}
          {!inArticle && (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.28 }}
              className="absolute inset-0 p-3"
            >
              {/* Page header */}
              <div className="flex items-center justify-between mb-2.5">
                <div>
                  <p className="text-[10.5px] font-bold text-slate-900 leading-none mb-0.5">Content Library</p>
                  <p className="text-[8.5px] text-slate-400 tabular-nums">{numVisible} articles published</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[7.5px] font-semibold bg-slate-900 text-white px-2 py-[2.5px] rounded-full">All</span>
                  <span className="text-[7.5px] text-slate-500 bg-slate-100 px-2 py-[2.5px] rounded-full">SEO</span>
                  <span className="text-[7.5px] text-slate-500 bg-slate-100 px-2 py-[2.5px] rounded-full">Guides</span>
                </div>
              </div>

              {/* 3-column article grid */}
              <div className="grid grid-cols-3 gap-2">
                {LIBRARY_ARTICLES.map((article, i) => {
                  const visible  = i < numVisible;
                  const cat      = CAT_STYLES[article.catKey];
                  const grad     = GRAD[article.catKey];
                  const isZoomed = i === zoomedIdx;
                  return (
                    <div key={article.id}>
                      {visible ? (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.92 }}
                          animate={{ opacity: 1, y: 0, scale: isZoomed ? 1.06 : 1 }}
                          transition={{ duration: 0.32, ease: "easeOut" }}
                          className={`rounded-xl border overflow-hidden bg-white ${
                            isZoomed
                              ? "border-blue-400 shadow-[0_0_0_2px_rgba(59,130,246,0.2),0_6px_18px_rgba(59,130,246,0.14)] z-10 relative"
                              : "border-slate-100 shadow-[0_1px_4px_rgba(15,23,42,0.05)]"
                          }`}
                        >
                          <div className={`h-9 bg-gradient-to-br ${grad}`} />
                          <div className="p-1.5">
                            <span className={`inline-block text-[6.5px] font-bold px-1.5 py-[1.5px] rounded-full mb-0.5 ${cat.bg} ${cat.text}`}>
                              {article.cat}
                            </span>
                            <p className="text-[7.5px] font-semibold text-slate-800 leading-snug line-clamp-2">{article.title}</p>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-slate-100 bg-slate-50/40 h-[72px]" />
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── ARTICLE VIEW ──────────────────────────────────── */}
          {inArticle && (
            <motion.div
              key="article"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.28 }}
              className="absolute inset-0 overflow-hidden"
            >
              {/* Scrolling content */}
              <motion.div
                animate={{ y: readScroll ? -96 : 0 }}
                transition={{ duration: 2.3, ease: "easeInOut" }}
                className="p-3"
              >
                {/* Hero image */}
                <div className={`h-14 rounded-xl bg-gradient-to-br ${GRAD[focused.catKey]} mb-2.5 flex items-end p-2`}>
                  <span className={`text-[7px] font-bold px-1.5 py-[1.5px] rounded-full ${CAT_STYLES[focused.catKey].bg} ${CAT_STYLES[focused.catKey].text}`}>
                    {focused.cat}
                  </span>
                </div>
                {/* Title */}
                <p className="text-[11px] font-bold text-slate-900 leading-tight mb-1.5">{focused.title}</p>
                {/* Meta */}
                <div className="flex items-center gap-1.5 mb-3">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${GRAD[focused.catKey]}`} />
                  <span className="text-[8px] text-slate-400">AstroRank AI · 8 min read · Jan 2025</span>
                </div>
                {/* Body skeleton */}
                <div className="flex flex-col gap-1.5">
                  {[98, 93, 100, 87, 0, 95, 90, 98, 83, 0, 100, 88, 75, 0].map((w, i) =>
                    w === 0 ? (
                      <div key={i} className="h-1" />
                    ) : (
                      <div key={i} className="h-[5px] rounded-full bg-slate-100" style={{ width: `${w}%` }} />
                    )
                  )}
                  <div className="h-[7px] rounded-full bg-slate-200 w-[40%] mt-1 mb-1.5" />
                  {[96, 89, 100, 84, 93, 78].map((w, i) => (
                    <div key={`b${i}`} className="h-[5px] rounded-full bg-slate-100" style={{ width: `${w}%` }} />
                  ))}
                </div>
              </motion.div>

              {/* Reading scan line */}
              {readScroll && (
                <motion.div
                  initial={{ top: 60 }}
                  animate={{ top: 290 }}
                  transition={{ duration: 2.3, ease: "easeInOut" }}
                  className="absolute left-3 right-3 h-px bg-gradient-to-r from-transparent via-blue-400/70 to-transparent pointer-events-none"
                  style={{ position: "absolute" }}
                />
              )}

              {/* Analytics overlay */}
              <AnimatePresence>
                {showStats && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-white/[0.97] p-3 flex flex-col"
                  >
                    {/* Article reference */}
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                      <div className={`w-5 h-5 rounded-lg bg-gradient-to-br ${GRAD[focused.catKey]} shrink-0`} />
                      <span className="text-[9px] font-semibold text-slate-700 line-clamp-1 flex-1">{focused.title}</span>
                    </div>
                    <p className="text-[7.5px] font-semibold text-slate-400 uppercase tracking-widest mb-2.5">Performance · Last 30 days</p>

                    {/* 2×2 metrics */}
                    <div className="grid grid-cols-2 gap-1.5 flex-1">
                      {ANALYTICS.map((m, i) => {
                        const Icon = m.Icon;
                        return (
                          <motion.div
                            key={m.label}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.07, duration: 0.25 }}
                            className="bg-slate-50 rounded-xl p-2 flex flex-col gap-1.5"
                          >
                            <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${m.cc}`}>
                              <Icon size={10} strokeWidth={2} />
                            </div>
                            <div>
                              <p className="text-[15px] font-extrabold text-slate-900 leading-none tabular-nums">
                                <AnimCounter target={m.value} run={showStats} />{m.suffix}
                              </p>
                              <p className="text-[7px] text-slate-400 mt-0.5 leading-none">{m.label}</p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Trend footer */}
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <TrendingUp size={9} className="text-emerald-500" />
                        <span className="text-[8px] text-emerald-600 font-semibold">+127% vs last month</span>
                      </div>
                      <span className="text-[7.5px] text-slate-400">AstroRank Analytics</span>
                    </div>
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
        <div
          key={i}
          className={`w-7 h-7 rounded-full border-2 border-white ${c} flex items-center justify-center text-white text-[9px] font-bold`}
        >
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
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[680px] h-[680px] rounded-full bg-gradient-to-br from-blue-50/80 via-violet-50/50 to-transparent blur-[80px]" />
        <div className="absolute bottom-0 -left-32 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-sky-50/70 to-transparent blur-[80px]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(15,23,42,1) 1px,transparent 1px),linear-gradient(90deg,rgba(15,23,42,1) 1px,transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6 lg:px-12 py-20 lg:py-0 lg:min-h-screen flex items-center">
        <div className="w-full grid lg:grid-cols-[54fr_46fr] gap-14 xl:gap-20 items-center">

          {/* Left: copy */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-start"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.08, duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-200/70 bg-blue-50/80 text-[13px] font-medium text-blue-700 mb-7"
            >
              <Sparkles size={13} className="text-blue-500" />
              <span>Early Access</span>
              <span className="w-px h-3.5 bg-blue-200" />
              <span className="font-semibold">First 10 pages free</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-[2.75rem] sm:text-[3.25rem] lg:text-[3.5rem] xl:text-[3.85rem] font-extrabold leading-[1.08] tracking-[-0.025em] text-slate-900 mb-5"
            >
              Give your brand an
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-violet-600 bg-clip-text text-transparent">
                unfair SEO
              </span>
              {" "}advantage.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.55 }}
              className="text-[17px] text-slate-500 leading-relaxed mb-9 max-w-[460px]"
            >
              Scale high-quality content with AI and publish hundreds of
              research-backed articles designed to rank on{" "}
              <PlatformCycler />.
            </motion.p>

            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="w-full max-w-[460px] flex flex-col sm:flex-row gap-2.5 mb-3.5"
            >
              <input
                ref={inputRef}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your work email"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-[14px] placeholder:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 shadow-sm transition-all duration-200"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white text-[14px] font-semibold shadow-sm shadow-blue-200/80 hover:bg-blue-500 active:scale-[0.98] transition-all duration-150 whitespace-nowrap"
              >
                Join Early Access
                <ArrowRight size={14} strokeWidth={2.25} />
              </button>
            </motion.form>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-[12px] text-slate-400 mb-10"
            >
              No credit card required &nbsp;·&nbsp; Cancel anytime
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.46, duration: 0.4 }}
              className="flex items-center gap-3.5"
            >
              <AvatarRow />
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-[12px] text-slate-400">Trusted by growing teams</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: product mockup */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5 }}
        className="max-w-[1280px] mx-auto px-6 lg:px-12 py-5"
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-0 sm:divide-x sm:divide-slate-100">
          {METRICS.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 8 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="flex items-center gap-2.5 sm:px-10 lg:px-14"
            >
              <span className={`text-[1.55rem] font-extrabold leading-none tracking-tight tabular-nums ${m.color}`}>
                {m.value}
              </span>
              <span className="text-[12px] font-medium text-slate-500 leading-snug">
                {m.label}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
