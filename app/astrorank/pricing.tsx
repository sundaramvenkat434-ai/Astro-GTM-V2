"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Check, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ─── Types & data ─────────────────────────────────────────────────────────────
type Cycle = "monthly" | "3months" | "6months";

const TABS: { id: Cycle; label: string }[] = [
  { id: "monthly",  label: "Monthly"  },
  { id: "3months",  label: "3 Months" },
  { id: "6months",  label: "6 Months" },
];

interface Plan {
  amount: string;
  sub: string;
  mo: string | null;
  savings: string | null;
}

// 3-month: ₹30,000 → ₹10,000/mo vs ₹15,000/mo → save 33%
// 6-month: ₹75,000 → ₹12,500/mo vs ₹15,000/mo → save 17%
const SEO_PRICING: Record<Cycle, Plan> = {
  monthly:  { amount: "₹15,000",  sub: "/ month",       mo: null,            savings: null       },
  "3months":{ amount: "₹30,000",  sub: "for 3 months",  mo: "₹10,000 / mo",  savings: "Save 33%" },
  "6months":{ amount: "₹75,000",  sub: "for 6 months",  mo: "₹12,500 / mo",  savings: "Save 17%" },
};

const FREE_FEATURES = [
  "10 Published Pages",
  "Basic Brand Analysis",
  "Basic Content Strategy",
  "Basic CTA Generation",
  "Up to 1,000 words per article",
  "Pages remain live for 45 days",
  "1 Performance Report",
];

const SEO_FEATURES: { text: string; hasTooltip?: true }[] = [
  { text: "50 Pages per month" },
  { text: "Custom Brand Theme" },
  { text: "Advanced Content Strategy", hasTooltip: true },
  { text: "2,500–3,000 words per article" },
  { text: "Custom CTA Generation" },
  { text: "Google Analytics Integration" },
  { text: "Google Search Console Integration" },
  { text: "Advanced Internal Linking" },
  { text: "2 Performance Reports per month" },
  { text: "Live User Conversion Alerts" },
];

const STRATEGY_BULLETS = [
  "Accurate keyword search volume estimation",
  "Competitor analysis",
  "AI Opportunity Score",
  "Topic prioritization",
  "Search intent analysis",
];

