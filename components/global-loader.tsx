'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

export function GlobalLoader() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = useCallback(() => {
    setProgress(0);
    setVisible(true);

    if (intervalRef.current) clearInterval(intervalRef.current);

    let current = 0;
    intervalRef.current = setInterval(() => {
      current += Math.random() * 12 + 3;
      if (current >= 90) current = 90;
      setProgress(current);
    }, 200);
  }, []);

  const finish = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setProgress(100);
    timeoutRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 300);
  }, []);

  useEffect(() => {
    // Initial page load
    start();
    const dismissInitial = () => setTimeout(finish, 100);
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

      if (href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) return;
      if (anchor.target === '_blank') return;
      if (e.ctrlKey || e.metaKey || e.shiftKey) return;

      const url = new URL(href, window.location.origin);
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      start();
    };

    const handlePopState = () => {
      start();
    };

    document.addEventListener('click', handleClick, true);
    window.addEventListener('popstate', handlePopState);

    // Detect when Next.js finishes rendering new content
    let finishTimeout: ReturnType<typeof setTimeout>;
    const observer = new MutationObserver(() => {
      clearTimeout(finishTimeout);
      finishTimeout = setTimeout(finish, 150);
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('load', dismissInitial);
      observer.disconnect();
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      clearTimeout(finishTimeout);
    };
  }, [start, finish]);

  if (!visible) return null;

  return (
    <div className="global-progress-bar" aria-hidden="true">
      <div
        className="global-progress-bar__fill"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
