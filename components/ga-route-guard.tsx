"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const GA_ID = "G-S7J68DJQKE";

function isBlockedRoute(pathname: string): boolean {
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/articles" ||
    pathname.startsWith("/articles/")
  );
}

function loadGA() {
  if (document.getElementById("ga-script")) return;
  const s = document.createElement("script");
  s.id = "ga-script";
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  s.async = true;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  }
  window.gtag = gtag as typeof window.gtag;
  gtag("js", new Date());
  gtag("config", GA_ID, { send_page_view: false });
}

export function GaRouteGuard() {
  const pathname = usePathname();
  const prevPathname = useRef<string | null>(null);

  useEffect(() => {
    if (isBlockedRoute(pathname)) {
      prevPathname.current = pathname;
      return;
    }

    if (!window.gtag) {
      loadGA();
    }

    if (prevPathname.current !== pathname) {
      window.gtag("event", "page_view", {
        page_path: pathname,
        page_location: window.location.href,
      });
    }

    prevPathname.current = pathname;
  }, [pathname]);

  return null;
}

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag: (...args: unknown[]) => void;
  }
}
