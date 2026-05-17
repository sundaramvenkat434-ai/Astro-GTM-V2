import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000';

export const metadata: Metadata = {
  title: 'Privacy Policy — AstroGTM',
  description: 'How AstroGTM collects, uses, and protects your personal information.',
  alternates: { canonical: `${SITE_URL}/privacy-policy` },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8 last:mb-0">
      <h2 className="font-display text-[15px] font-bold text-slate-900 mb-2 tracking-tight">{title}</h2>
      <div className="type-body space-y-2">{children}</div>
    </div>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-14">
        <span className="type-eyebrow">Legal</span>
        <h1 className="type-h1 mt-2 mb-1">Privacy Policy</h1>
        <p className="text-sm text-slate-400 mb-10">Last updated: May 2026</p>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-0">

          <Section title="1. Who We Are">
            <p>AstroGTM (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is an independent publication reviewing AI tools and SaaS products for GTM, SEO, and growth teams. Our website is accessible at <strong>astrogtm.com</strong>.</p>
          </Section>

          <Section title="2. Information We Collect">
            <p><strong>Information you provide:</strong> When you subscribe to our newsletter or submit a contact form, we collect your email address and any message content you include.</p>
            <p><strong>Listing claims:</strong> If you submit a tool listing claim, we collect your name, email, LinkedIn URL, website, and any message you provide to verify ownership.</p>
            <p><strong>Usage data:</strong> We automatically collect anonymised data including pages visited, time on site, browser type, device type, and referring URLs through analytics software.</p>
            <p><strong>Upvotes & interactions:</strong> We record a browser fingerprint (a hashed, non-identifying token) to prevent duplicate upvotes. No personal data is stored for this purpose.</p>
          </Section>

          <Section title="3. How We Use Your Information">
            <p>We use the information collected to:</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>Send the weekly newsletter you opted into</li>
              <li>Respond to contact and listing claim submissions</li>
              <li>Understand how readers use the site and improve content</li>
              <li>Prevent abuse (e.g., duplicate upvotes)</li>
            </ul>
            <p>We <strong>never sell</strong> your personal data to third parties.</p>
          </Section>

          <Section title="4. Newsletter">
            <p>By subscribing you consent to receive our weekly email digest. Every email includes an unsubscribe link. You can also request removal at any time via our <Link href="/contact" className="text-sky-600 hover:text-sky-800 underline">contact page</Link>. We use Supabase to store subscriber data securely.</p>
          </Section>

          <Section title="5. Cookies & Analytics">
            <p>We use first-party cookies and may use third-party analytics tools (such as Plausible, Google Analytics, or similar) to measure page traffic. Analytics data is aggregated and anonymised where possible.</p>
            <p>You can disable cookies in your browser settings. Doing so will not prevent you from reading the site but may affect some interactive features.</p>
          </Section>

          <Section title="6. Third-Party Links & Affiliate Disclosure">
            <p>Our reviews may contain affiliate links to tools and services. These are clearly disclosed at the top of any review that contains them. Affiliate relationships do not influence our ratings or editorial decisions.</p>
            <p>We are not responsible for the privacy practices of third-party sites we link to. Please review their policies directly.</p>
          </Section>

          <Section title="7. Data Storage & Security">
            <p>Subscriber and contact data is stored in Supabase, a hosted PostgreSQL service. Data is stored within the EU/US depending on your configured region and protected by row-level security policies. We take reasonable technical measures to protect your data from unauthorised access.</p>
          </Section>

          <Section title="8. Data Retention">
            <p>Newsletter subscriber data is retained until you unsubscribe. Contact form submissions and listing claims are retained for up to 24 months for operational purposes. Analytics data is retained per the third-party provider&apos;s retention policy.</p>
          </Section>

          <Section title="9. Your Rights">
            <p>Depending on your location (including under GDPR and CCPA), you may have the right to:</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>Access the personal data we hold about you</li>
              <li>Request correction or deletion of your data</li>
              <li>Object to or restrict certain processing</li>
              <li>Receive a portable copy of your data</li>
            </ul>
            <p>To exercise any of these rights, contact us via our <Link href="/contact" className="text-sky-600 hover:text-sky-800 underline">contact page</Link>. We will respond within 30 days.</p>
          </Section>

          <Section title="10. Children's Privacy">
            <p>Our site is not directed at children under 13. We do not knowingly collect personal information from anyone under 13. If you believe a child has submitted data, contact us and we will delete it promptly.</p>
          </Section>

          <Section title="11. Changes to This Policy">
            <p>We may update this policy occasionally. The &quot;Last updated&quot; date at the top will reflect any changes. Continued use of the site after changes constitutes acceptance of the revised policy.</p>
          </Section>

          <Section title="12. Contact">
            <p>
              For privacy-related questions or data requests, reach us via our{' '}
              <Link href="/contact" className="text-sky-600 hover:text-sky-800 underline">contact page</Link>.
            </p>
          </Section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
