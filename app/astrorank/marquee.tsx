"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Rocket, FileText, Search, TrendingUp, Megaphone,
  Building2, Briefcase, ShoppingBag,
  Layers, Smartphone, Sparkles, ShoppingCart,
  Factory, Heart, CreditCard, BookOpen, Users, GraduationCap,
} from "lucide-react";

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
  { label: "B2B SaaS",              Icon: Layers        },
  { label: "Consumer SaaS",         Icon: Smartphone    },
  { label: "AI Startups",           Icon: Sparkles      },
  { label: "Ecommerce",             Icon: ShoppingCart  },
  { label: "Manufacturing",         Icon: Factory       },
  { label: "Healthcare",            Icon: Heart         },
  { label: "FinTech",               Icon: CreditCard    },
  { label: "EdTech",                Icon: GraduationCap },
  { label: "HRTech",                Icon: Users         },
  { label: "Professional Services", Icon: BookOpen      },
];

function Pill({ label, Icon }: { label: string; Icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full shadow-[0_1px_4px_rgba(15,23,42,0.06)] cursor-default select-none whitespace-nowrap transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_4px_14px_rgba(37,99,235,0.1)]">
      <Icon size={12} className="text-slate-400 shrink-0" strokeWidth={1.75} />
      <span className="text-[12.5px] font-medium text-slate-600">{label}</span>
    </div>
  );
}

function MarqueeRow({ items, direction }: { items: { label: string; Icon: React.ElementType }[]; direction: "left" | "right" }) {
  const doubled = [...items, ...items];
  const trackClass = direction === "left" ? "marquee-track" : "marquee-track-right";
  return (
    <div className="relative overflow-hidden">
      <div className={`${trackClass} gap-2.5 py-2 px-2`}>
        {doubled.map((item, i) => (
          <Pill key={`${item.label}-${i}`} label={item.label} Icon={item.Icon} />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent z-10" />
    </div>
  );
}

export default function MarqueeSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} id="how-it-works" className="bg-white border-t border-b border-slate-100 py-14 overflow-hidden">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-12 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-widest mb-4">Who It&apos;s For</p>
          <h2 className="text-[2.25rem] sm:text-[2.5rem] font-extrabold text-slate-900 tracking-[-0.025em] leading-[1.1] mb-3.5">
            Built for every modern marketing team.
          </h2>
          <p className="text-[15.5px] text-slate-500 leading-relaxed max-w-[480px] mx-auto">
            Whether you&apos;re building a startup or scaling an enterprise, AstroRank helps you create content that compounds organic growth.
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.12 }}
        className="flex flex-col gap-0"
      >
        <MarqueeRow items={PERSONAS}   direction="left"  />
        <MarqueeRow items={INDUSTRIES} direction="right" />
      </motion.div>
    </section>
  );
}
