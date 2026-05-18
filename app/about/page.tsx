import type { Metadata } from 'next';
import { Users, Target, Zap, TrendingUp, ChartBar as BarChart2, Share2, CircleCheck as CheckCircle2, ArrowRight, Megaphone, Search, Layers, ShieldCheck, Rocket, Globe } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://astrogtm.com';

export const metadata: Metadata = {
  title: 'About AstroGTM — Curated GTM Tools by Operators, for Operators',
  description: 'AstroGTM is a community of 50+ proven product managers, growth operators, and founders curating tools that genuinely move the needle for real-world startups.',
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: 'About AstroGTM',
    description: 'Curated GTM tools by operators, for operators. No bloat. No affiliate spin.',
    url: `${SITE_URL}/about`,
    type: 'website',
  },
};

const STATS = [
  { value: '50+', label: 'Operators & Founders', icon: Users },
  { value: '1,000+', label: 'Teams Interviewed', icon: Globe },
  { value: '500+', label: 'Tools Evaluated', icon: Layers },
  { value: '0→10x', label: 'Growth Journeys Covered', icon: TrendingUp },
];

const FOCUS_AREAS = [
  { icon: Rocket, label: 'Product-Led Growth' },
  { icon: Megaphone, label: 'Outbound & Lead Generation' },
  { icon: Search, label: 'Content & SEO' },
  { icon: Zap, label: 'GTM Automation' },
  { icon: BarChart2, label: 'Analytics & Insights' },
  { icon: Share2, label: 'Social & Distribution' },
  { icon: Target, label: 'AI Workflows' },
  { icon: Globe, label: 'Creator Tooling' },
];

const EDITORIAL_LENS = [
  'Would we personally use this?',
  'Would we recommend it to another founder or GTM team?',
  'Does it genuinely solve a painful workflow problem?',
  'Is it practical, scalable, and cost-efficient?',
  'Can it help teams grow smarter, not just spend more?',
];

const WHAT_TEAMS_NEED = [
  { label: 'Practical recommendations', desc: 'Grounded in real workflows, not theoretical use cases.' },
  { label: 'Proven workflows', desc: 'Tested by operators who have been in the trenches.' },
  { label: 'Trustworthy tools', desc: 'Selected for signal, not affiliate incentive.' },
  { label: 'Real tradeoffs', desc: 'Honest about limitations, not just feature lists.' },
];

const WHO_WE_SERVE = [
  'Solo founders', 'Indie hackers', 'Startup GTM leads',
  'Growth marketers', 'Lean product teams', 'Agency operators',
];

