'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Crown, Star, ArrowUpRight, ExternalLink, Quote, Sparkles, ChevronRight } from 'lucide-react';

interface TopPickCardProps {
  tool: {
    id: string;
    slug: string;
    name: string;
    tagline: string;
    category: string;
    rating: number;
    rating_count: string;
    use_cases: string[];
    logo_url?: string | null;
    logo_alt?: string | null;
    website_url?: string | null;
  };
  entry: {
    score: number;
    best_for: string;
    verdict: string;
  };
  rank: number;
  totalCount: number;
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${
            s <= Math.floor(rating)
              ? 'fill-amber-400 text-amber-400'
              : s - 0.5 <= rating
              ? 'fill-amber-200 text-amber-300'
              : 'fill-slate-200 text-slate-200'
          }`}
        />
      ))}
      <span className="text-sm font-bold text-slate-800 ml-1">{rating}</span>
    </div>
  );
}

export function TopPickCard({ tool, entry, rank, totalCount }: TopPickCardProps) {
  const [activeUseCase, setActiveUseCase] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const useCases = tool.use_cases ?? [];

  useEffect(() => {
    if (useCases.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setActiveUseCase((prev) => (prev + 1) % useCases.length);
    }, 2200);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [useCases.length]);

  const isTopPick = rank === 0;

  return (
    <div className="lg:w-[300px] shrink-0 flex flex-col gap-0 rounded-2xl overflow-hidden shadow-lg shadow-amber-100/60 border border-amber-200/80 bg-white">

      {/* Header band */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-400 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-white" />
          <span className="text-[11px] font-extrabold text-white uppercase tracking-widest">
            {isTopPick ? `#1 of ${totalCount} Picks` : `#${rank + 1} Pick`}
          </span>
        </div>
        {entry.score > 0 && (
          <div className="bg-white/20 rounded-full px-2.5 py-0.5">
            <span className="text-[11px] font-bold text-white">{entry.score}/100</span>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="p-5 flex flex-col gap-4">

        {/* Tool identity */}
        <div className="flex items-center gap-3">
          {tool.logo_url ? (
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-100 bg-white shrink-0 flex items-center justify-center shadow-sm">
              <img
                src={tool.logo_url}
                alt={tool.logo_alt || tool.name}
                width={48}
                height={48}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 shrink-0 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-extrabold text-slate-900 text-[16px] leading-tight">{tool.name}</h3>
            <p className="text-[11px] text-slate-500 leading-snug mt-0.5 line-clamp-2">{tool.tagline}</p>
          </div>
        </div>

        {/* Star rating */}
        <StarRow rating={tool.rating} />

        {/* Animated use cases */}
        {useCases.length > 0 && (
          <div className="rounded-xl border border-slate-100 bg-slate-50 overflow-hidden">
            <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-1.5">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Use Cases</span>
              <div className="flex gap-0.5 ml-auto">
                {useCases.slice(0, 6).map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1 rounded-full transition-all duration-500 ${
                      idx === activeUseCase % Math.min(useCases.length, 6)
                        ? 'w-4 bg-amber-400'
                        : 'w-1.5 bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="relative h-[88px] overflow-hidden">
              {useCases.map((uc, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 flex items-center px-3 transition-all duration-500 ${
                    idx === activeUseCase
                      ? 'opacity-100 translate-y-0'
                      : idx < activeUseCase
                      ? 'opacity-0 -translate-y-full'
                      : 'opacity-0 translate-y-full'
                  }`}
                >
                  <div className="flex items-start gap-2.5 w-full">
                    <div className="w-5 h-5 rounded-md bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[9px] font-bold text-amber-600">{idx + 1}</span>
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-slate-800 leading-snug">{uc}</p>
                      {idx === 0 && (
                        <span className="inline-block mt-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-px rounded-sm">
                          Primary
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Why is this #1 */}
        {isTopPick && entry.best_for && (
          <div className="rounded-xl bg-gradient-to-br from-sky-50 to-white border border-sky-100 p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-4 h-4 rounded-full bg-sky-500 flex items-center justify-center">
                <Crown className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-sky-600">Why is this #1?</span>
            </div>
            <p className="text-[11px] text-slate-700 leading-snug font-medium">{entry.best_for}</p>
          </div>
        )}

        {/* Editor's Verdict */}
        {entry.verdict && (
          <div className="rounded-xl bg-slate-900 p-3.5">
            <div className="flex items-center gap-1.5 mb-2">
              <Quote className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-400">Editor&apos;s Verdict</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">{entry.verdict}</p>
          </div>
        )}

        {/* CTA buttons */}
        <div className="flex flex-col gap-2 pt-0.5">
          {tool.website_url ? (
            <a
              href={tool.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white text-[12px] font-bold px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm shadow-amber-200 hover:shadow-md hover:shadow-amber-200 hover:-translate-y-0.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Visit Website
            </a>
          ) : (
            <a
              href="#"
              className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white text-[12px] font-bold px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm shadow-amber-200 opacity-50 cursor-not-allowed"
              aria-disabled="true"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Visit Website
            </a>
          )}
          <Link
            href={`/category/${tool.category}/${tool.slug}`}
            className="inline-flex items-center justify-center gap-1.5 text-slate-600 hover:text-slate-900 text-[11px] font-semibold transition-colors py-1"
          >
            Read More <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
