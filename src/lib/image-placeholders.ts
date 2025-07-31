/**
 * Sistema de placeholders e imágenes de fallback por categoría
 * Proporciona imágenes consistentes cuando fallan las originales
 */

export interface PlaceholderConfig {
  emoji: string;
  color: string;
  bgColor: string;
  description: string;
  fallbackUrls: string[];
}

/**
 * Configuración de placeholders por categoría
 */
export const CATEGORY_PLACEHOLDERS: Record<string, PlaceholderConfig> = {
  // Alimentación
  'lacteos-huevos': {
    emoji: '🥛',
    color: '#ffffff',
    bgColor: '#3b82f6', // blue-500
    description: 'Lácteos y Huevos',
    fallbackUrls: [
      'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop',
      'https://picsum.photos/400/400?random=1&blur=1'
    ]
  },
  'carniceria-cremeria': {
    emoji: '🥩',
    color: '#ffffff',
    bgColor: '#dc2626', // red-600
    description: 'Carnicería y Cremería',
    fallbackUrls: [
      'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=400&fit=crop',
      'https://via.placeholder.com/400x400/dc2626/ffffff?text=🥩+Carnes'
    ]
  },
  'frutas-verduras': {
    emoji: '🥬',
    color: '#ffffff',
    bgColor: '#16a34a', // green-600
    description: 'Frutas y Verduras',
    fallbackUrls: [
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop',
      'https://via.placeholder.com/400x400/16a34a/ffffff?text=🥬+Frutas'
    ]
  },
  'panaderia': {
    emoji: '🍞',
    color: '#ffffff',
    bgColor: '#f59e0b', // amber-500
    description: 'Panadería',
    fallbackUrls: [
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop',
      'https://via.placeholder.com/400x400/f59e0b/ffffff?text=🍞+Pan'
    ]
  },
  'bebidas': {
    emoji: '🥤',
    color: '#ffffff',
    bgColor: '#0ea5e9', // sky-500
    description: 'Bebidas',
    fallbackUrls: [
      'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=400&fit=crop',
      'https://via.placeholder.com/400x400/0ea5e9/ffffff?text=🥤+Bebidas'
    ]
  },
  'snacks': {
    emoji: '🍿',
    color: '#ffffff',
    bgColor: '#f97316', // orange-500
    description: 'Snacks y Botanas',
    fallbackUrls: [
      'https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400&h=400&fit=crop',
      'https://via.placeholder.com/400x400/f97316/ffffff?text=🍿+Snacks'
    ]
  },
  'congelados': {
    emoji: '🧊',
    color: '#ffffff',
    bgColor: '#0284c7', // sky-600
    description: 'Productos Congelados',
    fallbackUrls: [
      'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=400&fit=crop',
      'https://via.placeholder.com/400x400/0284c7/ffffff?text=🧊+Congelados'
    ]
  },
  'limpieza': {
    emoji: '🧽',
    color: '#ffffff',
    bgColor: '#7c3aed', // violet-600
    description: 'Limpieza del Hogar',
    fallbackUrls: [
      'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&h=400&fit=crop',
      'https://via.placeholder.com/400x400/7c3aed/ffffff?text=🧽+Limpieza'
    ]
  },
  'hogar': {
    emoji: '🏠',
    color: '#ffffff',
    bgColor: '#059669', // emerald-600
    description: 'Artículos del Hogar',
    fallbackUrls: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
      'https://via.placeholder.com/400x400/059669/ffffff?text=🏠+Hogar'
    ]
  },
  'farmacia': {
    emoji: '💊',
    color: '#ffffff',
    bgColor: '#be123c', // rose-700
    description: 'Farmacia y Salud',
    fallbackUrls: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
      'https://via.placeholder.com/400x400/be123c/ffffff?text=💊+Farmacia'
    ]
  },
  'mascotas': {
    emoji: '🐕',
    color: '#ffffff',
    bgColor: '#7c2d12', // amber-800
    description: 'Productos para Mascotas',
    fallbackUrls: [
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=400&fit=crop',
      'https://via.placeholder.com/400x400/7c2d12/ffffff?text=🐕+Mascotas'
    ]
  },
  // Placeholder genérico
  'default': {
    emoji: '📦',
    color: '#ffffff',
    bgColor: '#6b7280', // gray-500
    description: 'Producto',
    fallbackUrls: [
      'https://picsum.photos/400/400?grayscale&blur=1',
      'https://via.placeholder.com/400x400/6b7280/ffffff?text=📦+Producto'
    ]
  }
};

