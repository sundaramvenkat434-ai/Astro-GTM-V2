'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

export function GlobalLoader() {
  const [visible, setVisible] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(true);
  }, []);

  const hide = useCallback(() => {
    timeoutRef.current = setTimeout(() => setVisible(false), 300);
  }, []);

  useEffect(() => {
    const dismissInitial = () => setTimeout(hide, 100);
    if (document.readyState === 'complete') {
      dismissInitial();
    } else {
      window.addEventListener('load', dismissInitial, { once: true });
    }

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

      show();
    };

    const handlePopState = () => show();

    document.addEventListener('click', handleClick, true);
    window.addEventListener('popstate', handlePopState);

    let finishTimeout: ReturnType<typeof setTimeout>;
    const observer = new MutationObserver(() => {
      clearTimeout(finishTimeout);
      finishTimeout = setTimeout(hide, 150);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('load', dismissInitial);
      observer.disconnect();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      clearTimeout(finishTimeout);
    };
  }, [show, hide]);

  if (!visible) return null;

  return (
    <div className="global-progress-bar" aria-hidden="true">
      <div className="global-progress-bar__fill" />
    </div>
  );
}
