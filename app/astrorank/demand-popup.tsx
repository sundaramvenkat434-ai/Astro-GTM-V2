"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export type LeadSource = "audit" | "pricing" | "free-pages" | "signin" | "demo";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function DemandPopup({
  open,
  onClose,
  source,
  initialUrl = "",
}: {
  open: boolean;
  onClose: () => void;
  source: LeadSource;
  initialUrl?: string;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!url.trim()) {
      setError("Please enter your website link.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { error: insertError } = await supabase
      .from("astrorank_leads")
      .insert({ website_url: url.trim(), source });
    setSubmitting(false);
    if (insertError) {
      setError("Something went wrong. Please try again.");
      return;
    }
    setDone(true);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {done ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">Thank you!</h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  We&apos;ve got your website link. We&apos;ll get back with your audit within 12 hours.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="mb-1 inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                  High demand right now
                </div>
                <h3 className="text-xl font-semibold leading-snug text-slate-900">
                  We&apos;re facing high demand as of now
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Drop in your website link and we&apos;ll get back with the audit within 12 hours.
                </p>
                <div className="mt-5 space-y-3">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                    placeholder="yourwebsite.com"
                    autoFocus
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />
                  {error && <p className="text-xs font-medium text-red-600">{error}</p>}
                  <button
                    onClick={submit}
                    disabled={submitting}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
                  >
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {submitting ? "Submitting..." : "Get my audit"}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function useDemandPopup() {
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState<LeadSource>("audit");
  const [initialUrl, setInitialUrl] = useState("");

  const openPopup = (s: LeadSource, url = "") => {
    setSource(s);
    setInitialUrl(url);
    setOpen(true);
  };

  return { open, source, initialUrl, openPopup, closePopup: () => setOpen(false) };
}
