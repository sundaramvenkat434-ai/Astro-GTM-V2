'use client';

import Script from 'next/script';
import { Mail, MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col">
      {/* Crisp live chat — loaded only on this page */}
      <Script id="crisp-chat" strategy="afterInteractive">{`
        window.$crisp=[];
        window.CRISP_WEBSITE_ID="f4e70b82-5a68-405f-8049-66275f232f93";
        (function(){
          var d=document,s=d.createElement("script");
          s.src="https://client.crisp.chat/l.js";
          s.async=1;
          d.getElementsByTagName("head")[0].appendChild(s);
        })();
      `}</Script>

      <SiteHeader />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(145deg, rgba(176,228,255,0.18) 0%, rgba(255,255,255,0) 60%)' }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-[11px] font-semibold text-sky-700 uppercase tracking-widest mb-5">
            <ShieldCheck className="w-3.5 h-3.5" />
            We read every message
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight tracking-tight mb-3">
            Get in Touch
          </h1>
          <p className="text-[15px] text-slate-500 leading-relaxed max-w-xl">
            AstroGTM is built by operators and founders, and we welcome thoughtful conversations from startups, growth teams, marketers, and product builders shaping the next generation of software.
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-20 space-y-6">

        {/* ── Contact cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Email */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-sky-200 transition-all group">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: 'linear-gradient(145deg, #B0E4FF 0%, #cceeff 100%)' }}
            >
              <Mail className="w-5 h-5 text-sky-700" />
            </div>
            <h2 className="text-[14px] font-bold text-slate-900 mb-1">Email Us</h2>
            <p className="text-[12px] text-slate-500 mb-3 leading-relaxed">
              For tool submissions, listing claims, corrections, and other enquiries.
            </p>
            <a
              href="mailto:contactastrogtm@gmail.com"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-sky-600 hover:text-sky-800 transition-colors group-hover:underline"
            >
              contactastrogtm@gmail.com
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Live chat */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-sky-200 transition-all group">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: 'linear-gradient(145deg, #B0E4FF 0%, #cceeff 100%)' }}
            >
              <MessageSquare className="w-5 h-5 text-sky-700" />
            </div>
            <h2 className="text-[14px] font-bold text-slate-900 mb-1">Live Chat</h2>
            <p className="text-[12px] text-slate-500 mb-3 leading-relaxed">
              Have a quick question? Use the chat widget in the bottom-right corner to reach us instantly.
            </p>
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && (window as any).$crisp) {
                  (window as any).$crisp.push(['do', 'chat:open']);
                }
              }}
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-sky-600 hover:text-sky-800 transition-colors"
            >
              Open live chat
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── Topics we cover ── */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div
            className="px-6 sm:px-8 py-4 border-b border-slate-100"
            style={{ background: 'linear-gradient(145deg, rgba(176,228,255,0.10) 0%, rgba(255,255,255,1) 60%)' }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-5 rounded-full bg-sky-500 shrink-0" />
              <h2 className="text-[14px] font-bold text-slate-900 tracking-tight">What to reach out about</h2>
            </div>
          </div>
          <div className="px-6 sm:px-8 py-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Tool submissions', desc: 'Launch your product, get listed, or reach growth-focused teams on AstroGTM.' },
              { label: 'Private expert reviews', desc: 'Get operator-led feedback on positioning, GTM workflows, onboarding, and discoverability.' },
              { label: 'Advertisements & sponsorships', desc: 'Explore sponsored placements, newsletter features, and growth collaborations.' },
              { label: 'Listing claims', desc: 'Claim and manage your product listing, assets, and company details.' },
              { label: 'Corrections & bugs', desc: 'Report outdated information, broken links, inaccuracies, or platform issues.' },
              { label: 'Personalized newsletters', desc: 'Get curated AI tool recommendations and GTM workflows tailored to your interests.' },
            ].map(({ label, desc }) => (
              <div key={label} className="flex items-start gap-3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0 mt-1.5" />
                <div>
                  <p className="text-[13px] font-semibold text-slate-800">{label}</p>
                  <p className="text-[12px] text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      <SiteFooter />
    </div>
  );
}
