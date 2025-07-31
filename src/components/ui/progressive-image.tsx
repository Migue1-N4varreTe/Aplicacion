import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ProgressiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** URL de la imagen principal (alta calidad) */
  src: string;
  /** URL de la imagen de baja calidad (thumbnail) para loading */
  placeholderSrc?: string;
  /** Alt text para accesibilidad */
  alt: string;
  /** Callback cuando la imagen se carga */
  onLoad?: () => void;
  /** Callback cuando hay error */
  onError?: () => void;
  /** Mostrar efecto blur mientras carga */
  blurEffect?: boolean;
  /** Intensidad del blur (por defecto 20px) */
  blurIntensity?: number;
  /** Duración de la transición (por defecto 300ms) */
  transitionDuration?: number;
}

/**
 * Componente de imagen progresiva con efecto blur
 * Carga primero una imagen de baja calidad y luego la de alta calidad
 */
export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  placeholderSrc,
  alt,
  onLoad,
  onError,
  blurEffect = true,
  blurIntensity = 20,
  transitionDuration = 300,
  className,
  ...props
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [placeholderLoaded, setPlaceholderLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!src) return;

    // Precargar la imagen principal
    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      onLoad?.();
    };
    img.onerror = () => {
      onError?.();
    };
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, onLoad, onError]);

  const handlePlaceholderLoad = () => {
    setPlaceholderLoaded(true);
  };

  const handlePlaceholderError = () => {
    // Si falla el placeholder, continuar sin él
    setPlaceholderLoaded(true);
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Placeholder image (low quality) */}
      {placeholderSrc && !imageLoaded && (
        <img
          src={placeholderSrc}
          alt={alt}
          onLoad={handlePlaceholderLoad}
          onError={handlePlaceholderError}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity",
            blurEffect && placeholderLoaded && `blur-[${blurIntensity}px]`,
            placeholderLoaded ? "opacity-100" : "opacity-0"
          )}
          style={{
            transitionDuration: `${transitionDuration}ms`,
            filter: blurEffect && placeholderLoaded ? `blur(${blurIntensity}px)` : undefined,
          }}
          aria-hidden="true"
        />
      )}

      {/* Main image (high quality) */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-opacity",
          imageLoaded ? "opacity-100" : "opacity-0"
        )}
        style={{
          transitionDuration: `${transitionDuration}ms`,
        }}
        loading="lazy"
        decoding="async"
        {...props}
      />

      {/* Loading skeleton mientras no hay ni placeholder ni imagen */}
      {!placeholderLoaded && !imageLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-sm">Cargando...</div>
        </div>
      )}
    </div>
  );
};

/**
 * Hook para generar placeholder de baja calidad
 */
export const useLowQualityPlaceholder = (src: string, quality: number = 10) => {
  const [placeholderSrc, setPlaceholderSrc] = useState<string>("");

  useEffect(() => {
    if (!src) return;

    // Intentar generar una versión de baja calidad
    // En un escenario real, esto se haría en el backend
    const generatePlaceholder = () => {
      try {
        // Para URLs de Unsplash, podemos reducir la calidad
        if (src.includes('unsplash.com')) {
          const url = new URL(src);
          url.searchParams.set('q', quality.toString());
          url.searchParams.set('w', '50'); // Muy pequeña
          url.searchParams.set('blur', '2');
          setPlaceholderSrc(url.toString());
          return;
        }

        // Para otras URLs, intentar crear un placeholder básico
        // En producción, esto se manejaría mejor con un servicio de imágenes
        const canvas = document.createElement('canvas');
        canvas.width = 10;
        canvas.height = 10;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#f3f4f6';
          ctx.fillRect(0, 0, 10, 10);
          setPlaceholderSrc(canvas.toDataURL());
        }
      } catch (error) {
        console.warn('Failed to generate placeholder:', error);
      }
    };

    generatePlaceholder();
  }, [src, quality]);

  return placeholderSrc;
};

/**
 * Wrapper component que combina ProgressiveImage con SmartImage
 */
export const EnhancedImage: React.FC<{
  src: string;
  alt: string;
  category?: string;
  fallbackSrcs?: string[];
  progressive?: boolean;
  className?: string;
  onLoad?: () => void;
  onError?: (error: string) => void;
}> = ({ 
  src, 
  alt, 
  category, 
  fallbackSrcs = [], 
  progressive = true, 
  className,
  onLoad,
  onError,
  ...props 
}) => {
  const placeholderSrc = useLowQualityPlaceholder(src);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [fallbackIndex, setFallbackIndex] = useState(-1);

  const handleError = () => {
    const nextIndex = fallbackIndex + 1;
    
    if (nextIndex < fallbackSrcs.length) {
      setFallbackIndex(nextIndex);
      setCurrentSrc(fallbackSrcs[nextIndex]);
    } else {
      onError?.(`Failed to load image: ${src}`);
    }
  };

  if (progressive && placeholderSrc) {
    return (
      <ProgressiveImage
        src={currentSrc}
        placeholderSrc={placeholderSrc}
        alt={alt}
        className={className}
        onLoad={onLoad}
        onError={handleError}
        {...props}
      />
    );
  }

  // Fallback a imagen regular
  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onLoad={onLoad}
      onError={handleError}
      loading="lazy"
      decoding="async"
      {...props}
    />
  );
};

export default ProgressiveImage;
