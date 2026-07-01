"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";

// ─── Phase loop ──────────────────────────────────────────────────────────────
// delays[i] = ms to stay at phase i before advancing to phase i+1
function usePhaseLoop(delays: number[]) {
  const [phase, setPhase] = useState(0);
  const cur = useRef(0);
  useEffect(() => {
    let id: ReturnType<typeof setTimeout>;
    function tick() {
      id = setTimeout(() => {
        cur.current = (cur.current + 1) % delays.length;
        setPhase(cur.current);
        tick();
      }, delays[cur.current]);
    }
    tick();
    return () => clearTimeout(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return phase;
}

// ─── Shared card shell ───────────────────────────────────────────────────────
function AnimCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`w-full h-full bg-white rounded-2xl border border-slate-200 shadow-[0_2px_16px_rgba(15,23,42,0.07)] overflow-hidden p-5 flex flex-col select-none ${className}`}>
      {children}
    </div>
  );
}

// ─── 1. Brand Analysis Card ──────────────────────────────────────────────────
const SCAN_ITEMS = ["Website", "LinkedIn", "Brand Mentions", "Competitors"];
const VOICE_BARS = [
  { label: "Professional", pct: 82, color: "bg-blue-500" },
  { label: "Technical",    pct: 91, color: "bg-violet-500" },
  { label: "Friendly",     pct: 64, color: "bg-sky-400" },
];
const VOICE_CHIPS = ["Professional", "B2B", "Thought Leadership"];
// phases: 0=blank, 1-4=scan items, 5=voice bars, 6=chips, 7=hold
const BRAND_DELAYS = [600, 550, 550, 550, 700, 1800, 1800, 600];

