'use client';

import { useEffect, useState } from 'react';

export function GlobalLoader() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const dismiss = () => {
      setFading(true);
      setTimeout(() => setVisible(false), 400);
    };

    if (document.readyState === 'complete') {
      setTimeout(dismiss, 200);
    } else {
      const handler = () => setTimeout(dismiss, 200);
      window.addEventListener('load', handler);
      return () => window.removeEventListener('load', handler);
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`global-loader ${fading ? 'global-loader--fade' : ''}`}
      aria-label="Loading"
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
