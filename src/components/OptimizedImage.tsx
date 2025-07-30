import React, { useState, useEffect, useRef, memo } from 'react';
import { cn } from '@/lib/utils';
import { imageCache } from '@/lib/performance-cache';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty' | 'skeleton';
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape';
  sizes?: string;
  quality?: number;
  onLoadingComplete?: () => void;
  fallbackSrc?: string;
}

const OptimizedImage = memo(({
  src,
  alt,
  className,
  priority = false,
  placeholder = 'skeleton',
  aspectRatio = 'square',
  sizes,
  quality = 75,
  onLoadingComplete,
  fallbackSrc,
  ...props
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(priority ? src : '');
  
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver>();

  // Aspect ratio classes
  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
  };

  // Placeholder component
  const PlaceholderComponent = () => {
    if (placeholder === 'skeleton') {
      return (
        <div className={cn(
          'absolute inset-0 bg-gray-200 animate-pulse',
          aspectRatioClasses[aspectRatio]
        )}>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
        </div>
      );
    }
    
    if (placeholder === 'blur') {
      return (
        <div className={cn(
          'absolute inset-0 bg-gray-100 backdrop-blur-sm',
          aspectRatioClasses[aspectRatio]
        )} />
      );
    }
    
    return null;
  };

  // Optimizar URL de imagen
  const optimizeImageUrl = (url: string, width?: number) => {
    // Para placeholder images, agregar parámetros de optimización
    if (url.includes('placeholder.com') || url.includes('via.placeholder.com')) {
      const baseUrl = url.split('?')[0];
      const params = new URLSearchParams();
      
      if (quality < 100) {
        params.set('q', quality.toString());
      }
      
      if (width) {
        params.set('w', width.toString());
      }
      
      const paramString = params.toString();
      return paramString ? `${baseUrl}?${paramString}` : baseUrl;
    }
    
    return url;
  };

  // Detectar ancho óptimo basado en el viewport
  const getOptimalWidth = () => {
    if (!imgRef.current) return undefined;
    
    const { clientWidth } = imgRef.current.parentElement || imgRef.current;
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // Redondear al siguiente múltiplo de 100 para mejor caching
    return Math.ceil((clientWidth * devicePixelRatio) / 100) * 100;
  };

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority, isInView]);

  // Cargar imagen cuando está en vista
  useEffect(() => {
    if (!isInView || currentSrc) return;

    const loadImage = async () => {
      try {
        // Verificar caché primero
        const cachedBlob = imageCache.get(src);
        if (cachedBlob) {
          const url = URL.createObjectURL(cachedBlob);
          setCurrentSrc(url);
          setIsLoaded(true);
          onLoadingComplete?.();
          return;
        }

        // Optimizar URL
        const optimalWidth = getOptimalWidth();
        const optimizedSrc = optimizeImageUrl(src, optimalWidth);
        
        // Precargar imagen
        const img = new Image();
        
        img.onload = () => {
          setCurrentSrc(optimizedSrc);
          setIsLoaded(true);
          onLoadingComplete?.();
          
          // Cachear imagen si es exitosa
          fetch(optimizedSrc)
            .then(response => response.blob())
            .then(blob => imageCache.set(src, blob))
            .catch(() => {}); // Silently fail caching
        };
        
        img.onerror = () => {
          setHasError(true);
          if (fallbackSrc) {
            setCurrentSrc(fallbackSrc);
          }
        };
        
        img.src = optimizedSrc;
        
      } catch (error) {
        setHasError(true);
        if (fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
      }
    };

    loadImage();
  }, [isInView, src, fallbackSrc, onLoadingComplete]);

  // Cleanup URLs
  useEffect(() => {
    return () => {
      if (currentSrc && currentSrc.startsWith('blob:')) {
        URL.revokeObjectURL(currentSrc);
      }
    };
  }, [currentSrc]);

  return (
    <div 
      className={cn(
        'relative overflow-hidden bg-gray-100',
        aspectRatioClasses[aspectRatio],
        className
      )}
      ref={imgRef}
    >
      {/* Placeholder */}
      {!isLoaded && !hasError && <PlaceholderComponent />}
      
      {/* Error fallback */}
      {hasError && !fallbackSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          <div className="text-gray-400 text-center p-4">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">Imagen no disponible</span>
          </div>
        </div>
      )}
      
      {/* Actual image */}
      {currentSrc && (
        <img
          {...props}
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          sizes={sizes}
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          style={{
            contentVisibility: 'auto',
            containIntrinsicSize: '300px 300px'
          }}
        />
      )}
      
      {/* Loading indicator */}
      {isInView && !isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;

// Hook para precargar imágenes críticas
export const useImagePreloader = () => {
  const preloadImages = async (urls: string[], priority: 'critical' | 'high' | 'low' = 'high') => {
    const preloadPromises = urls.map(async (url) => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        imageCache.set(url, blob);
      } catch (error) {
        console.warn(`Failed to preload image: ${url}`, error);
      }
    });
    
    if (priority === 'critical') {
      await Promise.all(preloadPromises);
    } else {
      // Non-blocking preload
      Promise.allSettled(preloadPromises);
    }
  };
  
  return { preloadImages };
};

// Utilidad para generar srcSet responsivo
export const generateSrcSet = (baseSrc: string, widths: number[] = [320, 640, 960, 1280, 1920]) => {
  if (!baseSrc.includes('placeholder.com')) {
    return baseSrc;
  }
  
  return widths
    .map(width => {
      const optimizedUrl = baseSrc.includes('?') 
        ? `${baseSrc}&w=${width}` 
        : `${baseSrc}?w=${width}`;
      return `${optimizedUrl} ${width}w`;
    })
    .join(', ');
};

// Componente específico para imágenes de productos
export const ProductImage = memo(({ product, priority = false, ...props }: { 
  product: { image: string; name: string }; 
  priority?: boolean;
} & Omit<OptimizedImageProps, 'src' | 'alt'>) => {
  return (
    <OptimizedImage
      src={product.image}
      alt={product.name}
      priority={priority}
      aspectRatio="square"
      placeholder="skeleton"
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      {...props}
    />
  );
});

ProductImage.displayName = 'ProductImage';
