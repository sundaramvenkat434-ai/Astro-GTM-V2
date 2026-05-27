'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Search, Calendar, Clock, ArrowRight, ChevronRight,
  BookOpen, TrendingUp, Zap, Mail, Send,
  CircleCheck as CheckCircle2, ChartBar as BarChart3, Target,
  Lightbulb, MessageSquare, ChevronDown, Star, Users,
  FileText, Gift, Heart, Sparkles,
} from 'lucide-react';

/* ─── Gifaa-style brand logo (script + serif) ────────────── */
function GifaaLogo({ size = 28, light = false }: { size?: number; light?: boolean }) {
  return (
    <svg width={size * 2.8} height={size} viewBox="0 0 112 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text
        x="4"
        y="30"
        fontFamily="'Georgia', 'Times New Roman', serif"
        fontSize="28"
        fontStyle="italic"
        fontWeight="700"
        letterSpacing="-0.5"
        fill={light ? '#ffffff' : '#1a2a4a'}
      >
        gifaa
      </text>
      <circle cx="100" cy="14" r="3" fill="#c9a84c" />
    </svg>
  );
}

/* ─── Color tokens (navy + gold + warm cream) ─────────────── */
const COLORS = {
  navy: '#1a2a4a',
  navyLight: '#2d4a7a',
  gold: '#c9a84c',
  goldLight: '#e8d5a0',
  cream: '#faf8f4',
  warmGray: '#6b7280',
  border: '#e5e1d8',
};

/* ─── Sample article data ─────────────────────────────────── */
const SAMPLE_ARTICLE = {
  title: 'The Complete Guide to Creating Your Perfect Gift Registry in 2026',
  subtitle: 'How modern couples and families are using digital registries to simplify gifting, eliminate duplicates, and make celebrations truly personal.',
  publishDate: 'May 22, 2026',
  readTime: '12 min read',
  author: {
    name: 'Priya Sharma',
    role: 'Senior Editor, Gifaa',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=2',
  },
  heroImage: 'https://images.pexels.com/photos/1303081/pexels-photo-1303081.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&dpr=2',
  category: 'Gift Registry',
};

const TOC_ITEMS = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'why-registry', label: 'Why Use a Registry?' },
  { id: 'types', label: 'Types of Registries' },
  { id: 'how-to-create', label: 'How to Create One' },
  { id: 'best-practices', label: 'Best Practices' },
  { id: 'comparison', label: 'Platform Comparison' },
  { id: 'tips', label: 'Expert Tips' },
  { id: 'faqs', label: 'FAQs' },
];

const RELATED_ARTICLES = [
  {
    title: 'Wedding Registry Etiquette: The Modern Rules Everyone Should Know',
    category: 'Weddings',
    date: 'May 18, 2026',
    readTime: '8 min',
    image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=2',
  },
  {
    title: 'Baby Shower Gifts That New Parents Actually Want',
    category: 'Baby Showers',
    date: 'May 14, 2026',
    readTime: '10 min',
    image: 'https://images.pexels.com/photos/3661272/pexels-photo-3661272.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=2',
  },
  {
    title: 'Housewarming Gift Ideas: From Classic to Creative',
    category: 'Housewarming',
    date: 'May 10, 2026',
    readTime: '7 min',
    image: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=2',
  },
];

const FAQ_ITEMS = [
  {
    q: 'How does a digital gift registry work?',
    a: 'A digital gift registry lets you curate items from any online store into a single wishlist. Share the link with guests, and they can purchase gifts directly — shipped to your address or contributed as cash funds.',
  },
  {
    q: 'Can I add items from multiple stores?',
    a: 'Yes! Modern registries like Gifaa allow you to add products from Amazon, Tata Cliq, Nykaa, Westside, and any other online store. Simply paste the product URL to add it.',
  },
  {
    q: 'Is it rude to share a gift registry?',
    a: 'Not at all. Guests appreciate knowing exactly what you want. It eliminates guesswork, prevents duplicates, and ensures you receive gifts you truly need and love.',
  },
  {
    q: 'How do cash fund contributions work?',
    a: 'Guests can contribute any amount via UPI directly to your account. No middlemen, no holding periods — the money goes straight to you instantly.',
  },
  {
    q: 'Can I keep my registry private?',
    a: 'Absolutely. Your registry is only accessible to people you share the link with. It is not indexed by search engines or visible to the public.',
  },
];

