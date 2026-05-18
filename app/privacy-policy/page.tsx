import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://astrogtm.com';

export const metadata: Metadata = {
  title: 'Privacy Policy — AstroGTM',
  description: 'How AstroGTM collects, uses, and protects your personal information.',
  alternates: { canonical: `${SITE_URL}/privacy-policy` },
};

const SECTIONS: { num: string; title: string; content: React.ReactNode }[] = [
  {
    num: '1',
    title: 'About AstroGTM',
    content: (
      <>
        <p>
          AstroGTM is an independent editorial platform and curated discovery layer for AI, GTM, SEO, marketing, and growth software.
        </p>
        <p>
          We help founders, operators, marketers, and product teams discover proven tools, workflows, and software recommendations through editorial reviews, research, and curated listings.
        </p>
        <p>This Privacy Policy explains what information we collect, how we use it, and how we protect it.</p>
      </>
    ),
  },
  {
    num: '2',
    title: 'Information We Collect',
    content: (
      <>
        <p className="font-semibold text-slate-800">Information You Provide</p>
        <p>We may collect information you voluntarily submit through:</p>
        <ul>
          <li>Newsletter subscriptions</li>
          <li>Contact forms</li>
          <li>Listing claims</li>
          <li>Partnership inquiries</li>
          <li>Tool submissions</li>
          <li>Feedback forms</li>
        </ul>
        <p>This may include:</p>
        <ul>
          <li>Name</li>
          <li>Email address</li>
          <li>Company name</li>
          <li>LinkedIn profile</li>
          <li>Website URL</li>
          <li>Message content</li>
        </ul>
        <p className="font-semibold text-slate-800 mt-2">Usage & Analytics Data</p>
        <p>We may automatically collect limited technical and usage information, including:</p>
        <ul>
          <li>Pages visited</li>
          <li>Browser type</li>
          <li>Device type</li>
          <li>Referral sources</li>
          <li>Session interactions</li>
          <li>Approximate geographic region</li>
          <li>On-site engagement metrics</li>
        </ul>
        <p>This data helps us improve the platform, content quality, and user experience.</p>
        <p className="font-semibold text-slate-800 mt-2">Platform Interaction Data</p>
        <p>
          To maintain platform integrity and prevent abuse, we may store limited non-identifying interaction data such as:
        </p>
        <ul>
          <li>Hashed browser/session identifiers</li>
          <li>Vote interaction signals</li>
          <li>Rate limiting metadata</li>
        </ul>
        <p>We do not use this information to personally identify users.</p>
      </>
    ),
  },
  {
    num: '3',
    title: 'How We Use Information',
    content: (
      <>
        <p>We use collected information to:</p>
        <ul>
          <li>Operate and improve AstroGTM</li>
          <li>Send newsletters and editorial updates</li>
          <li>Respond to submissions and inquiries</li>
          <li>Review listing claims</li>
          <li>Improve recommendations and discovery systems</li>
          <li>Detect abuse, spam, or fraudulent activity</li>
          <li>Analyze platform performance and usage trends</li>
        </ul>
        <p>We do not sell personal data to third parties.</p>
      </>
    ),
  },
  {
    num: '4',
    title: 'Editorial Independence & Affiliate Disclosure',
    content: (
      <>
        <p>Some pages on AstroGTM may contain affiliate links or sponsored placements.</p>
        <p>Affiliate relationships do not directly influence:</p>
        <ul>
          <li>Editorial reviews</li>
          <li>Rankings</li>
          <li>Recommendations</li>
          <li>Ratings</li>
        </ul>
        <p>
          Sponsored content is clearly labeled and separated from independent editorial coverage wherever applicable.
        </p>
      </>
    ),
  },
  {
    num: '5',
    title: 'Cookies & Analytics',
    content: (
      <>
        <p>AstroGTM may use:</p>
        <ul>
          <li>First-party cookies</li>
          <li>Analytics tools</li>
          <li>Session storage</li>
          <li>Lightweight tracking technologies</li>
        </ul>
        <p>to improve platform performance and understand site usage.</p>
        <p>We aim to minimize invasive tracking wherever reasonably possible.</p>
        <p>
          You may disable cookies through your browser settings, although some interactive features may function differently.
        </p>
      </>
    ),
  },
  {
    num: '6',
    title: 'Third-Party Services',
    content: (
      <>
        <p>We may use trusted third-party infrastructure providers and services for:</p>
        <ul>
          <li>Analytics</li>
          <li>Email delivery</li>
          <li>Database hosting</li>
          <li>Authentication</li>
          <li>Media storage</li>
          <li>Performance monitoring</li>
        </ul>
        <p>
          These providers may process limited information solely to support platform operations. We are not responsible for the privacy practices of external websites, tools, or vendors linked from AstroGTM.
        </p>
      </>
    ),
  },
  {
    num: '7',
    title: 'Data Storage & Security',
    content: (
      <>
        <p>
          We take reasonable technical and operational measures to protect submitted information from:
        </p>
        <ul>
          <li>Unauthorized access</li>
          <li>Misuse</li>
          <li>Disclosure</li>
          <li>Loss</li>
        </ul>
        <p>
          Data may be processed and stored through secure cloud infrastructure providers, including managed database and hosting platforms. While we strive to maintain strong security practices, no online platform can guarantee absolute security.
        </p>
      </>
    ),
  },
  {
    num: '8',
    title: 'Data Retention',
    content: (
      <>
        <p>We retain information only for as long as reasonably necessary to:</p>
        <ul>
          <li>Operate the platform</li>
          <li>Maintain editorial workflows</li>
          <li>Comply with legal obligations</li>
          <li>Resolve disputes</li>
          <li>Prevent abuse</li>
        </ul>
        <p>Users may request deletion of submitted personal information where applicable.</p>
      </>
    ),
  },
  {
    num: '9',
    title: 'Your Rights',
    content: (
      <>
        <p>Depending on your jurisdiction, you may have rights related to:</p>
        <ul>
          <li>Accessing your personal information</li>
          <li>Correcting inaccurate data</li>
          <li>Requesting deletion</li>
          <li>Objecting to certain processing</li>
          <li>Withdrawing consent</li>
          <li>Requesting data portability</li>
        </ul>
        <p>
          To exercise these rights, please contact us through the official{' '}
          <Link href="/contact" className="text-sky-600 hover:text-sky-800 underline underline-offset-2 transition-colors">
            AstroGTM contact page
          </Link>.
        </p>
      </>
    ),
  },
  {
    num: '10',
    title: "Children's Privacy",
    content: (
      <>
        <p>
          AstroGTM is intended for professional and business audiences and is not directed toward children under 13. We do not knowingly collect personal information from children.
        </p>
      </>
    ),
  },
  {
    num: '11',
    title: 'Policy Updates',
    content: (
      <>
        <p>
          We may update this Privacy Policy periodically as AstroGTM evolves. The &quot;Last updated&quot; date at the top of this page reflects the latest revision. Continued use of the platform after updates constitutes acceptance of the revised policy.
        </p>
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
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
            Privacy Policy
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

          {/* Section 12 — Contact (with link) */}
          <div className="px-6 sm:px-8 py-6">
            <div className="flex items-start gap-4">
              <span
                className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0 text-[11px] font-bold text-sky-700 mt-0.5"
                style={{ background: 'linear-gradient(145deg, #B0E4FF 0%, #cceeff 100%)' }}
              >
                12
              </span>
              <div className="flex-1 min-w-0">
                <h2 className="text-[14px] font-bold text-slate-900 mb-3 tracking-tight">Contact</h2>
                <p className="text-[13px] text-slate-600 leading-[1.8]">
                  For privacy-related questions, data requests, corrections, or legal inquiries, please contact the AstroGTM team through the{' '}
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
