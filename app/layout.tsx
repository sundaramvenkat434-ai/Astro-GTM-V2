import './globals.css';
import type { Metadata } from 'next';
import { Inter, DM_Sans } from 'next/font/google';
import Script from 'next/script';
import { GlobalLoader } from '@/components/global-loader';
import { supabaseServer } from '@/lib/supabase-server';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', weight: ['400', '500', '600', '700'] });

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await supabaseServer
    .from('admin_settings')
    .select('key, value')
    .in('key', ['site_meta_title', 'site_meta_description']);

  let title = 'Best AI Tools for GTM, SEO & Growth | AstroGTM';
  let description = 'Explore an expert-curated list of the latest AI tools to scale user acquisition — built for founders, marketers, and GTM teams.';

  if (data) {
    for (const row of data) {
      if (row.key === 'site_meta_title' && row.value) title = row.value;
      if (row.key === 'site_meta_description' && row.value) description = row.value;
    }
  }

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000'),
    title: {
      default: title,
      template: '%s | AstroGTM',
    },
    description,
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                window.addEventListener('error', function(e) {
                  if (
                    e.message && e.message.indexOf('Loading chunk') !== -1 ||
                    e.message && e.message.indexOf('ChunkLoadError') !== -1
                  ) {
                    if (!sessionStorage.getItem('chunk_reload')) {
                      sessionStorage.setItem('chunk_reload', '1');
                      window.location.reload();
                    }
                  }
                });
              }
            `,
          }}
        />
      </head>
<Script src="https://www.googletagmanager.com/gtag/js?id=G-S7J68DJQKE" strategy="afterInteractive" />
      <Script id="gtag-init" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-S7J68DJQKE');
      ` }} />
      <body className={`${inter.variable} ${dmSans.variable} ${dmSans.className} flex flex-col min-h-screen`}>
        <GlobalLoader />
        {children}
      </body>
    </html>
  );
}