const GROUNDED_IN = [
  'Hands-on workflow analysis',
  'Real operator experience',
  'Founder feedback',
  'Product positioning',
  'Pricing transparency',
  'Practical usability',
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col">
      <SiteHeader />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(145deg, rgba(176,228,255,0.18) 0%, rgba(255,255,255,0) 60%)' }}
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-[11px] font-semibold text-sky-700 uppercase tracking-widest mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            Operator-Curated · Editorial-First
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight tracking-tight max-w-3xl mb-5">
            Built by operators who've done the work.
            <span className="text-sky-600"> Not a tools directory.</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-2xl">
            AstroGTM is a close-knit community of <strong className="text-slate-700 font-semibold">50+ proven 0→1→10x product managers, growth operators, founders, and GTM leaders</strong> curating the best tools that have genuinely worked for us across real-world startups and growth teams.
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-20 space-y-10">

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STATS.map(({ value, label, icon: Icon }) => (
            <div
              key={label}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl mb-3"
                style={{ background: 'linear-gradient(145deg, #B0E4FF 0%, #cceeff 100%)' }}>
                <Icon className="w-4 h-4 text-sky-700" />
              </div>
              <p className="text-2xl font-bold text-slate-900 tabular-nums leading-none">{value}</p>
              <p className="text-[11px] text-slate-500 mt-1.5 font-medium leading-snug">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Why we built this ── */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 sm:px-8 py-5 border-b border-slate-100"
            style={{ background: 'linear-gradient(145deg, rgba(176,228,255,0.10) 0%, rgba(255,255,255,1) 60%)' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-5 rounded-full bg-sky-500 shrink-0" />
              <h2 className="text-[15px] font-bold text-slate-900 tracking-tight">Why We Built AstroGTM</h2>
            </div>
          </div>
          <div className="px-6 sm:px-8 py-6 space-y-4 text-[14px] text-slate-600 leading-[1.8]">
            <p>
              The internet is now flooded with AI tools, launch platforms, and growth software — but very little <strong className="text-slate-800 font-semibold">signal</strong> exists around what actually works when you're trying to grow a product from zero users to meaningful traction.
            </p>
            <p>
              AI has made it dramatically easier to build and launch products. It has also made distribution, automation, outreach, content creation, and experimentation more accessible than ever before.
            </p>
            <div className="bg-sky-50 border border-sky-100 rounded-xl px-5 py-4 my-2">
              <p className="text-[14px] font-semibold text-sky-800 leading-relaxed">
                But after speaking with and evaluating workflows across 1,000+ founders, operators, and teams, one challenge keeps repeating:
              </p>
              <p className="text-[15px] font-bold text-slate-900 mt-2">
                Growing consistently without burning massive budgets on ads is still incredibly difficult.
              </p>
            </div>
            <p>
              Most teams don't need more "Top 100 AI Tools" lists. They need curated stacks that actually help acquire users, automate GTM, improve conversions, and scale efficiently.
            </p>
          </div>
        </div>

        {/* ── What Teams Need ── */}
        <div>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-1 h-5 rounded-full bg-sky-500 shrink-0" />
            <h2 className="text-[15px] font-bold text-slate-900 tracking-tight">What Teams Actually Need</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {WHAT_TEAMS_NEED.map(({ label, desc }) => (
              <div key={label} className="group bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm hover:border-sky-200 hover:shadow-md transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: 'linear-gradient(145deg, #B0E4FF 0%, #cceeff 100%)' }}>
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-[13px] text-slate-900 mb-0.5">{label}</p>
                    <p className="text-[12px] text-slate-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Editorial Lens + Focus Areas (2-col) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Editorial lens */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100"
              style={{ background: 'linear-gradient(145deg, rgba(176,228,255,0.10) 0%, rgba(255,255,255,1) 60%)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-1 h-5 rounded-full bg-sky-500 shrink-0" />
                <h2 className="text-[15px] font-bold text-slate-900 tracking-tight">Our Editorial Lens</h2>
              </div>
              <p className="text-[12px] text-slate-400 mt-1 ml-[14px]">Every tool is selected against these criteria</p>
            </div>
            <ul className="divide-y divide-slate-100">
              {EDITORIAL_LENS.map((item, i) => (
                <li key={i} className="flex items-start gap-3 px-6 py-3.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-sky-100 text-sky-700 text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-[13px] text-slate-700 leading-relaxed">{item}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Focus areas */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100"
              style={{ background: 'linear-gradient(145deg, rgba(176,228,255,0.10) 0%, rgba(255,255,255,1) 60%)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-1 h-5 rounded-full bg-sky-500 shrink-0" />
                <h2 className="text-[15px] font-bold text-slate-900 tracking-tight">What We Cover</h2>
              </div>
              <p className="text-[12px] text-slate-400 mt-1 ml-[14px]">Our core focus areas across the GTM stack</p>
            </div>
            <div className="p-5 grid grid-cols-2 gap-2">
              {FOCUS_AREAS.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 hover:border-sky-200 hover:bg-sky-50/40 transition-colors">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'linear-gradient(145deg, #B0E4FF 0%, #cceeff 100%)' }}>
                    <Icon className="w-3.5 h-3.5 text-sky-700" />
                  </div>
                  <span className="text-[12px] font-medium text-slate-700 leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Grounded In ── */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 sm:px-8 py-5 border-b border-slate-100"
            style={{ background: 'linear-gradient(145deg, rgba(176,228,255,0.10) 0%, rgba(255,255,255,1) 60%)' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-5 rounded-full bg-sky-500 shrink-0" />
              <h2 className="text-[15px] font-bold text-slate-900 tracking-tight">Our Recommendations Are Grounded In</h2>
            </div>
          </div>
          <div className="px-6 sm:px-8 py-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {GROUNDED_IN.map((item) => (
              <div key={item} className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                <span className="text-[12px] font-medium text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Who We Serve ── */}
        <div>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-1 h-5 rounded-full bg-sky-500 shrink-0" />
            <h2 className="text-[15px] font-bold text-slate-900 tracking-tight">Who We Serve</h2>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {WHO_WE_SERVE.map((role) => (
              <span
                key={role}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 text-[13px] font-medium text-slate-700 shadow-sm hover:border-sky-200 hover:bg-sky-50/40 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                {role}
              </span>
            ))}
          </div>
        </div>

        {/* ── Mission CTA ── */}
        <div
          className="rounded-2xl overflow-hidden border border-sky-200/60 shadow-md"
          style={{ background: 'linear-gradient(145deg, rgba(176,228,255,0.22) 0%, rgba(255,255,255,1) 65%)' }}
        >
          <div className="px-6 sm:px-10 py-10 sm:py-12">
            <p className="text-[10px] font-bold uppercase tracking-widest text-sky-600 mb-3">Our Mission</p>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug max-w-xl mb-4">
              We are not a generic software directory.
            </h2>
            <p className="text-[14px] text-slate-600 leading-[1.8] max-w-2xl mb-6">
              AstroGTM is designed to become a <strong className="text-slate-800 font-semibold">trusted recommendation layer</strong> for modern growth teams navigating the AI-first internet. Our goal is simple: help you discover tools that actually move the needle — without wasting months testing bloated software or overspending on paid acquisition.
            </p>
            <div className="bg-white/70 border border-sky-100 rounded-xl px-5 py-4 inline-block max-w-xl">
              <p className="text-[14px] font-semibold text-slate-800 leading-relaxed">
                The future belongs to fast-moving teams with strong distribution.
              </p>
              <p className="text-[13px] text-sky-700 font-medium mt-1 flex items-center gap-1.5">
                We&apos;re here to help you build that stack.
                <ArrowRight className="w-3.5 h-3.5" />
              </p>
            </div>
          </div>
        </div>

      </main>

      <SiteFooter />
    </div>
  );
}
