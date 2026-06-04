'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronDown, ArrowLeft, Send } from 'lucide-react';
import { TenantGa } from '@/components/tenant-ga';

/* ─── FAQ Accordion ──────────────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left">
        <span className="text-[17px] font-semibold text-gray-900 pr-8">{q}</span>
        <ChevronDown className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="pb-5 text-[16px] leading-[1.8] text-gray-600">{a}</p>}
    </div>
  );
}

/* ─── Types ──────────────────────────────────────────────── */
interface Section {
  type: 'text' | 'heading' | 'image' | 'table' | 'review' | 'list';
  heading?: string;
  content?: string;
  image_url?: string;
  image_caption?: string;
  items?: string[];
  table_headers?: string[];
  table_rows?: string[][];
  reviewer_name?: string;
  reviewer_location?: string;
  review_text?: string;
  rating?: number;
}

interface FAQ {
  q: string;
  a: string;
}

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  hero_image: string;
  category: string;
  author_name: string;
  author_role: string;
  author_avatar: string;
  read_time: string;
  sections: Section[];
  faqs: FAQ[];
  published_at: string | null;
  show_toc: boolean;
  cta_heading: string;
  cta_description: string;
  cta_button_text: string;
  cta_success_message: string;
  cta_button_color: string;
  cta_redirect_url: string;
  cta_show_sidebar: boolean;
  cta_show_end: boolean;
  cta_inline_after_section: number;
}

interface RelatedArticle {
  slug: string;
  title: string;
  excerpt: string;
  hero_image: string;
  category: string;
  read_time: string;
  published_at: string | null;
}

interface TocItem {
  id: string;
  label: string;
}

function buildToc(sections: Section[], hasFaqs: boolean): TocItem[] {
  const items: TocItem[] = [];
  sections.forEach((s, i) => {
    if (s.type === 'heading' && s.heading) {
      items.push({ id: `section-${i}`, label: s.heading });
    }
  });
  if (hasFaqs) {
    items.push({ id: 'faqs', label: 'FAQs' });
  }
  return items;
}

interface Props {
  article: Article;
  relatedArticles: RelatedArticle[];
  siteName: string;
  publicDomain: string;
  logoUrl?: string | null;
  headerLogoHeight?: number;
  footerLogoHeight?: number;
  poweredByEnabled?: boolean;
  poweredByHeight?: number;
  poweredByOpacity?: number;
  isPreview?: boolean;
  gaMeasurementId?: string | null;
  headerMenuItems?: { label: string; url: string }[];
  footerLinks?: { heading: string; text: string; url: string }[];
}