function BrandAnalysisCard() {
  const phase = usePhaseLoop(BRAND_DELAYS);
  const showVoice = phase >= 5;

  return (
    <AnimCard>
      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2.5">Brand Intelligence</div>
      <AnimatePresence mode="wait">
        {!showVoice ? (
          <motion.div key="scan" exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className="flex flex-col gap-[7px]">
            {SCAN_ITEMS.map((item, i) => {
              if (i >= phase) return null;
              const isScanning = i === phase - 1;
              return (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between"
                >
                  <span className="text-[11px] text-slate-700">{item}</span>
                  {isScanning ? (
                    <motion.span
                      animate={{ opacity: [1, 0.35, 1] }}
                      transition={{ repeat: Infinity, duration: 0.9 }}
                      className="text-[10px] text-blue-500"
                    >
                      Scanning...
                    </motion.span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                      <Check size={9} strokeWidth={2.5} /> Scanned
                    </span>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div key="voice" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex flex-col gap-2">
            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Brand Voice</p>
            {VOICE_BARS.map((bar, i) => (
              <div key={bar.label} className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 w-[74px] shrink-0">{bar.label}</span>
                <div className="flex-1 h-[5px] bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${bar.pct}%` }}
                    transition={{ duration: 0.65, delay: i * 0.14, ease: "easeOut" }}
                    className={`h-full rounded-full ${bar.color}`}
                  />
                </div>
                <span className="text-[10px] font-semibold text-slate-600 w-7 text-right">{bar.pct}%</span>
              </div>
            ))}
            <AnimatePresence>
              {phase >= 6 && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex gap-1.5 mt-0.5 flex-wrap">
                  {VOICE_CHIPS.map((chip, i) => (
                    <motion.span
                      key={chip}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1, duration: 0.2 }}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 font-medium"
                    >
                      {chip}
                    </motion.span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimCard>
  );
}

// ─── 2. Content Strategy Card ────────────────────────────────────────────────
const KEYWORDS = [
  { label: "Industrial Automation", demand: "8.2K", comp: 64, opp: 96 },
  { label: "PLC Programming",       demand: "5.4K", comp: 51, opp: 91 },
  { label: "Servo Motors",          demand: "3.1K", comp: 38, opp: 88 },
  { label: "IIoT",                  demand: "6.8K", comp: 72, opp: 72 },
];
const KEYWORDS_SORTED = [...KEYWORDS].sort((a, b) => b.opp - a.opp);
// phases: 0=blank, 1-4=kw slide in, 5=scores+reorder, 6=top glows, 7=hold
const CONTENT_DELAYS = [400, 480, 480, 480, 580, 1800, 1600, 600];

function ContentStrategyCard() {
  const phase = usePhaseLoop(CONTENT_DELAYS);
  const showScores = phase >= 5;
  const glowTop = phase >= 6;

  return (
    <AnimCard>
      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Content Strategy</div>
      <AnimatePresence mode="wait">
        {!showScores ? (
          <motion.div key="list" exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="flex flex-col gap-[6px]">
            {KEYWORDS.map((kw, i) => {
              if (i >= phase) return null;
              return (
                <motion.div
                  key={kw.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-[11px] text-slate-700 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100 truncate"
                >
                  {kw.label}
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div key="scored" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }} className="flex flex-col gap-[5px]">
            <div className="grid grid-cols-[1fr_34px_26px_26px] text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5 px-1.5">
              <span>Keyword</span>
              <span className="text-center">Demand</span>
              <span className="text-center">Comp</span>
              <span className="text-center">Opp</span>
            </div>
            {KEYWORDS_SORTED.map((kw, i) => {
              const isTop = i === 0;
              const glow = isTop && glowTop;
              return (
                <motion.div
                  key={kw.label}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className={`grid grid-cols-[1fr_34px_26px_26px] items-center py-[5px] px-1.5 rounded-lg transition-all duration-300 ${glow ? "bg-blue-50 border border-blue-100" : "border border-transparent"}`}
                >
                  <span className={`text-[10px] font-medium truncate ${glow ? "text-blue-700" : "text-slate-700"}`}>{kw.label}</span>
                  <span className="text-[9px] text-slate-500 text-center">{kw.demand}</span>
                  <span className="text-[9px] text-slate-500 text-center">{kw.comp}</span>
                  <span className={`text-[10px] font-bold text-center ${glow ? "text-blue-600" : "text-slate-700"}`}>{kw.opp}</span>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </AnimCard>
  );
}

// ─── 3. Website Connect Card ─────────────────────────────────────────────────
// phases: 0=connecting, 1=dns, 2=publishing, 3=active badge, 4=hold
const CONNECT_DELAYS = [700, 900, 900, 1800, 500];

function WebsiteConnectCard() {
  const phase = usePhaseLoop(CONNECT_DELAYS);
  const isConnected = phase >= 3;

  return (
    <AnimCard className="justify-center">
      <div className="flex flex-col items-center gap-2.5">
        {/* Site pill */}
        <motion.div
          animate={{ borderColor: isConnected ? "#6ee7b7" : "#e2e8f0" }}
          transition={{ duration: 0.4 }}
          className="px-4 py-2 rounded-xl border bg-white text-[11px] font-medium text-slate-700 flex items-center gap-2"
        >
          <motion.span
            animate={{ backgroundColor: isConnected ? "#10b981" : "#3b82f6" }}
            transition={{ duration: 0.4 }}
            className="w-2 h-2 rounded-full block"
          />
          yourwebsite.com
        </motion.div>

        {/* Steps */}
        <div className="flex flex-col gap-1.5 w-full max-w-[196px]">
          {phase === 0 && (
            <motion.div className="flex items-center justify-center">
              <motion.span
                animate={{ opacity: [1, 0.35, 1] }}
                transition={{ repeat: Infinity, duration: 0.9 }}
                className="text-[10px] text-blue-500"
              >
                ● Connecting...
              </motion.span>
            </motion.div>
          )}
          <AnimatePresence>
            {phase >= 1 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl"
              >
                <span className="text-[10px] text-slate-600">DNS</span>
                <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                  <Check size={9} strokeWidth={2.5} /> Verified
                </span>
              </motion.div>
            )}
            {phase >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl"
              >
                <span className="text-[10px] text-slate-600">Publishing</span>
                <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                  <Check size={9} strokeWidth={2.5} /> Enabled
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Active badge */}
        <AnimatePresence>
          {isConnected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.88 }}
              className="relative flex items-center justify-center"
            >
              <motion.div
                animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "easeOut" }}
                className="absolute inset-0 rounded-full bg-emerald-300"
              />
              <span className="relative text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
                Publishing Active
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimCard>
  );
}

// ─── 4. Publish & Optimize Card ──────────────────────────────────────────────
const PIPELINE = ["Research", "Write", "Images", "SEO", "Publish"];
const PUB_METRICS = [
  { label: "SEO Score",   value: 96, color: "text-blue-600",    bg: "bg-blue-50" },
  { label: "EEAT",        value: 87, color: "text-violet-600",  bg: "bg-violet-50" },
  { label: "Performance", value: 95, color: "text-emerald-600", bg: "bg-emerald-50" },
];
// phases: 0=blank, 1-5=pipeline steps, 6=metrics, 7=LIVE, 8=hold
const PUBLISH_DELAYS = [400, 480, 480, 480, 480, 600, 1600, 1200, 500];

function PublishOptimizeCard() {
  const phase = usePhaseLoop(PUBLISH_DELAYS);
  const doneCount = Math.min(Math.max(phase - 1, 0), 5);
  const showMetrics = phase >= 6;
  const showLive = phase >= 7;

  return (
    <AnimCard>
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Pipeline</span>
        <AnimatePresence>
          {showLive && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5"
            >
              <motion.span
                animate={{ opacity: [1, 0.25, 1] }}
                transition={{ repeat: Infinity, duration: 1.1 }}
                className="w-1.5 h-1.5 bg-emerald-500 rounded-full block"
              />
              LIVE
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Pipeline steps */}
      <div className="flex items-start mb-3">
        {PIPELINE.flatMap((step, i) => {
          const isDone = i < doneCount;
          const isActive = i === doneCount && phase > 0 && !showMetrics;
          const el = (
            <div key={step} className="flex flex-col items-center" style={{ minWidth: 44 }}>
              <motion.div
                animate={isDone ? { scale: [1.25, 1] } : {}}
                transition={{ duration: 0.2 }}
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold z-10 ${
                  isDone ? "bg-emerald-100 text-emerald-600" : isActive ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400"
                }`}
              >
                {isDone ? <Check size={9} strokeWidth={2.5} /> : i + 1}
              </motion.div>
              <span className={`text-[8px] text-center mt-0.5 leading-tight w-full ${
                isDone ? "text-emerald-600" : isActive ? "text-blue-500" : "text-slate-400"
              }`}>{step}</span>
            </div>
          );
          if (i < PIPELINE.length - 1) {
            return [
              el,
              <div key={`c${i}`} className="flex-1 relative mt-2.5 h-px bg-slate-200">
                <motion.div
                  animate={{ width: isDone ? "100%" : "0%" }}
                  transition={{ duration: 0.3 }}
                  className="absolute left-0 top-0 h-full bg-emerald-300"
                />
              </div>,
            ];
          }
          return [el];
        })}
      </div>

      {/* Lower area */}
      <AnimatePresence mode="wait">
        {!showMetrics ? (
          <motion.div key="progress" exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            {phase > 0 && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] text-slate-500 truncate mb-1.5">
                  How to Choose the Right PLC for Industrial Automation
                </p>
                <div className="h-[5px] bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: `${(doneCount / 5) * 100}%` }}
                    transition={{ duration: 0.35 }}
                    className="h-full bg-gradient-to-r from-blue-400 to-violet-500 rounded-full"
                  />
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="metrics" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="grid grid-cols-3 gap-1.5">
              {PUB_METRICS.map((m, i) => (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1, duration: 0.22 }}
                  className={`${m.bg} rounded-xl p-2 flex flex-col items-center`}
                >
                  <span className={`text-[18px] font-extrabold leading-none ${m.color}`}>{m.value}</span>
                  <span className={`text-[8px] mt-0.5 opacity-80 text-center leading-tight ${m.color}`}>{m.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimCard>
  );
}

// ─── 5. Analytics Card ───────────────────────────────────────────────────────
const BAR_HEIGHTS = [28, 42, 35, 55, 50, 68, 88];
const NOTIFS = ["New Signup", "CTA Click", "Weekly Report Ready"];
// phases: 0=blank, 1=graph rises, 2=+28% badge, 3=kw count, 4-6=notifs, 7=hold, 8=reset
const ANALYTICS_DELAYS = [400, 1200, 800, 1000, 500, 500, 500, 1300, 500];

function AnalyticsCard() {
  const phase = usePhaseLoop(ANALYTICS_DELAYS);
  const showGraph  = phase >= 1;
  const showBadge  = phase >= 2;
  const showKw     = phase >= 3;
  const notifCount = Math.max(0, Math.min(phase - 3, 3));

  return (
    <AnimCard>
      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Analytics</div>
      <div className="flex gap-3 flex-1 min-h-0">
        {/* Left: chart + stats */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Bar chart */}
          <div className="flex items-end gap-[3px] h-[64px] mb-1.5">
            {BAR_HEIGHTS.map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: showGraph ? `${h}%` : "0%" }}
                transition={{ duration: 0.55, delay: showGraph ? i * 0.05 : 0, ease: "easeOut" }}
                className={`flex-1 rounded-t-sm ${i === BAR_HEIGHTS.length - 1 ? "bg-blue-500" : "bg-blue-200"}`}
              />
            ))}
          </div>
          <AnimatePresence>
            {showBadge && (
              <motion.div
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-baseline gap-1.5 mb-1"
              >
                <span className="text-[11px] font-semibold text-slate-700">Organic Traffic</span>
                <span className="text-[10px] font-bold text-emerald-600">▲ +28%</span>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {showKw && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="text-[8px] text-slate-400 uppercase tracking-wider">Ranking Keywords</div>
                <div className="text-[15px] font-bold text-slate-800 leading-tight">417</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: notifications */}
        <div className="flex flex-col gap-1.5 w-[112px] shrink-0">
          <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider">Activity</span>
          <AnimatePresence>
            {NOTIFS.slice(0, notifCount).map((n) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.22 }}
                className="flex items-start gap-1.5 px-2 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl"
              >
                <Check size={9} className="text-emerald-500 mt-0.5 shrink-0" strokeWidth={2.5} />
                <span className="text-[9px] text-emerald-700 leading-snug">{n}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </AnimCard>
  );
}

// ─── Features data ───────────────────────────────────────────────────────────
const FEATURES = [
  {
    number: "01",
    tag: "Brand Analysis",
    headline: "Understand your brand before writing a single word.",
    body: "AstroRank learns how your business communicates, who you're competing against, and what opportunities exist before creating your content strategy.",
    highlights: [
      "Analyzes your website, social media, and brand mentions",
      "Researches competitors to uncover content gaps",
      "Creates your unique brand voice and content guidelines",
    ],
    Card: BrandAnalysisCard,
  },
  {
    number: "02",
    tag: "Content Strategy",
    headline: "Find the topics with the highest opportunity to rank.",
    body: "Our AI estimates real-world search demand across Google and AI while prioritizing topics with the greatest potential.",
    highlights: [
      "Estimates search demand across Google and AI",
      "Analyzes keyword competition and difficulty",
      "Scores every topic using AI Opportunity Score",
    ],
    Card: ContentStrategyCard,
  },
  {
    number: "03",
    tag: "Website Connect",
    headline: "Connect once and publish automatically.",
    body: "No migrations, plugins, or engineering work required. AstroRank works alongside your existing website.",
    highlights: [
      "One-click setup",
      "No developer required",
      "Works with your current website and tools",
    ],
    Card: WebsiteConnectCard,
  },
  {
    number: "04",
    tag: "Publish & Optimize",
    headline: "Publish content that's built to rank from day one.",
    body: "Every article is researched, written, optimized, and published automatically using SEO and AI best practices.",
    highlights: [
      "Automatically researches and writes expert content",
      "Optimizes SEO, EEAT, images, and internal links",
      "Publishes directly to your website",
    ],
    Card: PublishOptimizeCard,
  },
  {
    number: "05",
    tag: "Analytics & Reports",
    headline: "Measure what's working and improve automatically.",
    body: "Track rankings, traffic, and conversions while AstroRank keeps you informed with reports and live alerts.",
    highlights: [
      "Connects with Google Analytics in minutes",
      "Automated performance reports every 14 days",
      "Live alerts for signups and CTA conversions",
    ],
    Card: AnalyticsCard,
  },
];

// ─── Feature block ────────────────────────────────────────────────────────────
function FeatureBlock({ feature, index }: { feature: typeof FEATURES[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const isReversed = index % 2 !== 0;
  const { Card } = feature;

  const textCol = (
    <div className="flex flex-col justify-center py-2">
      <div className="flex items-center gap-2.5 mb-3">
        <span className="text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-2.5 py-[3px] tabular-nums">
          {feature.number}
        </span>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
          {feature.tag}
        </span>
      </div>
      <h3 className="text-[1.45rem] font-bold text-slate-900 leading-[1.22] tracking-[-0.02em] mb-3">
        {feature.headline}
      </h3>
      <p className="text-[14px] text-slate-500 leading-[1.65] mb-5">{feature.body}</p>
      <ul className="flex flex-col gap-2">
        {feature.highlights.map((h) => (
          <li key={h} className="flex items-start gap-2.5">
            <span className="mt-[3px] w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <Check size={8} className="text-emerald-600" strokeWidth={3} />
            </span>
            <span className="text-[13px] text-slate-600 leading-relaxed">{h}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  const cardCol = (
    <div className="h-[260px] lg:h-[280px]">
      <Card />
    </div>
  );

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center"
    >
      {isReversed ? (
        <>
          {cardCol}
          {textCol}
        </>
      ) : (
        <>
          {textCol}
          {cardCol}
        </>
      )}
    </motion.div>
  );
}

// ─── Section export ───────────────────────────────────────────────────────────
export default function FeaturesSection() {
  return (
    <section id="features" className="py-14 bg-white border-t border-slate-100">
      <div className="max-w-[1100px] mx-auto px-5 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-widest mb-4">How It Works</p>
          <h2 className="text-[2rem] sm:text-[2.4rem] font-extrabold text-slate-900 tracking-[-0.025em] leading-[1.1]">
            From brand to rankings.
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Fully automated.
            </span>
          </h2>
        </motion.div>

        {/* Blocks */}
        <div className="flex flex-col gap-16 lg:gap-20">
          {FEATURES.map((f, i) => (
            <FeatureBlock key={f.number} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
