"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Rocket, FileText, Search, TrendingUp, Megaphone,
  Building2, Briefcase, ShoppingBag,
  Layers, Smartphone, Sparkles, ShoppingCart,
  Factory, Heart, CreditCard, BookOpen, Users, GraduationCap,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────
const PERSONAS = [
  { label: "Founders",           Icon: Rocket       },
  { label: "Content Marketers",  Icon: FileText     },
  { label: "SEO Specialists",    Icon: Search       },
  { label: "Growth Teams",       Icon: TrendingUp   },
  { label: "Product Marketers",  Icon: Megaphone    },
  { label: "Agencies",           Icon: Building2    },
  { label: "Solopreneurs",       Icon: Briefcase    },
  { label: "Small Businesses",   Icon: ShoppingBag  },
];

const INDUSTRIES = [
  { label: "B2B SaaS",              Icon: Layers       },
  { label: "Consumer SaaS",         Icon: Smartphone   },
  { label: "AI Startups",           Icon: Sparkles     },
  { label: "Ecommerce",             Icon: ShoppingCart },
  { label: "Manufacturing",         Icon: Factory      },
  { label: "Healthcare",            Icon: Heart        },
  { label: "FinTech",               Icon: CreditCard   },
  { label: "EdTech",                Icon: GraduationCap},
  { label: "HRTech",                Icon: Users        },
  { label: "Professional Services", Icon: BookOpen     },
];

// ─── Single pill ──────────────────────────────────────────────────────────────
function Pill({ label, Icon }: { label: string; Icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-full shadow-sm cursor-default select-none whitespace-nowrap transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_4px_16px_rgba(37,99,235,0.12)]">
      <Icon size={13} className="text-slate-400 shrink-0" strokeWidth={1.75} />
      <span className="text-[13px] font-medium text-slate-700">{label}</span>
    </div>
  );
}

// ─── Marquee row ──────────────────────────────────────────────────────────────
function MarqueeRow({
  items,
  direction,
}: {
  items: { label: string; Icon: React.ElementType }[];
  direction: "left" | "right";
}) {
  const doubled = [...items, ...items];
  const trackClass = direction === "left" ? "marquee-track" : "marquee-track-right";

  return (
    <div className="relative overflow-hidden">
      {/* Pills */}
      <div className={`${trackClass} gap-3 py-2.5 px-3`}>
        {doubled.map((item, i) => (
          <Pill key={`${item.label}-${i}`} label={item.label} Icon={item.Icon} />
        ))}
      </div>

      {/* Edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-white to-transparent z-10" />
    </div>
  );
}

// ─── Section export ───────────────────────────────────────────────────────────
export default function MarqueeSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="bg-white border-t border-b border-slate-100 py-16 overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-12 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center"
        >
          <h2 className="text-3xl sm:text-[2rem] font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
            Built for every modern marketing team.
          </h2>
          <p className="text-[15px] text-slate-500 leading-relaxed max-w-[520px] mx-auto">
            Whether you&apos;re building a startup or scaling an enterprise, AstroRank helps you create content that compounds organic growth.
          </p>
        </motion.div>
      </div>

      {/* Two strips — no gap between them */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <MarqueeRow items={PERSONAS}    direction="left"  />
        <MarqueeRow items={INDUSTRIES}  direction="right" />
      </motion.div>
    </section>
  );
}
