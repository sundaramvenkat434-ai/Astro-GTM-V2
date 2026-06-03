"use client";

import { useEffect } from "react";

interface TenantGaProps {
  measurementId: string;
}

export function TenantGa({ measurementId }: TenantGaProps) {
  useEffect(() => {
    if (!measurementId) return;

    const loaderId = `tenant-ga-loader-${measurementId}`;
    const initId = `tenant-ga-init-${measurementId}`;

    if (document.getElementById(loaderId) || document.getElementById(initId)) {
      return;
    }

    const loader = document.createElement("script");
    loader.id = loaderId;
    loader.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    loader.async = true;
    document.head.appendChild(loader);

    const init = document.createElement("script");
    init.id = initId;
    init.text = `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = window.gtag || gtag;
gtag('js', new Date());
gtag('config', '${measurementId}');`;
    document.head.appendChild(init);

    return () => {
      document.getElementById(loaderId)?.remove();
      document.getElementById(initId)?.remove();
    };
  }, [measurementId]);

  return null;
}
