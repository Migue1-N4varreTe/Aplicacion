/**
 * Generador de imágenes dinámicas usando Canvas API
 * Crea imágenes de fallback atractivas cuando no se cargan las originales
 */

export interface ImageGeneratorOptions {
  width: number;
  height: number;
  text: string;
  backgroundColor: string;
  textColor: string;
  emoji?: string;
  fontSize?: number;
  fontFamily?: string;
  gradient?: {
    start: string;
    end: string;
    direction?: 'horizontal' | 'vertical' | 'diagonal';
  };
}

/**
 * Genera una imagen usando Canvas API
 */
export const generateCanvasImage = (options: ImageGeneratorOptions): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas context not available');
      }

      canvas.width = options.width;
      canvas.height = options.height;

      // Fondo con gradiente o color sólido
      if (options.gradient) {
        const gradient = createGradient(ctx, options.gradient, options.width, options.height);
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = options.backgroundColor;
      }
      
      ctx.fillRect(0, 0, options.width, options.height);

      // Emoji si está disponible
      if (options.emoji) {
        const emojiSize = Math.min(options.width, options.height) * 0.3;
        ctx.font = `${emojiSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          options.emoji,
          options.width / 2,
          options.height * 0.35
        );
      }

      // Texto principal
      const fontSize = options.fontSize || Math.min(options.width, options.height) * 0.08;
      ctx.font = `bold ${fontSize}px ${options.fontFamily || 'Arial, sans-serif'}`;
      ctx.fillStyle = options.textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Dividir texto en líneas si es muy largo
      const maxWidth = options.width * 0.8;
      const lines = wrapText(ctx, options.text, maxWidth);
      const lineHeight = fontSize * 1.2;
      const startY = options.emoji 
        ? options.height * 0.65 
        : options.height / 2 - ((lines.length - 1) * lineHeight) / 2;

      lines.forEach((line, index) => {
        ctx.fillText(
          line,
          options.width / 2,
          startY + index * lineHeight
        );
      });

      // Convertir a blob y luego a URL
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          resolve(url);
        } else {
          reject(new Error('Failed to create blob'));
        }
      }, 'image/png');

    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Crea un gradiente CSS
 */
const createGradient = (
  ctx: CanvasRenderingContext2D,
  gradient: NonNullable<ImageGeneratorOptions['gradient']>,
  width: number,
  height: number
): CanvasGradient => {
  let canvasGradient: CanvasGradient;

  switch (gradient.direction) {
    case 'horizontal':
      canvasGradient = ctx.createLinearGradient(0, 0, width, 0);
      break;
    case 'vertical':
      canvasGradient = ctx.createLinearGradient(0, 0, 0, height);
      break;
    case 'diagonal':
    default:
      canvasGradient = ctx.createLinearGradient(0, 0, width, height);
      break;
  }

  canvasGradient.addColorStop(0, gradient.start);
  canvasGradient.addColorStop(1, gradient.end);

  return canvasGradient;
};

/**
 * Divide texto en líneas que caben en el ancho máximo
 */
const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
};

/**
 * Genera imagen de producto específica
 */
export const generateProductImage = async (
  productName: string,
  category: string,
  size: { width: number; height: number } = { width: 400, height: 400 }
): Promise<string> => {
  const { CATEGORY_PLACEHOLDERS, getPlaceholderConfig } = await import('./image-placeholders');
  const config = getPlaceholderConfig(category);

  return generateCanvasImage({
    width: size.width,
    height: size.height,
    text: productName.substring(0, 30), // Limitar longitud
    backgroundColor: config.bgColor,
    textColor: config.color,
    emoji: config.emoji,
    gradient: {
      start: config.bgColor,
      end: adjustColorBrightness(config.bgColor, -20),
      direction: 'diagonal'
    }
  });
};

/**
 * Genera imagen de categoría específica
 */
export const generateCategoryImage = async (
  categoryName: string,
  size: { width: number; height: number } = { width: 400, height: 400 }
): Promise<string> => {
  const { getPlaceholderConfig } = await import('./image-placeholders');
  const config = getPlaceholderConfig(categoryName);

  return generateCanvasImage({
    width: size.width,
    height: size.height,
    text: config.description,
    backgroundColor: config.bgColor,
    textColor: config.color,
    emoji: config.emoji,
    fontSize: Math.min(size.width, size.height) * 0.06,
    gradient: {
      start: adjustColorBrightness(config.bgColor, 20),
      end: adjustColorBrightness(config.bgColor, -20),
      direction: 'diagonal'
    }
  });
};

/**
 * Ajusta el brillo de un color hexadecimal
 */
const adjustColorBrightness = (hex: string, percent: number): string => {
  // Remover # si está presente
  const color = hex.replace('#', '');
  
  // Convertir a RGB
  const num = parseInt(color, 16);
  const r = (num >> 16) + percent;
  const g = (num >> 8 & 0x00FF) + percent;
  const b = (num & 0x0000FF) + percent;
  
  // Asegurar que los valores estén en rango 0-255
  const newR = Math.max(0, Math.min(255, r));
  const newG = Math.max(0, Math.min(255, g));
  const newB = Math.max(0, Math.min(255, b));
  
  return `#${(newR << 16 | newG << 8 | newB).toString(16).padStart(6, '0')}`;
};

/**
 * Hook para generar imágenes dinámicamente
 */
export const useImageGenerator = () => {
  const generateImage = async (
    type: 'product' | 'category',
    name: string,
    category?: string,
    size?: { width: number; height: number }
  ): Promise<string> => {
    if (type === 'product' && category) {
      return generateProductImage(name, category, size);
    } else {
      return generateCategoryImage(name, size);
    }
  };

  return { generateImage };
};

/**
 * Cache de imágenes generadas para evitar regenerar
 */
class ImageCache {
  private cache = new Map<string, string>();
  private maxSize = 50; // Máximo 50 imágenes en cache

  generateKey(type: string, name: string, category?: string, size?: { width: number; height: number }): string {
    return `${type}-${name}-${category || 'default'}-${size?.width || 400}x${size?.height || 400}`;
  }

  get(key: string): string | null {
    return this.cache.get(key) || null;
  }

  set(key: string, url: string): void {
    // Si el cache está lleno, eliminar el más antiguo
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        const oldUrl = this.cache.get(firstKey);
        if (oldUrl) {
          URL.revokeObjectURL(oldUrl); // Liberar memoria
        }
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, url);
  }

  clear(): void {
    // Liberar todas las URLs de objeto
    this.cache.forEach(url => URL.revokeObjectURL(url));
    this.cache.clear();
  }
}

export const imageCache = new ImageCache();

/**
 * Función helper para generar imagen con cache
 */
export const generateCachedImage = async (
  type: 'product' | 'category',
  name: string,
  category?: string,
  size?: { width: number; height: number }
): Promise<string> => {
  const key = imageCache.generateKey(type, name, category, size);
  const cached = imageCache.get(key);
  
  if (cached) {
    return cached;
  }

  const { generateImage } = useImageGenerator();
  const newImage = await generateImage(type, name, category, size);
  imageCache.set(key, newImage);
  
  return newImage;
};

export default {
  generateCanvasImage,
  generateProductImage,
  generateCategoryImage,
  generateCachedImage,
  useImageGenerator,
  imageCache,
};
