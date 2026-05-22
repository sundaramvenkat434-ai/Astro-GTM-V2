'use client';

import { useEffect, useState, useCallback } from 'react';

export function GlobalLoader() {
  const [loading, setLoading] = useState(true);

  const show = useCallback(() => setLoading(true), []);
  const hide = useCallback(() => setLoading(false), []);

  useEffect(() => {
    // Initial page load
    const dismissInitial = () => setTimeout(hide, 100);
    if (document.readyState === 'complete') {
      dismissInitial();
    } else {
      window.addEventListener('load', dismissInitial, { once: true });
    }

    // Intercept internal link clicks for route changes
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Skip external links, hash links, and new-tab links
      if (href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) return;
      if (anchor.target === '_blank') return;
      if (e.ctrlKey || e.metaKey || e.shiftKey) return;

      // Same page — skip
      const url = new URL(href, window.location.origin);
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      show();
    };

    // Listen for popstate (back/forward)
    const handlePopState = () => {
      show();
    };

    document.addEventListener('click', handleClick, true);
    window.addEventListener('popstate', handlePopState);

    // MutationObserver to detect when Next.js swaps the page content
    let hideTimeout: ReturnType<typeof setTimeout>;
    const observer = new MutationObserver(() => {
      if (loading) {
        clearTimeout(hideTimeout);
        hideTimeout = setTimeout(hide, 150);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('load', dismissInitial);
      observer.disconnect();
      clearTimeout(hideTimeout);
    };
  }, [show, hide, loading]);

  return (
    <div
      className={`global-loader ${!loading ? 'global-loader--fade' : ''}`}
      aria-hidden={!loading}
    >
      <div className="loader-planet-wrapper">
        <div className="loader-atmosphere" />
        <div className="loader-planet">
          <div className="loader-planet-shine" />
        </div>
        <div className="loader-orbit">
          <div className="loader-moon" />
        </div>
      </div>
    </div>
  );
}
