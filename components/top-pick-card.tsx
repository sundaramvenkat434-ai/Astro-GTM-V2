'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Crown, Star, ExternalLink, Quote, Sparkles, ChevronRight } from 'lucide-react';

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

export function TopPickCard({ tool, entry, rank, totalCount }: TopPickCardProps) {
  const [activeUseCase, setActiveUseCase] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const useCases = tool.use_cases ?? [];

  useEffect(() => {
    if (useCases.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setActiveUseCase((prev) => (prev + 1) % useCases.length);
    }, 2400);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [useCases.length]);

  const isTopPick = rank === 0;

  return (
    <div className="w-full lg:w-[310px] shrink-0 flex flex-col rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-200/70 transition-shadow duration-300">

      {/* Accent top bar */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400" />

      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center">
            <Crown className="w-3 h-3 text-amber-600" />
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-600">
            {isTopPick ? 'Our Top Pick' : `#${rank + 1} Pick`}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-400">#{rank + 1}</span>
          <span className="text-[10px] text-slate-300">of {totalCount}</span>
        </div>
      </div>

      {/* Main body */}
      <div className="p-5 flex flex-col gap-3.5">

        {/* Tool identity */}
        <div className="flex items-center gap-3">
          {tool.logo_url ? (
            <div className="w-11 h-11 rounded-xl overflow-hidden border border-slate-100 bg-white shrink-0 flex items-center justify-center shadow-sm">
              <img
                src={tool.logo_url}
                alt={tool.logo_alt || tool.name}
                width={44}
                height={44}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 shrink-0 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-extrabold text-slate-900 text-[15px] leading-tight truncate">{tool.name}</h3>
            <p className="text-[11px] text-slate-500 leading-snug mt-0.5 line-clamp-1">{tool.tagline}</p>
          </div>
          {entry.score > 0 && (
            <div className="shrink-0 w-10 h-10 rounded-full border-2 border-emerald-200 bg-emerald-50 flex flex-col items-center justify-center">
              <span className="text-[11px] font-bold text-emerald-700 leading-none">{entry.score}</span>
              <span className="text-[7px] text-emerald-500 uppercase font-bold tracking-wide">/100</span>
            </div>
          )}
        </div>

        {/* Stars */}
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-3.5 h-3.5 ${
                  s <= Math.floor(tool.rating)
                    ? 'fill-amber-400 text-amber-400'
                    : s - 0.5 <= tool.rating
                    ? 'fill-amber-200 text-amber-300'
                    : 'fill-slate-100 text-slate-200'
                }`}
              />
            ))}
          </div>
          <span className="text-[12px] font-bold text-slate-700">{tool.rating}</span>
          <span className="text-[10px] text-slate-400">({tool.rating_count})</span>
        </div>

        {/* Animated use cases - vertical auto scroll */}
        {useCases.length > 0 && (
          <div className="rounded-xl border border-slate-100 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
            <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Use Cases</span>
              <div className="flex gap-[3px]">
                {useCases.slice(0, 8).map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-[5px] rounded-full transition-all duration-500 ease-in-out ${
                      idx === activeUseCase % Math.min(useCases.length, 8)
                        ? 'w-3.5 bg-amber-400'
                        : 'w-[5px] bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="relative h-[72px] overflow-hidden">
              {useCases.map((uc, idx) => (
                <div
                  key={idx}
                  className="absolute inset-x-0 px-3.5 flex items-center h-full transition-all duration-[600ms] ease-in-out"
                  style={{
                    transform: `translateY(${(idx - activeUseCase) * 100}%)`,
                    opacity: idx === activeUseCase ? 1 : 0,
                  }}
                >
                  <div className="flex items-start gap-2.5 w-full">
                    <div className="w-5 h-5 rounded-md bg-amber-50 border border-amber-200/80 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[9px] font-bold text-amber-600">{idx + 1}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-semibold text-slate-700 leading-snug line-clamp-2">{uc}</p>
                      {idx === 0 && (
                        <span className="inline-block mt-1 text-[8px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-px rounded">
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
          <div className="rounded-xl bg-sky-50/70 border border-sky-100 p-3.5">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-4 h-4 rounded-full bg-sky-500 flex items-center justify-center shrink-0">
                <Crown className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-sky-700">Why #{rank + 1} of {totalCount}?</span>
            </div>
            <p className="text-[11px] text-slate-700 leading-relaxed font-medium">{entry.best_for}</p>
          </div>
        )}

        {/* Editor's Verdict */}
        {entry.verdict && (
          <div className="rounded-xl bg-slate-900 p-3.5">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Quote className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-400">Editor&apos;s Verdict</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">{entry.verdict}</p>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col items-center gap-1.5 pt-1">
          {tool.website_url ? (
            <a
              href={tool.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-[12px] font-bold px-4 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-px hover:shadow-md"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Visit Website
            </a>
          ) : (
            <Link
              href={`/category/${tool.category}/${tool.slug}`}
              className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-[12px] font-bold px-4 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-px hover:shadow-md"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Visit Website
            </Link>
          )}
          <Link
            href={`/category/${tool.category}/${tool.slug}`}
            className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-700 font-medium transition-colors py-1"
          >
            Read More <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
