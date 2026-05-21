// Server component — no 'use client'. All visible text renders in raw HTML.

import Link from 'next/link';
import { Linkedin, ExternalLink, Link as LinkOut } from 'lucide-react';
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

  return (
    <div className="mt-2 rounded-lg border border-slate-100 bg-white/60 overflow-hidden">
      {/* Single compact row */}
      <div className="flex items-center gap-2.5 px-4 py-2.5">
        {/* Label */}
        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider shrink-0">Reviews by</span>

        {/* Circular avatar */}
        <Link href={profileUrl} rel="author" className="shrink-0">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold ring-1 ring-white hover:opacity-80 transition-opacity"
            style={{ background: author.avatar_color }}
          >
            {author.avatar_initials}
          </div>
        </Link>

        {/* Name + title */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <Link href={profileUrl} rel="author" className="text-[12px] font-medium text-slate-600 hover:text-sky-700 transition-colors truncate">
            {author.name}
          </Link>
          <span className="text-slate-300 text-[11px] hidden sm:inline" aria-hidden="true">·</span>
          <span className="text-[11px] text-slate-400 truncate hidden sm:inline">{author.title}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {author.linkedin_url && (
            <a
              href={author.linkedin_url}
              target="_blank"
              rel="noopener noreferrer author"
              className="w-5 h-5 flex items-center justify-center hover:bg-slate-100 rounded transition-colors"
              aria-label={`${author.name} on LinkedIn`}
            >
              <Linkedin className="w-3 h-3 text-slate-400" />
            </a>
          )}
          <Link
            href={profileUrl}
            rel="author"
            className="w-5 h-5 flex items-center justify-center hover:bg-slate-100 rounded transition-colors"
            aria-label={`${author.name} profile`}
          >
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
        </div>

        {/* Not sponsored */}
        <span className="text-[10px] text-slate-300 font-medium shrink-0 hidden sm:inline">Not Sponsored</span>
      </div>

      {/* Sources — minimal, only if present */}
      {hasSources && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 pb-2.5 border-t border-slate-100 pt-2">
          <span className="text-[10px] font-medium text-slate-300 uppercase tracking-wider">Sources</span>
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
      )}
    </div>
  );
}

// Re-export from server-safe module so existing imports keep working
export { AUTHOR_SCHEMA, buildArticleSchema } from '@/lib/author-schema';
