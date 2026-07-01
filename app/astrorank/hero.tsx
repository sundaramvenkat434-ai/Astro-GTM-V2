"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  ArrowRight, Star, Zap, TrendingUp, FileText,
  ChartBar as BarChart3, Globe, CircleCheck as CheckCircle, Sparkles,
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

// ─── Workflow step card ───────────────────────────────────────────────────────
const STEPS = [
  { icon: Globe,       label: "Brand Analysis",   color: "bg-blue-50 text-blue-600",     dot: "bg-blue-500",   },
  { icon: TrendingUp,  label: "Content Strategy", color: "bg-violet-50 text-violet-600", dot: "bg-violet-500", },
  { icon: Zap,         label: "AI Research",       color: "bg-sky-50 text-sky-600",       dot: "bg-sky-500",    },
  { icon: FileText,    label: "AI Writing",        color: "bg-indigo-50 text-indigo-600", dot: "bg-indigo-500", },
  { icon: CheckCircle, label: "Auto Publishing",   color: "bg-emerald-50 text-emerald-600", dot: "bg-emerald-500" },
  { icon: BarChart3,   label: "Analytics",         color: "bg-teal-50 text-teal-600",     dot: "bg-teal-500",   },
];

const ARTICLE_CARDS = [
  { title: "10 Best AI Sales Tools for B2B Teams in 2025",    seo: 94, ai: 88, opp: 91, status: "Published" },
  { title: "How to Automate Lead Qualification with AI",       seo: 87, ai: 82, opp: 85, status: "Published" },
  { title: "CRM Integration Guide: Connecting AI Workflows",  seo: 79, ai: 91, opp: 76, status: "Live"      },
];

function ScorePill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`rounded-lg px-2 py-1.5 flex flex-col items-center ${color}`}>
      <span className="text-[13px] font-bold leading-none">{value}</span>
      <span className="text-[8.5px] mt-0.5 opacity-60 leading-none text-center tracking-wide uppercase">{label}</span>
    </div>
  );
}

function WorkflowPanel() {
  const [activeStep, setActiveStep] = useState(0);
  const [visibleCards, setVisibleCards] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setActiveStep(s => {
        const next = (s + 1) % STEPS.length;
        if (next === 0) setVisibleCards(0);
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (activeStep === STEPS.length - 1) {
      const timers = ARTICLE_CARDS.map((_, i) =>
        setTimeout(() => setVisibleCards(v => Math.max(v, i + 1)), i * 500)
      );
      return () => timers.forEach(clearTimeout);
    }
  }, [activeStep]);

  return (
    <div className="relative w-full h-full flex gap-4 items-start">
      {/* Steps column */}
      <div className="flex flex-col gap-[7px] min-w-[168px]">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isActive = i === activeStep;
          const isDone = i < activeStep || (activeStep === 0 && i === STEPS.length - 1);
          return (
            <div key={step.label} className="relative">
              <motion.div
                animate={{
                  scale: isActive ? 1.02 : 1,
                  boxShadow: isActive
                    ? "0 0 0 2px rgba(99,102,241,0.3), 0 4px 12px rgba(99,102,241,0.1)"
                    : "none",
                }}
                transition={{ duration: 0.2 }}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all duration-300 ${
                  isActive
                    ? "bg-white border-indigo-200"
                    : isDone
                    ? "bg-white border-slate-100 opacity-55"
                    : "bg-slate-50/80 border-slate-100 opacity-35"
                }`}
              >
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${step.color}`}>
                  <Icon size={13} />
                </span>
                <span className="text-[11.5px] font-medium text-slate-700 leading-tight">{step.label}</span>
                {isDone && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`ml-auto w-1.5 h-1.5 rounded-full block shrink-0 ${step.dot}`}
                  />
                )}
              </motion.div>
              {i < STEPS.length - 1 && (
                <div className="absolute left-[22px] -bottom-[7px] w-px h-[7px] bg-slate-200 overflow-hidden">
                  <motion.div
                    animate={{ scaleY: i < activeStep ? 1 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="w-full h-full bg-indigo-400 origin-top"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Article cards */}
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <div className="text-[9.5px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5 px-0.5">
          Generated Pages
        </div>
        <AnimatePresence>
          {ARTICLE_CARDS.slice(0, visibleCards).map((card) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="bg-white rounded-xl border border-slate-100 p-3 shadow-[0_1px_6px_rgba(0,0,0,0.05)]"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-[10.5px] font-medium text-slate-800 leading-snug line-clamp-2">{card.title}</p>
                <span className="shrink-0 text-[8.5px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                  {card.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <ScorePill label="SEO" value={card.seo} color="text-blue-600 bg-blue-50" />
                <ScorePill label="AI Vis." value={card.ai} color="text-violet-600 bg-violet-50" />
                <ScorePill label="Opp." value={card.opp} color="text-teal-600 bg-teal-50" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {visibleCards === 0 && (
          <div className="flex flex-col gap-2">
            {[0, 1].map(i => (
              <div key={i} className="bg-slate-50 rounded-xl border border-slate-100 h-[76px] animate-pulse" />
            ))}
          </div>
        )}
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
            {/* Badge */}
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

            {/* Headline */}
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

            {/* Sub */}
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

            {/* Email CTA */}
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
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white text-[14px] font-semibold shadow-sm shadow-blue-200/80 hover:bg-blue-500 hover:shadow-blue-300/80 active:scale-[0.98] transition-all duration-150 whitespace-nowrap"
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

            {/* Trust row */}
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
            {/* Outer glow */}
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-blue-100/50 via-violet-100/30 to-sky-100/50 blur-2xl pointer-events-none" />

            <div className="relative bg-white rounded-[20px] border border-slate-200/80 shadow-[0_8px_48px_rgba(15,23,42,0.1),0_2px_8px_rgba(15,23,42,0.06)] p-5 overflow-hidden">
              {/* Window chrome */}
              <div className="flex items-center gap-1.5 mb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                <div className="flex-1 mx-3 h-5 rounded-md bg-slate-100 flex items-center px-2.5">
                  <span className="text-[10px] text-slate-400 font-mono">app.astrorank.ai/researcher</span>
                </div>
              </div>

              {/* Workflow */}
              <div className="min-h-[320px] lg:min-h-[360px]">
                <WorkflowPanel />
              </div>

              {/* Status bar */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                  />
                  <span className="text-[11px] text-slate-400">AI pipeline running</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono tabular-nums">3 articles generated</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

// ─── Metrics strip ────────────────────────────────────────────────────────────
const METRICS = [
  { value: "95+",  label: "Lighthouse Score",    color: "text-blue-600"    },
  { value: "85+",  label: "EEAT Score",          color: "text-amber-500"   },
  { value: "95%",  label: "Content Originality", color: "text-emerald-600" },
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
