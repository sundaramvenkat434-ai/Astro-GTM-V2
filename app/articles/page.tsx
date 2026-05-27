'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, Calendar, Clock, User, ArrowRight, ChevronRight, BookOpen, TrendingUp, Zap, Mail, Send, CircleCheck as CheckCircle2, ChartBar as BarChart3, Target, Lightbulb, MessageSquare, ChevronDown, ExternalLink, Star, Users, Rocket, FileText } from 'lucide-react';
import { AstroGTMLogo } from '@/components/site-header';

/* ─── sample article data ─────────────────────────────────── */
const SAMPLE_ARTICLE = {
  title: 'The Complete Guide to AI-Powered Go-To-Market Strategy in 2026',
  subtitle: 'How leading B2B teams are leveraging artificial intelligence to accelerate pipeline, reduce CAC, and achieve predictable revenue growth.',
  publishDate: 'May 22, 2026',
  readTime: '14 min read',
  author: {
    name: 'Sarah Chen',
    role: 'Head of Growth Research',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=2',
  },
  heroImage: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&dpr=2',
  category: 'GTM Strategy',
};

const TOC_ITEMS = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'why-ai-gtm', label: 'Why AI for GTM?' },
  { id: 'key-strategies', label: 'Key Strategies' },
  { id: 'tools-comparison', label: 'Tools Comparison' },
  { id: 'implementation', label: 'Implementation Guide' },
  { id: 'metrics', label: 'Metrics That Matter' },
  { id: 'case-studies', label: 'Case Studies' },
  { id: 'faqs', label: 'FAQs' },
];

const RELATED_ARTICLES = [
  {
    title: 'How to Build a Scalable Outbound Engine with AI SDRs',
    category: 'Sales Outreach',
    date: 'May 18, 2026',
    readTime: '9 min',
    image: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=2',
  },
  {
    title: 'SEO in the Age of AI Overviews: What GTM Teams Need to Know',
    category: 'SEO & Content',
    date: 'May 14, 2026',
    readTime: '11 min',
    image: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=2',
  },
  {
    title: 'From PLG to AI-Led Growth: The New GTM Playbook',
    category: 'Growth Strategy',
    date: 'May 10, 2026',
    readTime: '12 min',
    image: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=2',
  },
];

const FAQ_ITEMS = [
  {
    q: 'What is an AI-powered GTM strategy?',
    a: 'An AI-powered GTM strategy uses artificial intelligence tools and models to automate, optimize, and scale your go-to-market motions — from lead generation and content creation to sales outreach and customer success.',
  },
  {
    q: 'How much does it cost to implement AI GTM tools?',
    a: 'Costs vary widely. Many tools offer free tiers or trials. A typical mid-market team can expect to spend $500–$3,000/month on a stack of 3–5 AI GTM tools. Enterprise deployments can exceed $10,000/month.',
  },
  {
    q: 'Can AI replace human GTM teams?',
    a: 'No. AI augments human teams by automating repetitive tasks, surfacing insights, and enabling scale. The best results come from human-in-the-loop workflows where AI handles volume and humans handle strategy and relationships.',
  },
  {
    q: 'What metrics should I track for AI GTM success?',
    a: 'Focus on pipeline velocity, cost per qualified lead, content production efficiency, response rates, and time-to-revenue. Compare these against pre-AI baselines to measure true impact.',
  },
  {
    q: 'How long does it take to see ROI from AI GTM tools?',
    a: 'Most teams see measurable improvements within 30–60 days for outbound and content use cases. Longer-cycle strategies like SEO may take 90–180 days to show compounding returns.',
  },
];

const COMPARISON_DATA = [
  { tool: 'AI SDR Platform', useCase: 'Outbound Automation', impact: 'High', adoption: '72%' },
  { tool: 'Content AI Suite', useCase: 'SEO & Blog Creation', impact: 'High', adoption: '68%' },
  { tool: 'Predictive Analytics', useCase: 'Lead Scoring', impact: 'Medium', adoption: '54%' },
  { tool: 'Conversation Intel', useCase: 'Sales Coaching', impact: 'Medium', adoption: '47%' },
  { tool: 'ABM Orchestration', useCase: 'Account Targeting', impact: 'High', adoption: '41%' },
];

