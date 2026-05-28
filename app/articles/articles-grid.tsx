'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, Search } from 'lucide-react';

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

interface Props {
  articles: Article[];
  totalCount: number;
  siteName: string;
  publicDomain: string;
  logoUrl?: string | null;
}

export function ArticlesGrid({ articles, totalCount, siteName, publicDomain, logoUrl }: Props) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

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
          <Link href="/articles">
            {logoUrl ? (
              <img src={logoUrl} alt={siteName} className="h-8 w-auto object-contain" />
            ) : (
              <span className="text-xl font-bold text-gray-900 italic" style={{ fontFamily: "'Georgia', serif" }}>
                {siteName.toLowerCase()}
              </span>
            )}
          </Link>
          <nav className="hidden sm:flex items-center gap-7 text-[14px] text-gray-500">
            <a href={`https://${publicDomain}`} className="hover:text-gray-900 transition-colors">Home</a>
            <Link href="/articles" className="text-gray-900 font-medium">Blog</Link>
          </nav>
        </div>
      </header>

      {/* Page Header */}
      <div className="max-w-6xl mx-auto px-6 pt-14 pb-10">
        <h1 className="text-[2.5rem] sm:text-[3rem] font-bold text-gray-900 tracking-[-0.025em] mb-3" style={{ fontFamily: "'Georgia', serif" }}>
          Blog
        </h1>
        <p className="text-[17px] text-gray-500 leading-relaxed max-w-xl mb-10">
          Ideas, guides, and inspiration from {siteName}. {totalCount > 0 && <span className="text-gray-400">({totalCount} articles)</span>}
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
        {filtered.length === 0 ? (
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
            {logoUrl ? (
              <img src={logoUrl} alt={siteName} className="h-6 w-auto object-contain" />
            ) : (
              <span className="text-lg font-bold text-gray-900 italic" style={{ fontFamily: "'Georgia', serif" }}>
                {siteName.toLowerCase()}
              </span>
            )}
            <p className="text-[12px] text-gray-400">&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
