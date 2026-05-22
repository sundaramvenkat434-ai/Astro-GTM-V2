'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AstroGTMLogo } from '@/components/site-header';

export default function AdminFake404() {
  const router = useRouter();
  const [clickCount, setClickCount] = useState(0);

  function handleLogoClick() {
    const next = clickCount + 1;
    setClickCount(next);
    if (next >= 3) {
      router.push('/admin/login');
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14">
            <Link href="/" className="flex items-center">
              <AstroGTMLogo size={34} />
            </Link>
          </div>
        </div>
      </header>

      {/* 404 Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <div className="mb-8">
            <button
              onClick={handleLogoClick}
              className="inline-block cursor-default focus:outline-none"
              aria-label="Logo"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center mx-auto shadow-sm">
                <svg width="40" height="40" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <radialGradient id="p404" cx="38%" cy="32%" r="65%">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="40%" stopColor="#0369a1" />
                      <stop offset="100%" stopColor="#0c2340" />
                    </radialGradient>
                  </defs>
                  <circle cx="18" cy="18" r="13" fill="url(#p404)" />
                  <ellipse cx="18" cy="18" rx="20" ry="6" stroke="#38bdf8" strokeWidth="1.4" fill="none" opacity="0.5" transform="rotate(-18 18 18)" />
                  <circle cx="28" cy="14" r="2.4" fill="#bae6fd" />
                </svg>
              </div>
            </button>
          </div>

          <h1 className="text-7xl font-extrabold text-slate-900 tracking-tight mb-4">404</h1>
          <h2 className="text-xl font-semibold text-slate-700 mb-3">Page not found</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-8 max-w-sm mx-auto">
            The page you are looking for does not exist or has been moved. Please check the URL and try again.
          </p>

          <div className="flex items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Go Home
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg border border-slate-200 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-slate-400">
            &copy; {new Date().getFullYear()} AstroGTM. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
