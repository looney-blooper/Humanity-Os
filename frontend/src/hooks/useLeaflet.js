// frontend/src/hooks/useLeaflet.js
import { useEffect, useState } from "react";

export function useLeaflet() {
  const [leaflet, setLeaflet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadLeaflet() {
      // Check if running in browser
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      // Check if already loaded
      if (window.L) {
        setLeaflet(window.L);
        setLoading(false);
        return;
      }

      try {
        // Load CSS
        const cssHref = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        if (!document.querySelector(`link[href="${cssHref}"]`)) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = cssHref;
          document.head.appendChild(link);
        }

        // Load JS
        if (!document.querySelector('script[data-leaflet]')) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.async = true;
            script.setAttribute('data-leaflet', '1');
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Leaflet'));
            document.body.appendChild(script);
          });
        }

        // Set leaflet if component is still mounted
        if (window.L && !cancelled) {
          setLeaflet(window.L);
          setLoading(false);
        }
      } catch (err) {
        console.error('Leaflet loading error:', err);
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      }
    }

    loadLeaflet();

    return () => {
      cancelled = true;
    };
  }, []);

  return { leaflet, loading, error };
}