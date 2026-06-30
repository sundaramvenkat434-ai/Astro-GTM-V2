"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Star, Zap, TrendingUp, FileText, ChartBar as BarChart3, Globe, CircleCheck as CheckCircle, Sparkles } from "lucide-react";

// ─── Platform cycling animation ─────────────────────────────────────────────
const PLATFORMS = ["Google", "ChatGPT", "Gemini", "Claude", "Perplexity", "Copilot"];

function PlatformCycler() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex(i => (i + 1) % PLATFORMS.length), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <span className="inline-block relative">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="inline-block bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent"
        >
          {PLATFORMS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// ─── Workflow step card ──────────────────────────────────────────────────────
const STEPS = [
  { icon: Globe,      label: "Brand Analysis",    color: "bg-blue-50 text-blue-600",     dot: "bg-blue-500",   delay: 0 },
  { icon: TrendingUp, label: "Content Strategy",  color: "bg-violet-50 text-violet-600", dot: "bg-violet-500", delay: 0.6 },
  { icon: Zap,        label: "AI Research",        color: "bg-sky-50 text-sky-600",       dot: "bg-sky-500",    delay: 1.2 },
  { icon: FileText,   label: "AI Writing",         color: "bg-indigo-50 text-indigo-600", dot: "bg-indigo-500", delay: 1.8 },
  { icon: CheckCircle,label: "Auto Publishing",    color: "bg-emerald-50 text-emerald-600",dot: "bg-emerald-500",delay: 2.4 },
  { icon: BarChart3,  label: "Analytics",          color: "bg-teal-50 text-teal-600",     dot: "bg-teal-500",   delay: 3.0 },
];

const ARTICLE_CARDS = [
  { title: "10 Best AI Sales Tools for B2B Teams in 2025", seo: 94, ai: 88, opp: 91, status: "Published" },
  { title: "How to Automate Lead Qualification with AI Agents", seo: 87, ai: 82, opp: 85, status: "Published" },
  { title: "CRM Integration Guide: Connecting Your AI Workflows", seo: 79, ai: 91, opp: 76, status: "Live" },
];

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
      {/* Workflow steps column */}
      <div className="flex flex-col gap-2 min-w-[172px]">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isActive = i === activeStep;
          const isDone = i < activeStep || (activeStep === 0 && i === STEPS.length - 1);
          return (
            <div key={step.label} className="relative">
              <motion.div
                animate={{
                  scale: isActive ? 1.03 : 1,
                  boxShadow: isActive
                    ? "0 0 0 2px rgba(99,102,241,0.35), 0 4px 16px rgba(99,102,241,0.12)"
                    : "0 1px 4px rgba(0,0,0,0.06)",
                }}
                transition={{ duration: 0.25 }}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-colors duration-300 ${
                  isActive
                    ? "bg-white border-indigo-200"
                    : isDone
                    ? "bg-white border-slate-100 opacity-60"
                    : "bg-white border-slate-100 opacity-40"
                }`}
              >
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${step.color}`}>
                  <Icon size={14} />
                </span>
                <span className="text-xs font-medium text-slate-700 leading-tight">{step.label}</span>
                <span className="ml-auto">
                  {isDone && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`w-2 h-2 rounded-full block ${step.dot}`}
                    />
                  )}
                </span>
              </motion.div>
              {/* Connector */}
              {i < STEPS.length - 1 && (
                <div className="absolute left-5 -bottom-2 w-px h-2 overflow-hidden">
                  <motion.div
                    animate={{ height: i < activeStep ? "100%" : "0%" }}
                    transition={{ duration: 0.3 }}
                    className="w-full bg-gradient-to-b from-indigo-400 to-violet-400"
                    style={{ height: "100%" }}
                  />
                  <div className="absolute inset-0 bg-slate-100" style={{ zIndex: -1 }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Generated article cards */}
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1 px-1">
          Generated Pages
        </div>
        <AnimatePresence>
          {ARTICLE_CARDS.slice(0, visibleCards).map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, x: 20, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="bg-white rounded-2xl border border-slate-100 p-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <p className="text-[11px] font-medium text-slate-800 leading-snug line-clamp-2">{card.title}</p>
                <span className="flex-shrink-0 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                  {card.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <ScorePill label="SEO" value={card.seo} color="text-blue-600 bg-blue-50" />
                <ScorePill label="AI Visibility" value={card.ai} color="text-violet-600 bg-violet-50" />
                <ScorePill label="Opportunity" value={card.opp} color="text-teal-600 bg-teal-50" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {visibleCards === 0 && (
          <div className="flex flex-col gap-2">
            {[1, 2].map(i => (
              <div key={i} className="bg-slate-50 rounded-2xl border border-slate-100 p-3 h-[80px] animate-pulse" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ScorePill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`rounded-lg px-2 py-1.5 flex flex-col items-center ${color}`}>
      <span className="text-[13px] font-bold leading-none">{value}</span>
      <span className="text-[9px] mt-0.5 opacity-70 leading-none text-center">{label}</span>
    </div>
  );
}

// ─── Avatar row ──────────────────────────────────────────────────────────────
const AVATAR_COLORS = ["bg-blue-400", "bg-violet-400", "bg-teal-400", "bg-indigo-400", "bg-sky-400"];

function AvatarRow() {
  return (
    <div className="flex -space-x-2">
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

// ─── Main hero ───────────────────────────────────────────────────────────────
export default function AstroRankHero() {
  const [email, setEmail] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) { inputRef.current?.focus(); return; }
    // TODO: wire to waitlist endpoint
    setEmail("");
  }

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white">
      {/* Background gradient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-50 via-violet-50 to-transparent opacity-60 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-sky-50 to-transparent opacity-50 blur-3xl" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.5) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6 lg:px-12 py-20 lg:py-0 lg:min-h-screen flex items-center">
        <div className="w-full grid lg:grid-cols-[55fr_45fr] gap-12 xl:gap-20 items-center">

          {/* ── Left: Content ─────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-start"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-violet-200 bg-gradient-to-r from-blue-50 to-violet-50 text-sm font-medium text-violet-700 mb-6 shadow-sm"
            >
              <Sparkles size={14} className="text-violet-500" />
              <span>Join Early Access</span>
              <span className="w-px h-3.5 bg-violet-200" />
              <span className="text-violet-600 font-semibold">Get 10 Pages FREE</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.55 }}
              className="text-[2.6rem] sm:text-5xl lg:text-[3.25rem] xl:text-[3.75rem] font-extrabold leading-[1.1] tracking-tight text-slate-900 mb-5"
            >
              Give your brand an<br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent"> unfair SEO</span>
              <br className="hidden sm:block" /> advantage.
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="text-lg text-slate-500 leading-relaxed mb-8 max-w-[480px]"
            >
              Scale high-quality content with AI and publish hundreds of
              research-backed articles designed to rank on{" "}
              <PlatformCycler />.
            </motion.p>

            {/* Email CTA */}
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="w-full max-w-[460px] flex flex-col sm:flex-row gap-3 mb-4"
            >
              <input
                ref={inputRef}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your work email"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm placeholder:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 shadow-sm transition-all"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-semibold shadow-md shadow-blue-200 hover:shadow-blue-300 hover:from-blue-500 hover:to-violet-500 transition-all duration-200 whitespace-nowrap"
              >
                Join Early Access
                <ArrowRight size={15} />
              </button>
            </motion.form>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="text-xs text-slate-400 mb-10"
            >
              No credit card required &nbsp;•&nbsp; Get your first 10 pages free
            </motion.p>

            {/* Trust row */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="flex items-center gap-4"
            >
              <AvatarRow />
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs text-slate-500">Trusted by growing startups &amp; businesses</span>
              </div>
            </motion.div>
          </motion.div>

          {/* ── Right: Product mockup ──────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.65, ease: "easeOut" }}
            className="relative"
          >
            {/* Outer glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-100/60 via-violet-100/40 to-sky-100/60 blur-xl scale-105 pointer-events-none" />

            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-100 shadow-2xl shadow-slate-200/60 p-5 overflow-hidden">
              {/* Window chrome */}
              <div className="flex items-center gap-1.5 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400/70" />
                <div className="w-3 h-3 rounded-full bg-amber-400/70" />
                <div className="w-3 h-3 rounded-full bg-emerald-400/70" />
                <div className="flex-1 mx-3 h-6 rounded-md bg-slate-100 flex items-center px-3">
                  <span className="text-[10px] text-slate-400">app.astrorank.ai / researcher</span>
                </div>
              </div>

              {/* Workflow */}
              <div className="min-h-[340px] lg:min-h-[380px]">
                <WorkflowPanel />
              </div>

              {/* Bottom status bar */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                    className="w-2 h-2 rounded-full bg-emerald-400"
                  />
                  <span className="text-[11px] text-slate-500">AI pipeline running</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">3 articles generated</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
