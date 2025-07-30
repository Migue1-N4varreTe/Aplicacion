import React, { memo } from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'product';
  width?: number | string;
  height?: number | string;
  lines?: number;
  animate?: boolean;
}

const Skeleton = memo(({
  className,
  variant = 'rectangular',
  width,
  height,
  lines = 1,
  animate = true,
}: SkeletonProps) => {
  const baseClasses = cn(
    'bg-gray-200',
    animate && 'animate-pulse',
    className
  );

  if (variant === 'text') {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseClasses,
              'h-4 rounded',
              index === lines - 1 && lines > 1 && 'w-3/4' // Last line shorter
            )}
            style={{ width, height: height || '1rem' }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'circular') {
    return (
      <div
        className={cn(baseClasses, 'rounded-full')}
        style={{
          width: width || height || '40px',
          height: height || width || '40px',
        }}
      />
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn('border border-gray-200 rounded-lg p-4 space-y-3', className)}>
        <div className="aspect-square bg-gray-200 rounded animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2" />
        </div>
      </div>
    );
  }

  if (variant === 'product') {
    return (
      <div className={cn('space-y-3', className)}>
        {/* Image skeleton */}
        <div className="aspect-square bg-gray-200 rounded animate-pulse" />
        
        {/* Brand skeleton */}
        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4" />
        
        {/* Title skeleton */}
        <div className="space-y-1">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
        </div>
        
        {/* Rating skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-12" />
        </div>
        
        {/* Price skeleton */}
        <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3" />
        
        {/* Button skeleton */}
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div
      className={baseClasses}
      style={{ width, height }}
    />
  );
});

Skeleton.displayName = 'Skeleton';

// Componente específico para loading de productos en grid
export const ProductGridSkeleton = memo(({ count = 20 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} variant="product" />
      ))}
    </div>
  );
});

ProductGridSkeleton.displayName = 'ProductGridSkeleton';

// Componente para loading de página completa
export const PageSkeleton = memo(({ type = 'shop' }: { type?: 'shop' | 'cart' | 'favorites' }) => {
  if (type === 'shop') {
    return (
      <div className="container px-4 py-8 space-y-6">
        {/* Header skeleton */}
        <div className="space-y-4">
          <Skeleton variant="text" lines={1} className="h-8 w-1/4" />
          <Skeleton variant="text" lines={1} className="h-4 w-1/2" />
        </div>
        
        {/* Filters skeleton */}
        <div className="flex flex-wrap gap-4">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-12 w-36" />
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-12 w-32" />
        </div>
        
        {/* Results info skeleton */}
        <Skeleton variant="text" lines={1} className="h-4 w-1/3" />
        
        {/* Products grid skeleton */}
        <ProductGridSkeleton count={20} />
      </div>
    );
  }
  
  if (type === 'cart') {
    return (
      <div className="container px-4 py-8 space-y-6">
        {/* Header */}
        <Skeleton variant="text" lines={1} className="h-8 w-1/4" />
        
        {/* Cart items */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex gap-4 p-4 border rounded-lg">
              <Skeleton className="w-20 h-20" />
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" lines={2} />
                <Skeleton className="h-4 w-1/4" />
              </div>
              <Skeleton className="w-20 h-8" />
            </div>
          ))}
        </div>
        
        {/* Total */}
        <div className="border-t pt-4">
          <Skeleton className="h-6 w-1/3 ml-auto" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="container px-4 py-8">
      <Skeleton variant="text" lines={3} />
    </div>
  );
});

PageSkeleton.displayName = 'PageSkeleton';

// Hook para manejar estados de loading con skeleton
export const useSkeletonLoader = (isLoading: boolean, minLoadingTime = 300) => {
  const [showSkeleton, setShowSkeleton] = React.useState(isLoading);
  const timeoutRef = React.useRef<NodeJS.Timeout>();
  
  React.useEffect(() => {
    if (isLoading) {
      setShowSkeleton(true);
    } else {
      // Mostrar skeleton por al menos minLoadingTime para evitar flashes
      timeoutRef.current = setTimeout(() => {
        setShowSkeleton(false);
      }, minLoadingTime);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, minLoadingTime]);
  
  return showSkeleton;
};

export default Skeleton;
