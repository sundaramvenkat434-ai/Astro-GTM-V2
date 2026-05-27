'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Clock, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';

/* ─── Gifaa Logo ─────────────────────────────────────────── */
function GifaaLogo({ light = false }: { light?: boolean }) {
  return (
    <svg width="72" height="28" viewBox="0 0 72 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="2" y="22" fontFamily="'Georgia', serif" fontSize="20" fontStyle="italic" fontWeight="700" letterSpacing="-0.5" fill={light ? '#ffffff' : '#1a2a4a'}>
        gifaa
      </text>
      <circle cx="65" cy="9" r="2.5" fill="#c9a84c" />
    </svg>
  );
}

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  hero_image: string;
  category: string;
  author_name: string;
  read_time: string;
  published_at: string | null;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('gifaa_articles')
        .select('id, slug, title, excerpt, hero_image, category, author_name, read_time, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      setArticles(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const categories = ['All', ...Array.from(new Set(articles.map((a) => a.category).filter(Boolean)))];

  const filtered = articles.filter((a) => {
    const matchesSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === 'All' || a.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
          <Link href="/articles" className="flex items-center">
            <GifaaLogo />
          </Link>
          <nav className="hidden sm:flex items-center gap-7 text-[14px] text-gray-500">
            <a href="#" className="hover:text-gray-900 transition-colors">Occasions</a>
            <a href="#" className="hover:text-gray-900 transition-colors">How It Works</a>
            <a href="#" className="text-gray-900 font-medium">Blog</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Create Registry</a>
          </nav>
        </div>
      </header>

      {/* Page Header */}
      <div className="max-w-6xl mx-auto px-6 pt-14 pb-10">
        <h1 className="text-[2.5rem] sm:text-[3rem] font-bold text-gray-900 tracking-[-0.025em] mb-3" style={{ fontFamily: "'Georgia', serif" }}>
          Blog
        </h1>
        <p className="text-[17px] text-gray-500 leading-relaxed max-w-xl mb-10">
          Ideas, guides, and inspiration for every celebration. Learn how to create the perfect registry and make gifting effortless.
        </p>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-10 pr-4 py-2.5 text-[14px] border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 placeholder-gray-400"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 text-[13px] font-medium rounded-full transition-colors ${
                  activeCategory === cat
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-24">
        {loading ? (
          <div className="py-20 text-center text-gray-400 text-[15px]">Loading articles...</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-400 text-[15px] mb-2">No articles found</p>
            <p className="text-gray-400 text-[13px]">Check back soon for new content.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="group block"
              >
                <div className="overflow-hidden rounded-lg mb-4">
                  {article.hero_image ? (
                    <img
                      src={article.hero_image}
                      alt={article.title}
                      className="w-full h-[200px] object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-[200px] bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-300 text-sm">No image</span>
                    </div>
                  )}
                </div>
                {article.category && (
                  <p className="text-[12px] uppercase tracking-[0.08em] font-semibold text-gray-400 mb-2">
                    {article.category}
                  </p>
                )}
                <h2 className="text-[18px] font-semibold text-gray-900 leading-snug mb-2 group-hover:text-gray-600 transition-colors" style={{ fontFamily: "'Georgia', serif" }}>
                  {article.title}
                </h2>
                <p className="text-[14px] text-gray-500 leading-relaxed line-clamp-2 mb-3">
                  {article.excerpt}
                </p>
                <div className="flex items-center gap-3 text-[12px] text-gray-400">
                  {article.published_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                  {article.read_time && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.read_time}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

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
