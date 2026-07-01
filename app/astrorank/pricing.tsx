"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";

type Cycle = "monthly" | "3months" | "6months";

const BILLING: { id: Cycle; label: string; shortLabel: string }[] = [
  { id: "monthly",  label: "Monthly",  shortLabel: "mo"  },
  { id: "3months",  label: "3 Months", shortLabel: "3mo" },
  { id: "6months",  label: "6 Months", shortLabel: "6mo" },
];

const STARTER_PRICING: Record<Cycle, { monthly: number; total: number; discount: number | null }> = {
  monthly:  { monthly: 15000, total: 15000,  discount: null },
  "3months":{ monthly: 12500, total: 37500,  discount: 17  },
  "6months":{ monthly: 10000, total: 60000,  discount: 33  },
};

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

const FREE_FEATURES_VISIBLE = [
  "10 Published Pages",
  "Basic Brand Analysis",
  "Basic Content Strategy",
];
const FREE_FEATURES_HIDDEN = [
  "Basic CTA Generation",
  "Up to 1,000 words per article",
  "Pages remain live for 45 days",
  "1 Performance Report",
];

const STARTER_FEATURES_VISIBLE = [
  "50 Pages per month",
  "Full Brand Analysis & Custom Theme",
  "Advanced Content Strategy",
  "2,500–3,000 words per article",
  "Google Analytics & Search Console",
];
const STARTER_FEATURES_HIDDEN = [
  "Custom CTA Generation",
  "Advanced Internal Linking",
  "2 Performance Reports per month",
  "Live User Conversion Alerts",
  "Sitemap & robots.txt management",
];

function FeatureRow({ text, accent = false }: { text: string; accent?: boolean }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className={`mt-[3px] w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${accent ? "bg-blue-100" : "bg-emerald-100"}`}>
        <Check size={8} className={accent ? "text-blue-600" : "text-emerald-600"} strokeWidth={3} />
      </span>
      <span className="text-[13.5px] text-slate-600 leading-snug">{text}</span>
    </li>
  );
}

function ExpandableFeatures({ visible, hidden, accent = false }: { visible: string[]; hidden: string[]; accent?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <ul className="flex flex-col gap-2.5">
        {visible.map(f => <FeatureRow key={f} text={f} accent={accent} />)}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <ul className="flex flex-col gap-2.5 pt-2.5">
                {hidden.map(f => <FeatureRow key={f} text={f} accent={accent} />)}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </ul>
      <button
        onClick={() => setOpen(o => !o)}
        className={`mt-4 flex items-center gap-1.5 text-[12.5px] font-medium transition-colors duration-150 ${
          accent ? "text-blue-500 hover:text-blue-700" : "text-slate-400 hover:text-slate-700"
        }`}
      >
        {open ? "Show less" : `+${hidden.length} more features`}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={13} strokeWidth={2.5} />
        </motion.span>
      </button>
    </div>
  );
}

