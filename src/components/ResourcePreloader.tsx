import { useEffect } from "react";

interface ResourcePreloaderProps {
  resources?: string[];
  priority?: "high" | "low";
}

const ResourcePreloader = ({ 
  resources = [], 
  priority = "low" 
}: ResourcePreloaderProps) => {
  useEffect(() => {
    // Preload critical resources
    const criticalResources = [
      // Critical fonts
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
      // Critical images (optimized)
      "https://images.pexels.com/photos/2564460/pexels-photo-2564460.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop",
      ...resources
    ];

    const preloadResource = (url: string) => {
      if (url.endsWith('.css') || url.includes('fonts.googleapis.com')) {
        // Preload stylesheets
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = url;
        link.onload = () => {
          link.rel = 'stylesheet';
        };
        document.head.appendChild(link);
      } else if (url.match(/\.(jpg|jpeg|png|webp|svg)$/i)) {
        // Preload images
        const img = new Image();
        img.loading = 'eager';
        img.decoding = 'async';
        img.src = url;
      } else {
        // Preload other resources
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
      }
    };

    // Use requestIdleCallback for non-critical resources
    if (priority === "low" && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        criticalResources.forEach(preloadResource);
      });
    } else {
      // Load immediately for high priority
      criticalResources.forEach(preloadResource);
    }

    // Service Worker registration for caching
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
    }

  }, [resources, priority]);

  // Performance observer for monitoring
  useEffect(() => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            // Log performance metrics in development
            if (import.meta.env.DEV) {
              console.log('Navigation timing:', {
                DNS: entry.domainLookupEnd - entry.domainLookupStart,
                TCP: entry.connectEnd - entry.connectStart,
                Request: entry.responseStart - entry.requestStart,
                Response: entry.responseEnd - entry.responseStart,
                DOM: entry.domContentLoadedEventEnd - entry.responseEnd,
                Load: entry.loadEventEnd - entry.loadEventStart,
                Total: entry.loadEventEnd - entry.navigationStart
              });
            }
          }
        }
      });
      
      observer.observe({ entryTypes: ['navigation', 'resource'] });
      
      return () => observer.disconnect();
    }
  }, []);

  return null; // This component doesn't render anything
};

export default ResourcePreloader;