const COMPARISON_DATA = [
  { platform: 'Universal Registry', stores: 'Any Store', cashFund: 'Yes', upi: 'Yes', fee: '0%' },
  { platform: 'Single-Store Registry', stores: '1 Store Only', cashFund: 'No', upi: 'No', fee: 'Varies' },
  { platform: 'Cash-Only App', stores: 'None', cashFund: 'Yes', upi: 'Yes', fee: '2-5%' },
  { platform: 'Social Wishlist', stores: 'Limited', cashFund: 'No', upi: 'No', fee: '0%' },
];

/* ─── Page Component ──────────────────────────────────────── */
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
    <div className="min-h-screen" style={{ background: COLORS.cream, fontFamily: "'DM Sans', 'Inter', sans-serif" }}>

      {/* ── Sticky Navbar ── */}
      <header className="sticky top-0 z-50 border-b" style={{ background: '#ffffff', borderColor: COLORS.border }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <Link href="/articles" className="flex items-center shrink-0">
              <GifaaLogo size={26} />
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {['Occasions', 'How It Works', 'Find a Registry', 'FAQs', 'Blog'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-sm font-medium transition-colors"
                  style={{ color: item === 'Blog' ? COLORS.navy : COLORS.warmGray }}
                >
                  {item}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border" style={{ borderColor: COLORS.border }}>
                <Search className="w-4 h-4" style={{ color: COLORS.warmGray }} />
                <span className="text-sm" style={{ color: COLORS.warmGray }}>Find a registry</span>
              </div>
              <a href="#" className="text-sm font-medium" style={{ color: COLORS.navy }}>Sign in</a>
              <a
                href="#"
                className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ background: COLORS.navy }}
              >
                Create Registry
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="border-b" style={{ background: '#ffffff', borderColor: COLORS.border }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-10 sm:pb-14 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6" style={{ background: '#f5f0e6', border: `1px solid ${COLORS.goldLight}` }}>
            <Gift className="w-3.5 h-3.5" style={{ color: COLORS.gold }} />
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.gold }}>{SAMPLE_ARTICLE.category}</span>
          </div>

          <div className="flex items-center justify-center gap-4 text-sm mb-5" style={{ color: COLORS.warmGray }}>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {SAMPLE_ARTICLE.publishDate}
            </span>
            <span className="w-1 h-1 rounded-full" style={{ background: COLORS.border }} />
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {SAMPLE_ARTICLE.readTime}
            </span>
          </div>

          <h1
            className="text-2xl sm:text-3xl lg:text-[2.75rem] font-bold leading-[1.15] mb-5 max-w-3xl mx-auto"
            style={{ color: COLORS.navy, fontFamily: "'Georgia', 'Times New Roman', serif", letterSpacing: '-0.02em' }}
          >
            {SAMPLE_ARTICLE.title}
          </h1>

          <p className="text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-8" style={{ color: COLORS.warmGray }}>
            {SAMPLE_ARTICLE.subtitle}
          </p>

          <div className="flex items-center justify-center gap-3">
            <img
              src={SAMPLE_ARTICLE.author.avatar}
              alt={SAMPLE_ARTICLE.author.name}
              className="w-10 h-10 rounded-full object-cover border-2 shadow-md"
              style={{ borderColor: COLORS.goldLight }}
            />
            <div className="text-left">
              <p className="text-sm font-semibold" style={{ color: COLORS.navy }}>{SAMPLE_ARTICLE.author.name}</p>
              <p className="text-xs" style={{ color: COLORS.warmGray }}>{SAMPLE_ARTICLE.author.role}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Image ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2">
        <div className="rounded-2xl overflow-hidden shadow-xl border" style={{ borderColor: COLORS.border }}>
          <img
            src={SAMPLE_ARTICLE.heroImage}
            alt="Gift Registry Guide"
            className="w-full h-[240px] sm:h-[360px] lg:h-[420px] object-cover"
          />
        </div>
      </div>

      {/* ── Two-Column Content Area ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">

          {/* ── Left Sidebar ── */}
          <aside className="lg:w-[260px] shrink-0">
            <div className="lg:sticky lg:top-24 space-y-8">
              {/* Table of Contents */}
              <nav className="rounded-xl border p-5" style={{ background: '#ffffff', borderColor: COLORS.border }}>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: COLORS.warmGray }}>
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
                        className="block text-sm py-1.5 px-3 rounded-lg transition-all duration-150"
                        style={{
                          color: activeSection === item.id ? COLORS.navy : COLORS.warmGray,
                          fontWeight: activeSection === item.id ? 600 : 400,
                          background: activeSection === item.id ? '#f5f0e6' : 'transparent',
                          borderLeft: activeSection === item.id ? `2px solid ${COLORS.gold}` : '2px solid transparent',
                        }}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Sidebar CTA Form */}
              <div className="rounded-xl border p-5" style={{ background: '#ffffff', borderColor: COLORS.gold + '40' }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#f5f0e6' }}>
                    <Mail className="w-4 h-4" style={{ color: COLORS.gold }} />
                  </div>
                  <h4 className="text-sm font-bold" style={{ color: COLORS.navy }}>Gifting Tips</h4>
                </div>
                <p className="text-xs leading-relaxed mb-4" style={{ color: COLORS.warmGray }}>
                  Weekly inspiration for celebrations. Join 5,000+ happy gifters.
                </p>
                {sidebarSubmitted ? (
                  <div className="flex items-center gap-2 text-sm font-medium py-2" style={{ color: '#16a34a' }}>
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
                      className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 placeholder-gray-400"
                      style={{ borderColor: COLORS.border }}
                    />
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
                      style={{ background: COLORS.navy }}
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
            <div className="max-w-none">

              {/* Introduction */}
              <section id="introduction" data-section>
                <p className="text-lg leading-[1.8] mb-6" style={{ color: '#374151' }}>
                  Gift registries have evolved far beyond the traditional department store model. Today, modern registries let you curate items from any online store, accept cash contributions via UPI, and share your wishlist with a single link — no middlemen, no complications.
                </p>
                <p className="text-base leading-[1.8] mb-6" style={{ color: '#4b5563' }}>
                  Whether you&apos;re planning a wedding, expecting a baby, or moving into a new home, this guide covers everything you need to know about creating a registry that truly reflects your needs and makes gifting effortless for your loved ones.
                </p>
              </section>

              {/* Why Use a Registry */}
              <section id="why-registry" data-section className="mt-12">
                <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-3" style={{ color: COLORS.navy, fontFamily: "'Georgia', serif" }}>
                  <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#f5f0e6' }}>
                    <Heart className="w-5 h-5" style={{ color: COLORS.gold }} />
                  </span>
                  Why Use a Gift Registry?
                </h2>
                <p className="text-base leading-[1.8] mb-6" style={{ color: '#4b5563' }}>
                  The numbers speak for themselves. Couples and families who use registries report significantly better gifting experiences for both themselves and their guests.
                </p>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  {[
                    { value: '92%', label: 'Guests prefer buying from a list', icon: <Users className="w-5 h-5" /> },
                    { value: '0%', label: 'Duplicate gifts received', icon: <CheckCircle2 className="w-5 h-5" /> },
                    { value: '3 min', label: 'Average setup time', icon: <Zap className="w-5 h-5" /> },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl border p-5 text-center" style={{ background: '#ffffff', borderColor: COLORS.border }}>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3" style={{ background: '#f5f0e6', color: COLORS.gold }}>
                        {stat.icon}
                      </div>
                      <p className="text-2xl font-extrabold mb-1" style={{ color: COLORS.navy }}>{stat.value}</p>
                      <p className="text-xs font-medium" style={{ color: COLORS.warmGray }}>{stat.label}</p>
                    </div>
                  ))}
                </div>

                <ul className="space-y-3 mb-6">
                  {[
                    'Eliminates awkward duplicate gifts and unwanted items',
                    'Guests can contribute any amount to cash funds via UPI',
                    'Items from any store — Amazon, Nykaa, Westside, and more',
                    'Direct shipping to your address with no middleman fees',
                    'Private link sharing — only visible to people you invite',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-base leading-relaxed" style={{ color: '#4b5563' }}>
                      <ChevronRight className="w-4 h-4 mt-1 shrink-0" style={{ color: COLORS.gold }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Types of Registries */}
              <section id="types" data-section className="mt-12">
                <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-3" style={{ color: COLORS.navy, fontFamily: "'Georgia', serif" }}>
                  <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#f5f0e6' }}>
                    <Gift className="w-5 h-5" style={{ color: COLORS.gold }} />
                  </span>
                  Types of Gift Registries
                </h2>

                <div className="space-y-6 mb-8">
                  {[
                    {
                      num: '01',
                      title: 'Wedding Registry',
                      desc: 'The most popular registry type. Curate everything from kitchen appliances to honeymoon funds. Share with wedding invites and let guests pick what fits their budget.',
                    },
                    {
                      num: '02',
                      title: 'Baby Shower Registry',
                      desc: 'List exactly what you need for the new arrival — from cribs and strollers to diapers and clothing. Prevent duplicates and ensure you get the right sizes and brands.',
                    },
                    {
                      num: '03',
                      title: 'Housewarming Registry',
                      desc: 'Moving into a new home? Create a list of items you actually need — furniture, decor, kitchen essentials, and smart home devices.',
                    },
                    {
                      num: '04',
                      title: 'Birthday & Anniversary',
                      desc: 'For milestone celebrations where guests want to contribute meaningfully. Combine product wishes with experience funds and charity donations.',
                    },
                  ].map((item) => (
                    <div key={item.num} className="flex gap-4 p-5 rounded-xl border transition-all hover:shadow-sm" style={{ background: '#ffffff', borderColor: COLORS.border }}>
                      <span className="text-2xl font-extrabold shrink-0 leading-none mt-0.5" style={{ color: COLORS.goldLight }}>{item.num}</span>
                      <div>
                        <h3 className="text-base font-bold mb-1.5" style={{ color: COLORS.navy }}>{item.title}</h3>
                        <p className="text-sm leading-relaxed" style={{ color: COLORS.warmGray }}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* How to Create */}
              <section id="how-to-create" data-section className="mt-12">
                <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-3" style={{ color: COLORS.navy, fontFamily: "'Georgia', serif" }}>
                  <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#f5f0e6' }}>
                    <Sparkles className="w-5 h-5" style={{ color: COLORS.gold }} />
                  </span>
                  How to Create Your Registry
                </h2>

                <p className="text-base leading-[1.8] mb-6" style={{ color: '#4b5563' }}>
                  Creating a registry takes just minutes. Follow these simple steps to set up a beautiful, shareable wishlist:
                </p>

                {/* Step image */}
                <div className="rounded-xl overflow-hidden border mb-8" style={{ borderColor: COLORS.border }}>
                  <img
                    src="https://images.pexels.com/photos/6214476/pexels-photo-6214476.jpeg?auto=compress&cs=tinysrgb&w=900&h=400&dpr=2"
                    alt="Creating a gift registry"
                    className="w-full h-[200px] sm:h-[280px] object-cover"
                  />
                </div>

                <div className="space-y-4 mb-8">
                  {[
                    { step: 'Step 1: Sign Up', desc: 'Create your free account in seconds. No credit card required — just your email and a password.' },
                    { step: 'Step 2: Add Items', desc: 'Paste product URLs from any online store or browse curated collections. Add cash fund goals for experiences.' },
                    { step: 'Step 3: Customize', desc: 'Add a personal message, upload a cover photo, and set your shipping address (kept private from guests).' },
                    { step: 'Step 4: Share', desc: 'Get your unique registry link. Share via WhatsApp, email, or include in your event invitations.' },
                  ].map((phase) => (
                    <div key={phase.step} className="p-5 rounded-xl border" style={{ background: '#ffffff', borderColor: COLORS.border }}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold" style={{ color: COLORS.navy }}>{phase.step}</h4>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: COLORS.warmGray }}>{phase.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Best Practices */}
              <section id="best-practices" data-section className="mt-12">
                <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-3" style={{ color: COLORS.navy, fontFamily: "'Georgia', serif" }}>
                  <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#f5f0e6' }}>
                    <Lightbulb className="w-5 h-5" style={{ color: COLORS.gold }} />
                  </span>
                  Best Practices
                </h2>
                <p className="text-base leading-[1.8] mb-6" style={{ color: '#4b5563' }}>
                  Follow these tips to create a registry that your guests will love and that ensures you get exactly what you need:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {[
                    { tip: 'Vary price ranges', detail: 'Include items from affordable to premium so every guest finds something in budget' },
                    { tip: 'Add a cash fund', detail: 'Some guests prefer giving money — make it easy with a UPI-linked fund' },
                    { tip: 'Update regularly', detail: 'Remove purchased items and add new ones to keep the list fresh' },
                    { tip: 'Share early', detail: 'Give guests time to browse. Share your registry 4-6 weeks before the event' },
                    { tip: 'Write thank-you notes', detail: 'Track who gave what and send personalized thank-you messages' },
                    { tip: 'Keep it focused', detail: 'Quality over quantity — 30-50 items is the sweet spot for most celebrations' },
                  ].map((m) => (
                    <div key={m.tip} className="flex items-start gap-3 p-4 rounded-xl border" style={{ background: '#ffffff', borderColor: COLORS.border }}>
                      <Star className="w-4 h-4 mt-0.5 shrink-0" style={{ color: COLORS.gold }} />
                      <div>
                        <p className="text-sm font-bold mb-0.5" style={{ color: COLORS.navy }}>{m.tip}</p>
                        <p className="text-xs" style={{ color: COLORS.warmGray }}>{m.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Platform Comparison Table */}
              <section id="comparison" data-section className="mt-12">
                <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-3" style={{ color: COLORS.navy, fontFamily: "'Georgia', serif" }}>
                  <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#f5f0e6' }}>
                    <BarChart3 className="w-5 h-5" style={{ color: COLORS.gold }} />
                  </span>
                  Platform Comparison
                </h2>
                <p className="text-base leading-[1.8] mb-6" style={{ color: '#4b5563' }}>
                  Not all registries are created equal. Here&apos;s how different approaches compare:
                </p>

                <div className="overflow-x-auto mb-8 rounded-xl border" style={{ borderColor: COLORS.border }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: '#f5f0e6' }}>
                        <th className="text-left px-4 py-3 font-semibold" style={{ color: COLORS.navy }}>Platform Type</th>
                        <th className="text-left px-4 py-3 font-semibold" style={{ color: COLORS.navy }}>Stores</th>
                        <th className="text-center px-4 py-3 font-semibold" style={{ color: COLORS.navy }}>Cash Fund</th>
                        <th className="text-center px-4 py-3 font-semibold" style={{ color: COLORS.navy }}>UPI</th>
                        <th className="text-center px-4 py-3 font-semibold" style={{ color: COLORS.navy }}>Fee</th>
                      </tr>
                    </thead>
                    <tbody>
                      {COMPARISON_DATA.map((row, i) => (
                        <tr key={row.platform} style={{ background: i % 2 === 0 ? '#ffffff' : COLORS.cream, borderTop: `1px solid ${COLORS.border}` }}>
                          <td className="px-4 py-3 font-medium" style={{ color: COLORS.navy }}>{row.platform}</td>
                          <td className="px-4 py-3" style={{ color: COLORS.warmGray }}>{row.stores}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              row.cashFund === 'Yes' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {row.cashFund}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              row.upi === 'Yes' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {row.upi}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center font-semibold" style={{ color: row.fee === '0%' ? '#16a34a' : COLORS.warmGray }}>{row.fee}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Expert Tips */}
              <section id="tips" data-section className="mt-12">
                <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-3" style={{ color: COLORS.navy, fontFamily: "'Georgia', serif" }}>
                  <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#f5f0e6' }}>
                    <TrendingUp className="w-5 h-5" style={{ color: COLORS.gold }} />
                  </span>
                  Expert Tips
                </h2>

                <div className="space-y-6 mb-8">
                  <div className="rounded-xl border p-6" style={{ background: '#ffffff', borderColor: COLORS.border }}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#f5f0e6', color: COLORS.gold }}>Wedding</span>
                    </div>
                    <h4 className="text-base font-bold mb-2" style={{ color: COLORS.navy }}>Make It Personal, Not Transactional</h4>
                    <p className="text-sm leading-relaxed mb-4" style={{ color: COLORS.warmGray }}>
                      Add a heartfelt note explaining why certain items matter to you. When guests understand the story behind a wish, they feel more connected to the gift. A simple &quot;This reminds us of our first trip together&quot; transforms a generic item into a meaningful gesture.
                    </p>
                    <div className="flex items-center gap-4 text-xs font-medium" style={{ color: COLORS.warmGray }}>
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" style={{ color: COLORS.gold }} /> Personal touch</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" style={{ color: COLORS.gold }} /> Guest experience</span>
                    </div>
                  </div>

                  <div className="rounded-xl border p-6" style={{ background: '#ffffff', borderColor: COLORS.border }}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#ecfdf5', color: '#16a34a' }}>Pro Tip</span>
                    </div>
                    <h4 className="text-base font-bold mb-2" style={{ color: COLORS.navy }}>Leverage Group Gifting for Big-Ticket Items</h4>
                    <p className="text-sm leading-relaxed mb-4" style={{ color: COLORS.warmGray }}>
                      Expensive items like premium appliances or honeymoon experiences can feel daunting for individual guests. Enable group contributions so multiple people can chip in toward one meaningful gift rather than settling for smaller alternatives.
                    </p>
                    <div className="flex items-center gap-4 text-xs font-medium" style={{ color: COLORS.warmGray }}>
                      <span className="flex items-center gap-1"><Target className="w-3 h-3" style={{ color: COLORS.gold }} /> Higher value</span>
                      <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" style={{ color: '#16a34a' }} /> Inclusive</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* FAQs */}
              <section id="faqs" data-section className="mt-12">
                <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-3" style={{ color: COLORS.navy, fontFamily: "'Georgia', serif" }}>
                  <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#f5f0e6' }}>
                    <MessageSquare className="w-5 h-5" style={{ color: COLORS.gold }} />
                  </span>
                  Common Questions
                </h2>

                <div className="space-y-3 mb-8">
                  {FAQ_ITEMS.map((faq, i) => (
                    <div key={i} className="rounded-xl border overflow-hidden" style={{ borderColor: COLORS.border, background: '#ffffff' }}>
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-gray-50"
                      >
                        <span className="text-sm font-semibold" style={{ color: COLORS.navy }}>{faq.q}</span>
                        <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} style={{ color: COLORS.warmGray }} />
                      </button>
                      {openFaq === i && (
                        <div className="px-5 pb-4 text-sm leading-relaxed border-t pt-3" style={{ color: COLORS.warmGray, borderColor: COLORS.border }}>
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Related Articles */}
              <section className="mt-16 pt-10 border-t" style={{ borderColor: COLORS.border }}>
                <h3 className="text-lg font-bold mb-6" style={{ color: COLORS.navy, fontFamily: "'Georgia', serif" }}>Related Articles</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {RELATED_ARTICLES.map((article) => (
                    <div key={article.title} className="group rounded-xl border overflow-hidden hover:shadow-md transition-all cursor-pointer" style={{ borderColor: COLORS.border, background: '#ffffff' }}>
                      <div className="h-36 overflow-hidden">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: COLORS.gold }}>{article.category}</span>
                        <h4 className="text-sm font-bold leading-snug mb-2 transition-colors line-clamp-2" style={{ color: COLORS.navy }}>
                          {article.title}
                        </h4>
                        <div className="flex items-center gap-3 text-xs" style={{ color: COLORS.warmGray }}>
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
      <section className="border-t" style={{ background: COLORS.navy, borderColor: '#2d4a7a' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* CTA Copy */}
            <div className="flex-1 text-center lg:text-left">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5" style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)' }}>
                <Gift className="w-3.5 h-3.5" style={{ color: COLORS.gold }} />
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: COLORS.gold }}>Free Forever</span>
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight mb-4" style={{ color: '#ffffff', fontFamily: "'Georgia', serif" }}>
                Your Wishlist,
                <br />
                <span style={{ color: COLORS.gold, fontStyle: 'italic' }}>Zero Middlemen.</span>
              </h2>
              <p className="text-base leading-relaxed max-w-md mx-auto lg:mx-0 mb-6" style={{ color: '#94a3b8' }}>
                Create your registry in minutes. Add items from any store, accept UPI payments directly, and make celebrations effortless for everyone.
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm" style={{ color: '#94a3b8' }}>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" style={{ color: COLORS.gold }} />No fees</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" style={{ color: COLORS.gold }} />Direct UPI settlement</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" style={{ color: COLORS.gold }} />Any store</span>
              </div>
            </div>

            {/* CTA Form */}
            <div className="w-full max-w-md">
              <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {ctaSubmitted ? (
                  <div className="text-center py-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ background: COLORS.gold }}>
                      <CheckCircle2 className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1.5">Welcome!</h3>
                    <p className="text-sm" style={{ color: '#94a3b8' }}>Check your inbox to get started with your registry.</p>
                  </div>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); if (ctaEmail.trim()) setCtaSubmitted(true); }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>Full Name</label>
                      <input
                        type="text"
                        placeholder="Your name"
                        className="w-full px-4 py-3 text-sm rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>Email</label>
                      <input
                        type="email"
                        required
                        value={ctaEmail}
                        onChange={(e) => setCtaEmail(e.target.value)}
                        placeholder="you@email.com"
                        className="w-full px-4 py-3 text-sm rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>Occasion</label>
                      <select
                        className="w-full px-4 py-3 text-sm rounded-xl focus:outline-none focus:ring-2 appearance-none"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#94a3b8' }}
                      >
                        <option value="">Select occasion...</option>
                        <option value="wedding">Wedding</option>
                        <option value="baby">Baby Shower</option>
                        <option value="housewarming">Housewarming</option>
                        <option value="birthday">Birthday</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                      style={{ background: COLORS.gold }}
                    >
                      Create Your Registry
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
      <footer className="border-t" style={{ background: '#0f1b33', borderColor: '#1e3a5f' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Brand column */}
            <div className="col-span-2 sm:col-span-4 lg:col-span-1 mb-4 lg:mb-0">
              <GifaaLogo size={24} light />
              <p className="text-sm leading-relaxed mt-3 max-w-xs" style={{ color: '#64748b' }}>
                India&apos;s premier gift registry platform. Making every celebration more thoughtful, organized, and joyful.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: COLORS.gold }}>Product</h4>
              <ul className="space-y-2.5">
                <li><a href="#" className="text-sm transition-colors hover:text-white" style={{ color: '#64748b' }}>How It Works</a></li>
                <li><a href="#" className="text-sm transition-colors hover:text-white" style={{ color: '#64748b' }}>Features</a></li>
                <li><a href="#" className="text-sm transition-colors hover:text-white" style={{ color: '#64748b' }}>Pricing</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: COLORS.gold }}>Company</h4>
              <ul className="space-y-2.5">
                <li><a href="#" className="text-sm transition-colors hover:text-white" style={{ color: '#64748b' }}>About Us</a></li>
                <li><a href="#" className="text-sm transition-colors hover:text-white" style={{ color: '#64748b' }}>Careers</a></li>
                <li><a href="#" className="text-sm transition-colors hover:text-white" style={{ color: '#64748b' }}>Contact Us</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: COLORS.gold }}>Legal</h4>
              <ul className="space-y-2.5">
                <li><a href="#" className="text-sm transition-colors hover:text-white" style={{ color: '#64748b' }}>Privacy Policy</a></li>
                <li><a href="#" className="text-sm transition-colors hover:text-white" style={{ color: '#64748b' }}>Terms</a></li>
                <li><a href="#" className="text-sm transition-colors hover:text-white" style={{ color: '#64748b' }}>Refunds</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: COLORS.gold }}>Support</h4>
              <ul className="space-y-2.5">
                <li><a href="#" className="text-sm transition-colors hover:text-white" style={{ color: '#64748b' }}>Help Center</a></li>
                <li><a href="#" className="text-sm transition-colors hover:text-white" style={{ color: '#64748b' }}>FAQs</a></li>
                <li><a href="#" className="text-sm transition-colors hover:text-white" style={{ color: '#64748b' }}>Community</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: '1px solid #1e3a5f' }}>
            <p className="text-xs" style={{ color: '#475569' }}>&copy; {new Date().getFullYear()} Gifaa. All rights reserved.</p>
            <p className="text-xs" style={{ color: '#475569' }}>
              Made with <span style={{ color: COLORS.gold }}>&#9829;</span> in India
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
