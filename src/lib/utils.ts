import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases CSS de manera inteligente usando clsx y tailwind-merge
 *
 * Esta función utiliza clsx para manejar clases condicionales y luego
 * tailwind-merge para resolver conflictos entre clases de Tailwind CSS,
 * manteniendo solo la clase más específica cuando hay conflictos.
 *
 * @param inputs - Clases CSS, objetos condicionales, arrays, etc.
 * @returns String con las clases CSS combinadas y optimizadas
 *
 * @example
 * ```tsx
 * // Clases básicas
 * cn('flex', 'items-center', 'gap-2')
 * // → 'flex items-center gap-2'
 *
 * // Clases condicionales
 * cn('btn', {
 *   'btn-primary': isPrimary,
 *   'btn-disabled': isDisabled
 * })
 *
 * // Resolver conflictos de Tailwind
 * cn('p-4', 'p-2') // → 'p-2' (mantiene la última)
 *
 * // Uso en componentes
 * <div className={cn(
 *   'base-styles',
 *   variant === 'primary' && 'primary-styles',
 *   className // Props del componente
 * )} />
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
