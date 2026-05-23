'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Crown, Star, ExternalLink, Quote, Sparkles, ChevronRight, Zap } from 'lucide-react';

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
    }, 2600);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [useCases.length]);

  return (
    <div className="w-full sm:w-[340px] lg:w-[320px] shrink-0 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden">

      {/* Top accent line */}
      <div className="h-[3px] w-full bg-gradient-to-r from-sky-400 via-sky-500 to-teal-400" />

      {/* Tool header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start gap-3 mb-3">
          {tool.logo_url ? (
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100 bg-white shrink-0 flex items-center justify-center">
              <img
                src={tool.logo_url}
                alt={tool.logo_alt || tool.name}
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-100 shrink-0 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-sky-500" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-[15px] leading-tight truncate">{tool.name}</h3>
              {entry.score > 0 && (
                <span className="shrink-0 text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-100 px-1.5 py-0.5 rounded">
                  {entry.score}/100
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 leading-snug mt-0.5 line-clamp-1">{tool.tagline}</p>
          </div>
        </div>

        {/* Stars */}
        <div className="flex items-center gap-1.5 mb-4">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-3 h-3 ${
                  s <= Math.floor(tool.rating)
                    ? 'fill-amber-400 text-amber-400'
                    : s - 0.5 <= tool.rating
                    ? 'fill-amber-200 text-amber-300'
                    : 'fill-slate-100 text-slate-200'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] font-bold text-slate-700">{tool.rating}</span>
          <span className="text-[10px] text-slate-400">({tool.rating_count})</span>
        </div>

        {/* Animated use cases */}
        {useCases.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Use Cases</span>
              <div className="flex gap-[3px]">
                {useCases.slice(0, 6).map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1 rounded-full transition-all duration-500 ease-out ${
                      idx === activeUseCase % Math.min(useCases.length, 6)
                        ? 'w-3 bg-sky-400'
                        : 'w-1 bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="relative h-[52px] rounded-lg bg-slate-50 border border-slate-100 overflow-hidden">
              {useCases.map((uc, idx) => (
                <div
                  key={idx}
                  className="absolute inset-0 flex items-center px-3 transition-all duration-500 ease-in-out"
                  style={{
                    transform: `translateY(${(idx - activeUseCase) * 100}%)`,
                    opacity: idx === activeUseCase ? 1 : 0,
                  }}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Zap className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    <p className="text-[12px] font-medium text-slate-700 leading-snug line-clamp-2">{uc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Why #1 */}
        {entry.best_for && (
          <div className="mb-3 flex items-start gap-2 px-3 py-2.5 rounded-lg bg-sky-50/70 border border-sky-100">
            <Crown className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-px" />
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-sky-600 block mb-0.5">Why #{rank + 1} of {totalCount}?</span>
              <p className="text-[11px] text-slate-700 leading-snug">{entry.best_for}</p>
            </div>
          </div>
        )}

        {/* Editor verdict */}
        {entry.verdict && (
          <div className="mb-4 flex items-start gap-2 px-3 py-2.5 rounded-lg bg-slate-900">
            <Quote className="w-3 h-3 text-sky-400 shrink-0 mt-px" />
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-sky-400 block mb-0.5">Editor&apos;s Verdict</span>
              <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">{entry.verdict}</p>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="flex flex-col items-center gap-1.5">
          {tool.website_url ? (
            <a
              href={tool.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 text-white text-[12px] font-semibold px-4 py-2.5 rounded-lg transition-all duration-200 hover:-translate-y-px"
              style={{ background: 'linear-gradient(145deg, #60b8e8 0%, #3a9fd4 100%)' }}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Visit Website
            </a>
          ) : (
            <Link
              href={`/category/${tool.category}/${tool.slug}`}
              className="w-full inline-flex items-center justify-center gap-2 text-white text-[12px] font-semibold px-4 py-2.5 rounded-lg transition-all duration-200 hover:-translate-y-px"
              style={{ background: 'linear-gradient(145deg, #60b8e8 0%, #3a9fd4 100%)' }}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Visit Website
            </Link>
          )}
          <Link
            href={`/category/${tool.category}/${tool.slug}`}
            className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-sky-600 font-medium transition-colors py-0.5"
          >
            Read More <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
