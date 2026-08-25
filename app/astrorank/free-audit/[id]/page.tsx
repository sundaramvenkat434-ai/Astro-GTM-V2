"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, Globe, Zap, RefreshCw, CircleAlert as AlertCircle, CircleCheck as CheckCircle2, ExternalLink, Rocket, Lock, ChevronDown, Loader as Loader2, Bug, X, Brain, ChartBar as BarChart3, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
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

interface UnderstanderAnalysis {
  about_brand?: string;
  primary_product_or_service?: string;
  geographies?: string;
  target_audience?: string;
  search_intent?: string;
  business_understanding?: string;
}

interface AuditData {
  id: string;
  website_url: string;
  status: string;
  brand_analysis: BrandAnalysis | Record<string, unknown>;
  search_queries: string[];
  serp_results: SerpResult[];
  scraped_competitors: ScrapedCompetitor[];
  error_message: string | null;
  created_at: string;
  updated_at: string;
  search_queries_raw_input?: Record<string, unknown> | null;
  search_queries_raw_output?: Record<string, unknown> | null;
  scraped_content?: string | null;
  understander_analysis?: UnderstanderAnalysis | Record<string, unknown> | null;
  keyword_volume_estimates?: KeywordVolumeEstimate[] | null;
  keyword_volume_raw_input?: Record<string, unknown> | null;
  keyword_volume_raw_output?: Record<string, unknown> | null;
}

interface KeywordVolumeEstimate {
  query: string;
  cluster_id: number | null;
  cluster_head: string;
  is_cluster_head: boolean;
  estimated_monthly_volume: number;
  confidence: string;
  factors: Record<string, unknown>;
}

type TabId = "queries" | "brand" | "competition" | "opportunity";

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
  { id: "queries", label: "Search Queries" },
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

