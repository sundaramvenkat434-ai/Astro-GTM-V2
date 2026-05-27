'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

/* ─── Gifaa Logo ─────────────────────────────────────────── */
function GifaaLogo({ light = false }: { light?: boolean }) {
  return (
    <svg width="72" height="28" viewBox="0 0 72 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="2" y="22" fontFamily="'Georgia', serif" fontSize="20" fontStyle="italic" fontWeight="700" letterSpacing="-0.5" fill={light ? '#ffffff' : '#1a2a4a'}>
        gifaa
      </text>
      <circle cx="65" cy="9" r="2.5" fill="#c9a84c" />
    </svg>
  );
}

/* ─── FAQ Accordion ──────────────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left">
        <span className="text-[17px] font-semibold text-gray-900 pr-8">{q}</span>
        <ChevronDown className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="pb-5 text-[16px] leading-[1.8] text-gray-600">{a}</p>}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function ArticlesPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
          <Link href="/articles" className="flex items-center">
            <GifaaLogo />
          </Link>
          <nav className="hidden sm:flex items-center gap-7 text-[14px] text-gray-500">
            <a href="#" className="hover:text-gray-900 transition-colors">Occasions</a>
            <a href="#" className="hover:text-gray-900 transition-colors">How It Works</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Blog</a>
            <a href="#" className="text-gray-900 font-medium">Create Registry</a>
          </nav>
        </div>
      </header>

      {/* ── Article ── */}
      <main className="max-w-[680px] mx-auto px-6 pt-16 pb-24">

        {/* Meta */}
        <p className="text-[13px] uppercase tracking-[0.08em] text-gray-400 font-medium mb-6">
          Gift Registry &nbsp;&middot;&nbsp; May 22, 2026 &nbsp;&middot;&nbsp; 12 min read
        </p>

        {/* H1 */}
        <h1 className="text-[2.5rem] sm:text-[3rem] leading-[1.1] font-bold text-gray-900 tracking-[-0.025em] mb-6" style={{ fontFamily: "'Georgia', serif" }}>
          The Complete Guide to Creating Your Perfect Gift Registry
        </h1>

        {/* Subtitle */}
        <p className="text-[19px] leading-[1.7] text-gray-500 mb-10">
          How modern families are using digital registries to simplify gifting, eliminate duplicates, and make every celebration truly personal.
        </p>

        {/* Author */}
        <div className="flex items-center gap-3 mb-16 pb-10 border-b border-gray-100">
          <img
            src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=2"
            alt="Priya Sharma"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="text-[14px] font-semibold text-gray-900">Priya Sharma</p>
            <p className="text-[13px] text-gray-400">Senior Editor</p>
          </div>
        </div>

        {/* Hero Image */}
        <figure className="mb-16">
          <img
            src="https://images.pexels.com/photos/1303081/pexels-photo-1303081.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&dpr=2"
            alt="Gift registry planning"
            className="w-full rounded-lg"
          />
          <figcaption className="mt-3 text-[13px] text-gray-400 text-center">
            Photo by Pexels
          </figcaption>
        </figure>

        {/* ── Introduction ── */}
        <p className="text-[17px] leading-[1.85] text-gray-700 mb-7">
          Gift registries have evolved far beyond the traditional department store model. Today, a registry is a simple link you share with loved ones — they see exactly what you want, pick something that fits their budget, and it arrives at your door. No duplicates, no awkward returns, no guesswork.
        </p>

        <p className="text-[17px] leading-[1.85] text-gray-700 mb-7">
          Whether you&apos;re planning a wedding, expecting a baby, or moving into a new home, this guide covers everything you need to know about creating a registry that works for you and your guests.
        </p>

        <p className="text-[17px] leading-[1.85] text-gray-700 mb-16">
          We&apos;ll cover the different types of registries available, walk through the creation process step-by-step, share best practices from thousands of successful registries, and answer the most common questions people have.
        </p>

        {/* ── Section: Why ── */}
        <h2 className="text-[1.75rem] font-bold text-gray-900 tracking-[-0.02em] mt-20 mb-6" style={{ fontFamily: "'Georgia', serif" }}>
          Why use a gift registry?
        </h2>

        <p className="text-[17px] leading-[1.85] text-gray-700 mb-7">
          The short answer: it makes life easier for everyone involved. You get things you actually want. Your guests stop stressing about what to buy. And nobody ends up with three identical toasters.
        </p>

        <p className="text-[17px] leading-[1.85] text-gray-700 mb-8">
          Here&apos;s what the data shows from over 10,000 registries created in the last year:
        </p>

        {/* Stats — minimal, text-only */}
        <div className="grid grid-cols-3 gap-6 mb-12 py-8 border-y border-gray-100">
          <div className="text-center">
            <p className="text-[2rem] font-bold text-gray-900">92%</p>
            <p className="text-[13px] text-gray-500 mt-1">of guests prefer buying from a list</p>
          </div>
          <div className="text-center">
            <p className="text-[2rem] font-bold text-gray-900">0</p>
            <p className="text-[13px] text-gray-500 mt-1">duplicate gifts on average</p>
          </div>
          <div className="text-center">
            <p className="text-[2rem] font-bold text-gray-900">3 min</p>
            <p className="text-[13px] text-gray-500 mt-1">to set up a full registry</p>
          </div>
        </div>

        <p className="text-[17px] leading-[1.85] text-gray-700 mb-7">
          Beyond convenience, registries solve deeper problems. They eliminate the social awkwardness around gift expectations. They make it easy for distant relatives or coworkers — people who care but don&apos;t know your taste — to participate meaningfully.
        </p>

        <p className="text-[17px] leading-[1.85] text-gray-700 mb-8">
          The key benefits:
        </p>

        <ul className="space-y-4 mb-16 pl-1">
          {[
            'Eliminates duplicate gifts and unwanted items entirely',
            'Guests can contribute any amount to cash funds via UPI',
            'Add items from any online store — Amazon, Nykaa, Westside, and more',
            'Direct shipping to your address with no middleman fees',
            'Private link sharing — only visible to people you invite',
            'Group gifting lets multiple people chip in for expensive items',
          ].map((item) => (
            <li key={item} className="flex items-start gap-3 text-[16px] leading-[1.75] text-gray-700">
              <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
              {item}
            </li>
          ))}
        </ul>

        {/* ── Section: Types ── */}
        <h2 className="text-[1.75rem] font-bold text-gray-900 tracking-[-0.02em] mt-20 mb-6" style={{ fontFamily: "'Georgia', serif" }}>
          Types of gift registries
        </h2>

        <p className="text-[17px] leading-[1.85] text-gray-700 mb-10">
          Not all celebrations are the same, and your registry should reflect that. Here are the four most common types and when to use each.
        </p>

        <h3 className="text-[20px] font-semibold text-gray-900 mt-12 mb-4">
          Wedding registry
        </h3>
        <p className="text-[17px] leading-[1.85] text-gray-700 mb-7">
          The most popular type by far. Wedding registries let you curate everything from kitchen appliances and bedding to honeymoon fund contributions. The best approach is to include a wide range of price points — from practical everyday items to aspirational pieces — so every guest can find something meaningful regardless of budget.
        </p>

        <h3 className="text-[20px] font-semibold text-gray-900 mt-12 mb-4">
          Baby shower registry
        </h3>
        <p className="text-[17px] leading-[1.85] text-gray-700 mb-7">
          List exactly what you need for the new arrival. Cribs, strollers, car seats, clothing in specific sizes, diapers in bulk. A good baby registry prevents the number one problem new parents face: receiving adorable but impractical gifts while still needing the essentials.
        </p>

        <h3 className="text-[20px] font-semibold text-gray-900 mt-12 mb-4">
          Housewarming registry
        </h3>
        <p className="text-[17px] leading-[1.85] text-gray-700 mb-7">
          Moving into a new home creates a natural wishlist. Furniture, kitchen essentials, smart home devices, plants, decor. A housewarming registry is especially useful because guests often default to generic items without one.
        </p>

        <h3 className="text-[20px] font-semibold text-gray-900 mt-12 mb-4">
          Birthday and anniversary
        </h3>
        <p className="text-[17px] leading-[1.85] text-gray-700 mb-16">
          For milestone celebrations where guests want to contribute meaningfully. Combine physical product wishes with experience funds — travel, dining, classes — and even charity donations for causes you care about.
        </p>

        {/* Image break */}
        <figure className="mb-16">
          <img
            src="https://images.pexels.com/photos/6214476/pexels-photo-6214476.jpeg?auto=compress&cs=tinysrgb&w=900&h=450&dpr=2"
            alt="Setting up a registry"
            className="w-full rounded-lg"
          />
          <figcaption className="mt-3 text-[13px] text-gray-400 text-center">
            Creating your registry takes just a few minutes
          </figcaption>
        </figure>

        {/* ── Section: How to Create ── */}
        <h2 className="text-[1.75rem] font-bold text-gray-900 tracking-[-0.02em] mt-20 mb-6" style={{ fontFamily: "'Georgia', serif" }}>
          How to create your registry
        </h2>

        <p className="text-[17px] leading-[1.85] text-gray-700 mb-10">
          The entire process takes about three minutes. Here&apos;s the step-by-step:
        </p>

        <h3 className="text-[20px] font-semibold text-gray-900 mt-10 mb-4">
          1. Create your account
        </h3>
        <p className="text-[17px] leading-[1.85] text-gray-700 mb-7">
          Sign up with your email. No credit card, no trial period — the core platform is free. You&apos;ll set a name for your registry (usually your names or the event) and choose a custom URL to share.
        </p>

        <h3 className="text-[20px] font-semibold text-gray-900 mt-10 mb-4">
          2. Add items from any store
        </h3>
        <p className="text-[17px] leading-[1.85] text-gray-700 mb-7">
          This is where universal registries differ from traditional ones. Instead of being locked to one store, you paste product URLs from anywhere — Amazon, Tata Cliq, Nykaa, Westside, local boutiques. The system pulls in the product image, title, and price automatically.
        </p>

        <h3 className="text-[20px] font-semibold text-gray-900 mt-10 mb-4">
          3. Set up cash funds
        </h3>
        <p className="text-[17px] leading-[1.85] text-gray-700 mb-7">
          For experiences, large purchases, or when you simply prefer cash contributions, create fund goals. Guests contribute any amount via UPI, and the money settles directly to your bank account — no holding period, no platform fees.
        </p>

        <h3 className="text-[20px] font-semibold text-gray-900 mt-10 mb-4">
          4. Share your link
        </h3>
        <p className="text-[17px] leading-[1.85] text-gray-700 mb-16">
          Copy your unique registry URL and share it through your invitation, WhatsApp groups, email, or however feels natural. Only people with the link can see it — nothing is public unless you choose.
        </p>

        {/* ── Section: Comparison Table ── */}
        <h2 className="text-[1.75rem] font-bold text-gray-900 tracking-[-0.02em] mt-20 mb-6" style={{ fontFamily: "'Georgia', serif" }}>
          Platform comparison
        </h2>

        <p className="text-[17px] leading-[1.85] text-gray-700 mb-8">
          Not all registry platforms are equal. Here&apos;s how the main options stack up:
        </p>

        <div className="overflow-x-auto mb-16">
          <table className="w-full text-[15px]">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 pr-4 font-semibold text-gray-900">Platform Type</th>
                <th className="text-left py-3 pr-4 font-semibold text-gray-900">Stores</th>
                <th className="text-center py-3 pr-4 font-semibold text-gray-900">Cash Fund</th>
                <th className="text-center py-3 pr-4 font-semibold text-gray-900">UPI</th>
                <th className="text-center py-3 font-semibold text-gray-900">Fee</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              <tr className="border-b border-gray-100">
                <td className="py-3 pr-4 font-medium">Universal Registry</td>
                <td className="py-3 pr-4">Any Store</td>
                <td className="py-3 pr-4 text-center">Yes</td>
                <td className="py-3 pr-4 text-center">Yes</td>
                <td className="py-3 text-center font-medium text-green-700">0%</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 pr-4 font-medium">Single-Store Registry</td>
                <td className="py-3 pr-4">1 Store Only</td>
                <td className="py-3 pr-4 text-center">No</td>
                <td className="py-3 pr-4 text-center">No</td>
                <td className="py-3 text-center">Varies</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 pr-4 font-medium">Cash-Only App</td>
                <td className="py-3 pr-4">None</td>
                <td className="py-3 pr-4 text-center">Yes</td>
                <td className="py-3 pr-4 text-center">Yes</td>
                <td className="py-3 text-center">2–5%</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium">Social Wishlist</td>
                <td className="py-3 pr-4">Limited</td>
                <td className="py-3 pr-4 text-center">No</td>
                <td className="py-3 pr-4 text-center">No</td>
                <td className="py-3 text-center font-medium text-green-700">0%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── Section: Best Practices ── */}
        <h2 className="text-[1.75rem] font-bold text-gray-900 tracking-[-0.02em] mt-20 mb-6" style={{ fontFamily: "'Georgia', serif" }}>
          Best practices
        </h2>

        <p className="text-[17px] leading-[1.85] text-gray-700 mb-8">
          After analyzing thousands of successful registries, these patterns consistently lead to better outcomes for both creators and guests:
        </p>

        <ul className="space-y-4 mb-10 pl-1">
          {[
            'Include items across at least three price tiers so every guest finds something comfortable',
            'Add 30–50 items total — enough variety without overwhelming people',
            'Always include a cash fund option for guests who prefer giving money',
            'Share your registry 4–6 weeks before the event to give people time',
            'Update the list regularly — remove purchased items and add new ones',
            'Write a brief personal note explaining what the celebration means to you',
            'Enable group gifting for items over a certain price threshold',
          ].map((item) => (
            <li key={item} className="flex items-start gap-3 text-[16px] leading-[1.75] text-gray-700">
              <span className="mt-[10px] w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
              {item}
            </li>
          ))}
        </ul>

        <p className="text-[17px] leading-[1.85] text-gray-700 mb-16">
          The registries that perform best are the ones that feel personal rather than transactional. A sentence explaining why you chose an item or what it means to you transforms the gifting experience entirely.
        </p>

        {/* Infographic-style image */}
        <figure className="mb-16">
          <img
            src="https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=900&h=450&dpr=2"
            alt="Registry best practices"
            className="w-full rounded-lg"
          />
          <figcaption className="mt-3 text-[13px] text-gray-400 text-center">
            Registries that feel personal get 40% more contributions
          </figcaption>
        </figure>

        {/* ── Section: Expert Tips ── */}
        <h2 className="text-[1.75rem] font-bold text-gray-900 tracking-[-0.02em] mt-20 mb-6" style={{ fontFamily: "'Georgia', serif" }}>
          Expert tips from real couples
        </h2>

        <p className="text-[17px] leading-[1.85] text-gray-700 mb-10">
          We spoke to families who&apos;ve used registries for various celebrations. Here&apos;s what they wish they&apos;d known earlier:
        </p>

        <blockquote className="border-l-2 border-gray-200 pl-6 mb-10">
          <p className="text-[17px] leading-[1.85] text-gray-600 italic mb-3">
            &quot;We made our wedding gifting so simple. No complicated portals — our guests just used our link and the money was in our account instantly.&quot;
          </p>
          <cite className="text-[14px] text-gray-400 not-italic">— Meera &amp; Arjun, Mumbai</cite>
        </blockquote>

        <blockquote className="border-l-2 border-gray-200 pl-6 mb-10">
          <p className="text-[17px] leading-[1.85] text-gray-600 italic mb-3">
            &quot;I love that there&apos;s no middlemen. When my friend bought a gift, it was shipped directly from the store to my house. Everything was so transparent.&quot;
          </p>
          <cite className="text-[14px] text-gray-400 not-italic">— Priya Sharma, Delhi</cite>
        </blockquote>

        <blockquote className="border-l-2 border-gray-200 pl-6 mb-16">
          <p className="text-[17px] leading-[1.85] text-gray-600 italic mb-3">
            &quot;Adding items from different boutiques was a breeze. It&apos;s the most modern, direct tool for organizing gifts I&apos;ve ever used.&quot;
          </p>
          <cite className="text-[14px] text-gray-400 not-italic">— Vikram Rao, Bangalore</cite>
        </blockquote>

        {/* ── Section: FAQs ── */}
        <h2 className="text-[1.75rem] font-bold text-gray-900 tracking-[-0.02em] mt-20 mb-8" style={{ fontFamily: "'Georgia', serif" }}>
          Frequently asked questions
        </h2>

        <div className="mb-16 border-t border-gray-200">
          <FaqItem
            q="How does a digital gift registry work?"
            a="A digital gift registry lets you curate items from any online store into a single wishlist. Share the link with guests, and they can purchase gifts directly — shipped to your address or contributed as cash funds. No middlemen involved."
          />
          <FaqItem
            q="Can I add items from multiple stores?"
            a="Yes. Modern universal registries let you add products from Amazon, Tata Cliq, Nykaa, Westside, and any other online store. Simply paste the product URL and it gets added automatically with the image and price."
          />
          <FaqItem
            q="Is it rude to share a gift registry?"
            a="Not at all. Research shows 92% of guests prefer buying from a list. It eliminates guesswork, prevents duplicates, and ensures you receive gifts you genuinely need and will use."
          />
          <FaqItem
            q="How do cash fund contributions work?"
            a="Guests can contribute any amount via UPI directly to your bank account. No middlemen, no holding periods, no platform fees — the money settles instantly and securely."
          />
          <FaqItem
            q="Can I keep my registry private?"
            a="Absolutely. Your registry is only accessible via the unique link you share. It's not indexed by search engines or visible publicly. Only the people you choose to share it with can see your list."
          />
          <FaqItem
            q="Is there any cost to create a registry?"
            a="Creating a registry is completely free. There are no subscription fees, no transaction fees on physical gifts, and no hidden charges. Cash fund UPI transfers also have zero platform fees."
          />
        </div>

        {/* ── CTA ── */}
        <div className="my-20 py-12 border-y border-gray-100 text-center">
          <h2 className="text-[1.5rem] font-bold text-gray-900 mb-3" style={{ fontFamily: "'Georgia', serif" }}>
            Ready to create your registry?
          </h2>
          <p className="text-[17px] text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
            Join thousands of families who&apos;ve simplified their celebrations. Free forever, no credit card required.
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-[15px] font-semibold text-white transition-colors"
            style={{ background: '#1a2a4a' }}
          >
            Start Your Registry
          </a>
        </div>

        {/* ── Related Reading ── */}
        <h2 className="text-[1.75rem] font-bold text-gray-900 tracking-[-0.02em] mt-20 mb-8" style={{ fontFamily: "'Georgia', serif" }}>
          Continue reading
        </h2>

        <div className="space-y-8 mb-16">
          {[
            { title: 'Wedding Registry Etiquette: The Modern Rules Everyone Should Know', date: 'May 18, 2026', time: '8 min read' },
            { title: 'Baby Shower Gifts That New Parents Actually Want', date: 'May 14, 2026', time: '10 min read' },
            { title: 'Housewarming Gift Ideas: From Classic to Creative', date: 'May 10, 2026', time: '7 min read' },
          ].map((article) => (
            <a key={article.title} href="#" className="block group">
              <h3 className="text-[18px] font-semibold text-gray-900 group-hover:text-gray-600 transition-colors mb-1">
                {article.title}
              </h3>
              <p className="text-[13px] text-gray-400">
                {article.date} &nbsp;&middot;&nbsp; {article.time}
              </p>
            </a>
          ))}
        </div>

      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div>
              <GifaaLogo />
              <p className="text-[13px] text-gray-400 leading-relaxed mt-3">
                India&apos;s premier gift registry. Simple, direct, joyful.
              </p>
            </div>
            <div>
              <h4 className="text-[12px] font-semibold uppercase tracking-wider text-gray-500 mb-3">Product</h4>
              <ul className="space-y-2 text-[14px] text-gray-500">
                <li><a href="#" className="hover:text-gray-900 transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[12px] font-semibold uppercase tracking-wider text-gray-500 mb-3">Company</h4>
              <ul className="space-y-2 text-[14px] text-gray-500">
                <li><a href="#" className="hover:text-gray-900 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[12px] font-semibold uppercase tracking-wider text-gray-500 mb-3">Legal</h4>
              <ul className="space-y-2 text-[14px] text-gray-500">
                <li><a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Refunds</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[12px] text-gray-400">&copy; {new Date().getFullYear()} Gifaa. All rights reserved.</p>
            <p className="text-[12px] text-gray-400">Made with care in India</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
