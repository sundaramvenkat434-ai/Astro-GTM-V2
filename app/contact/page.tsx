import type { Metadata } from 'next';
import { Mail, MessageSquare } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000';

export const metadata: Metadata = {
  title: 'Contact — AstroGTM',
  description: 'Get in touch with the AstroGTM team for review requests, corrections, or partnership inquiries.',
  alternates: { canonical: `${SITE_URL}/contact` },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
        <span className="type-eyebrow">Get in touch</span>
        <h1 className="type-h1 mt-2 mb-4">Contact Us</h1>
        <p className="type-body mb-10">
          We welcome corrections, review requests, and partnership inquiries. We read every message but may not be able to reply to all.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center mb-4">
              <Mail className="w-5 h-5 text-sky-600" />
            </div>
            <h2 className="text-sm font-semibold text-slate-900 mb-1">Editorial &amp; Corrections</h2>
            <p className="text-xs text-slate-500 mb-3">Found an error? Want to suggest a tool for review?</p>
            <a href="mailto:editorial@astrogtm.com" className="text-sm text-sky-600 hover:text-sky-800 transition-colors">
              editorial@astrogtm.com
            </a>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center mb-4">
              <MessageSquare className="w-5 h-5 text-sky-600" />
            </div>
            <h2 className="text-sm font-semibold text-slate-900 mb-1">Partnerships</h2>
            <p className="text-xs text-slate-500 mb-3">Sponsorship, content partnerships, or vendor inquiries.</p>
            <a href="mailto:partners@astrogtm.com" className="text-sm text-sky-600 hover:text-sky-800 transition-colors">
              partners@astrogtm.com
            </a>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-amber-800">
          <strong className="font-semibold">Vendor note:</strong> We do not accept payment for reviews or ratings. Sponsored content is clearly labelled and kept separate from editorial.
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
