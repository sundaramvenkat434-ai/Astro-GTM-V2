"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Star } from "lucide-react";

const FEATURED = {
  tag: "Agency Case Study",
  name: "GrowthMint Agency",
  headline: "GrowthMint: 3× organic traffic in 90 days, 58% more leads.",
  body: "This B2B marketing agency ran every client site through Gifaa's free audit, then turned each brand's positioning into a full SEO content engine. They scaled from 4 articles/month to 50 without adding headcount — search visibility tripled within 90 days and inbound leads grew 58% quarter-over-quarter.",
  metrics: [
    { value: "+3×", label: "Organic Traffic" },
    { value: "+58%", label: "Inbound Leads" },
  ],
};

const REVIEWS = [
  {
    name: "Priya Mehta",
    role: "Head of Growth",
    company: "SaaS startup",
    stars: 5,
    source: "G2",
    quote: "Gifaa replaced our entire content agency. The free audit showed us exactly why our blog was invisible, and the brand intelligence means every article genuinely sounds like us. We went from 2 posts a month to 40, and organic search sessions doubled in 8 weeks.",
  },
  {
    name: "Rahul Sharma",
    role: "Founder & CEO",
    company: "E-commerce brand",
    stars: 5,
    source: "Capterra",
    quote: "I was skeptical about AI content, but Gifaa studies your brand before it writes a single word. Google ranks our pages within days of publishing, not months. The ROI in the first month alone justified the subscription.",
  },
  {
    name: "Ananya Krishnan",
    role: "SEO Manager",
    company: "Digital agency",
    stars: 5,
    source: "G2",
    quote: "Managing SEO content for 12 clients used to require a team of writers. Now one person runs every account through Gifaa — audits, keyword strategies, and publishing all happen in one place. It's genuinely impressive.",
  },
  {
    name: "Vikram Nair",
    role: "Marketing Director",
    company: "EdTech platform",
    stars: 5,
    source: "G2",
    quote: "We're ranking on the first page for 140+ keywords our competitors dominated for years. Gifaa's keyword strategy surfaced opportunities our own team had completely missed. This is the future of SEO.",
  },
  {
    name: "Sneha Patel",
    role: "Content Lead",
    company: "Fintech startup",
    stars: 5,
    source: "Capterra",
    quote: "The free audit alone was worth it — it flagged issues our previous agency had missed for two years. We connected our CMS, published the first Gifaa-drafted article the same day, and the writing is research-backed and reads completely naturally.",
  },
  {
    name: "Arjun Desai",
    role: "Co-founder",
    company: "B2B SaaS",
    stars: 5,
    source: "G2",
    quote: "Gifaa's brand intelligence helped us find 60+ untapped topics our rivals weren't covering. The AI Opportunity Score is incredibly accurate. Three months in and we're outranking our main competitor on 20+ keywords.",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

function SourceBadge({ source }: { source: string }) {
  return (
    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 rounded px-1.5 py-0.5 leading-none tracking-wide">
      {source}
    </span>
  );
}

export default function ReviewsSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} id="reviews" className="py-16 bg-white border-t border-slate-100">
      <div className="max-w-[1280px] mx-auto px-5 lg:px-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-widest mb-4">Reviews</p>
          <h2 className="text-[2rem] sm:text-[2.4rem] font-extrabold text-slate-900 tracking-[-0.025em] leading-[1.1] mb-3">
            Teams that switched to Gifaa tell us
            <br className="hidden sm:block" /> what changed.
          </h2>
          <p className="text-[15px] text-slate-500 max-w-[400px] mx-auto leading-relaxed">
            Verified reviews from early customers who run their SEO on Gifaa every day.
          </p>
        </motion.div>

        {/* Featured case study */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="mb-5"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_24px_rgba(15,23,42,0.07)] p-8 sm:p-10 lg:p-12 relative overflow-hidden">
            {/* subtle tinted glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-sky-100/30 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
              <div className="flex-1 max-w-[600px]">
                <span className="inline-block text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-3 py-[3px] uppercase tracking-widest mb-4">
                  {FEATURED.tag}
                </span>
                <h3 className="text-[1.5rem] sm:text-[1.75rem] font-extrabold text-slate-900 leading-[1.2] tracking-[-0.02em] mb-4">
                  {FEATURED.headline}
                </h3>
                <p className="text-[14.5px] text-slate-500 leading-relaxed">
                  {FEATURED.body}
                </p>
              </div>
              <div className="flex flex-row lg:flex-col gap-3 lg:gap-3 shrink-0">
                {FEATURED.metrics.map(m => (
                  <div key={m.label} className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-center min-w-[120px]">
                    <div className="text-[1.75rem] font-extrabold text-blue-600 leading-none tracking-tight mb-1">
                      {m.value}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Review grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {REVIEWS.map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, y: 18 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.07 }}
              className="bg-slate-50 rounded-2xl border border-slate-200/70 shadow-[0_2px_12px_rgba(15,23,42,0.04)] p-6 flex flex-col gap-4 hover:shadow-[0_6px_28px_rgba(15,23,42,0.08)] hover:border-slate-300/60 transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[13.5px] font-bold text-slate-900 leading-tight">{r.name}</p>
                  <p className="text-[11.5px] text-slate-400 mt-0.5">{r.role} · {r.company}</p>
                </div>
                <SourceBadge source={r.source} />
              </div>
              <Stars count={r.stars} />
              <p className="text-[13px] text-slate-600 leading-relaxed flex-1">
                &ldquo;{r.quote}&rdquo;
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