export function ArticleView({ article, relatedArticles, siteName, publicDomain, logoUrl, headerLogoHeight = 32, footerLogoHeight = 24, poweredByEnabled = true, poweredByHeight = 20, poweredByOpacity = 60, isPreview = false, gaMeasurementId = null, headerMenuItems = [], footerLinks = [] }: Props) {
  const [activeSection, setActiveSection] = useState('');
  const [sidebarEmail, setSidebarEmail] = useState('');
  const [sidebarSubmitted, setSidebarSubmitted] = useState(false);
  const tracked = useRef(false);

  // Track page view
  useEffect(() => {
    if (tracked.current || isPreview || !article.id) return;
    tracked.current = true;
    fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/track-pageview`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ article_id: article.id, event_type: 'view' }),
      }
    ).catch(() => {});
  }, [article.id, isPreview]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-100px 0px -65% 0px', threshold: 0.1 }
    );
    const timer = setTimeout(() => {
      const sections = document.querySelectorAll('[data-toc-section]');
      sections.forEach((s) => observer.observe(s));
    }, 300);
    return () => { clearTimeout(timer); observer.disconnect(); };
  }, []);

  const tocItems = buildToc(article.sections, article.faqs?.length > 0);
  const showSidebar = article.show_toc && tocItems.length > 0;

  return (
    <div className="min-h-screen bg-white">
      {gaMeasurementId && <TenantGa measurementId={gaMeasurementId} />}
      {/* Preview Banner */}
      {isPreview && (
        <div className="sticky top-0 z-[60] bg-amber-500 text-white text-center py-2 px-4 text-sm font-medium shadow-sm">
          Preview Mode — This page is not published and will not be indexed by search engines.
        </div>
      )}
      {/* Navbar */}
      <header className={`sticky ${isPreview ? 'top-[40px]' : 'top-0'} z-50 bg-white border-b border-gray-100`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
          <Link href="/articles">
            {logoUrl ? (
              <img src={logoUrl} alt={siteName} style={{ height: `${headerLogoHeight}px` }} className="w-auto object-contain" />
            ) : (
              <span className="text-xl font-bold text-gray-900 italic" style={{ fontFamily: "'Georgia', serif" }}>
                {siteName.toLowerCase()}
              </span>
            )}
          </Link>
          <nav className="hidden sm:flex items-center gap-7 text-[14px] text-gray-500">
            {headerMenuItems.length > 0 ? (
              headerMenuItems.map((item, i) => (
                <a key={i} href={item.url} className="hover:text-gray-900 transition-colors">{item.label}</a>
              ))
            ) : (
              <>
                <Link href="/articles" className="hover:text-gray-900 transition-colors">Blog</Link>
                <a href={`https://${publicDomain}`} className="text-gray-900 font-medium">Home</a>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Title Area */}
      <div className="max-w-[720px] mx-auto px-6 pt-12">
        <Link href="/articles" className="inline-flex items-center gap-1.5 text-[13px] text-gray-400 hover:text-gray-700 transition-colors mb-8">
          <ArrowLeft className="w-3.5 h-3.5" /> All articles
        </Link>

        <p className="text-[13px] uppercase tracking-[0.08em] text-gray-400 font-medium mb-5">
          {article.category && <>{article.category} &nbsp;&middot;&nbsp; </>}
          {article.published_at && <>{new Date(article.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} &nbsp;&middot;&nbsp; </>}
          {article.read_time}
        </p>

        <h1 className="text-[2.25rem] sm:text-[2.75rem] leading-[1.1] font-bold text-gray-900 tracking-[-0.025em] mb-5" style={{ fontFamily: "'Georgia', serif" }}>
          {article.title}
        </h1>

        {article.excerpt && (
          <p className="text-[18px] leading-[1.7] text-gray-500 mb-8">
            {article.excerpt}
          </p>
        )}

        {article.author_name && (
          <div className="flex items-center gap-3 mb-12 pb-8 border-b border-gray-100">
            {article.author_avatar && (
              <img src={article.author_avatar} alt={article.author_name} className="w-10 h-10 rounded-full object-cover" />
            )}
            <div>
              <p className="text-[14px] font-semibold text-gray-900">{article.author_name}</p>
              {article.author_role && <p className="text-[13px] text-gray-400">{article.author_role}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Hero Image */}
      {article.hero_image && (
        <div className="max-w-[720px] mx-auto px-6 mb-14">
          <figure>
            <img src={article.hero_image} alt={article.title} className="w-full rounded-lg" />
          </figure>
        </div>
      )}

      {/* Two Column Layout: Sidebar + Content */}
      <div className="max-w-6xl mx-auto px-6 pb-24">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">

          {/* Left Sidebar (sticky) */}
          {showSidebar && (
            <aside className="lg:w-[220px] shrink-0 order-2 lg:order-1">
              <div className="lg:sticky lg:top-20 space-y-8">
                {/* Table of Contents */}
                <nav>
                  <h4 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400 mb-4">
                    On this page
                  </h4>
                  <ul className="space-y-0.5">
                    {tocItems.map((item) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className={`block text-[13px] py-1.5 transition-colors border-l-2 pl-3 ${
                            activeSection === item.id
                              ? 'border-gray-900 text-gray-900 font-medium'
                              : 'border-transparent text-gray-400 hover:text-gray-700'
                          }`}
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>

                {/* Sidebar CTA */}
                {article.cta_show_sidebar && article.cta_heading && (
                  <div className="border-t border-gray-100 pt-6">
                    <h4 className="text-[13px] font-semibold text-gray-900 mb-1.5">{article.cta_heading}</h4>
                    {article.cta_description && (
                      <p className="text-[12px] text-gray-400 leading-relaxed mb-4">{article.cta_description}</p>
                    )}
                    {article.cta_redirect_url ? (
                      <a
                        href={article.cta_redirect_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          if (article.id) {
                            fetch(
                              `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/track-pageview`,
                              {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                  Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                                },
                                body: JSON.stringify({ article_id: article.id, event_type: 'cta_click' }),
                              }
                            ).catch(() => {});
                          }
                        }}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-[13px] font-medium text-white transition-opacity hover:opacity-90"
                        style={{ background: article.cta_button_color || '#1a2a4a' }}
                      >
                        {article.cta_button_text || 'Subscribe'} <Send className="w-3 h-3" />
                      </a>
                    ) : sidebarSubmitted ? (
                      <p className="text-[13px] text-green-700 font-medium">{article.cta_success_message || 'Subscribed!'}</p>
                    ) : (
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (sidebarEmail.trim()) {
                          setSidebarSubmitted(true);
                          if (article.id) {
                            fetch(
                              `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/track-pageview`,
                              {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                  Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                                },
                                body: JSON.stringify({ article_id: article.id, event_type: 'cta_click' }),
                              }
                            ).catch(() => {});
                          }
                        }
                      }} className="space-y-2">
                        <input
                          type="email"
                          required
                          value={sidebarEmail}
                          onChange={(e) => setSidebarEmail(e.target.value)}
                          placeholder="you@email.com"
                          className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 placeholder-gray-400"
                        />
                        <button
                          type="submit"
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-[13px] font-medium text-white"
                          style={{ background: article.cta_button_color || '#1a2a4a' }}
                        >
                          {article.cta_button_text || 'Subscribe'} <Send className="w-3 h-3" />
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </aside>
          )}

          {/* Main Article Content */}
          <article className={`flex-1 min-w-0 max-w-[680px] ${showSidebar ? 'order-1 lg:order-2' : ''}`}>
            {article.sections.map((section, i) => (
              <div key={i}>
                <ArticleSection section={section} index={i} />
                {article.cta_inline_after_section === i && article.cta_heading && (
                  <InlineCta article={article} />
                )}
              </div>
            ))}

            {/* End of Article CTA */}
            {article.cta_show_end && article.cta_heading && (
              <EndCta article={article} />
            )}

            {/* FAQs */}
            {article.faqs && article.faqs.length > 0 && (
              <section id="faqs" data-toc-section className="mt-20">
                <h2 className="text-[1.75rem] font-bold text-gray-900 tracking-[-0.02em] mb-8" style={{ fontFamily: "'Georgia', serif" }}>
                  Frequently asked questions
                </h2>
                <div className="border-t border-gray-200">
                  {article.faqs.map((faq, i) => (
                    <FaqItem key={i} q={faq.q} a={faq.a} />
                  ))}
                </div>
              </section>
            )}

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <section className="mt-20 pt-12 border-t border-gray-100">
                <h2 className="text-[1.75rem] font-bold text-gray-900 tracking-[-0.02em] mb-10" style={{ fontFamily: "'Georgia', serif" }}>
                  Continue reading
                </h2>
                <div className="space-y-10">
                  {relatedArticles.map((r) => (
                    <Link key={r.slug} href={`/articles/${r.slug}`} className="block group">
                      {r.hero_image && (
                        <div className="overflow-hidden rounded-lg mb-4">
                          <img src={r.hero_image} alt={r.title} className="w-full h-[200px] sm:h-[240px] object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                        </div>
                      )}
                      <p className="text-[13px] text-gray-400 mb-2">
                        {r.published_at && new Date(r.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {r.read_time && <> &middot; {r.read_time}</>}
                      </p>
                      <h3 className="text-[20px] font-semibold text-gray-900 group-hover:text-gray-600 transition-colors mb-2" style={{ fontFamily: "'Georgia', serif" }}>
                        {r.title}
                      </h3>
                      {r.excerpt && <p className="text-[15px] text-gray-500 leading-[1.7]">{r.excerpt}</p>}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </article>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Footer Links */}
          {footerLinks.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 pb-10 border-b border-gray-200">
              {footerLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  {link.heading && (
                    <p className="text-[13px] font-semibold text-gray-900 group-hover:text-gray-600 transition-colors mb-0.5">{link.heading}</p>
                  )}
                  {link.text && (
                    <p className="text-[12px] text-gray-500 leading-relaxed">{link.text}</p>
                  )}
                </a>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {logoUrl ? (
              <img src={logoUrl} alt={siteName} style={{ height: `${footerLogoHeight}px` }} className="w-auto object-contain" />
            ) : (
              <span className="text-lg font-bold text-gray-900 italic" style={{ fontFamily: "'Georgia', serif" }}>
                {siteName.toLowerCase()}
              </span>
            )}
            {poweredByEnabled ? (
              <a
                href={`https://www.astrogtm.com?utm_source=${encodeURIComponent(siteName)}&utm_medium=Footer&utm_campaign=SEO-Tenant`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 transition-opacity hover:opacity-100"
                style={{ opacity: poweredByOpacity / 100 }}
              >
                <span className="text-[11px] text-gray-400 font-medium">Powered by</span>
                <span
                  className="inline-flex items-center px-2 py-0.5 bg-gray-200 rounded text-gray-600 font-bold"
                  style={{ fontSize: `${Math.max(10, poweredByHeight * 0.55)}px`, height: `${poweredByHeight}px` }}
                >
                  AstroGTM
                </span>
              </a>
            ) : (
              <p className="text-[12px] text-gray-400">&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</p>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Section Renderer ───────────────────────────────────── */
function ArticleSection({ section, index }: { section: Section; index: number }) {
  switch (section.type) {
    case 'heading':
      return (
        <h2
          id={`section-${index}`}
          data-toc-section
          className="text-[1.75rem] font-bold text-gray-900 tracking-[-0.02em] mt-20 mb-6"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          {section.heading}
        </h2>
      );

    case 'text':
      return (
        <div className="mb-7">
          {section.heading && (
            <h3 className="text-[20px] font-semibold text-gray-900 mt-10 mb-4">{section.heading}</h3>
          )}
          {section.content && (
            <p className="text-[17px] leading-[1.85] text-gray-700">{section.content}</p>
          )}
        </div>
      );

    case 'image':
      return (
        <figure className="my-14">
          {section.image_url && (
            <img src={section.image_url} alt={section.image_caption || ''} className="w-full rounded-lg" />
          )}
          {section.image_caption && (
            <figcaption className="mt-3 text-[13px] text-gray-400 text-center">{section.image_caption}</figcaption>
          )}
        </figure>
      );

    case 'list':
      return (
        <div className="mb-7">
          {section.heading && (
            <h3 className="text-[20px] font-semibold text-gray-900 mt-10 mb-4">{section.heading}</h3>
          )}
          <ul className="space-y-3 pl-1">
            {(section.items || []).map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-[16px] leading-[1.75] text-gray-700">
                <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      );

    case 'table':
      return (
        <div className="my-10 overflow-x-auto">
          {section.heading && (
            <h3 className="text-[20px] font-semibold text-gray-900 mb-4">{section.heading}</h3>
          )}
          <table className="w-full text-[15px]">
            {section.table_headers && (
              <thead>
                <tr className="border-b-2 border-gray-200">
                  {section.table_headers.map((h, i) => (
                    <th key={i} className="text-left py-3 pr-4 font-semibold text-gray-900">{h}</th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="text-gray-700">
              {(section.table_rows || []).map((row, ri) => (
                <tr key={ri} className="border-b border-gray-100">
                  {row.map((cell, ci) => (
                    <td key={ci} className="py-3 pr-4">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'review':
      return (
        <blockquote className="border-l-2 border-gray-200 pl-6 my-10">
          {section.review_text && (
            <p className="text-[17px] leading-[1.85] text-gray-600 italic mb-3">
              &quot;{section.review_text}&quot;
            </p>
          )}
          {section.reviewer_name && (
            <cite className="text-[14px] text-gray-400 not-italic">
              — {section.reviewer_name}{section.reviewer_location && `, ${section.reviewer_location}`}
            </cite>
          )}
        </blockquote>
      );

    default:
      return null;
  }
}

/* ─── Inline CTA ────────────────────────────────────────── */
function InlineCta({ article }: { article: Article }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const color = article.cta_button_color || '#1a2a4a';

  function trackClick() {
    if (article.id) {
      fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/track-pageview`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ article_id: article.id, event_type: 'cta_click' }),
        }
      ).catch(() => {});
    }
  }

  return (
    <div className="my-14 rounded-2xl p-8 text-center" style={{ backgroundColor: `${color}06`, border: `1px solid ${color}18` }}>
      <h4 className="text-[20px] font-bold text-gray-900 mb-2" style={{ fontFamily: "'Georgia', serif" }}>
        {article.cta_heading}
      </h4>
      {article.cta_description && (
        <p className="text-[15px] text-gray-600 mb-5 max-w-md mx-auto leading-relaxed">{article.cta_description}</p>
      )}
      {article.cta_redirect_url ? (
        <a
          href={article.cta_redirect_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={trackClick}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-[14px] font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: color }}
        >
          {article.cta_button_text || 'Subscribe'}
        </a>
      ) : submitted ? (
        <p className="text-[14px] text-green-700 font-medium">{article.cta_success_message || 'Subscribed!'}</p>
      ) : (
        <form onSubmit={(e) => {
          e.preventDefault();
          if (email.trim()) { setSubmitted(true); trackClick(); }
        }} className="flex items-center gap-2 max-w-sm mx-auto">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="flex-1 px-4 py-2.5 text-[14px] border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 placeholder-gray-400"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: color }}
          >
            {article.cta_button_text || 'Subscribe'}
          </button>
        </form>
      )}
    </div>
  );
}

/* ─── End CTA ───────────────────────────────────────────── */
function EndCta({ article }: { article: Article }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const color = article.cta_button_color || '#1a2a4a';

  function trackClick() {
    if (article.id) {
      fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/track-pageview`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ article_id: article.id, event_type: 'cta_click' }),
        }
      ).catch(() => {});
    }
  }

  return (
    <section className="mt-20 mb-10">
      <div className="rounded-2xl px-8 py-12 text-center" style={{ backgroundColor: `${color}08`, border: `1px solid ${color}20` }}>
        <h3 className="text-[1.5rem] font-bold text-gray-900 mb-3" style={{ fontFamily: "'Georgia', serif" }}>
          {article.cta_heading}
        </h3>
        {article.cta_description && (
          <p className="text-[16px] text-gray-600 mb-6 max-w-lg mx-auto leading-relaxed">{article.cta_description}</p>
        )}
        {article.cta_redirect_url ? (
          <a
            href={article.cta_redirect_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={trackClick}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-[15px] font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-[1.02]"
            style={{ backgroundColor: color }}
          >
            {article.cta_button_text || 'Subscribe'}
          </a>
        ) : submitted ? (
          <p className="text-[15px] text-green-700 font-medium">{article.cta_success_message || 'Subscribed!'}</p>
        ) : (
          <form onSubmit={(e) => {
            e.preventDefault();
            if (email.trim()) { setSubmitted(true); trackClick(); }
          }} className="flex items-center gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="flex-1 px-4 py-3 text-[15px] border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 placeholder-gray-400"
            />
            <button
              type="submit"
              className="px-7 py-3 rounded-xl text-[15px] font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-[1.02]"
              style={{ backgroundColor: color }}
            >
              {article.cta_button_text || 'Subscribe'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
