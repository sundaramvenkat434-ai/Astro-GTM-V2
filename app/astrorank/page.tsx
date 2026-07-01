import AstroRankHeader from './header';
import AstroRankHero, { MetricsStrip } from './hero';
import FeaturesSection from './features';
import MarqueeSection from './marquee';
import PricingSection from './pricing';
import ReviewsSection from './reviews';
import FAQSection from './faq';
import AstroRankFooter from './footer';
import SpaceBg from './space-bg';

export const metadata = {
  title: 'AstroRank — Give Your Brand an Astronomical SEO Advantage',
  description: 'Scale high-quality content with AI and publish hundreds of research-backed articles designed to rank on Google, ChatGPT, Gemini, and more.',
};

export default function AstroRankPage() {
  return (
    <>
      <AstroRankHeader />
      <main className="relative min-h-screen bg-[#f8fafc] overflow-hidden" style={{ zIndex: 1 }}>
        <SpaceBg />
        <AstroRankHero />
        <MetricsStrip />
        <FeaturesSection />
        <MarqueeSection />
        <PricingSection />
        <ReviewsSection />
        <FAQSection />
        <AstroRankFooter />
      </main>
    </>
  );
}
