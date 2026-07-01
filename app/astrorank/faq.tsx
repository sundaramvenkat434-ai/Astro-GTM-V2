"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const FAQS = [
  {
    q: "How does AstroRank generate content?",
    a: "AstroRank uses a multi-step AI pipeline: it analyzes your brand, researches keywords with real search volume data, builds a content strategy, then writes and optimizes full articles (2,500–3,000 words) with internal linking, CTAs, and schema markup — ready to publish directly to your domain.",
  },
  {
    q: "Will the content actually rank on Google?",
    a: "Yes. Every article is written around real search intent, targets achievable keywords based on competitor analysis, achieves 95+ Lighthouse scores, 85+ EEAT scores, and 95%+ originality on Grammarly. Most customers see ranking improvements within 45–90 days of publishing.",
  },
  {
    q: "What is included in the free trial?",
    a: "The free trial gives you 10 fully published pages with basic brand analysis, content strategy, and CTA generation. Articles are up to 1,000 words and remain live for 45 days. No credit card required.",
  },
  {
    q: "How does AstroRank integrate with my website?",
    a: "AstroRank publishes directly to your domain via a lightweight script or CMS integration (WordPress, Webflow, custom). Pages are indexed by Google within hours using our sitemap sync. Google Analytics and Search Console are connected automatically on SEO Lite.",
  },
  {
    q: "What is an AI Opportunity Score?",
    a: "The AI Opportunity Score is a proprietary metric that combines keyword difficulty, search volume, competitor content gap, and your brand's existing authority to surface the keywords where you have the highest probability of ranking quickly.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. There are no long-term contracts. You can cancel your subscription at any time and retain access through the end of your billing period. Published pages remain live until you choose to take them down.",
  },
  {
    q: "What are the 3-month and 6-month plans?",
    a: "Committing to 3 or 6 months unlocks a significant discount (save 33% on 3 months, 17% on 6 months). Content compounds over time — the longer you publish, the more traffic you capture. Longer plans are simply billed upfront at a lower effective monthly rate.",
  },
  {
    q: "Is my content unique or will it be penalized by Google?",
    a: "All content is fully original — no spinning, no templates. Each article is researched and written from scratch for your brand's unique positioning. We score 95%+ on Grammarly Originality before publishing. Google's helpful content guidelines are baked into every generation step.",
  },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="border-b border-slate-100 last:border-0"
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left group"
      >
        <span className="text-[14.5px] font-semibold text-slate-800 group-hover:text-blue-600 transition-colors duration-150 leading-snug">
          {q}
        </span>
        <span className="shrink-0 w-6 h-6 rounded-full bg-slate-100 group-hover:bg-blue-50 flex items-center justify-center transition-colors duration-150">
          {open
            ? <Minus size={12} className="text-blue-600" strokeWidth={2.5} />
            : <Plus size={12} className="text-slate-500 group-hover:text-blue-600" strokeWidth={2.5} />
          }
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-[13.5px] text-slate-500 leading-relaxed pr-8">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const half = Math.ceil(FAQS.length / 2);
  const left = FAQS.slice(0, half);
  const right = FAQS.slice(half);

  return (
    <section ref={ref} id="faq" className="py-16 bg-slate-50/90 border-t border-slate-100">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10">

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-widest mb-4">FAQ</p>
          <h2 className="text-[2rem] sm:text-[2.25rem] font-extrabold text-slate-900 tracking-[-0.025em] leading-[1.1] mb-3">
            Everything you need to know.
          </h2>
          <p className="text-[15px] text-slate-500 max-w-[420px] mx-auto leading-relaxed">
            Have a different question? Reach us at{" "}
            <a href="/contact" className="text-blue-500 hover:underline">hello@astrorank.io</a>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-12"
        >
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.04)] px-6 py-2">
            {left.map((item, i) => <FAQItem key={item.q} q={item.q} a={item.a} index={i} />)}
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.04)] px-6 py-2">
            {right.map((item, i) => <FAQItem key={item.q} q={item.q} a={item.a} index={i + half} />)}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
