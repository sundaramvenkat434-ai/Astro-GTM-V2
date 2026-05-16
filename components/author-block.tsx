// Server component — no 'use client'. All visible text (dates, sources, author
// name, stats) renders in raw HTML and is crawler-visible without JavaScript.

import Link from 'next/link';
import { Linkedin, ExternalLink, BookOpen, Star, CalendarDays, Link as LinkOut } from 'lucide-react';
import type { Author } from '@/lib/author-schema';
import { AuthorBioToggle, UpdatedDateTooltip } from './author-block-interactive';

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

function fmtShort(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function fmtExact(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function AuthorBlock({ author, publishedDate, updatedDate, sources }: AuthorBlockProps) {
  const profileUrl = `/author/${author.slug}`;
  const hasSources = (sources?.length ?? 0) > 0;

  return (
    <div className="mt-2 rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">

      {/* ── Top label bar — fully SSR ──────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-5 py-2.5 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Reviewed by</span>
        </div>

        {(publishedDate || updatedDate) && (
          <span className="text-slate-200 text-[11px] hidden sm:inline" aria-hidden="true">·</span>
        )}

        {/* Published date — plain SSR text, no interactivity needed */}
        {publishedDate && (
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
            <CalendarDays className="w-3 h-3 text-slate-400" aria-hidden="true" />
            Published {fmtShort(publishedDate)}
          </span>
        )}

        {/* Updated date — text is SSR-rendered inside UpdatedDateTooltip; the
            client layer only adds the hover tooltip, not the visible text. */}
        {updatedDate && (
          <UpdatedDateTooltip short={fmtShort(updatedDate)} exact={fmtExact(updatedDate)} />
        )}
      </div>

      {/* ── Author card — fully SSR ───────────────────────────────────────── */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          <Link href={profileUrl} rel="author" className="shrink-0 group">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-base shadow-sm group-hover:opacity-90 transition-opacity"
              style={{ background: author.avatar_color }}
            >
              {author.avatar_initials}
            </div>
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <Link href={profileUrl} rel="author" className="text-[15px] font-bold text-slate-900 hover:text-sky-700 transition-colors leading-tight block">
                  {author.name}
                </Link>
                <p className="text-[12px] text-slate-500 mt-0.5">{author.title}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {author.linkedin_url && (
                  <a
                    href={author.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer author"
                    className="w-7 h-7 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center hover:bg-sky-100 transition-colors"
                    aria-label={`${author.name} on LinkedIn`}
                  >
                    <Linkedin className="w-3.5 h-3.5 text-sky-600" />
                  </a>
                )}
                <Link
                  href={profileUrl}
                  rel="author"
                  className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors"
                  aria-label={`${author.name} author profile`}
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </Link>
              </div>
            </div>

            {/* Stats — SSR-visible credentials */}
            {author.stats.length > 0 && (
              <div className="flex gap-4 mt-3 flex-wrap">
                {author.stats.map((s) => (
                  <div key={s.label}>
                    <span className="text-[13px] font-bold text-slate-800">{s.value}</span>
                    <span className="text-[11px] text-slate-400 ml-1">{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bio — text is SSR; the expand/collapse button is the only client piece */}
        <AuthorBioToggle bio={author.bio} />

        <div className="mt-3 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-50 border border-sky-200 text-[11px] font-semibold text-sky-700">
            <Star className="w-3 h-3 fill-sky-500 text-sky-500" />
            AstroGTM Editorial
          </span>
          <span className="text-[11px] text-slate-400">Independent · Not sponsored</span>
        </div>
      </div>

      {/* ── Sources — fully SSR, rel="nofollow noopener noreferrer" ──────── */}
      {hasSources && (
        <div className="border-t border-slate-100 px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2.5">Sources</p>
          <ul className="space-y-1.5">
            {(sources ?? []).map((src, i) => (
              <li key={i}>
                <a
                  href={src.url}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[12px] text-slate-600 hover:text-sky-700 transition-colors group"
                >
                  <LinkOut className="w-3 h-3 text-slate-300 group-hover:text-sky-500 shrink-0" aria-hidden="true" />
                  {src.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Re-export from server-safe module so existing imports keep working
export { AUTHOR_SCHEMA, buildArticleSchema } from '@/lib/author-schema';
