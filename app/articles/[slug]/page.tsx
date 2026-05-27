'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronDown, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';

/* ─── Gifaa Logo ─────────────────────────────────────────── */
function GifaaLogo() {
  return (
    <svg width="72" height="28" viewBox="0 0 72 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="2" y="22" fontFamily="'Georgia', serif" fontSize="20" fontStyle="italic" fontWeight="700" letterSpacing="-0.5" fill="#1a2a4a">
        gifaa
      </text>
      <circle cx="65" cy="9" r="2.5" fill="#c9a84c" />
    </svg>
  );
}

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
  related_slugs: string[];
  published_at: string | null;
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

export default function ArticleSlugPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<RelatedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('gifaa_articles')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setArticle(data);

      if (data.related_slugs && data.related_slugs.length > 0) {
        const { data: relData } = await supabase
          .from('gifaa_articles')
          .select('slug, title, excerpt, hero_image, category, read_time, published_at')
          .in('slug', data.related_slugs)
          .eq('status', 'published');
        setRelated(relData || []);
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-400 text-[15px]">Loading...</p>
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-gray-900 text-[20px] font-semibold">Article not found</p>
        <Link href="/articles" className="text-[14px] text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to all articles
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
          <Link href="/articles" className="flex items-center">
            <GifaaLogo />
          </Link>
          <nav className="hidden sm:flex items-center gap-7 text-[14px] text-gray-500">
            <Link href="/articles" className="hover:text-gray-900 transition-colors">Blog</Link>
            <a href="#" className="hover:text-gray-900 transition-colors">Occasions</a>
            <a href="#" className="text-gray-900 font-medium">Create Registry</a>
          </nav>
        </div>
      </header>

      {/* Article Content */}
      <main className="max-w-[720px] mx-auto px-6 pt-12 pb-24">
        {/* Back link */}
        <Link href="/articles" className="inline-flex items-center gap-1.5 text-[13px] text-gray-400 hover:text-gray-700 transition-colors mb-8">
          <ArrowLeft className="w-3.5 h-3.5" /> All articles
        </Link>

        {/* Meta */}
        <p className="text-[13px] uppercase tracking-[0.08em] text-gray-400 font-medium mb-5">
          {article.category && <>{article.category} &nbsp;&middot;&nbsp; </>}
          {article.published_at && <>{new Date(article.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} &nbsp;&middot;&nbsp; </>}
          {article.read_time}
        </p>

        {/* Title */}
        <h1 className="text-[2.25rem] sm:text-[2.75rem] leading-[1.1] font-bold text-gray-900 tracking-[-0.025em] mb-5" style={{ fontFamily: "'Georgia', serif" }}>
          {article.title}
        </h1>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-[18px] leading-[1.7] text-gray-500 mb-8">
            {article.excerpt}
          </p>
        )}

        {/* Author */}
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

        {/* Hero Image */}
        {article.hero_image && (
          <figure className="mb-14">
            <img src={article.hero_image} alt={article.title} className="w-full rounded-lg" />
          </figure>
        )}

        {/* Sections */}
        {article.sections.map((section, i) => (
          <ArticleSection key={i} section={section} />
        ))}

        {/* FAQs */}
        {article.faqs && article.faqs.length > 0 && (
          <section className="mt-20">
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
        {related.length > 0 && (
          <section className="mt-20 pt-12 border-t border-gray-100">
            <h2 className="text-[1.75rem] font-bold text-gray-900 tracking-[-0.02em] mb-10" style={{ fontFamily: "'Georgia', serif" }}>
              Continue reading
            </h2>
            <div className="space-y-10">
              {related.map((r) => (
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
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <GifaaLogo />
            <p className="text-[12px] text-gray-400">&copy; {new Date().getFullYear()} Gifaa. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Section Renderer ───────────────────────────────────── */
function ArticleSection({ section }: { section: Section }) {
  switch (section.type) {
    case 'heading':
      return (
        <h2 className="text-[1.75rem] font-bold text-gray-900 tracking-[-0.02em] mt-20 mb-6" style={{ fontFamily: "'Georgia', serif" }}>
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