/**
 * Genera una imagen SVG placeholder
 */
export const generateSVGPlaceholder = (
  category: string,
  width: number = 400,
  height: number = 400
): string => {
  const config = CATEGORY_PLACEHOLDERS[category] || CATEGORY_PLACEHOLDERS.default;
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${config.bgColor}"/>
      <text 
        x="50%" 
        y="40%" 
        text-anchor="middle" 
        dominant-baseline="middle" 
        font-size="${Math.min(width, height) * 0.2}" 
        fill="${config.color}"
      >${config.emoji}</text>
      <text 
        x="50%" 
        y="70%" 
        text-anchor="middle" 
        dominant-baseline="middle" 
        font-size="${Math.min(width, height) * 0.05}" 
        fill="${config.color}"
        font-family="Arial, sans-serif"
      >${config.description}</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Obtiene la configuración de placeholder para una categoría
 */
export const getPlaceholderConfig = (category?: string): PlaceholderConfig => {
  if (!category) return CATEGORY_PLACEHOLDERS.default;
  
  // Normalizar nombre de categoría
  const normalizedCategory = category.toLowerCase().trim();
  
  // Buscar coincidencia exacta
  if (CATEGORY_PLACEHOLDERS[normalizedCategory]) {
    return CATEGORY_PLACEHOLDERS[normalizedCategory];
  }
  
  // Buscar coincidencia parcial
  const partialMatch = Object.keys(CATEGORY_PLACEHOLDERS).find(key =>
    normalizedCategory.includes(key.split('-')[0]) || 
    key.includes(normalizedCategory)
  );
  
  return CATEGORY_PLACEHOLDERS[partialMatch || 'default'];
};

/**
 * Genera URLs de fallback para una categoría específica
 */
export const generateFallbackUrls = (
  category?: string,
  productName?: string,
  size: { width: number; height: number } = { width: 400, height: 400 }
): string[] => {
  const config = getPlaceholderConfig(category);
  const fallbacks: string[] = [];
  
  // 1. URLs específicas de la categoría
  fallbacks.push(...config.fallbackUrls);
  
  // 2. Imagen SVG generada
  fallbacks.push(generateSVGPlaceholder(category || 'default', size.width, size.height));
  
  // 3. Placeholder.com con información del producto
  if (productName) {
    const encodedName = encodeURIComponent(productName.substring(0, 20));
    fallbacks.push(
      `https://via.placeholder.com/${size.width}x${size.height}/${config.bgColor.substring(1)}/ffffff?text=${encodedName}`
    );
  }
  
  // 4. Placeholder.com básico
  fallbacks.push(
    `https://via.placeholder.com/${size.width}x${size.height}/${config.bgColor.substring(1)}/ffffff?text=Sin+Imagen`
  );
  
  // 5. Picsum (siempre funciona)
  fallbacks.push(`https://picsum.photos/${size.width}/${size.height}?random=${Date.now()}`);
  
  return fallbacks;
};

/**
 * Hook para obtener información de placeholder
 */
export const usePlaceholder = (category?: string) => {
  const config = getPlaceholderConfig(category);
  
  return {
    config,
    generateSVG: (width?: number, height?: number) => 
      generateSVGPlaceholder(category || 'default', width, height),
    getFallbackUrls: (productName?: string, size?: { width: number; height: number }) =>
      generateFallbackUrls(category, productName, size),
  };
};

/**
 * Tipos para TypeScript
 */
export type CategoryKey = keyof typeof CATEGORY_PLACEHOLDERS;
export type PlaceholderSize = { width: number; height: number };

export default {
  CATEGORY_PLACEHOLDERS,
  generateSVGPlaceholder,
  getPlaceholderConfig,
  generateFallbackUrls,
  usePlaceholder,
};
