import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Loader2, ImageOff, Package, Store } from "lucide-react";

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** URL principal de la imagen */
  src: string;
  /** URLs de fallback en orden de prioridad */
  fallbackSrcs?: string[];
  /** Alt text para accesibilidad */
  alt: string;
  /** Categoría para placeholder específico */
  category?: string;
  /** Texto a mostrar en fallback final */
  fallbackText?: string;
  /** Mostrar loading spinner */
  showLoader?: boolean;
  /** Aspect ratio (w-h) */
  aspectRatio?: "square" | "video" | "photo" | "auto";
  /** Tamaño del placeholder */
  size?: "sm" | "md" | "lg" | "xl";
  /** Callback cuando falla la carga */
  onError?: (error: string) => void;
  /** Callback cuando carga exitosamente */
  onSuccess?: () => void;
}

/**
 * Componente inteligente de imagen con sistema de fallbacks
 * Maneja errores de carga, lazy loading y placeholders personalizados
 */
export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  fallbackSrcs = [],
  alt,
  category,
  fallbackText,
  showLoader = true,
  aspectRatio = "auto",
  size = "md",
  onError,
  onSuccess,
  className,
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(src);
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [fallbackIndex, setFallbackIndex] = useState(-1);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset cuando cambia la imagen principal
  useEffect(() => {
    setCurrentSrc(src);
    setImageState('loading');
    setFallbackIndex(-1);
  }, [src]);

  const handleImageLoad = () => {
    setImageState('loaded');
    onSuccess?.();
  };

  const handleImageError = () => {
    const nextIndex = fallbackIndex + 1;
    
    if (nextIndex < fallbackSrcs.length) {
      // Probar siguiente fallback
      setFallbackIndex(nextIndex);
      setCurrentSrc(fallbackSrcs[nextIndex]);
    } else {
      // No hay más fallbacks, mostrar placeholder
      setImageState('error');
      onError?.(`Failed to load image: ${src} and ${fallbackSrcs.length} fallbacks`);
    }
  };

  const getPlaceholderIcon = () => {
    switch (category?.toLowerCase()) {
      case 'lacteos-huevos':
      case 'lacteos':
        return '🥛';
      case 'carniceria-cremeria':
      case 'carnes':
        return '🥩';
      case 'frutas-verduras':
      case 'frutas':
      case 'verduras':
        return '🥬';
      case 'panaderia':
        return '🍞';
      case 'bebidas':
        return '🥤';
      case 'snacks':
        return '🍿';
      case 'congelados':
        return '🧊';
      case 'limpieza':
        return '🧽';
      case 'hogar':
        return '🏠';
      case 'farmacia':
        return '💊';
      default:
        return <Package className="h-8 w-8 text-gray-400" />;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-16 w-16';
      case 'md':
        return 'h-24 w-24';
      case 'lg':
        return 'h-32 w-32';
      case 'xl':
        return 'h-48 w-48';
      default:
        return 'h-24 w-24';
    }
  };

  const getAspectRatioClasses = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'video':
        return 'aspect-video';
      case 'photo':
        return 'aspect-[4/3]';
      default:
        return '';
    }
  };

  // Placeholder cuando no se puede cargar la imagen
  if (imageState === 'error') {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 transition-colors hover:bg-gray-50",
          getAspectRatioClasses(),
          getSizeClasses(),
          className
        )}
        {...props}
      >
        <div className="text-4xl mb-2">
          {typeof getPlaceholderIcon() === 'string' ? (
            <span className="text-2xl">{getPlaceholderIcon()}</span>
          ) : (
            getPlaceholderIcon()
          )}
        </div>
        <div className="text-center px-2">
          <div className="text-xs text-gray-500 font-medium">
            {fallbackText || alt || 'Imagen no disponible'}
          </div>
          {category && (
            <div className="text-xs text-gray-400 mt-1 capitalize">
              {category.replace('-', ' ')}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", getAspectRatioClasses(), className)}>
      {/* Loading estado */}
      {imageState === 'loading' && showLoader && (
        <div className={cn(
          "absolute inset-0 flex items-center justify-center bg-gray-100",
          getSizeClasses()
        )}>
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}
      
      {/* Imagen principal */}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={cn(
          "transition-opacity duration-300",
          imageState === 'loaded' ? 'opacity-100' : 'opacity-0',
          props.className
        )}
        loading="lazy"
        decoding="async"
        {...props}
      />
    </div>
  );
};

/**
 * Hook para generar URLs de fallback automáticamente
 */
export const useImageFallbacks = (category?: string, search?: string) => {
  const generateFallbacks = (category?: string, search?: string): string[] => {
    const fallbacks: string[] = [];
    
    // Picsum (Lorem Ipsum para imágenes) - siempre funciona
    fallbacks.push(`https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}`);
    
    // Placeholder.com con categoría
    if (category) {
      fallbacks.push(`https://via.placeholder.com/400x400/f3f4f6/9ca3af?text=${encodeURIComponent(category)}`);
    }
    
    // Placeholder genérico
    fallbacks.push(`https://via.placeholder.com/400x400/e5e7eb/6b7280?text=Imagen+No+Disponible`);
    
    return fallbacks;
  };

  return generateFallbacks(category, search);
};

/**
 * Componente específico para productos
 */
export const ProductImage: React.FC<{
  src: string;
  productName: string;
  category?: string;
  className?: string;
}> = ({ src, productName, category, className }) => {
  const fallbacks = useImageFallbacks(category, productName);
  
  return (
    <SmartImage
      src={src}
      fallbackSrcs={fallbacks}
      alt={productName}
      category={category}
      fallbackText={productName}
      aspectRatio="square"
      size="md"
      className={className}
    />
  );
};

/**
 * Componente específico para categorías
 */
export const CategoryImage: React.FC<{
  src: string;
  categoryName: string;
  className?: string;
}> = ({ src, categoryName, className }) => {
  const fallbacks = useImageFallbacks(categoryName);
  
  return (
    <SmartImage
      src={src}
      fallbackSrcs={fallbacks}
      alt={`Categoría ${categoryName}`}
      category={categoryName}
      fallbackText={categoryName}
      aspectRatio="square"
      size="lg"
      className={className}
    />
  );
};
