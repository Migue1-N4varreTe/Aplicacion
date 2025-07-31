/**
 * Utilidades para optimización automática de imágenes
 * Mejora la carga y experiencia de usuario
 */

export interface ImageOptimizationOptions {
  /** Ancho máximo deseado */
  maxWidth?: number;
  /** Alto máximo deseado */
  maxHeight?: number;
  /** Calidad de compresión (0-100) */
  quality?: number;
  /** Formato de salida */
  format?: 'webp' | 'jpeg' | 'png' | 'auto';
  /** Usar lazy loading */
  lazy?: boolean;
  /** Precargar imagen crítica */
  priority?: boolean;
}

/**
 * Optimiza URLs de imágenes externas (Unsplash, etc.)
 */
export const optimizeImageUrl = (
  url: string,
  options: ImageOptimizationOptions = {}
): string => {
  const {
    maxWidth = 800,
    maxHeight = 600,
    quality = 80,
    format = 'auto'
  } = options;

  try {
    // Optimización para Unsplash
    if (url.includes('unsplash.com')) {
      const optimizedUrl = new URL(url);
      optimizedUrl.searchParams.set('w', maxWidth.toString());
      optimizedUrl.searchParams.set('h', maxHeight.toString());
      optimizedUrl.searchParams.set('q', quality.toString());
      optimizedUrl.searchParams.set('fit', 'crop');
      optimizedUrl.searchParams.set('auto', 'format');
      return optimizedUrl.toString();
    }

    // Optimización para Pexels
    if (url.includes('pexels.com')) {
      const optimizedUrl = new URL(url);
      optimizedUrl.searchParams.set('auto', 'compress');
      optimizedUrl.searchParams.set('cs', 'tinysrgb');
      optimizedUrl.searchParams.set('w', maxWidth.toString());
      optimizedUrl.searchParams.set('h', maxHeight.toString());
      optimizedUrl.searchParams.set('fit', 'crop');
      return optimizedUrl.toString();
    }

    // Para otras URLs, retornar sin modificar
    return url;
  } catch (error) {
    console.warn('Failed to optimize image URL:', error);
    return url;
  }
};

/**
 * Genera múltiples tamaños de una imagen (responsive images)
 */
export const generateResponsiveSizes = (
  baseUrl: string,
  sizes: number[] = [320, 640, 1024, 1280, 1920]
): string => {
  const srcSet = sizes
    .map(size => {
      const optimizedUrl = optimizeImageUrl(baseUrl, { maxWidth: size });
      return `${optimizedUrl} ${size}w`;
    })
    .join(', ');

  return srcSet;
};

/**
 * Genera el atributo sizes para responsive images
 */
export const generateSizesAttribute = (
  breakpoints: Array<{ query: string; size: string }> = [
    { query: '(max-width: 640px)', size: '100vw' },
    { query: '(max-width: 1024px)', size: '50vw' },
    { query: '(max-width: 1280px)', size: '33vw' },
  ],
  defaultSize: string = '25vw'
): string => {
  const sizesString = breakpoints
    .map(bp => `${bp.query} ${bp.size}`)
    .join(', ');
  
  return `${sizesString}, ${defaultSize}`;
};

/**
 * Detecta si el navegador soporta WebP
 */
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

/**
 * Detecta si el navegador soporta AVIF
 */
export const supportsAVIF = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const avif = new Image();
    avif.onload = avif.onerror = () => {
      resolve(avif.height === 2);
    };
    avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=';
  });
};

/**
 * Hook para detectar formatos soportados
 */
export const useImageFormatSupport = () => {
  const [formats, setFormats] = React.useState({
    webp: false,
    avif: false,
    loading: true
  });

  React.useEffect(() => {
    const detectFormats = async () => {
      const [webpSupport, avifSupport] = await Promise.all([
        supportsWebP(),
        supportsAVIF()
      ]);

      setFormats({
        webp: webpSupport,
        avif: avifSupport,
        loading: false
      });
    };

    detectFormats();
  }, []);

  return formats;
};

/**
 * Obtiene el mejor formato de imagen para el navegador
 */
export const getBestImageFormat = async (): Promise<'avif' | 'webp' | 'jpeg'> => {
  const [avifSupport, webpSupport] = await Promise.all([
    supportsAVIF(),
    supportsWebP()
  ]);

  if (avifSupport) return 'avif';
  if (webpSupport) return 'webp';
  return 'jpeg';
};

/**
 * Interfaz para configurar Image Observer
 */
interface ImageLoadingStrategy {
  /** Usar Intersection Observer para lazy loading */
  useLazyLoading: boolean;
  /** Margen del root para pre-cargar */
  rootMargin: string;
  /** Umbral de visibilidad */
  threshold: number;
  /** Precargar imágenes críticas */
  preloadCritical: boolean;
  /** Número máximo de imágenes a precargar */
  maxPreload: number;
}

/**
 * Configuración por defecto para carga de imágenes
 */
export const DEFAULT_LOADING_STRATEGY: ImageLoadingStrategy = {
  useLazyLoading: true,
  rootMargin: '50px',
  threshold: 0.1,
  preloadCritical: true,
  maxPreload: 3
};

/**
 * Hook para optimizar la carga de imágenes
 */
export const useImageOptimization = (
  strategy: Partial<ImageLoadingStrategy> = {}
) => {
  const config = { ...DEFAULT_LOADING_STRATEGY, ...strategy };
  const observerRef = React.useRef<IntersectionObserver>();
  const preloadedCount = React.useRef(0);

  const optimizeImage = React.useCallback((
    src: string,
    options: ImageOptimizationOptions = {}
  ) => {
    return optimizeImageUrl(src, options);
  }, []);

  const preloadImage = React.useCallback((src: string) => {
    if (preloadedCount.current >= config.maxPreload) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
    
    preloadedCount.current++;
  }, [config.maxPreload]);

  const createLazyLoadObserver = React.useCallback((
    callback: (entries: IntersectionObserverEntry[]) => void
  ) => {
    if (!config.useLazyLoading) return null;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(callback, {
      rootMargin: config.rootMargin,
      threshold: config.threshold
    });

    return observerRef.current;
  }, [config.useLazyLoading, config.rootMargin, config.threshold]);

  React.useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return {
    optimizeImage,
    preloadImage,
    createLazyLoadObserver,
    config
  };
};

export default {
  optimizeImageUrl,
  generateResponsiveSizes,
  generateSizesAttribute,
  supportsWebP,
  supportsAVIF,
  getBestImageFormat,
  useImageFormatSupport,
  useImageOptimization,
  DEFAULT_LOADING_STRATEGY
};