function BillingToggle({ cycle, onChange }: { cycle: Cycle; onChange: (c: Cycle) => void }) {
  return (
    <div className="inline-flex bg-slate-100 rounded-xl p-1 gap-0.5">
      {BILLING.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative px-4 py-1.5 rounded-[9px] text-[12.5px] font-semibold transition-all duration-150 whitespace-nowrap ${
            cycle === tab.id
              ? "bg-white text-slate-900 shadow-[0_1px_5px_rgba(15,23,42,0.08)]"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {tab.label}
          {tab.id === "6months" && (
            <span className="ml-1.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-1.5 py-[1px]">
              Best
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export default function PricingSection() {
  const [cycle, setCycle] = useState<Cycle>("monthly");
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-60px" });
  const plan = STARTER_PRICING[cycle];

  return (
    <section ref={sectionRef} id="pricing" className="py-16 bg-[#FAFAFA] border-t border-slate-100">
      <div className="max-w-[1280px] mx-auto px-5 lg:px-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-widest mb-4">Pricing</p>
          <h2 className="text-[2.25rem] sm:text-[2.5rem] font-extrabold text-slate-900 tracking-[-0.025em] leading-[1.1] mb-3">
            Simple pricing that grows with you.
          </h2>
          <p className="text-[15.5px] text-slate-500 max-w-[440px] mx-auto leading-relaxed">
            Start free and upgrade only when you&apos;re ready to scale your organic growth.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[840px] mx-auto"
        >

          {/* ── Free Trial ── */}
          <div className="relative bg-white rounded-2xl border border-slate-200 shadow-[0_2px_16px_rgba(15,23,42,0.06)] p-8 flex flex-col">
            <div className="mb-1">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Free Trial</p>
              <div className="text-[2.75rem] font-extrabold text-slate-900 leading-none tracking-tight mb-2">
                FREE
              </div>
              <p className="text-[13.5px] text-slate-400 mb-6">Best for trying AstroRank before committing.</p>
            </div>

            <button className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 text-[13.5px] font-semibold hover:border-slate-300 hover:bg-slate-50 active:scale-[0.99] transition-all duration-150 mb-7">
              Start for Free
            </button>

            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-4">Includes</p>
            <ExpandableFeatures visible={FREE_FEATURES_VISIBLE} hidden={FREE_FEATURES_HIDDEN} />
          </div>

          {/* ── AstroRank Starter ── */}
          <div className="relative bg-white rounded-2xl border-2 border-blue-500 shadow-[0_4px_32px_rgba(59,130,246,0.14)] p-8 flex flex-col overflow-hidden">
            <div className="absolute top-5 right-5">
              <span className="inline-flex items-center text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-2.5 py-[3px]">
                Most Popular
              </span>
            </div>

            <div className="mb-4">
              <p className="text-[11px] font-semibold text-blue-500 uppercase tracking-widest mb-2">AstroRank Starter</p>

              {/* Billing toggle inside card */}
              <div className="mb-5">
                <BillingToggle cycle={cycle} onChange={setCycle} />
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={cycle}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className="flex items-end gap-2.5 flex-wrap mb-1">
                    <span className="text-[2.75rem] font-extrabold text-slate-900 leading-none tracking-tight">
                      {fmt(plan.monthly)}
                    </span>
                    <span className="text-[14px] text-slate-500 pb-1">/month</span>
                    {plan.discount && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-[3px]">
                        Save {plan.discount}%
                      </span>
                    )}
                  </div>
                  {cycle !== "monthly" && (
                    <p className="text-[12.5px] text-slate-400">
                      {fmt(plan.total)} total · billed {cycle === "3months" ? "every 3 months" : "every 6 months"}
                    </p>
                  )}
                  {cycle === "monthly" && (
                    <p className="text-[12.5px] text-slate-400">Billed monthly. Cancel anytime.</p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <button className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-[13.5px] font-semibold shadow-sm shadow-blue-200 hover:bg-blue-500 active:scale-[0.99] transition-all duration-150 mb-7">
              Start Growing
            </button>

            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-4">Everything in Free, plus</p>
            <ExpandableFeatures visible={STARTER_FEATURES_VISIBLE} hidden={STARTER_FEATURES_HIDDEN} accent />
          </div>
        </motion.div>

        {/* Coming soon plans */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, delay: 0.25 }}
          className="mt-4 max-w-[840px] mx-auto"
        >
          <div className="rounded-2xl border border-dashed border-slate-200 px-7 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              {["SEO Pro", "Enterprise"].map(name => (
                <div key={name} className="flex items-center gap-2 opacity-40">
                  <span className="text-[13.5px] font-semibold text-slate-600">{name}</span>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 rounded-full px-2 py-0.5 uppercase tracking-wide">
                    Soon
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[13px] text-slate-400 text-center sm:text-right">
              More plans launching soon.{" "}
              <a href="/contact" className="text-blue-500 font-medium hover:underline">
                Get notified
              </a>
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
