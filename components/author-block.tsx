// Server component — no 'use client'. All visible text renders in raw HTML.

import Link from 'next/link';
import { Linkedin, ExternalLink, Link as LinkOut, BookOpen } from 'lucide-react';
import type { Author } from '@/lib/author-schema';

export type { Author };
export { FALLBACK } from '@/lib/author-schema';

export interface Source {
  name: string;
  url: string;
}

interface AuthorBlockProps {
  author: Author;
  publishedDate?: string | null;
  updatedDate?: string | null;
  sources?: Source[];
}

export function AuthorBlock({ author, sources }: AuthorBlockProps) {
  const profileUrl = `/author/${author.slug}`;
  const hasSources = (sources?.length ?? 0) > 0;
  const hasStats = (author.stats?.length ?? 0) > 0;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 bg-slate-50">
        <BookOpen className="w-3 h-3 text-slate-400 shrink-0" />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reviews Consolidated By</span>
      </div>

      {/* Main author row */}
      <div className="px-5 py-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Link href={profileUrl} rel="author" className="shrink-0 mt-0.5">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-[14px] font-bold shadow-sm ring-2 ring-white hover:opacity-90 transition-opacity"
              style={{ background: author.avatar_color }}
            >
              {author.avatar_initials}
            </div>
          </Link>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <Link href={profileUrl} rel="author" className="text-[15px] font-bold text-slate-900 hover:text-sky-700 transition-colors leading-tight">
                {author.name}
              </Link>
              {author.linkedin_url && (
                <a
                  href={author.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer author"
                  className="w-6 h-6 rounded flex items-center justify-center hover:bg-sky-50 transition-colors"
                  aria-label={`${author.name} on LinkedIn`}
                >
                  <Linkedin className="w-3.5 h-3.5 text-slate-400 hover:text-sky-600 transition-colors" />
                </a>
              )}
              <Link
                href={profileUrl}
                rel="author"
                className="w-6 h-6 rounded flex items-center justify-center hover:bg-slate-100 transition-colors"
                aria-label="View author profile"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 transition-colors" />
              </Link>
              <span className="text-[10px] font-medium text-slate-300 ml-auto hidden sm:inline">Not Sponsored</span>
            </div>

            <p className="text-[12px] text-slate-500 leading-snug mb-3">{author.title}</p>

            {/* Bio */}
            {author.bio && (
              <p className="text-[12px] text-slate-500 leading-relaxed">{author.bio}</p>
            )}
          </div>
        </div>

        {/* Stats row */}
        {hasStats && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-3">
            {author.stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-[16px] font-bold text-slate-800 leading-none">{stat.value}</p>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sources */}
      {hasSources && (
        <div className="px-5 pb-4 pt-0 border-t border-slate-100 mt-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-300 mb-2 pt-3">Sources</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {(sources ?? []).map((src, i) => (
              <a
                key={i}
                href={src.url}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-sky-600 transition-colors"
              >
                <LinkOut className="w-2.5 h-2.5 shrink-0" aria-hidden="true" />
                {src.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Re-export from server-safe module so existing imports keep working
export { AUTHOR_SCHEMA, buildArticleSchema } from '@/lib/author-schema';
