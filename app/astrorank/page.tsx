import AstroRankHero, { MetricsStrip } from './hero';
import FeaturesSection from './features';
import PricingSection from './pricing';
import AstroRankFooter from './footer';

export const metadata = {
  title: 'AstroRank — Give Your Brand an Unfair SEO Advantage',
  description: 'Scale high-quality content with AI and publish hundreds of research-backed articles designed to rank on Google, ChatGPT, Gemini, and more.',
};

export default function AstroRankPage() {
  return (
    <main className="min-h-screen bg-white overflow-hidden">
      <AstroRankHero />
      <MetricsStrip />
      <FeaturesSection />
      <PricingSection />
      <AstroRankFooter />
    </main>
  );
}