// ─── Search Queries Tab ──────────────────────────────────────────────────────
function SearchQueriesLoadingState() {
  const steps = ["Fetching website content", "Extracting page text", "Analyzing business", "Generating search queries"];
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
      <p className="text-[16px] font-bold text-slate-700 mb-4">Generating search queries...</p>
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

function SearchQueriesErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <AlertCircle size={26} className="text-red-500" />
      </div>
      <p className="text-[16px] font-bold text-slate-700 mb-2">Generation Failed</p>
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

function RawDataPopup({ audit, onClose }: { audit: AuditData; onClose: () => void }) {
  const rawInput = audit.search_queries_raw_input || null;
  const rawOutput = audit.search_queries_raw_output || null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-[720px] w-full max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Bug size={16} className="text-amber-500" />
            <h3 className="text-[15px] font-bold text-slate-900">Raw AI Input / Output</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Raw Input (sent to AI)</p>
            <pre className="text-[11.5px] text-slate-700 bg-slate-50 rounded-xl border border-slate-200 p-3.5 overflow-x-auto whitespace-pre-wrap break-words leading-relaxed">
{rawInput ? JSON.stringify(rawInput, null, 2) : "No raw input saved"}
            </pre>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Raw Output (from AI)</p>
            <pre className="text-[11.5px] text-slate-700 bg-slate-50 rounded-xl border border-slate-200 p-3.5 overflow-x-auto whitespace-pre-wrap break-words leading-relaxed">
{rawOutput ? JSON.stringify(rawOutput, null, 2) : "No raw output saved"}
            </pre>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Content Helpers ──────────────────────────────────────────────────────────
function formatScrapedContent(raw: string): { label: string; text: string; kind: "title" | "meta" | "heading" | "body" }[] {
  const lines = raw.split(/\n+/).map(l => l.trim()).filter(Boolean);
  const blocks: { label: string; text: string; kind: "title" | "meta" | "heading" | "body" }[] = [];
  const keywordRe = /\b(product|solution|feature|pricing|customer|about|service|platform|how it work|benefit|use case|testimonial|review|faq|contact|team|mission|value|integrat|api|demo|trial|free|starter|pro|enterprise|plan)/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();

    if (i === 0 && line.length < 200 && lines.length > 1) {
      blocks.push({ label: "Title", text: line, kind: "title" });
      continue;
    }
    if (line.length < 300 && (lower.startsWith("meta") || lower.includes("description:"))) {
      blocks.push({ label: "Meta Description", text: line.replace(/^meta\s*(description)?\s*:?\\s*/i, ""), kind: "meta" });
      continue;
    }
    const isShortHeading = line.length <= 120 && line.length >= 2;
    const looksLikeHeading = isShortHeading && (
      /^(h[1-6]|heading|section|chapter)/i.test(line) ||
      /^[A-Z][A-Z0-9 \-:&'/]+$/.test(line) ||
      (line.split(" ").length <= 12 && /^[A-Z]/.test(line) && !line.endsWith("."))
    );
    if (looksLikeHeading) {
      const level = /^(h1|title)/i.test(line) ? "H1" : /^(h2)/i.test(line) ? "H2" : /^(h3)/i.test(line) ? "H3" : "Heading";
      blocks.push({ label: level, text: line.replace(/^h[1-6]\\s*/i, ""), kind: "heading" });
      continue;
    }
    if (line.length > 60) {
      const isKeywordSection = keywordRe.test(line);
      blocks.push({ label: isKeywordSection ? "Key Section" : "Paragraph", text: line, kind: "body" });
      continue;
    }
    blocks.push({ label: "Text", text: line, kind: "body" });
  }
  return blocks;
}

function generateWebsiteBrief(raw: string): string {
  const blocks = formatScrapedContent(raw);
  if (blocks.length === 0) return "";

  const businessKeywords = /\b(product|solution|feature|pricing|customer|about|service|platform|how it work|benefit|use case|testimonial|review|faq|contact|team|mission|value|integrat|api|demo|trial|free|starter|pro|enterprise|plan|offer|market|industries?|help|support|resource|blog|case stud|success stor|capabilit|technology|software|tool|saas|app|application)/i;
  const faqRe = /\b(faq|frequently asked|question|answer|q\s*[:a])/i;
  const seen = new Set<string>();

  const scored = blocks.map((block, i) => {
    const text = block.text.trim();
    const lower = text.toLowerCase();
    let score = 0;

    if (block.kind === "title") score += 30;
    if (block.kind === "meta") score += 25;
    if (block.kind === "heading") score += 15;

    if (businessKeywords.test(text)) score += 12;
    if (faqRe.test(text)) score += 10;

    if (block.kind === "heading" && i + 1 < blocks.length) {
      const next = blocks[i + 1];
      if (next.kind === "body" && next.text.length > 60) score += 8;
    }
    if (block.kind === "body" && i > 0 && blocks[i - 1].kind === "heading") score += 6;

    if (text.length >= 80 && text.length <= 500) score += 5;
    if (text.length < 30) score -= 8;
    if (text.length > 800) score -= 4;

    score += Math.max(0, 5 - Math.floor(i / 10));

    const dedupKey = lower.replace(/[^a-z0-9]/g, "").slice(0, 80);
    if (seen.has(dedupKey)) score -= 20;
    else seen.add(dedupKey);

    return { text, score, kind: block.kind, index: i };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.filter(s => s.score > 0).slice(0, 10);
  top.sort((a, b) => a.index - b.index);

  const parts = top.map(t => t.text);
  let brief = parts.join(" ");
  const words = brief.split(/\s+/);
  if (words.length > 500) {
    brief = words.slice(0, 500).join(" ");
  }
  return brief;
}

function extractScrapedKeywords(raw: string): string[] {
  const blocks = formatScrapedContent(raw);
  const keywords: string[] = [];
  const seen = new Set<string>();
  const businessRe = /\b(product|solution|feature|pricing|customer|service|platform|benefit|use case|testimonial|integrat|api|demo|trial|enterprise|capabilit|technology|software|saas|industries?|market|help|support|resource|blog|case stud|success stor)/i;

  for (const block of blocks) {
    if (block.kind === "title" || block.kind === "heading") {
      const text = block.text.trim();
      if (text.length >= 3 && text.length <= 60) {
        const key = text.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          keywords.push(text);
        }
      }
    }
    if (block.kind === "body" && keywords.length < 25) {
      const sentences = block.text.split(/[.;,]/).map(s => s.trim()).filter(s => s.length >= 10 && s.length <= 80);
      for (const sentence of sentences) {
        if (businessRe.test(sentence)) {
          const key = sentence.toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            keywords.push(sentence);
          }
        }
      }
    }
  }
  return keywords.slice(0, 20);
}

// ─── Browser Mockup ───────────────────────────────────────────────────────────
function BrowserMockup({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl overflow-hidden shadow-2xl border border-slate-200 bg-white">
      <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-100 border-b border-slate-200">
        <div className="flex gap-1.5 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <div className="flex items-center gap-0.5 ml-2 shrink-0">
          <ChevronLeft size={14} className="text-slate-300" />
          <ChevronRight size={14} className="text-slate-300" />
        </div>
        <div className="flex-1 ml-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-md border border-slate-200">
            <Lock size={10} className="text-slate-400 shrink-0" />
            <span className="text-[11px] text-slate-500 truncate font-mono">{url}</span>
          </div>
        </div>
      </div>
      <div className="relative overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function SkeletonWebsite() {
  return (
    <div className="p-5 sm:p-6 space-y-5 bg-slate-50/50 min-h-[420px]">
      <div className="space-y-2.5">
        <div className="h-6 w-3/4 bg-slate-200/70 rounded animate-pulse" />
        <div className="h-4 w-1/2 bg-slate-200/50 rounded animate-pulse" />
        <div className="h-9 w-32 bg-blue-200/50 rounded-lg animate-pulse mt-1.5" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map(i => (
          <div key={i} className="space-y-2 p-3 border border-slate-200/60 rounded-lg bg-white/50">
            <div className="h-4 w-full bg-slate-200/50 rounded animate-pulse" />
            <div className="h-3 w-3/4 bg-slate-200/40 rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full bg-slate-200/40 rounded animate-pulse" />
        <div className="h-3 w-5/6 bg-slate-200/40 rounded animate-pulse" />
        <div className="h-3 w-4/6 bg-slate-200/40 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[0, 1].map(i => (
          <div key={i} className="space-y-2 p-3 border border-slate-200/60 rounded-lg bg-white/50">
            <div className="h-3.5 w-2/3 bg-slate-200/50 rounded animate-pulse" />
            <div className="h-3 w-full bg-slate-200/40 rounded animate-pulse" />
            <div className="h-3 w-5/6 bg-slate-200/40 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ScannerOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <motion.div
        className="absolute left-0 right-0 h-24 bg-gradient-to-b from-transparent via-blue-400/10 to-blue-500/20"
        animate={{ top: ["-12%", "100%"] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300/40 to-transparent translate-y-1" />
      </motion.div>
    </div>
  );
}

interface SeoSignal {
  label: string;
  anchorTop: number;
}

const SEO_SIGNALS: SeoSignal[] = [
  { label: "Analysing website content", anchorTop: 4 },
  { label: "Checking page title", anchorTop: 12 },
  { label: "Reading meta description", anchorTop: 19 },
  { label: "Analysing headings", anchorTop: 30 },
  { label: "Identifying H1", anchorTop: 36 },
  { label: "Reviewing H2 sections", anchorTop: 44 },
  { label: "Understanding products and services", anchorTop: 56 },
  { label: "Checking FAQs", anchorTop: 68 },
  { label: "Reading structured data", anchorTop: 80 },
  { label: "Identifying key business information", anchorTop: 90 },
];

type SignalState = "pending" | "scanning" | "complete";

function SeoScanSignals() {
  const [currentSignal, setCurrentSignal] = useState(0);
  const [signalStates, setSignalStates] = useState<SignalState[]>(
    () => SEO_SIGNALS.map(() => "pending")
  );

  useEffect(() => {
    const stepDuration = 650;
    const interval = setInterval(() => {
      setCurrentSignal(prev => {
        const next = prev + 1;
        if (next >= SEO_SIGNALS.length) {
          clearInterval(interval);
          return prev;
        }
        return next;
      });
    }, stepDuration);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentSignal >= SEO_SIGNALS.length) return;
    setSignalStates(prev => {
      const next = [...prev];
      if (currentSignal > 0) next[currentSignal - 1] = "complete";
      next[currentSignal] = "scanning";
      return next;
    });
  }, [currentSignal]);

  useEffect(() => {
    if (currentSignal !== SEO_SIGNALS.length - 1) return;
    const timeout = setTimeout(() => {
      setSignalStates(prev => {
        const next = [...prev];
        next[SEO_SIGNALS.length - 1] = "complete";
        return next;
      });
    }, 650);
    return () => clearTimeout(timeout);
  }, [currentSignal]);

  const visibleStart = Math.max(0, currentSignal - 1);
  const visibleEnd = Math.min(SEO_SIGNALS.length, visibleStart + 4);
  const visibleSignals = SEO_SIGNALS.slice(visibleStart, visibleEnd).map((sig, i) => ({
    ...sig,
    state: signalStates[visibleStart + i],
    index: visibleStart + i,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence mode="popLayout">
        {visibleSignals.map(sig => {
          const isScanning = sig.state === "scanning";
          const isComplete = sig.state === "complete";
          return (
            <motion.div
              key={sig.index}
              layout
              initial={{ opacity: 0, y: 6, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.92 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              style={{ top: `${sig.anchorTop}%`, left: "50%", x: "-50%" }}
              className="absolute"
            >
              <div
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-lg border shadow-sm whitespace-nowrap
                  transition-colors duration-300
                  ${isComplete
                    ? "bg-emerald-50/95 border-emerald-200"
                    : isScanning
                    ? "bg-blue-50/95 border-blue-200"
                    : "bg-white/90 border-slate-200"
                  }`
                }
              >
                {isComplete ? (
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                ) : isScanning ? (
                  <Loader2 size={13} className="text-blue-500 shrink-0 animate-spin" />
                ) : (
                  <div className="w-[13px] h-[13px] rounded-full border-1.5 border-slate-300 shrink-0" />
                )}
                <span
                  className={`text-[11.5px] font-semibold transition-colors duration-300 ${
                    isComplete
                      ? "text-emerald-700"
                      : isScanning
                      ? "text-blue-700"
                      : "text-slate-400"
                  }`}
                >
                  {sig.label}
                </span>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

const SCAN_STATUSES = ["Scanning website", "Finding key signals", "Connecting the dots", "Building your brand profile"];

function ScanningStatus() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIdx(i => Math.min(i + 1, SCAN_STATUSES.length - 1));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 h-5">
      <Loader2 size={13} className="text-blue-500 animate-spin shrink-0" />
      <AnimatePresence mode="wait">
        <motion.span
          key={idx}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          className="text-[13px] font-semibold text-slate-600"
        >
          {SCAN_STATUSES[idx]}...
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

// ─── Search Queries Tab (Simplified) ──────────────────────────────────────────
function SearchQueriesTab({ audit, onGenerate, generating, generateError, rateLimited, resetIn, queryTime, onEstimateVolume, estimatingVolume, volumeError, volumeRateLimited, volumeResetIn, volumeTime }: {
  audit: AuditData;
  onGenerate: () => void;
  generating: boolean;
  generateError: string | null;
  rateLimited: boolean;
  resetIn?: number;
  queryTime: number | null;
  onEstimateVolume: () => void;
  estimatingVolume: boolean;
  volumeError: string | null;
  volumeRateLimited: boolean;
  volumeResetIn?: number;
  volumeTime: number | null;
}) {
  const queries = audit.search_queries || [];
  const hasResults = queries.length > 0;
  const [showRaw, setShowRaw] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[20px] font-bold text-slate-900">Search Queries</h2>
        <p className="text-[13px] text-slate-400 mt-0.5">AI-generated search queries based on your brand analysis</p>
      </div>

      {generating && <SearchQueriesLoadingState />}
      {!generating && rateLimited && <RateLimitMessage resetIn={resetIn} />}
      {!generating && !rateLimited && generateError && !hasResults && <SearchQueriesErrorState message={generateError} onRetry={onGenerate} />}
      {!generating && !rateLimited && !generateError && !hasResults && (
        <SearchQueriesErrorState message="No search queries generated yet. Run the brand analysis first, then generate queries." onRetry={onGenerate} />
      )}
      {!generating && !rateLimited && hasResults && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[13px] text-slate-500">{queries.length} search queries generated{queryTime ? ` · ${queryTime.toFixed(1)}s` : ""}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRaw(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-50 text-amber-600 text-[12.5px] font-semibold hover:bg-amber-100 transition-colors"
              >
                <Bug size={13} /> Raw I/O
              </button>
              <button
                onClick={onGenerate}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 text-slate-600 text-[12.5px] font-semibold hover:bg-slate-200 transition-colors"
              >
                <RefreshCw size={13} /> Regenerate
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {queries.map((query, i) => {
              const volumeEstimate = (audit.keyword_volume_estimates || []).find(e => e.query === query);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <span className="text-[13px] font-bold text-blue-600 tabular-nums">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] text-slate-700 font-medium leading-relaxed">{query}</p>
                    {volumeEstimate && volumeEstimate.estimated_monthly_volume > 0 && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[12px] text-slate-500">
                          ~{volumeEstimate.estimated_monthly_volume.toLocaleString()}/mo
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          volumeEstimate.confidence === "High"
                            ? "bg-emerald-50 text-emerald-600"
                            : volumeEstimate.confidence === "Medium"
                            ? "bg-amber-50 text-amber-600"
                            : "bg-slate-100 text-slate-500"
                        }`}>
                          {volumeEstimate.confidence}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="pt-2">
            {estimatingVolume && (
              <div className="flex flex-col items-center justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-10 h-10 border-3 border-blue-100 border-t-blue-500 rounded-full mb-4"
                  style={{ borderWidth: "3px" }}
                />
                <p className="text-[14px] font-medium text-slate-500">Estimating search volumes...</p>
              </div>
            )}

            {!estimatingVolume && volumeRateLimited && <RateLimitMessage resetIn={volumeResetIn} />}

            {!estimatingVolume && !volumeRateLimited && volumeError && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3">
                  <AlertCircle size={22} className="text-red-500" />
                </div>
                <p className="text-[14px] font-bold text-slate-700 mb-1">Estimation Failed</p>
                <p className="text-[12.5px] text-slate-500 mb-4 text-center max-w-[400px]">{volumeError}</p>
                <button
                  onClick={onEstimateVolume}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-[13px] font-semibold hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw size={13} /> Try Again
                </button>
              </div>
            )}

            {!estimatingVolume && !volumeRateLimited && !volumeError && (
              <div className="flex items-center justify-between">
                <div>
                  {audit.keyword_volume_estimates && audit.keyword_volume_estimates.length > 0 ? (
                    <p className="text-[13px] text-slate-500">
                      Volume estimates generated{volumeTime ? ` · ${volumeTime.toFixed(1)}s` : ""}
                    </p>
                  ) : (
                    <p className="text-[13px] text-slate-400">Estimate monthly search volume for all queries</p>
                  )}
                </div>
                <button
                  onClick={onEstimateVolume}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 text-white text-[12.5px] font-semibold hover:bg-blue-700 transition-colors"
                >
                  <BarChart3 size={13} />
                  {audit.keyword_volume_estimates && audit.keyword_volume_estimates.length > 0 ? "Re-estimate Volume" : "Estimate Volume"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <AnimatePresence>
        {showRaw && <RawDataPopup audit={audit} onClose={() => setShowRaw(false)} />}
      </AnimatePresence>
    </div>
  );
}

// ─── Brand Tab (Browser Workflow) ────────────────────────────────────────────
function RateLimitMessage({ resetIn }: { resetIn?: number }) {
  const mins = resetIn ? Math.ceil(resetIn / 60) : "a few";
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mb-4">
        <AlertCircle size={26} className="text-amber-500" />
      </div>
      <p className="text-[16px] font-bold text-slate-700 mb-2">Rate Limit Reached</p>
      <p className="text-[13px] text-slate-500 mb-6 text-center max-w-[400px]">
        You&apos;ve made a lot of requests recently. Please try again in about {mins} minute{mins === 1 ? "" : "s"}.
      </p>
    </div>
  );
}

type BrandPhase = "initial" | "scanning" | "complete";
type PipelineStep = "idle" | "scraping" | "understanding" | "done";

function BrandTab({ audit, onScrape, scraping, scrapeError, onRunUnderstander, runningUnderstander, understanderError, onGenerateQueries, generatingQueries, generateQueriesError, generateQueriesRateLimited, generateQueriesResetIn, queryTime, scrapeTime, understanderTime, summary, onSummarize, onNext }: {
  audit: AuditData;
  onScrape: () => void;
  scraping: boolean;
  scrapeError: string | null;
  onRunUnderstander: () => void;
  runningUnderstander: boolean;
  understanderError: string | null;
  onGenerateQueries: () => void;
  generatingQueries: boolean;
  generateQueriesError: string | null;
  generateQueriesRateLimited: boolean;
  generateQueriesResetIn?: number;
  queryTime: number | null;
  scrapeTime: number | null;
  understanderTime: number | null;
  summary: string | null;
  onSummarize: () => void;
  onNext: (keywords: string[]) => void;
}) {
  const [phase, setPhase] = useState<BrandPhase>("initial");
  const [pipelineStep, setPipelineStep] = useState<PipelineStep>("idle");
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const queriesTriggeredRef = useRef(false);
  const understanderStartedRef = useRef(false);

  const hasScraped = Boolean(audit.scraped_content && audit.scraped_content.length > 0);
  const hasUnderstanding = (() => {
    const ua = audit.understander_analysis as UnderstanderAnalysis | undefined;
    if (!ua) return false;
    return Boolean(ua.about_brand || ua.primary_product_or_service || ua.geographies || ua.target_audience || ua.search_intent || ua.business_understanding);
  })();
  const brand = (audit.brand_analysis || {}) as BrandAnalysis;

  const keywords = useMemo(() => {
    if (audit.scraped_content) {
      return extractScrapedKeywords(audit.scraped_content);
    }
    return [];
  }, [audit.scraped_content]);

  const allQueries = audit.search_queries || [];
  const sortedQueries = useMemo(() => {
    return [...allQueries].sort((a, b) => {
      const aWords = a.trim().split(/\s+/).length;
      const bWords = b.trim().split(/\s+/).length;
      if (aWords !== bWords) return aWords - bWords;
      return a.length - b.length;
    });
  }, [allQueries]);
  const topKeywords = sortedQueries.slice(0, 6);
  const rankedKeywords = topKeywords.slice(0, 2);
  const optionalKeywords = topKeywords.slice(2, 6);
  const hasQueries = allQueries.length > 0;

  // Auto-detect existing data on mount
  useEffect(() => {
    if (hasScraped && hasUnderstanding && phase === "initial") {
      setPhase("complete");
    }
  }, [hasScraped, hasUnderstanding, phase]);

  // Start the analysis pipeline
  const startAnalysis = useCallback(() => {
    understanderStartedRef.current = false;
    setPhase("scanning");
    setMinTimeElapsed(false);
    setPipelineStep(hasScraped ? "understanding" : "scraping");

    if (hasScraped) {
      onSummarize();
      onRunUnderstander();
      understanderStartedRef.current = true;
    } else {
      onScrape();
    }

    setTimeout(() => setMinTimeElapsed(true), 6000);
  }, [hasScraped, onScrape, onSummarize, onRunUnderstander]);

  // When scraping completes, move to understanding
  useEffect(() => {
    if (pipelineStep === "scraping" && hasScraped && !understanderStartedRef.current) {
      onSummarize();
      setPipelineStep("understanding");
      onRunUnderstander();
      understanderStartedRef.current = true;
    }
  }, [pipelineStep, hasScraped, onSummarize, onRunUnderstander]);

  // When understanding completes and min time elapsed, go to complete
  useEffect(() => {
    if (phase === "scanning" && hasUnderstanding && minTimeElapsed) {
      setPipelineStep("done");
      setPhase("complete");
    }
  }, [phase, hasUnderstanding, minTimeElapsed]);

  // Auto-generate search queries once the brand profile is complete
  useEffect(() => {
    if (phase === "complete" && !hasQueries && !generatingQueries && !queriesTriggeredRef.current) {
      queriesTriggeredRef.current = true;
      onGenerateQueries();
    }
  }, [phase, hasQueries, generatingQueries, onGenerateQueries]);

  // Auto-select the top 2 ranked keywords when queries arrive
  useEffect(() => {
    if (hasQueries && selectedKeywords.size === 0) {
      setSelectedKeywords(new Set(sortedQueries.slice(0, 2)));
    }
  }, [hasQueries, selectedKeywords.size, sortedQueries]);

  // Error during scanning
  const scanError = scrapeError || understanderError;

  // ── Initial State ──
  if (phase === "initial") {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-[420px]"
        >
          <div className="relative inline-flex mb-6">
            <div className="absolute inset-0 bg-blue-100/50 blur-2xl rounded-full" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Globe size={30} className="text-white" />
            </div>
          </div>
          <h2 className="text-[22px] font-bold text-slate-900 mb-2">Let&apos;s analyse your website</h2>
          <p className="text-[14px] text-slate-500 leading-relaxed mb-8">
            We&apos;ll scan <span className="font-semibold text-slate-700">{audit.website_url}</span> to understand what your brand does, who you serve, and how customers find you.
          </p>
          <button
            onClick={startAnalysis}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-[14px] font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20"
          >
            <Search size={16} /> Start Analysis
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Scanning State ──
  if (phase === "scanning") {
    return (
      <div className="space-y-5">
        <BrowserMockup url={audit.website_url}>
          <SkeletonWebsite />
          <ScannerOverlay />
          <SeoScanSignals />
        </BrowserMockup>

        <div className="flex flex-col items-center gap-3">
          <ScanningStatus />
          {scanError && (
            <div className="flex flex-col items-center gap-2 mt-2">
              <p className="text-[13px] text-red-500 font-medium">{scanError}</p>
              <button
                onClick={startAnalysis}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-[13px] font-semibold hover:bg-blue-700 transition-colors"
              >
                <RefreshCw size={13} /> Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Completion State ──
  const understanderData = (audit.understander_analysis as UnderstanderAnalysis) || {};
  const understanding = understanderData.business_understanding || "";
  const briefSummary = summary || "";
  const brandName = brand.about_brand?.split(/[.,;:]/)[0]?.trim() || audit.website_url.replace(/^https?:\/\/(www\.)?/, "").split("/")[0];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* Left column: Browser preview */}
        <BrowserMockup url={audit.website_url}>
          <div className="bg-white min-h-[340px]">
            {/* Hero section */}
            <div className="px-5 sm:px-6 pt-6 pb-5 border-b border-slate-100">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Globe size={14} className="text-slate-400" />
                  <span className="text-[12px] text-slate-400 font-mono">{audit.website_url}</span>
                </div>
                <h2 className="text-[20px] font-bold text-slate-900 mb-1">{brandName}</h2>
                {briefSummary && (
                  <p className="text-[13px] text-slate-500 leading-relaxed line-clamp-2 max-w-[600px]">
                    {briefSummary.slice(0, 200)}{briefSummary.length > 200 ? "..." : ""}
                  </p>
                )}
              </motion.div>
            </div>

            {/* Brand profile */}
            <div className="px-5 sm:px-6 py-5">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Brain size={14} className="text-blue-600" />
                  </div>
                  <h3 className="text-[15px] font-bold text-slate-900">Your brand profile</h3>
                </div>
                {understanderData.about_brand || understanderData.primary_product_or_service || understanderData.geographies || understanderData.target_audience || understanderData.search_intent ? (
                  <div className="space-y-3">
                    {understanderData.about_brand && (
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">About the brand</p>
                        <p className="text-[13.5px] text-slate-700 leading-relaxed">{understanderData.about_brand}</p>
                      </div>
                    )}
                    {understanderData.primary_product_or_service && (
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Primary product or service</p>
                        <p className="text-[13.5px] text-slate-700 leading-relaxed">{understanderData.primary_product_or_service}</p>
                      </div>
                    )}
                    {understanderData.geographies && (
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Geographies</p>
                        <p className="text-[13.5px] text-slate-700 leading-relaxed">{understanderData.geographies}</p>
                      </div>
                    )}
                    {understanderData.target_audience && (
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Target audience</p>
                        <p className="text-[13.5px] text-slate-700 leading-relaxed">{understanderData.target_audience}</p>
                      </div>
                    )}
                    {understanderData.search_intent && (
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">How people might search for it</p>
                        <p className="text-[13.5px] text-slate-700 leading-relaxed">{understanderData.search_intent}</p>
                      </div>
                    )}
                  </div>
                ) : understanding ? (
                  <p className="text-[14px] text-slate-700 leading-relaxed">{understanding}</p>
                ) : (
                  <p className="text-[13px] text-slate-400">No understanding available yet.</p>
                )}
              </motion.div>
            </div>

            {/* Key themes from scraped content */}
            {keywords.length > 0 && (
              <div className="px-5 sm:px-6 pb-5">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <Sparkles size={14} className="text-emerald-600" />
                    </div>
                    <h3 className="text-[15px] font-bold text-slate-900">Key themes discovered</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {keywords.slice(0, 8).map((kw, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.25 + i * 0.04 }}
                        className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-[12px] font-medium text-slate-600"
                      >
                        {kw}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </BrowserMockup>

        {/* Right column: Main keywords */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-slate-100">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Search size={14} className="text-blue-600" />
                </div>
                <h3 className="text-[15px] font-bold text-slate-900">Here&apos;s what we&apos;ve identified as the main keywords</h3>
              </div>
              <p className="text-[12.5px] text-slate-400 ml-9">How people find your brand on search</p>
            </motion.div>
          </div>

          <div className="px-5 sm:px-6 py-5">
            {generatingQueries && (
              <div className="flex items-center gap-2 py-6">
                <Loader2 size={14} className="text-blue-500 animate-spin shrink-0" />
                <span className="text-[13px] text-slate-500">Identifying your main keywords...</span>
              </div>
            )}

            {generateQueriesRateLimited && !generatingQueries && (
              <RateLimitMessage resetIn={generateQueriesResetIn} />
            )}

            {generateQueriesError && !generatingQueries && !hasQueries && (
              <div className="flex flex-col items-start gap-2 py-4">
                <p className="text-[13px] text-red-500 font-medium">{generateQueriesError}</p>
                <button
                  onClick={onGenerateQueries}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 text-white text-[12.5px] font-semibold hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw size={13} /> Try Again
                </button>
              </div>
            )}

            {hasQueries && !generatingQueries && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  {rankedKeywords.map((kw, i) => (
                    <motion.div
                      key={kw}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + i * 0.06 }}
                      className="flex items-center gap-3 p-3 rounded-xl border border-blue-200 bg-blue-50/40"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                        <span className="text-[12px] font-bold text-white tabular-nums">{i + 1}</span>
                      </div>
                      <span className="text-[14px] font-semibold text-slate-800 flex-1">{kw}</span>
                      <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
                    </motion.div>
                  ))}
                </div>

                {optionalKeywords.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Select a few more that fit</p>
                    <div className="flex flex-wrap gap-2">
                      {optionalKeywords.map((kw) => {
                        const isSelected = selectedKeywords.has(kw);
                        return (
                          <button
                            key={kw}
                            onClick={() => {
                              setSelectedKeywords(prev => {
                                const next = new Set(prev);
                                if (next.has(kw)) next.delete(kw);
                                else next.add(kw);
                                return next;
                              });
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12.5px] font-medium transition-all ${
                              isSelected
                                ? "bg-blue-600 border-blue-600 text-white"
                                : "bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-700"
                            }`}
                          >
                            {isSelected && <CheckCircle2 size={12} />}
                            {kw}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {queryTime && (
                  <p className="text-[11px] text-slate-400">Keywords identified in {queryTime.toFixed(1)}s</p>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          {scrapeTime && <span>Scraped in {scrapeTime.toFixed(1)}s</span>}
          {understanderTime && <span> · Understood in {understanderTime.toFixed(1)}s</span>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={startAnalysis}
            disabled={scraping || runningUnderstander}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 text-slate-600 text-[12.5px] font-semibold hover:bg-slate-200 transition-colors disabled:opacity-60"
          >
            <RefreshCw size={13} /> Re-run Analysis
          </button>
          {hasQueries && !generatingQueries && rankedKeywords.length > 0 && (
            <button
              onClick={() => onNext(selectedKeywords.size > 0 ? Array.from(selectedKeywords) : rankedKeywords)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-[12.5px] font-semibold hover:bg-blue-700 transition-colors"
            >
              Next <ChevronRight size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Competition Tab Helpers ──────────────────────────────────────────────────
function GoogleSearchMockup({ query, children }: { query: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl overflow-hidden shadow-2xl border border-slate-200 bg-white">
      <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-100 border-b border-slate-200">
        <div className="flex gap-1.5 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <div className="flex items-center gap-0.5 ml-2 shrink-0">
          <ChevronLeft size={14} className="text-slate-300" />
          <ChevronRight size={14} className="text-slate-300" />
        </div>
        <div className="flex-1 ml-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-md border border-slate-200">
            <Search size={10} className="text-slate-400 shrink-0" />
            <span className="text-[11px] text-slate-500 truncate font-mono">google.com/search?q={query.replace(/\s+/g, "+")}</span>
          </div>
        </div>
      </div>
      <div className="relative overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function GoogleSkeletonResults() {
  return (
    <div className="px-6 py-5 space-y-5 bg-white min-h-[340px]">
      {[0, 1, 2, 3, 4].map(i => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="space-y-1.5"
        >
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-slate-100 animate-pulse" />
            <div className="h-2 w-40 bg-slate-100 rounded animate-pulse" />
          </div>
          <div className="h-3.5 w-2/3 bg-blue-100/60 rounded animate-pulse" />
          <div className="h-2.5 w-full bg-slate-100 rounded animate-pulse" />
          <div className="h-2.5 w-5/6 bg-slate-100 rounded animate-pulse" />
        </motion.div>
      ))}
    </div>
  );
}

const COMPETITION_SCAN_STATUSES = ["Searching Google", "Scanning results", "Identifying competitors", "Analyzing top sites"];

function CompetitionScanningStatus({ competitorCount }: { competitorCount: number }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIdx(i => Math.min(i + 1, COMPETITION_SCAN_STATUSES.length - 1));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2 h-5">
        <Loader2 size={13} className="text-blue-500 animate-spin shrink-0" />
        <AnimatePresence mode="wait">
          <motion.span
            key={idx}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="text-[13px] font-semibold text-slate-600"
          >
            {COMPETITION_SCAN_STATUSES[idx]}...
          </motion.span>
        </AnimatePresence>
      </div>
      {competitorCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100"
        >
          <CheckCircle2 size={12} className="text-blue-600" />
          <span className="text-[12px] font-semibold text-blue-700">
            {competitorCount} competitor{competitorCount === 1 ? "" : "s"} identified
          </span>
        </motion.div>
      )}
    </div>
  );
}

type CompetitionPhase = "idle" | "scanning" | "results";

// ─── Competition Tab ──────────────────────────────────────────────────────────
function CompetitionTab({ audit, onSearch, onScrape, autoSearchKeywords }: {
  audit: AuditData;
  onSearch: (term: string) => Promise<{ results?: SerpResult[] }>;
  onScrape: (urls: string[]) => Promise<{ results?: ScrapedCompetitor[] }>;
  autoSearchKeywords?: string[];
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
  const [phase, setPhase] = useState<CompetitionPhase>("idle");
  const [animatedQuery, setAnimatedQuery] = useState("");
  const [competitorCount, setCompetitorCount] = useState(0);
  const autoSearchRanRef = useRef(false);

  useEffect(() => {
    if (audit.serp_results?.length) setSerpResults(audit.serp_results);
    if (audit.scraped_competitors?.length) setScrapedResults(audit.scraped_competitors);
  }, [audit.serp_results, audit.scraped_competitors]);

  useEffect(() => {
    if (brand.primary_search_keyword && !searchTerm) {
      setSearchTerm(brand.primary_search_keyword);
    }
  }, [brand.primary_search_keyword]);

  // Auto-search when arriving from the Brand tab with keywords
  useEffect(() => {
    if (autoSearchKeywords && autoSearchKeywords.length > 0 && !autoSearchRanRef.current && !searching && serpResults.length === 0) {
      autoSearchRanRef.current = true;
      const topKeyword = autoSearchKeywords[0];
      setSearchTerm(topKeyword);
      setPhase("scanning");
      setTimeout(() => {
        handleSearch(topKeyword);
      }, 800);
    }
  }, [autoSearchKeywords, searching, serpResults.length]);

  // Typing animation for keywords during scanning
  useEffect(() => {
    if (phase !== "scanning" || !autoSearchKeywords || autoSearchKeywords.length === 0) return;
    let kwIdx = 0;
    let charIdx = 0;
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const typeNext = () => {
      if (cancelled) return;
      const currentKw = autoSearchKeywords[kwIdx];
      if (charIdx <= currentKw.length) {
        setAnimatedQuery(currentKw.slice(0, charIdx));
        charIdx++;
        timer = setTimeout(typeNext, 50 + Math.random() * 40);
      } else {
        timer = setTimeout(() => {
          if (cancelled) return;
          kwIdx++;
          charIdx = 0;
          if (kwIdx < autoSearchKeywords.length) {
            setAnimatedQuery("");
            typeNext();
          } else {
            setAnimatedQuery(autoSearchKeywords[autoSearchKeywords.length - 1]);
          }
        }, 700);
      }
    };

    typeNext();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [phase, autoSearchKeywords]);

  // Competitor counter animation during scanning
  useEffect(() => {
    if (phase !== "scanning") return;
    setCompetitorCount(0);
    let count = 0;
    const interval = setInterval(() => {
      count++;
      if (count <= 10) {
        setCompetitorCount(count);
      } else {
        clearInterval(interval);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [phase]);

  // When search completes during scanning phase, go to results
  useEffect(() => {
    if (phase === "scanning" && !searching && serpResults.length > 0) {
      setCompetitorCount(serpResults.length);
      setTimeout(() => setPhase("results"), 600);
    }
  }, [phase, searching, serpResults.length]);

  // If search errors during scanning, go to results to show error
  useEffect(() => {
    if (phase === "scanning" && !searching && (searchError || rateLimited)) {
      setPhase("results");
    }
  }, [phase, searching, searchError, rateLimited]);

  async function handleSearch(termOverride?: string) {
    const term = termOverride || searchTerm;
    if (!term || searching) return;
    setSearching(true);
    setSearchError(null);
    setRateLimited(false);
    try {
      const data = await onSearch(term);
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

  // ── Scanning Phase ──
  if (phase === "scanning") {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-[20px] font-bold text-slate-900">Competitor Research</h2>
          <p className="text-[13px] text-slate-400 mt-0.5">See who ranks for your keywords and analyze their content</p>
        </div>

        <GoogleSearchMockup query={animatedQuery}>
          <GoogleSkeletonResults />
          <ScannerOverlay />
        </GoogleSearchMockup>

        <div className="flex flex-col items-center gap-3">
          <CompetitionScanningStatus competitorCount={competitorCount} />
        </div>
      </div>
    );
  }

  // ── Idle / Results Phase ──
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[20px] font-bold text-slate-900">Competitor Research</h2>
        <p className="text-[13px] text-slate-400 mt-0.5">See who ranks for your keywords and analyze their content</p>
      </div>

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
          onClick={() => handleSearch()}
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
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
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
  const [generatingQueries, setGeneratingQueries] = useState(false);
  const [generateQueriesError, setGenerateQueriesError] = useState<string | null>(null);
  const [generateQueriesRateLimited, setGenerateQueriesRateLimited] = useState(false);
  const [generateQueriesResetIn, setGenerateQueriesResetIn] = useState<number | undefined>();
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [runningUnderstander, setRunningUnderstander] = useState(false);
  const [understanderError, setUnderstanderError] = useState<string | null>(null);
  const [scrapeTime, setScrapeTime] = useState<number | null>(null);
  const [understanderTime, setUnderstanderTime] = useState<number | null>(null);
  const [queryTime, setQueryTime] = useState<number | null>(null);
  const [websiteBrief, setWebsiteBrief] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [estimatingVolume, setEstimatingVolume] = useState(false);
  const [volumeError, setVolumeError] = useState<string | null>(null);
  const [volumeRateLimited, setVolumeRateLimited] = useState(false);
  const [volumeResetIn, setVolumeResetIn] = useState<number | undefined>();
  const [volumeTime, setVolumeTime] = useState<number | null>(null);
  const [competitionKeywords, setCompetitionKeywords] = useState<string[]>([]);

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

  const generateSearchQueries = useCallback(async () => {
    setGeneratingQueries(true);
    setGenerateQueriesError(null);
    setGenerateQueriesRateLimited(false);
    setQueryTime(null);
    const start = performance.now();
    try {
      const data = await callFreeAudit("generate-search-queries", { audit_id: params.id });
      setAudit(data.data);
      setQueryTime((performance.now() - start) / 1000);
    } catch (err: any) {
      if (err.rateLimited) {
        setGenerateQueriesRateLimited(true);
        setGenerateQueriesResetIn(err.resetIn);
      } else {
        setGenerateQueriesError(err.message || "Failed to generate search queries");
      }
    } finally {
      setGeneratingQueries(false);
    }
  }, [params.id]);

  const scrapeWebsite = useCallback(async () => {
    setScraping(true);
    setScrapeError(null);
    setScrapeTime(null);
    const start = performance.now();
    try {
      const data = await callFreeAudit("scrape-website", { audit_id: params.id });
      setAudit(data.data);
      setScrapeTime((performance.now() - start) / 1000);
    } catch (err: any) {
      setScrapeError(err.message || "Scraping failed");
    } finally {
      setScraping(false);
    }
  }, [params.id]);

  const runUnderstander = useCallback(async () => {
    setRunningUnderstander(true);
    setUnderstanderError(null);
    setUnderstanderTime(null);
    const start = performance.now();
    try {
      const payload: Record<string, unknown> = { audit_id: params.id };
      if (websiteBrief && websiteBrief.length >= 50) {
        payload.summary = websiteBrief;
      }
      const data = await callFreeAudit("run-understander", payload);
      setAudit(data.data);
      setUnderstanderTime((performance.now() - start) / 1000);
    } catch (err: any) {
      setUnderstanderError(err.message || "Understanding failed");
    } finally {
      setRunningUnderstander(false);
    }
  }, [params.id, websiteBrief]);

  const summarizeContent = useCallback(() => {
    setSummarizing(true);
    try {
      const content = audit?.scraped_content || "";
      if (content.length > 0) {
        const brief = generateWebsiteBrief(content);
        setWebsiteBrief(brief || null);
      }
    } finally {
      setSummarizing(false);
    }
  }, [audit?.scraped_content]);

  const estimateVolume = useCallback(async () => {
    setEstimatingVolume(true);
    setVolumeError(null);
    setVolumeRateLimited(false);
    setVolumeTime(null);
    const start = performance.now();
    try {
      const data = await callFreeAudit("estimate-volume", { audit_id: params.id });
      setAudit(data.data);
      setVolumeTime((performance.now() - start) / 1000);
    } catch (err: any) {
      if (err.rateLimited) {
        setVolumeRateLimited(true);
        setVolumeResetIn(err.resetIn);
      } else {
        setVolumeError(err.message || "Volume estimation failed");
      }
    } finally {
      setEstimatingVolume(false);
    }
  }, [params.id]);

  const handleSearch = useCallback(async (term: string): Promise<{ results?: SerpResult[] }> => {
    return await callFreeAudit("search-serp", {
      audit_id: params.id,
      search_term: term,
    });
  }, [params.id]);

  const handleScrape = useCallback(async (urls: string[]): Promise<{ results?: ScrapedCompetitor[] }> => {
    return await callFreeAudit("scrape-competitors", {
      audit_id: params.id,
      urls,
    });
  }, [params.id]);

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

      <div className="relative z-10 max-w-[960px] mx-auto px-5 lg:px-8 py-8">
        <div className="flex justify-center mb-8">
          <TabBar active={activeTab} onChange={setActiveTab} />
        </div>

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
                onScrape={scrapeWebsite}
                scraping={scraping}
                scrapeError={scrapeError}
                onRunUnderstander={runUnderstander}
                runningUnderstander={runningUnderstander}
                understanderError={understanderError}
                onGenerateQueries={generateSearchQueries}
                generatingQueries={generatingQueries}
                generateQueriesError={generateQueriesError}
                generateQueriesRateLimited={generateQueriesRateLimited}
                generateQueriesResetIn={generateQueriesResetIn}
                queryTime={queryTime}
                scrapeTime={scrapeTime}
                understanderTime={understanderTime}
                summary={websiteBrief}
                onSummarize={summarizeContent}
                onNext={(kws) => {
                  setCompetitionKeywords(kws);
                  setActiveTab("competition");
                }}
              />
            )}
            {activeTab === "queries" && (
              <SearchQueriesTab
                audit={audit}
                onGenerate={generateSearchQueries}
                generating={generatingQueries}
                generateError={generateQueriesError}
                rateLimited={generateQueriesRateLimited}
                resetIn={generateQueriesResetIn}
                queryTime={queryTime}
                onEstimateVolume={estimateVolume}
                estimatingVolume={estimatingVolume}
                volumeError={volumeError}
                volumeRateLimited={volumeRateLimited}
                volumeResetIn={volumeResetIn}
                volumeTime={volumeTime}
              />
            )}
            {activeTab === "competition" && (
              <CompetitionTab
                audit={audit}
                onSearch={handleSearch}
                onScrape={handleScrape}
                autoSearchKeywords={competitionKeywords}
              />
            )}
            {activeTab === "opportunity" && <OpportunityTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