/* ─── page component ──────────────────────────────────────── */
export default function ArticlesPage() {
  const [activeSection, setActiveSection] = useState('introduction');
  const [ctaEmail, setCtaEmail] = useState('');
  const [ctaSubmitted, setCtaSubmitted] = useState(false);
  const [sidebarEmail, setSidebarEmail] = useState('');
  const [sidebarSubmitted, setSidebarSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 }
    );

    const sections = document.querySelectorAll('[data-section]');
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* ── Sticky Navbar ── */}
      <header className="bg-white/95 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <Link href="/" className="flex items-center shrink-0">
              <AstroGTMLogo size={36} />
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Tools</Link>
              <Link href="/articles" className="text-sm font-semibold text-sky-700 transition-colors">Articles</Link>
              <Link href="/about" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">About</Link>
              <Link href="/contact" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Contact</Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/contact"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)' }}
              >
                <Rocket className="w-3.5 h-3.5" />
                Submit Tool
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-10 sm:pb-14 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-200 mb-6">
            <BookOpen className="w-3.5 h-3.5 text-sky-600" />
            <span className="text-xs font-semibold text-sky-700 uppercase tracking-wide">{SAMPLE_ARTICLE.category}</span>
          </div>

          <div className="flex items-center justify-center gap-4 text-sm text-slate-500 mb-5">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {SAMPLE_ARTICLE.publishDate}
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {SAMPLE_ARTICLE.readTime}
            </span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl lg:text-[2.75rem] font-extrabold text-slate-900 leading-[1.15] tracking-[-0.025em] mb-5 max-w-3xl mx-auto">
            {SAMPLE_ARTICLE.title}
          </h1>

          <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto mb-8">
            {SAMPLE_ARTICLE.subtitle}
          </p>

          <div className="flex items-center justify-center gap-3">
            <img
              src={SAMPLE_ARTICLE.author.avatar}
              alt={SAMPLE_ARTICLE.author.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
            />
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-900">{SAMPLE_ARTICLE.author.name}</p>
              <p className="text-xs text-slate-500">{SAMPLE_ARTICLE.author.role}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Image ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2">
        <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200">
          <img
            src={SAMPLE_ARTICLE.heroImage}
            alt="AI-Powered GTM Strategy"
            className="w-full h-[240px] sm:h-[360px] lg:h-[420px] object-cover"
          />
        </div>
      </div>

      {/* ── Two-Column Content Area ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">

          {/* ── Left Sidebar (sticky TOC + CTA) ── */}
          <aside className="lg:w-[260px] shrink-0">
            <div className="lg:sticky lg:top-24 space-y-8">
              {/* Table of Contents */}
              <nav className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" />
                  On This Page
                </h3>
                <ul className="space-y-1">
                  {TOC_ITEMS.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`block text-sm py-1.5 px-3 rounded-lg transition-all duration-150 ${
                          activeSection === item.id
                            ? 'text-sky-700 font-semibold bg-sky-50 border-l-2 border-sky-500'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Sidebar CTA Form */}
              <div className="rounded-xl border border-sky-200 bg-gradient-to-b from-sky-50 to-white p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-sky-600" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">GTM Newsletter</h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Weekly AI tool picks and growth strategies. Join 2,400+ GTM leaders.
                </p>
                {sidebarSubmitted ? (
                  <div className="flex items-center gap-2 text-sm text-emerald-700 font-medium py-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Subscribed!
                  </div>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); if (sidebarEmail.trim()) setSidebarSubmitted(true); }} className="space-y-2">
                    <input
                      type="email"
                      required
                      value={sidebarEmail}
                      onChange={(e) => setSidebarEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-400 placeholder-slate-400"
                    />
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
                      style={{ background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)' }}
                    >
                      Subscribe
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </aside>

          {/* ── Right Content Column ── */}
          <article ref={contentRef} className="flex-1 min-w-0 max-w-3xl">
            <div className="prose prose-slate prose-lg max-w-none">

              {/* Introduction */}
              <section id="introduction" data-section>
                <p className="text-lg text-slate-600 leading-[1.8] mb-6">
                  The go-to-market landscape has fundamentally shifted. In 2026, AI is no longer a competitive advantage — it&apos;s table stakes. Teams that fail to integrate artificial intelligence into their GTM motions are falling behind at an accelerating rate.
                </p>
                <p className="text-base text-slate-600 leading-[1.8] mb-6">
                  This comprehensive guide breaks down exactly how leading B2B companies are using AI across every stage of their go-to-market strategy — from initial market research to closed-won deals and beyond. We&apos;ll cover the tools, frameworks, and metrics that matter most.
                </p>
              </section>

              {/* Why AI for GTM */}
              <section id="why-ai-gtm" data-section className="mt-12">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-6 flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-sky-100 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5 text-sky-600" />
                  </span>
                  Why AI for GTM?
                </h2>
                <p className="text-base text-slate-600 leading-[1.8] mb-6">
                  The convergence of large language models, automation platforms, and data infrastructure has created unprecedented opportunities for growth teams. Here&apos;s what the data shows:
                </p>

                {/* Infographic-style stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 not-prose">
                  {[
                    { value: '3.2x', label: 'Pipeline velocity increase', icon: <Zap className="w-5 h-5" /> },
                    { value: '47%', label: 'Reduction in CAC', icon: <Target className="w-5 h-5" /> },
                    { value: '68%', label: 'Teams adopting AI GTM', icon: <Users className="w-5 h-5" /> },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 text-center">
                      <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center mx-auto mb-3 text-sky-600">
                        {stat.icon}
                      </div>
                      <p className="text-2xl font-extrabold text-slate-900 mb-1">{stat.value}</p>
                      <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <p className="text-base text-slate-600 leading-[1.8] mb-4">
                  The shift isn&apos;t just about efficiency — it&apos;s about unlocking entirely new GTM motions that weren&apos;t possible before. Consider:
                </p>
                <ul className="space-y-3 mb-6 not-prose">
                  {[
                    'Hyper-personalized outbound at scale without sacrificing quality',
                    'Content creation velocity that matches SEO demand signals in real-time',
                    'Predictive lead scoring that surfaces intent before competitors notice',
                    'Automated competitive intelligence that feeds directly into positioning',
                    'Dynamic pricing and packaging optimized by usage patterns',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-base text-slate-600 leading-relaxed">
                      <ChevronRight className="w-4 h-4 text-sky-500 mt-1 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Key Strategies */}
              <section id="key-strategies" data-section className="mt-12">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-6 flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                    <Lightbulb className="w-5 h-5 text-emerald-600" />
                  </span>
                  Key Strategies for AI-Powered GTM
                </h2>

                <div className="space-y-6 not-prose mb-8">
                  {[
                    {
                      num: '01',
                      title: 'Signal-Based Outbound',
                      desc: 'Replace spray-and-pray with precision targeting. Use AI to monitor buying signals — job changes, tech stack updates, funding rounds, and content engagement — then trigger personalized sequences automatically.',
                    },
                    {
                      num: '02',
                      title: 'Programmatic SEO at Scale',
                      desc: 'Generate hundreds of high-quality, intent-matched pages using AI content systems. Layer in human editing for expertise signals and build topical authority faster than manual teams.',
                    },
                    {
                      num: '03',
                      title: 'AI-Augmented Sales Conversations',
                      desc: 'Deploy conversation intelligence that provides real-time coaching, surfaces competitive battlecards mid-call, and auto-generates follow-up sequences based on call themes.',
                    },
                    {
                      num: '04',
                      title: 'Predictive Revenue Operations',
                      desc: 'Use AI models to forecast pipeline with greater accuracy, identify at-risk deals before they stall, and optimize resource allocation across territories and segments.',
                    },
                  ].map((item) => (
                    <div key={item.num} className="flex gap-4 p-5 rounded-xl border border-slate-200 bg-white hover:border-sky-200 hover:shadow-sm transition-all">
                      <span className="text-2xl font-extrabold text-sky-200 shrink-0 leading-none mt-0.5">{item.num}</span>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 mb-1.5">{item.title}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Tools Comparison Table */}
              <section id="tools-comparison" data-section className="mt-12">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-6 flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                    <BarChart3 className="w-5 h-5 text-amber-600" />
                  </span>
                  Tools Comparison
                </h2>
                <p className="text-base text-slate-600 leading-[1.8] mb-6">
                  We analyzed the top AI GTM tools across five core categories. Here&apos;s how they stack up by impact and enterprise adoption rate:
                </p>

                <div className="overflow-x-auto not-prose mb-8 rounded-xl border border-slate-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left px-4 py-3 font-semibold text-slate-700">Tool Category</th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-700">Primary Use Case</th>
                        <th className="text-center px-4 py-3 font-semibold text-slate-700">Impact</th>
                        <th className="text-center px-4 py-3 font-semibold text-slate-700">Adoption</th>
                      </tr>
                    </thead>
                    <tbody>
                      {COMPARISON_DATA.map((row, i) => (
                        <tr key={row.tool} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                          <td className="px-4 py-3 font-medium text-slate-900">{row.tool}</td>
                          <td className="px-4 py-3 text-slate-600">{row.useCase}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              row.impact === 'High' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {row.impact}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center font-semibold text-slate-700">{row.adoption}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Implementation Guide */}
              <section id="implementation" data-section className="mt-12">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-6 flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-sky-100 flex items-center justify-center shrink-0">
                    <Rocket className="w-5 h-5 text-sky-600" />
                  </span>
                  Implementation Guide
                </h2>

                <p className="text-base text-slate-600 leading-[1.8] mb-6">
                  Rolling out an AI-powered GTM stack requires a phased approach. Rushing deployment without proper foundations leads to tool sprawl, data silos, and wasted budget. Follow this framework:
                </p>

                {/* Implementation image */}
                <div className="rounded-xl overflow-hidden border border-slate-200 mb-8 not-prose">
                  <img
                    src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=900&h=400&dpr=2"
                    alt="Team implementing AI GTM strategy"
                    className="w-full h-[200px] sm:h-[280px] object-cover"
                  />
                </div>

                <div className="space-y-4 not-prose mb-8">
                  {[
                    { phase: 'Phase 1: Audit & Foundation', weeks: 'Weeks 1-2', desc: 'Map existing GTM motions, identify highest-impact automation opportunities, and establish data hygiene standards.' },
                    { phase: 'Phase 2: Core Tool Deployment', weeks: 'Weeks 3-4', desc: 'Deploy 2-3 highest-priority tools. Focus on quick wins: AI writing assistants, meeting intelligence, and signal monitoring.' },
                    { phase: 'Phase 3: Integration & Workflows', weeks: 'Weeks 5-8', desc: 'Connect tools to your CRM and data warehouse. Build automated workflows that pass context between systems.' },
                    { phase: 'Phase 4: Optimization & Scale', weeks: 'Weeks 9-12', desc: 'Measure performance against baselines, A/B test configurations, and expand successful patterns across the organization.' },
                  ].map((phase) => (
                    <div key={phase.phase} className="p-5 rounded-xl border border-slate-200 bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold text-slate-900">{phase.phase}</h4>
                        <span className="text-xs font-medium text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full">{phase.weeks}</span>
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed">{phase.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Metrics */}
              <section id="metrics" data-section className="mt-12">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-6 flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
                    <BarChart3 className="w-5 h-5 text-teal-600" />
                  </span>
                  Metrics That Matter
                </h2>
                <p className="text-base text-slate-600 leading-[1.8] mb-6">
                  Track these KPIs to measure your AI GTM transformation. Focus on leading indicators that predict downstream revenue impact:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose mb-8">
                  {[
                    { metric: 'Pipeline Velocity', target: '40% increase in 90 days', category: 'Revenue' },
                    { metric: 'Content Output', target: '5x with consistent quality', category: 'Marketing' },
                    { metric: 'Response Rate', target: '2-3x improvement', category: 'Sales' },
                    { metric: 'Time to First Value', target: 'Reduce by 60%', category: 'Product' },
                    { metric: 'Cost Per Lead', target: '35-50% reduction', category: 'Finance' },
                    { metric: 'Rep Productivity', target: '25% more deals per rep', category: 'Operations' },
                  ].map((m) => (
                    <div key={m.metric} className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-white">
                      <Star className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-slate-900 mb-0.5">{m.metric}</p>
                        <p className="text-xs text-slate-500">{m.target}</p>
                        <span className="inline-block mt-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{m.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Case Studies */}
              <section id="case-studies" data-section className="mt-12">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-6 flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-sky-100 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-sky-600" />
                  </span>
                  Case Studies
                </h2>

                <div className="space-y-6 not-prose mb-8">
                  <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">B2B SaaS</span>
                      <span className="text-xs text-slate-400">Series B, 120 employees</span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 mb-2">How a Mid-Market SaaS Scaled Pipeline 4x in One Quarter</h4>
                    <p className="text-sm text-slate-500 leading-relaxed mb-4">
                      By deploying AI-powered signal detection and automated outbound sequences, this team went from 200 to 800+ qualified opportunities per quarter while reducing their SDR headcount by 30%.
                    </p>
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
                      <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-emerald-500" /> 4x pipeline</span>
                      <span className="flex items-center gap-1"><Target className="w-3 h-3 text-sky-500" /> 42% lower CAC</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-amber-500" /> 12 weeks</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">E-Commerce</span>
                      <span className="text-xs text-slate-400">D2C Brand, $15M ARR</span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 mb-2">AI-Generated Content Drove 210% Organic Traffic Growth</h4>
                    <p className="text-sm text-slate-500 leading-relaxed mb-4">
                      Combining programmatic SEO with AI-written product guides, this brand published 400+ optimized pages in 60 days — capturing long-tail intent their competitors ignored.
                    </p>
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
                      <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-emerald-500" /> 210% traffic</span>
                      <span className="flex items-center gap-1"><FileText className="w-3 h-3 text-sky-500" /> 400+ pages</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-amber-500" /> 60 days</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* FAQs */}
              <section id="faqs" data-section className="mt-12">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-6 flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5 text-slate-600" />
                  </span>
                  Frequently Asked Questions
                </h2>

                <div className="space-y-3 not-prose mb-8">
                  {FAQ_ITEMS.map((faq, i) => (
                    <div key={i} className="rounded-xl border border-slate-200 overflow-hidden">
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                      >
                        <span className="text-sm font-semibold text-slate-900">{faq.q}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
                      </button>
                      {openFaq === i && (
                        <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Related Articles */}
              <section className="mt-16 pt-10 border-t border-slate-200 not-prose">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Related Articles</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {RELATED_ARTICLES.map((article) => (
                    <div key={article.title} className="group rounded-xl border border-slate-200 overflow-hidden hover:border-sky-200 hover:shadow-md transition-all cursor-pointer">
                      <div className="h-36 overflow-hidden">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 mb-1.5 block">{article.category}</span>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug mb-2 group-hover:text-sky-700 transition-colors line-clamp-2">
                          {article.title}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span>{article.date}</span>
                          <span>{article.readTime}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </article>
        </div>
      </div>

      {/* ── Large CTA Section ── */}
      <section className="border-t border-slate-200 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* CTA Copy */}
            <div className="flex-1 text-center lg:text-left">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-900/40 border border-sky-700/50 mb-5">
                <Zap className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-xs font-semibold text-sky-300 uppercase tracking-wide">Free Resource</span>
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight mb-4">
                Get the AI GTM Toolkit
                <br />
                <span className="text-sky-400">Shipped to Your Inbox</span>
              </h2>
              <p className="text-base text-slate-400 leading-relaxed max-w-md mx-auto lg:mx-0 mb-6">
                Templates, tool recommendations, and implementation checklists used by 500+ growth teams. Updated weekly with new AI tools and strategies.
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" />No spam, ever</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" />Unsubscribe anytime</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" />2,400+ subscribers</span>
              </div>
            </div>

            {/* CTA Form */}
            <div className="w-full max-w-md">
              <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-6 sm:p-8">
                {ctaSubmitted ? (
                  <div className="text-center py-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-900/30">
                      <CheckCircle2 className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1.5">You&apos;re in!</h3>
                    <p className="text-sm text-slate-400">Check your inbox for the toolkit download link.</p>
                  </div>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); if (ctaEmail.trim()) setCtaSubmitted(true); }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                      <input
                        type="text"
                        placeholder="Jane Smith"
                        className="w-full px-4 py-3 text-sm bg-white/5 border border-white/15 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Work Email</label>
                      <input
                        type="email"
                        required
                        value={ctaEmail}
                        onChange={(e) => setCtaEmail(e.target.value)}
                        placeholder="jane@company.com"
                        className="w-full px-4 py-3 text-sm bg-white/5 border border-white/15 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Company Size</label>
                      <select className="w-full px-4 py-3 text-sm bg-white/5 border border-white/15 rounded-xl text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500/50 appearance-none">
                        <option value="">Select...</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201+">201+ employees</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                      style={{ background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #0ea5e9 100%)' }}
                    >
                      Get the Free Toolkit
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-900 border-t border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Brand column */}
            <div className="col-span-2 sm:col-span-4 lg:col-span-1 mb-4 lg:mb-0">
              <AstroGTMLogo size={32} dark />
              <p className="text-sm text-slate-400 leading-relaxed mt-3 max-w-xs">
                The expert-curated directory of AI tools for go-to-market teams. Find, compare, and adopt the best growth tools.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">Product</h4>
              <ul className="space-y-2.5">
                <li><Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">Browse Tools</Link></li>
                <li><Link href="/articles" className="text-sm text-slate-400 hover:text-white transition-colors">Articles</Link></li>
                <li><Link href="/contact" className="text-sm text-slate-400 hover:text-white transition-colors">Submit a Tool</Link></li>
                <li><Link href="/contact" className="text-sm text-slate-400 hover:text-white transition-colors">Request Review</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">Resources</h4>
              <ul className="space-y-2.5">
                <li><Link href="/articles" className="text-sm text-slate-400 hover:text-white transition-colors">GTM Guides</Link></li>
                <li><Link href="/articles" className="text-sm text-slate-400 hover:text-white transition-colors">AI Tool Reviews</Link></li>
                <li><Link href="/articles" className="text-sm text-slate-400 hover:text-white transition-colors">Case Studies</Link></li>
                <li><Link href="/articles" className="text-sm text-slate-400 hover:text-white transition-colors">Newsletter</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">Company</h4>
              <ul className="space-y-2.5">
                <li><Link href="/about" className="text-sm text-slate-400 hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="text-sm text-slate-400 hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/privacy-policy" className="text-sm text-slate-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-sm text-slate-400 hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">Connect</h4>
              <ul className="space-y-2.5">
                <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Twitter / X</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">LinkedIn</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">YouTube</a></li>
                <li><a href="/llms.txt" className="text-sm text-slate-400 hover:text-white transition-colors">llms.txt</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-8 border-t border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">© {new Date().getFullYear()} AstroGTM. All rights reserved.</p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <Link href="/privacy-policy" className="hover:text-slate-300 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
              <Link href="/contact" className="hover:text-slate-300 transition-colors">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