// ─── Billing toggle ───────────────────────────────────────────────────────────
function BillingToggle({ cycle, onChange }: { cycle: Cycle; onChange: (c: Cycle) => void }) {
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);

  useEffect(() => {
    const idx = TABS.findIndex(t => t.id === cycle);
    const el = btnRefs.current[idx];
    if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth });
  }, [cycle]);

  return (
    <div className="relative inline-flex bg-slate-100 rounded-[14px] p-1 gap-0.5">
      {pill && (
        <motion.div
          animate={{ left: pill.left, width: pill.width }}
          initial={false}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="absolute top-1 bottom-1 bg-white rounded-xl shadow-[0_1px_6px_rgba(0,0,0,0.08)]"
        />
      )}
      {TABS.map((tab, i) => (
        <button
          key={tab.id}
          ref={el => { btnRefs.current[i] = el; }}
          onClick={() => onChange(tab.id)}
          className={`relative z-10 px-5 py-1.5 rounded-xl text-sm font-medium transition-colors duration-150 whitespace-nowrap ${
            cycle === tab.id ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ─── Feature row ──────────────────────────────────────────────────────────────
function FeatureRow({ text, hasTooltip }: { text: string; hasTooltip?: true }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-[2px] w-[17px] h-[17px] rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
        <Check size={9} className="text-emerald-600" strokeWidth={2.5} />
      </span>
      <span className="text-[13.5px] text-slate-600 leading-snug flex items-center gap-1.5">
        {text}
        {hasTooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="inline-flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                <Info size={13} />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="max-w-[220px] p-3 text-[12px] leading-relaxed"
            >
              <p className="font-semibold text-slate-800 mb-2">Advanced Content Strategy</p>
              <ul className="flex flex-col gap-1">
                {STRATEGY_BULLETS.map(b => (
                  <li key={b} className="flex items-start gap-1.5 text-slate-600">
                    <span className="mt-0.5 shrink-0 text-emerald-500">•</span>
                    {b}
                  </li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>
        )}
      </span>
    </li>
  );
}

// ─── Pricing section ──────────────────────────────────────────────────────────
export default function PricingSection() {
  const [cycle, setCycle] = useState<Cycle>("monthly");
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-60px" });
  const plan = SEO_PRICING[cycle];

  return (
    <TooltipProvider>
      <section ref={sectionRef} className="py-24 bg-[#FAFAFA] border-t border-slate-100">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[11px] font-semibold text-blue-600 uppercase tracking-widest mb-4">
              Pricing
            </div>
            <h2 className="text-4xl sm:text-[2.5rem] font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
              Simple pricing that grows with you.
            </h2>
            <p className="text-[16px] text-slate-500 max-w-[480px] mx-auto leading-relaxed">
              Start free and upgrade only when you&apos;re ready to scale your organic growth.
            </p>
          </motion.div>

          {/* Billing toggle */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex justify-center mb-10"
          >
            <BillingToggle cycle={cycle} onChange={setCycle} />
          </motion.div>

          {/* Cards */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-[820px] mx-auto"
          >
            {/* ── FREE card ──────────────────────────────────────── */}
            <motion.div
              whileHover={{ y: -6, boxShadow: "0 20px 48px -8px rgba(0,0,0,0.12)" }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              className="relative bg-white rounded-[24px] border border-slate-200 shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8 flex flex-col"
            >
              {/* Plan name */}
              <div className="mb-6">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Free Trial</p>
                <div className="text-[2.6rem] font-extrabold text-slate-900 leading-none tracking-tight">
                  FREE
                </div>
                <p className="text-sm text-slate-400 mt-2">Best for trying AstroRank before committing.</p>
              </div>

              {/* CTA */}
              <button className="w-full py-3 rounded-xl border-2 border-slate-200 text-slate-700 text-sm font-semibold hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 mb-7">
                Start Free
              </button>

              {/* Divider */}
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-4">Includes</div>

              {/* Features */}
              <ul className="flex flex-col gap-2.5">
                {FREE_FEATURES.map(f => (
                  <FeatureRow key={f} text={f} />
                ))}
              </ul>
            </motion.div>

            {/* ── SEO Lite card ─────────────────────────────────── */}
            <motion.div
              whileHover={{ y: -6, boxShadow: "0 20px 48px -8px rgba(59,130,246,0.18)" }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              className="relative bg-white rounded-[24px] border-2 border-blue-500 shadow-[0_4px_32px_rgba(59,130,246,0.12)] p-8 flex flex-col overflow-hidden"
            >
              {/* Most Popular ribbon */}
              <div className="absolute top-5 right-5">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-3 py-1">
                  Most Popular
                </span>
              </div>

              {/* Plan name + price */}
              <div className="mb-6">
                <p className="text-[11px] font-semibold text-blue-500 uppercase tracking-widest mb-1">SEO Lite</p>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={cycle}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="flex items-end gap-2 flex-wrap"
                  >
                    <span className="text-[2.6rem] font-extrabold text-slate-900 leading-none tracking-tight">
                      {plan.amount}
                    </span>
                    <div className="flex flex-col pb-0.5 gap-0.5">
                      <span className="text-sm text-slate-500">{plan.sub}</span>
                      {plan.mo && (
                        <span className="text-[11px] text-slate-400">{plan.mo}</span>
                      )}
                    </div>
                    {plan.savings && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5 mb-0.5">
                        {plan.savings}
                      </span>
                    )}
                  </motion.div>
                </AnimatePresence>

                <p className="text-sm text-slate-400 mt-2">Best for growing your organic presence.</p>
              </div>

              {/* CTA */}
              <button className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold shadow-md shadow-blue-200 hover:shadow-blue-300 hover:from-blue-500 hover:to-blue-400 transition-all duration-200 mb-7">
                Start Growing
              </button>

              {/* Divider */}
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-4">Everything in Free, plus</div>

              {/* Features */}
              <ul className="flex flex-col gap-2.5">
                {SEO_FEATURES.map(f => (
                  <FeatureRow key={f.text} text={f.text} hasTooltip={f.hasTooltip} />
                ))}
              </ul>
            </motion.div>
          </motion.div>

          {/* Coming soon */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.3 }}
            className="mt-5 max-w-[820px] mx-auto"
          >
            <div className="rounded-[20px] border border-dashed border-slate-200 bg-white/60 px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="flex items-center gap-5">
                {["SEO Pro", "Enterprise"].map(name => (
                  <div key={name} className="flex items-center gap-2.5 opacity-50">
                    <span className="text-[14px] font-semibold text-slate-500">{name}</span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 rounded-full px-2 py-0.5 uppercase tracking-wide">
                      Coming Soon
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[13px] text-slate-400 text-center sm:text-right">
                More plans launching soon.{" "}
                <span className="text-blue-500 font-medium cursor-pointer hover:underline">
                  Get notified
                </span>
              </p>
            </div>
          </motion.div>

        </div>
      </section>
    </TooltipProvider>
  );
}
