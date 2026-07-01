import AstroRankHeader from './header';
import AstroRankHero, { MetricsStrip } from './hero';
import FeaturesSection from './features';
import MarqueeSection from './marquee';
import PricingSection from './pricing';
import FAQSection from './faq';
import AstroRankFooter from './footer';

export const metadata = {
  title: 'AstroRank — Give Your Brand an Astronomical SEO Advantage',
  description: 'Scale high-quality content with AI and publish hundreds of research-backed articles designed to rank on Google, ChatGPT, Gemini, and more.',
};

export default function AstroRankPage() {
  return (
    <>
      <AstroRankHeader />
      <main className="min-h-screen bg-white overflow-hidden">
        <AstroRankHero />
        <MetricsStrip />
        <FeaturesSection />
        <MarqueeSection />
        <PricingSection />
        <FAQSection />
        <AstroRankFooter />
      </main>
    </>
  );
}
