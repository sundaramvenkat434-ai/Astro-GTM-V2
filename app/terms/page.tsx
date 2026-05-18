import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://astrogtm.com';

export const metadata: Metadata = {
  title: 'Terms of Service — AstroGTM',
  description: 'Terms and conditions for using AstroGTM.',
  alternates: { canonical: `${SITE_URL}/terms` },
};

const SECTIONS = [
  {
    num: '1',
    title: 'Acceptance of Terms',
    content: (
      <>
        <p>
          By accessing or using AstroGTM, you agree to these Terms of Service and our editorial policies. If you do not agree with these terms, please do not use the platform.
        </p>
      </>
    ),
  },
  {
    num: '2',
    title: 'Editorial Content & Recommendations',
    content: (
      <>
        <p>AstroGTM publishes independent editorial content, including:</p>
        <ul>
          <li>Software reviews</li>
          <li>Product comparisons</li>
          <li>Curated recommendations</li>
          <li>Ratings</li>
          <li>Workflow insights</li>
          <li>Educational content</li>
        </ul>
        <p>All content is intended for informational and research purposes only.</p>
        <p>
          While we strive to provide accurate, operator-focused insights, software products evolve rapidly and information may change over time. You should independently evaluate any product, pricing, security, compliance, or purchasing decision before adoption.
        </p>
      </>
    ),
  },
  {
    num: '3',
    title: 'Accuracy of Information',
    content: (
      <>
        <p>
          We make reasonable efforts to keep listings, pricing, features, integrations, and editorial content updated. However, AstroGTM does not guarantee that:
        </p>
        <ul>
          <li>All information is fully accurate</li>
          <li>Pricing is current</li>
          <li>Features remain unchanged</li>
          <li>Third-party claims are error-free</li>
        </ul>
        <p>
          Vendors may update their products without notice. If you discover outdated or incorrect information, we encourage you to contact us so we can review and update it.
        </p>
      </>
    ),
  },
  {
    num: '4',
    title: 'Affiliate & Sponsored Content Disclosure',
    content: (
      <>
        <p>
          Some links on AstroGTM may be affiliate links. If you purchase a product through these links, we may earn a commission at no additional cost to you.
        </p>
        <p>Affiliate relationships do not directly influence:</p>
        <ul>
          <li>Editorial reviews</li>
          <li>Rankings</li>
          <li>Ratings</li>
          <li>Recommendations</li>
        </ul>
        <p>
          Sponsored content, paid placements, and advertisements are clearly labeled and kept separate from independent editorial coverage.
        </p>
      </>
    ),
  },
  {
    num: '5',
    title: 'Intellectual Property & Content Usage',
    content: (
      <>
        <p>
          All AstroGTM content — including branding, editorial copy, comparisons, ratings, screenshots, design elements, and research — is protected by applicable intellectual property laws.
        </p>
        <p>You may not:</p>
        <ul>
          <li>Reproduce</li>
          <li>Republish</li>
          <li>Scrape</li>
          <li>Distribute</li>
          <li>Commercially reuse</li>
        </ul>
        <p>
          our content without prior written permission. Reasonable excerpts and short quotations with proper attribution and a link back to the original source page are permitted.
        </p>
      </>
    ),
  },
  {
    num: '6',
    title: 'Third-Party Services & External Links',
    content: (
      <>
        <p>
          AstroGTM may link to third-party products, vendors, APIs, websites, and external services. We are not responsible for:
        </p>
        <ul>
          <li>Third-party content</li>
          <li>Product performance</li>
          <li>Availability</li>
          <li>Pricing changes</li>
          <li>Privacy practices</li>
          <li>Security issues</li>
          <li>Vendor claims</li>
        </ul>
        <p>
          Your interactions with external products and services are solely between you and the vendor.
        </p>
      </>
    ),
  },
  {
    num: '7',
    title: 'Limitation of Liability',
    content: (
      <>
        <p>AstroGTM is provided on an &quot;as is&quot; and &quot;as available&quot; basis. We are not liable for:</p>
        <ul>
          <li>Purchasing decisions</li>
          <li>Implementation outcomes</li>
          <li>Business losses</li>
          <li>Marketing performance</li>
          <li>Operational disruptions</li>
          <li>Data loss</li>
          <li>Revenue impact</li>
          <li>Investment decisions</li>
        </ul>
        <p>arising from the use of information published on the platform.</p>
      </>
    ),
  },
  {
    num: '8',
    title: 'Platform Usage',
    content: (
      <>
        <p>You agree not to:</p>
        <ul>
          <li>Misuse the platform</li>
          <li>Attempt unauthorized access</li>
          <li>Scrape data at abusive volumes</li>
          <li>Interfere with platform stability</li>
          <li>Impersonate vendors or reviewers</li>
          <li>Submit misleading or fraudulent information</li>
        </ul>
        <p>
          We reserve the right to restrict or remove access where necessary to protect the platform and community.
        </p>
      </>
    ),
  },
  {
    num: '9',
    title: 'Changes to These Terms',
    content: (
      <>
        <p>
          We may update these Terms of Service periodically as AstroGTM evolves. Continued use of the platform after updates constitutes acceptance of the revised terms.
        </p>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col">
      <SiteHeader />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(145deg, rgba(176,228,255,0.18) 0%, rgba(255,255,255,0) 60%)' }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-sky-600 mb-3">Legal</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight tracking-tight mb-2">
            Terms of Service
          </h1>
          <p className="text-[13px] text-slate-400 font-medium">Last updated: May 2026</p>
        </div>
      </section>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-100">
          {SECTIONS.map(({ num, title, content }) => (
            <div key={num} className="px-6 sm:px-8 py-6">
              <div className="flex items-start gap-4">
                <span
                  className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0 text-[11px] font-bold text-sky-700 mt-0.5"
                  style={{ background: 'linear-gradient(145deg, #B0E4FF 0%, #cceeff 100%)' }}
                >
                  {num}
                </span>
                <div className="flex-1 min-w-0">
                  <h2 className="text-[14px] font-bold text-slate-900 mb-3 tracking-tight">{title}</h2>
                  <div className="text-[13px] text-slate-600 leading-[1.8] space-y-2 [&_ul]:mt-1.5 [&_ul]:space-y-1 [&_ul]:pl-4 [&_ul]:list-none [&_ul_li]:flex [&_ul_li]:items-start [&_ul_li]:gap-2 [&_ul_li]:before:content-[''] [&_ul_li]:before:w-1.5 [&_ul_li]:before:h-1.5 [&_ul_li]:before:rounded-full [&_ul_li]:before:bg-sky-400 [&_ul_li]:before:shrink-0 [&_ul_li]:before:mt-[6px]">
                    {content}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Section 10 — Contact (with link) */}
          <div className="px-6 sm:px-8 py-6">
            <div className="flex items-start gap-4">
              <span
                className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0 text-[11px] font-bold text-sky-700 mt-0.5"
                style={{ background: 'linear-gradient(145deg, #B0E4FF 0%, #cceeff 100%)' }}
              >
                10
              </span>
              <div className="flex-1 min-w-0">
                <h2 className="text-[14px] font-bold text-slate-900 mb-3 tracking-tight">Contact</h2>
                <p className="text-[13px] text-slate-600 leading-[1.8]">
                  For legal inquiries, corrections, vendor requests, or questions regarding these terms, please contact the AstroGTM team through the{' '}
                  <Link href="/contact" className="text-sky-600 hover:text-sky-800 underline underline-offset-2 transition-colors">
                    official contact page
                  </Link>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
