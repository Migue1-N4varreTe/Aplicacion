import { useEffect } from 'react';
import { logger } from '@/lib/logger';

interface PerformanceOptimizerProps {
  children: React.ReactNode;
}

const PerformanceOptimizer = ({ children }: PerformanceOptimizerProps) => {
  useEffect(() => {
    // Preload critical resources
    const preloadCriticalResources = () => {
      // Preload critical CSS
      const criticalStyles = [
        '/src/index.css',
        '/src/App.css'
      ];

      criticalStyles.forEach(href => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = href;
        document.head.appendChild(link);
      });

      // Preload critical fonts
      const criticalFonts = [
        'Inter',
        'system-ui'
      ];

      criticalFonts.forEach(fontFamily => {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = 'https://fonts.googleapis.com';
        document.head.appendChild(link);
      });

      // Preload critical images
      const criticalImages = [
        'https://via.placeholder.com/400x300', // placeholder base
      ];

      criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
      });
    };

    // DNS prefetch for external domains
    const prefetchDomains = () => {
      const domains = [
        'https://via.placeholder.com',
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com'
      ];

      domains.forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = domain;
        document.head.appendChild(link);
      });
    };

    // Optimize images
    const optimizeImages = () => {
      // Set loading="lazy" for all images not marked as priority
      const images = document.querySelectorAll('img:not([loading])');
      images.forEach((img, index) => {
        if (index > 8) { // First 8 images load eagerly
          img.setAttribute('loading', 'lazy');
          img.setAttribute('decoding', 'async');
        }
      });
    };

    // Performance monitoring
    const monitorPerformance = () => {
      // Web Vitals monitoring
      if ('performance' in window) {
        // Monitor LCP (Largest Contentful Paint)
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          logger.performanceMetric('LCP', lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // Monitor FID (First Input Delay)
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry) => {
            logger.performanceMetric('FID', entry.processingStart - entry.startTime);
          });
        }).observe({ entryTypes: ['first-input'] });

        // Monitor CLS (Cumulative Layout Shift)
        new PerformanceObserver((entryList) => {
          let clsValue = 0;
          const entries = entryList.getEntries();
          entries.forEach((entry) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          logger.performanceMetric('CLS', clsValue);
        }).observe({ entryTypes: ['layout-shift'] });

        // Monitor page load time
        window.addEventListener('load', () => {
          const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
          logger.performanceMetric('Page Load Time', loadTime);
          
          if (loadTime > 3000) {
            logger.warn('Page load time exceeded 3 seconds', { loadTime });
          }
        });
      }
    };

    // Critical Path Optimization
    const optimizeCriticalPath = () => {
      // Defer non-critical JavaScript
      const scripts = document.querySelectorAll('script[src]:not([defer]):not([async])');
      scripts.forEach(script => {
        if (!script.src.includes('critical')) {
          script.setAttribute('defer', 'true');
        }
      });

      // Optimize CSS delivery
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"]:not([media])');
      stylesheets.forEach((link, index) => {
        if (index > 1) { // First 2 stylesheets are critical
          link.setAttribute('media', 'print');
          link.setAttribute('onload', "this.media='all'");
        }
      });
    };

    // Content visibility optimization
    const optimizeContentVisibility = () => {
      // Apply content-visibility to off-screen elements
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const target = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            target.style.contentVisibility = 'visible';
          } else {
            target.style.contentVisibility = 'auto';
          }
        });
      }, {
        rootMargin: '50px'
      });

      // Observe product cards
      setTimeout(() => {
        const productCards = document.querySelectorAll('[data-product-card]');
        productCards.forEach(card => observer.observe(card));
      }, 100);
    };

    // Execute optimizations
    requestIdleCallback(() => {
      preloadCriticalResources();
      prefetchDomains();
      optimizeImages();
      monitorPerformance();
      optimizeCriticalPath();
      optimizeContentVisibility();
    });

    // Cleanup
    return () => {
      // Remove preloaded resources if needed
    };
  }, []);

  // Service Worker optimization
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'imports'
      }).then((registration) => {
        logger.info('SW registered', { scope: registration.scope });
        
        // Check for updates every 5 minutes
        setInterval(() => {
          registration.update();
        }, 5 * 60 * 1000);
      }).catch((error) => {
        logger.error('SW registration failed', error);
      });
    }
  }, []);

  return <>{children}</>;
};

export default PerformanceOptimizer;
