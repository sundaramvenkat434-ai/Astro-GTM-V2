import { HeroSection } from './components/hero-section';

export const metadata = {
  title: 'AstroRank AI — Your Next 6 Months of SEO, Done This Week',
  description: 'AstroRank AI integrates with your site, understands your business, finds untapped keywords, and publishes 100s of on-brand SEO pages optimized to rank.',
};

export default function AstroRankPage() {
  return (
    <main className="min-h-screen bg-[#042a18] overflow-hidden">
      <HeroSection />
    </main>
  );
}
