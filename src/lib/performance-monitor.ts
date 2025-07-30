import { logger } from './logger';
import { performanceCache } from './performance-cache';

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  loadTime: number; // Total page load time
}

interface OptimizationReport {
  loadTime: number;
  cacheUtilization: number;
  serviceWorkerActive: boolean;
  criticalResourcesLoaded: boolean;
  meetsPerformanceTarget: boolean;
  recommendations: string[];
}

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];
  private TARGET_LOAD_TIME = 3000; // 3 segundos objetivo

  constructor() {
    this.initializeObservers();
    this.startMonitoring();
  }

  private initializeObservers() {
    if (!('PerformanceObserver' in window)) {
      logger.warn('PerformanceObserver not supported');
      return;
    }

    try {
      // First Contentful Paint
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          this.metrics.fcp = fcpEntry.startTime;
          logger.performance('FCP', fcpEntry.startTime);
        }
      });
      fcpObserver.observe({ type: 'paint', buffered: true });
      this.observers.push(fcpObserver);

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = lastEntry.startTime;
        logger.performance('LCP', lastEntry.startTime);
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      this.observers.push(lcpObserver);

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.metrics.fid = entry.processingStart - entry.startTime;
          logger.performance('FID', this.metrics.fid);
        });
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
      this.observers.push(fidObserver);

      // Cumulative Layout Shift
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.metrics.cls = clsValue;
        logger.performance('CLS', clsValue);
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      this.observers.push(clsObserver);

    } catch (error) {
      logger.error('Failed to initialize performance observers:', error);
    }
  }

  private startMonitoring() {
    // Monitor page load time
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      this.metrics.loadTime = loadTime;
      
      // TTFB from navigation timing
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        this.metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
      }

      logger.performance('Page Load Time', loadTime);
      
      // Generar reporte después de 2 segundos para capturar todas las métricas
      setTimeout(() => {
        this.generateReport();
      }, 2000);
    });
  }

  public generateReport(): OptimizationReport {
    const cacheStats = performanceCache.getStats();
    const loadTime = this.metrics.loadTime || 0;
    const serviceWorkerActive = 'serviceWorker' in navigator && 
      navigator.serviceWorker.controller !== null;

    const criticalResourcesLoaded = this.checkCriticalResources();
    const meetsPerformanceTarget = loadTime <= this.TARGET_LOAD_TIME;

    const recommendations = this.generateRecommendations({
      loadTime,
      cacheUtilization: cacheStats.utilizationPercent,
      serviceWorkerActive,
      criticalResourcesLoaded,
    });

    const report: OptimizationReport = {
      loadTime,
      cacheUtilization: cacheStats.utilizationPercent,
      serviceWorkerActive,
      criticalResourcesLoaded,
      meetsPerformanceTarget,
      recommendations,
    };

    logger.info('Performance Report', report);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚀 Performance Optimization Report');
      console.log(`⏱️  Load Time: ${loadTime.toFixed(0)}ms (Target: ${this.TARGET_LOAD_TIME}ms)`);
      console.log(`🎯 Performance Target: ${meetsPerformanceTarget ? '✅ MET' : '❌ NOT MET'}`);
      console.log(`🗄️  Cache Utilization: ${cacheStats.utilizationPercent.toFixed(1)}%`);
      console.log(`⚙️  Service Worker: ${serviceWorkerActive ? '✅ Active' : '❌ Inactive'}`);
      console.log(`📦 Critical Resources: ${criticalResourcesLoaded ? '✅ Loaded' : '❌ Missing'}`);
      
      if (this.metrics.fcp) console.log(`🎨 First Contentful Paint: ${this.metrics.fcp.toFixed(0)}ms`);
      if (this.metrics.lcp) console.log(`🖼️  Largest Contentful Paint: ${this.metrics.lcp.toFixed(0)}ms`);
      if (this.metrics.fid) console.log(`👆 First Input Delay: ${this.metrics.fid.toFixed(0)}ms`);
      if (this.metrics.cls) console.log(`📐 Cumulative Layout Shift: ${this.metrics.cls.toFixed(3)}`);
      
      if (recommendations.length > 0) {
        console.log('💡 Recommendations:');
        recommendations.forEach(rec => console.log(`   • ${rec}`));
      }
      console.groupEnd();
    }

    return report;
  }

  private checkCriticalResources(): boolean {
    // Verificar que los recursos críticos estén cacheados
    const criticalRoutes = ['/shop', '/cart', '/categories'];
    const routeCache = performanceCache.get('route:/shop');
    
    return routeCache !== null;
  }

  private generateRecommendations(data: {
    loadTime: number;
    cacheUtilization: number;
    serviceWorkerActive: boolean;
    criticalResourcesLoaded: boolean;
  }): string[] {
    const recommendations: string[] = [];

    if (data.loadTime > this.TARGET_LOAD_TIME) {
      recommendations.push(`Tiempo de carga excede objetivo: ${data.loadTime.toFixed(0)}ms > ${this.TARGET_LOAD_TIME}ms`);
    }

    if (!data.serviceWorkerActive) {
      recommendations.push('Service Worker no está activo - verificar registro');
    }

    if (!data.criticalResourcesLoaded) {
      recommendations.push('Recursos críticos no pre-cargados - revisar prefetch');
    }

    if (data.cacheUtilization < 10) {
      recommendations.push('Baja utilización de caché - revisar estrategias de caching');
    }

    if (this.metrics.fcp && this.metrics.fcp > 1800) {
      recommendations.push('First Contentful Paint lento - optimizar recursos críticos');
    }

    if (this.metrics.lcp && this.metrics.lcp > 2500) {
      recommendations.push('Largest Contentful Paint lento - optimizar imágenes hero');
    }

    if (this.metrics.fid && this.metrics.fid > 100) {
      recommendations.push('First Input Delay alto - reducir JavaScript blocking');
    }

    if (this.metrics.cls && this.metrics.cls > 0.1) {
      recommendations.push('Layout Shift alto - estabilizar elementos visuales');
    }

    return recommendations;
  }

  public getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  public destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Instancia global del monitor
export const performanceMonitor = new PerformanceMonitor();

// Utilidad para validar optimizaciones
export const validateOptimizations = (): Promise<OptimizationReport> => {
  return new Promise((resolve) => {
    // Dar tiempo para que se capturen todas las métricas
    setTimeout(() => {
      const report = performanceMonitor.generateReport();
      resolve(report);
    }, 3000);
  });
};

// Hook para componentes que quieren monitorear rendimiento
export const usePerformanceMonitoring = () => {
  const [report, setReport] = React.useState<OptimizationReport | null>(null);

  React.useEffect(() => {
    validateOptimizations().then(setReport);
  }, []);

  return report;
};
