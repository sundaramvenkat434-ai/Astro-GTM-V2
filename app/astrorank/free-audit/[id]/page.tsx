"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Search, Globe, Zap, RefreshCw, CircleAlert as AlertCircle, CircleCheck as CheckCircle2, ExternalLink, Rocket, Lock, ChevronDown, Loader as Loader2 } from "lucide-react";
import SpaceBg from "../../space-bg";

// ─── Types ────────────────────────────────────────────────────────────────────
interface BrandAnalysis {
  about_brand?: string;
  primary_business_segment?: string;
  primary_geography?: string;
  target_audience?: string;
  primary_search_keyword?: string;
  secondary_search_keywords?: string[];
  long_tail_keyword_examples?: string[];
  content_opportunities?: string[];
}

interface SerpResult {
  rank: number;
  title: string;
  url: string;
  description: string;
}

interface ScrapedCompetitor {
  url: string;
  content: string;
  error?: string;
}

interface AuditData {
  id: string;
  website_url: string;
  status: string;
  brand_analysis: BrandAnalysis | Record<string, unknown>;
  serp_results: SerpResult[];
  scraped_competitors: ScrapedCompetitor[];
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

type TabId = "brand" | "competition" | "opportunity";

// ─── API Helper ───────────────────────────────────────────────────────────────
async function callFreeAudit(action: string, payload: Record<string, unknown> = {}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const apiUrl = `${supabaseUrl}/functions/v1/free-audit`;

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({ action, ...payload }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw {
      status: res.status,
      message: data?.error || "Request failed",
      rateLimited: data?.rate_limited || res.status === 429,
      resetIn: data?.reset_in_seconds,
    };
  }

  return data;
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
function AstroLogo() {
  return (
    <a href="/astrorank" className="flex items-center gap-2.5 shrink-0 group">
      <div className="relative w-9 h-9 shrink-0">
        <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="8" fill="#1D4ED8" />
          <rect width="32" height="32" rx="8" fill="url(#audit_logo_grad)" opacity="0.6" />
          <path d="M16 5L19.5 11.5H26L20.5 15.8L23 23L16 19L9 23L11.5 15.8L6 11.5H12.5L16 5Z" fill="white" />
          <circle cx="16" cy="15" r="3.5" fill="#BFDBFE" fillOpacity="0.8" />
          <defs>
            <linearGradient id="audit_logo_grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3B82F6" />
              <stop offset="1" stopColor="#1D4ED8" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <span className="text-[19px] font-black tracking-[-0.045em] text-slate-900 leading-none">
        Astro<span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Rank</span>
      </span>
    </a>
  );
}

// ─── Tab Bar ──────────────────────────────────────────────────────────────────
const TABS: { id: TabId; label: string }[] = [
  { id: "brand", label: "Your Brand" },
  { id: "competition", label: "Your Competition" },
  { id: "opportunity", label: "Your Opportunity" },
];

function TabBar({ active, onChange }: { active: TabId; onChange: (t: TabId) => void }) {
  return (
    <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        const isDisabled = tab.id === "opportunity";
        return (
          <button
            key={tab.id}
            onClick={() => !isDisabled && onChange(tab.id)}
            disabled={isDisabled}
            className={`relative px-4 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200 ${
              isActive
                ? "text-white"
                : isDisabled
                ? "text-slate-300 cursor-not-allowed"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="tab-bg"
                className="absolute inset-0 bg-blue-600 rounded-lg shadow-md shadow-blue-600/25"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {tab.label}
              {isDisabled && <Lock size={11} className="opacity-50" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Brand Tab ────────────────────────────────────────────────────────────────
function BrandFieldCard({ label, value, delay }: { label: string; value: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</p>
      <p className="text-[14px] text-slate-700 leading-relaxed">{value || "—"}</p>
    </motion.div>
  );
}

function KeywordChip({ text, delay }: { text: string; delay: number }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.25 }}
      className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[12.5px] font-medium text-blue-700"
    >
      {text}
    </motion.span>
  );
}

function BrandLoadingState() {
  const steps = ["Fetching website content", "Extracting page text", "Analyzing brand identity", "Identifying target audience", "Finding primary keywords", "Discovering content opportunities"];
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((s) => (s + 1) % steps.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-3 border-blue-100 border-t-blue-500 rounded-full mb-6"
        style={{ borderWidth: "3px" }}
      />
      <p className="text-[16px] font-bold text-slate-700 mb-4">Analyzing your brand...</p>
      <div className="flex flex-col gap-2 w-full max-w-[320px]">
        {steps.map((step, i) => (
          <motion.div
            key={step}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: i <= currentStep ? 1 : 0.3 }}
            className="flex items-center gap-2"
          >
            {i < currentStep ? (
              <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
            ) : i === currentStep ? (
              <Loader2 size={15} className="text-blue-500 shrink-0 animate-spin" />
            ) : (
              <div className="w-[15px] h-[15px] rounded-full border-1.5 border-slate-200 shrink-0" />
            )}
            <span className={`text-[13px] ${i <= currentStep ? "text-slate-600 font-medium" : "text-slate-300"}`}>
              {step}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function BrandErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <AlertCircle size={26} className="text-red-500" />
      </div>
      <p className="text-[16px] font-bold text-slate-700 mb-2">Analysis Failed</p>
      <p className="text-[13px] text-slate-500 mb-6 text-center max-w-[400px]">{message}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-[13px] font-semibold hover:bg-blue-700 transition-colors"
      >
        <RefreshCw size={14} /> Try Again
      </button>
    </div>
  );
}

function RateLimitMessage({ resetIn }: { resetIn?: number }) {
  const mins = resetIn ? Math.ceil(resetIn / 60) : "a few";
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mb-4">
        <AlertCircle size={26} className="text-amber-500" />
      </div>
      <p className="text-[16px] font-bold text-slate-700 mb-2">Rate Limit Reached</p>
      <p className="text-[13px] text-slate-500 mb-6 text-center max-w-[400px]">
        You've made a lot of requests recently. Please try again in about {mins} minute{mins === 1 ? "" : "s"}.
      </p>
    </div>
  );
}

function BrandTab({ audit, onAnalyze, analyzing, analyzeError, rateLimited, resetIn }: {
  audit: AuditData;
  onAnalyze: () => void;
  analyzing: boolean;
  analyzeError: string | null;
  rateLimited: boolean;
  resetIn?: number;
}) {
  const brand = (audit.brand_analysis || {}) as BrandAnalysis;
  const hasResults = audit.status === "complete" && brand.about_brand;

  if (analyzing) return <BrandLoadingState />;
  if (rateLimited) return <RateLimitMessage resetIn={resetIn} />;
  if (analyzeError && !hasResults) return <BrandErrorState message={analyzeError} onRetry={onAnalyze} />;
  if (!hasResults) return <BrandErrorState message="No analysis available yet." onRetry={onAnalyze} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-slate-900">Brand Intelligence</h2>
          <p className="text-[13px] text-slate-400 mt-0.5">AI-powered analysis of {audit.website_url}</p>
        </div>
        <button
          onClick={onAnalyze}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 text-slate-600 text-[12.5px] font-semibold hover:bg-slate-200 transition-colors"
        >
          <RefreshCw size={13} /> Re-analyze
        </button>
      </div>

      {/* Top row: 4 fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BrandFieldCard label="About the Brand" value={brand.about_brand || ""} delay={0} />
        <BrandFieldCard label="Primary Business Segment" value={brand.primary_business_segment || ""} delay={0.05} />
        <BrandFieldCard label="Primary Geography" value={brand.primary_geography || ""} delay={0.1} />
        <BrandFieldCard label="Target Audience" value={brand.target_audience || ""} delay={0.15} />
      </div>

      {/* Primary keyword */}
      {brand.primary_search_keyword && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-5 text-white shadow-md shadow-blue-600/20"
        >
          <p className="text-[11px] font-bold text-blue-100 uppercase tracking-wider mb-2">Primary Search Keyword</p>
          <p className="text-[22px] font-extrabold">{brand.primary_search_keyword}</p>
        </motion.div>
      )}

      {/* Secondary keywords */}
      {brand.secondary_search_keywords && brand.secondary_search_keywords.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Secondary Keywords</p>
          <div className="flex flex-wrap gap-2">
            {brand.secondary_search_keywords.map((kw, i) => (
              <KeywordChip key={i} text={kw} delay={0.3 + i * 0.04} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Long-tail keywords */}
      {brand.long_tail_keyword_examples && brand.long_tail_keyword_examples.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Long-tail Keywords</p>
          <div className="flex flex-wrap gap-2">
            {brand.long_tail_keyword_examples.map((kw, i) => (
              <KeywordChip key={i} text={kw} delay={0.4 + i * 0.04} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Content opportunities */}
      {brand.content_opportunities && brand.content_opportunities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
        >
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Content Opportunities</p>
          <div className="space-y-2">
            {brand.content_opportunities.map((opp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.06 }}
                className="flex items-start gap-2.5 bg-emerald-50/60 border border-emerald-100 rounded-xl p-3.5"
              >
                <Zap size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-[13px] text-emerald-800 leading-relaxed">{opp}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── Competition Tab ──────────────────────────────────────────────────────────
function CompetitionTab({ audit, onSearch, onScrape }: {
  audit: AuditData;
  onSearch: (term: string) => Promise<{ results?: SerpResult[] }>;
  onScrape: (urls: string[]) => Promise<{ results?: ScrapedCompetitor[] }>;
}) {
  const brand = (audit.brand_analysis || {}) as BrandAnalysis;
  const [searchTerm, setSearchTerm] = useState(brand.primary_search_keyword || "");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);
  const [resetIn, setResetIn] = useState<number | undefined>();
  const [serpResults, setSerpResults] = useState<SerpResult[]>(audit.serp_results || []);
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [scrapedResults, setScrapedResults] = useState<ScrapedCompetitor[]>(audit.scraped_competitors || []);
  const [expandedUrl, setExpandedUrl] = useState<string | null>(null);

  // Sync from audit when it loads
  useEffect(() => {
    if (audit.serp_results?.length) setSerpResults(audit.serp_results);
    if (audit.scraped_competitors?.length) setScrapedResults(audit.scraped_competitors);
  }, [audit.serp_results, audit.scraped_competitors]);

  // Update search term when brand analysis loads
  useEffect(() => {
    if (brand.primary_search_keyword && !searchTerm) {
      setSearchTerm(brand.primary_search_keyword);
    }
  }, [brand.primary_search_keyword]);

  async function handleSearch() {
    if (!searchTerm || searching) return;
    setSearching(true);
    setSearchError(null);
    setRateLimited(false);
    try {
      const data = await onSearch(searchTerm);
      setSerpResults(data.results || []);
    } catch (err: any) {
      if (err.rateLimited) {
        setRateLimited(true);
        setResetIn(err.resetIn);
      } else {
        setSearchError(err.message || "Search failed");
      }
    } finally {
      setSearching(false);
    }
  }

  function toggleUrl(url: string) {
    setSelectedUrls(prev => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else if (next.size < 5) next.add(url);
      return next;
    });
  }

  async function handleScrape() {
    if (selectedUrls.size === 0 || scraping) return;
    setScraping(true);
    setScrapeError(null);
    try {
      const data = await onScrape(Array.from(selectedUrls));
      setScrapedResults(data.results || []);
    } catch (err: any) {
      if (err.rateLimited) {
        setScrapeError("Rate limit reached. Please try again later.");
      } else {
        setScrapeError(err.message || "Scraping failed");
      }
    } finally {
      setScraping(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[20px] font-bold text-slate-900">Competitor Research</h2>
        <p className="text-[13px] text-slate-400 mt-0.5">See who ranks for your keywords and analyze their content</p>
      </div>

      {/* Search bar */}
      <div className="flex gap-2.5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Enter a search keyword..."
            disabled={searching}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 shadow-sm transition-all"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={searching || !searchTerm}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white text-[14px] font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {searching ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Searching...
            </>
          ) : (
            <>
              <Search size={15} /> Search
            </>
          )}
        </button>
      </div>

      {searchError && (
        <p className="text-[13px] text-red-500 font-medium">{searchError}</p>
      )}
      {rateLimited && <RateLimitMessage resetIn={resetIn} />}

      {/* SERP Results */}
      {serpResults.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-bold text-slate-600">
              {serpResults.length} results found
            </p>
            {selectedUrls.size > 0 && (
              <button
                onClick={handleScrape}
                disabled={scraping}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-[12.5px] font-semibold hover:bg-slate-800 transition-colors disabled:opacity-60"
              >
                {scraping ? (
                  <>
                    <Loader2 size={13} className="animate-spin" /> Scraping...
                  </>
                ) : (
                  <>
                    <Zap size={13} /> Scrape {selectedUrls.size} competitor{selectedUrls.size === 1 ? "" : "s"}
                  </>
                )}
              </button>
            )}
          </div>

          {serpResults.map((result, i) => {
            const isSelected = selectedUrls.has(result.url);
            return (
              <motion.div
                key={result.url}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
                  isSelected
                    ? "border-blue-300 bg-blue-50/50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <button
                  onClick={() => toggleUrl(result.url)}
                  className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                    isSelected ? "bg-blue-600 border-blue-600" : "border-slate-300 hover:border-blue-400"
                  }`}
                >
                  {isSelected && <CheckCircle2 size={13} className="text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold text-slate-400 tabular-nums">#{result.rank}</span>
                    <span className="text-[12px] text-slate-500 truncate">{result.url}</span>
                  </div>
                  <p className="text-[14px] font-semibold text-slate-800 mb-1">{result.title}</p>
                  <p className="text-[12.5px] text-slate-500 leading-relaxed line-clamp-2">{result.description}</p>
                </div>
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <ExternalLink size={14} />
                </a>
              </motion.div>
            );
          })}
        </div>
      )}

      {scrapeError && (
        <p className="text-[13px] text-red-500 font-medium">{scrapeError}</p>
      )}

      {/* Scraped competitor content */}
      {scrapedResults.length > 0 && (
        <div className="space-y-3">
          <p className="text-[13px] font-bold text-slate-600">Scraped Competitor Content</p>
          {scrapedResults.map((sc, i) => (
            <motion.div
              key={sc.url}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-xl border border-slate-200 bg-white overflow-hidden"
            >
              <button
                onClick={() => setExpandedUrl(expandedUrl === sc.url ? null : sc.url)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Globe size={15} className="text-slate-400 shrink-0" />
                  <span className="text-[13px] font-medium text-slate-700 truncate">{sc.url}</span>
                </div>
                <ChevronDown
                  size={15}
                  className={`text-slate-400 shrink-0 transition-transform ${expandedUrl === sc.url ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence>
                {expandedUrl === sc.url && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4">
                      {sc.error ? (
                        <p className="text-[12.5px] text-red-500">Error: {sc.error}</p>
                      ) : (
                        <p className="text-[12.5px] text-slate-600 leading-relaxed line-clamp-[8]">
                          {sc.content.slice(0, 2000)}
                          {sc.content.length > 2000 ? "..." : ""}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {serpResults.length === 0 && !searching && !searchError && !rateLimited && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Search size={24} className="text-slate-300" />
          </div>
          <p className="text-[14px] text-slate-400">Search for a keyword to see your competition</p>
        </div>
      )}
    </div>
  );
}

// ─── Opportunity Tab ─────────────────────────────────────────────────────────
function OpportunityTab() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        <div className="absolute inset-0 bg-blue-100/40 blur-2xl rounded-full" />
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Rocket size={30} className="text-white" />
        </div>
      </motion.div>
      <motion.h3
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-[20px] font-bold text-slate-900 mt-6 mb-2"
      >
        Coming Soon
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22 }}
        className="text-[14px] text-slate-500 text-center max-w-[400px] leading-relaxed"
      >
        Your personalized content opportunity report will appear here once the full audit pipeline is available.
      </motion.p>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function FreeAuditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("brand");
  const [audit, setAudit] = useState<AuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [analyzeRateLimited, setAnalyzeRateLimited] = useState(false);
  const [analyzeResetIn, setAnalyzeResetIn] = useState<number | undefined>();
  const hasTriggeredAnalysis = useRef(false);

  // Load audit on mount
  const loadAudit = useCallback(async () => {
    try {
      const data = await callFreeAudit("get", { audit_id: params.id });
      setAudit(data.data);
    } catch {
      router.replace("/astrorank");
      return;
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    loadAudit();
  }, [loadAudit]);

  // Auto-trigger brand analysis
  const analyzeBrand = useCallback(async () => {
    setAnalyzing(true);
    setAnalyzeError(null);
    setAnalyzeRateLimited(false);
    try {
      const data = await callFreeAudit("analyze-brand", { audit_id: params.id });
      setAudit(data.data);
    } catch (err: any) {
      if (err.rateLimited) {
        setAnalyzeRateLimited(true);
        setAnalyzeResetIn(err.resetIn);
      } else {
        setAnalyzeError(err.message || "Analysis failed");
      }
    } finally {
      setAnalyzing(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (!audit || hasTriggeredAnalysis.current) return;
    if (audit.status === "pending" || audit.status === "error") {
      hasTriggeredAnalysis.current = true;
      analyzeBrand();
    }
  }, [audit, analyzeBrand]);

  // SERP search handler
  const handleSearch = useCallback(async (term: string): Promise<{ results?: SerpResult[] }> => {
    return await callFreeAudit("search-serp", {
      audit_id: params.id,
      search_term: term,
    });
  }, [params.id]);

  // Scrape competitors handler
  const handleScrape = useCallback(async (urls: string[]): Promise<{ results?: ScrapedCompetitor[] }> => {
    return await callFreeAudit("scrape-competitors", {
      audit_id: params.id,
      urls,
    });
  }, [params.id]);

  // Loading state
  if (loading) {
    return (
      <div className="relative min-h-screen bg-slate-50">
        <SpaceBg />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 border-3 border-blue-100 border-t-blue-500 rounded-full"
              style={{ borderWidth: "3px" }}
            />
            <p className="text-[14px] text-slate-400 mt-4">Loading audit...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="relative min-h-screen bg-slate-50">
        <SpaceBg />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 border-3 border-blue-100 border-t-blue-500 rounded-full"
              style={{ borderWidth: "3px" }}
            />
            <p className="text-[14px] text-slate-400 mt-4">Redirecting...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50">
      <SpaceBg />

      {/* Header */}
      <header className="relative z-10 sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-200/70">
        <div className="max-w-[960px] mx-auto px-5 lg:px-8 h-[64px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <AstroLogo />
            <div className="hidden sm:block h-6 w-px bg-slate-200" />
            <div className="hidden sm:flex items-center gap-1.5 min-w-0">
              <Globe size={14} className="text-slate-400 shrink-0" />
              <span className="text-[13px] text-slate-500 truncate font-mono">{audit.website_url}</span>
            </div>
          </div>
          <a
            href="/astrorank"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors shrink-0"
          >
            <ArrowLeft size={14} /> Back
          </a>
        </div>
      </header>

      {/* Main content */}
      <div className="relative z-10 max-w-[960px] mx-auto px-5 lg:px-8 py-8">
        {/* Tab bar */}
        <div className="flex justify-center mb-8">
          <TabBar active={activeTab} onChange={setActiveTab} />
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === "brand" && (
              <BrandTab
                audit={audit}
                onAnalyze={analyzeBrand}
                analyzing={analyzing}
                analyzeError={analyzeError}
                rateLimited={analyzeRateLimited}
                resetIn={analyzeResetIn}
              />
            )}
            {activeTab === "competition" && (
              <CompetitionTab
                audit={audit}
                onSearch={handleSearch}
                onScrape={handleScrape}
              />
            )}
            {activeTab === "opportunity" && <OpportunityTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
