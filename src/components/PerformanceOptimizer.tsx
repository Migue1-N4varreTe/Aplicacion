import React, { useEffect, useState, ReactNode } from 'react';
import { useSmartPrefetch } from '@/hooks/use-smart-prefetch';
import { performanceCache } from '@/lib/performance-cache';
import { logger } from '@/lib/logger';

interface PerformanceOptimizerProps {
  children: ReactNode;
}

const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = ({ children }) => {
  const [isOptimized, setIsOptimized] = useState(false);
  const { stats } = useSmartPrefetch();

  useEffect(() => {
    const initializeOptimizations = async () => {
      try {
        // 1. Registrar Service Worker optimizado
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none'
          });

          // Actualizar SW inmediatamente si hay uno nuevo
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }

          // Escuchar actualizaciones del SW
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Nuevo SW instalado, recargar para activar
                  window.location.reload();
                }
              });
            }
          });

          logger.info('Service Worker registered successfully');
        }

        // 2. Optimizaciones de CSS
        optimizeCSS();

        // 3. Configurar Web Vitals monitoring
        setupWebVitalsMonitoring();

        // 4. Optimizar carga de fuentes
        optimizeFonts();

        // 5. Configurar prefetch de DNS
        setupDNSPrefetch();

        setIsOptimized(true);
        logger.info('Performance optimizations initialized');

      } catch (error) {
        logger.error('Failed to initialize performance optimizations:', error);
      }
    };

    initializeOptimizations();
  }, []);

  // Optimizar CSS crítico
  const optimizeCSS = () => {
    // Precargar CSS crítico
    const criticalCSS = document.querySelector('style[data-critical]');
    if (!criticalCSS) {
      const style = document.createElement('style');
      style.setAttribute('data-critical', 'true');
      style.textContent = `
        /* CSS crítico para FCP mejorado */
        .mobile-card { transform: translateZ(0); }
        .btn-gradient { will-change: transform; }
        .group:hover .group-hover\\:scale-105 { transform: scale(1.05); }
        img[loading="lazy"] { content-visibility: auto; }
      `;
      document.head.appendChild(style);
    }
  };

  // Configurar monitoreo de Web Vitals
  const setupWebVitalsMonitoring = () => {
    // Configurar PerformanceObserver para métricas
    if ('PerformanceObserver' in window) {
      try {
        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          logger.performanceMetric('LCP', lastEntry.startTime);
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            logger.performanceMetric('FID', entry.processingStart - entry.startTime);
          });
        });
        fidObserver.observe({ type: 'first-input', buffered: true });

        // Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          logger.performanceMetric('CLS', clsValue);
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });

      } catch (error) {
        logger.warn('Performance Observer setup failed:', error);
      }
    }
  };

  // Optimizar carga de fuentes
  const optimizeFonts = () => {
    // Precargar fuentes críticas
    const fontPreloads = [
      'Inter, system-ui, sans-serif'
    ];

    fontPreloads.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      // En producción, esto sería el URL real de las fuentes
      document.head.appendChild(link);
    });
  };

  // Configurar DNS prefetch para recursos externos
  const setupDNSPrefetch = () => {
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

  // Monitorear rendimiento en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      const cacheStats = performanceCache.getStats();
      
      // Log estadísticas de rendimiento cada 30 segundos
      logger.info('Cache Stats', {
        entries: cacheStats.totalEntries,
        utilization: `${cacheStats.utilizationPercent.toFixed(1)}%`,
        prefetchActive: stats.activePrefetch,
        queueSize: stats.queueSize
      });

      // Limpiar caché si está muy lleno
      if (cacheStats.utilizationPercent > 90) {
        logger.warn('Cache near full, triggering cleanup');
        // El sistema de limpieza automática se encarga de esto
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [stats]);

  return (
    <>
      {children}
      {/* Indicador de optimización (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && isOptimized && (
        <div className="fixed bottom-4 right-4 z-50 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium opacity-75">
          ⚡ Optimizado
        </div>
      )}
    </>
  );
};

export default PerformanceOptimizer;
