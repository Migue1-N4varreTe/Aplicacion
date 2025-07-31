import { describe, it, expect } from 'vitest';
import { cn } from './utils';

/**
 * Tests para la función cn (className utility)
 * Esta función es crítica ya que se usa en toda la aplicación para combinar clases CSS
 */
describe('cn utility function', () => {
  it('should combine basic class names', () => {
    const result = cn('flex', 'items-center', 'gap-2');
    expect(result).toBe('flex items-center gap-2');
  });

  it('should handle conditional classes with object syntax', () => {
    const result = cn('base-class', {
      'active': true,
      'disabled': false,
      'large': true,
    });
    expect(result).toContain('base-class');
    expect(result).toContain('active');
    expect(result).toContain('large');
    expect(result).not.toContain('disabled');
  });

  it('should resolve Tailwind conflicts correctly', () => {
    // tailwind-merge debería resolver conflictos manteniendo la última clase
    const result = cn('p-4', 'p-2');
    expect(result).toBe('p-2');
  });

  it('should handle undefined and null values', () => {
    const result = cn('base', undefined, null, 'valid');
    expect(result).toBe('base valid');
  });

  it('should handle empty strings and false values', () => {
    const result = cn('base', '', false, 'valid');
    expect(result).toBe('base valid');
  });

  it('should handle complex nested conditions', () => {
    const isActive = true;
    const size = 'large';
    const disabled = false;

    const result = cn(
      'btn',
      {
        'btn-active': isActive,
        'btn-large': size === 'large',
        'btn-disabled': disabled,
      },
      isActive && 'has-focus',
      disabled ? 'cursor-not-allowed' : 'cursor-pointer'
    );

    expect(result).toContain('btn');
    expect(result).toContain('btn-active');
    expect(result).toContain('btn-large');
    expect(result).toContain('has-focus');
    expect(result).toContain('cursor-pointer');
    expect(result).not.toContain('btn-disabled');
    expect(result).not.toContain('cursor-not-allowed');
  });

  it('should handle responsive classes correctly', () => {
    const result = cn(
      'text-sm',
      'md:text-base',
      'lg:text-lg',
      'hover:text-blue-500'
    );
    expect(result).toBe('text-sm md:text-base lg:text-lg hover:text-blue-500');
  });

  it('should merge conflicting responsive classes', () => {
    const result = cn('p-4', 'md:p-6', 'md:p-8');
    expect(result).toBe('p-4 md:p-8');
  });

  it('should handle arrays of classes', () => {
    const result = cn(['flex', 'items-center'], ['gap-2', 'p-4']);
    expect(result).toBe('flex items-center gap-2 p-4');
  });

  it('should handle mixed types correctly', () => {
    const result = cn(
      'base',
      ['flex', 'items-center'],
      {
        'active': true,
        'disabled': false,
      },
      'final-class'
    );
    expect(result).toContain('base');
    expect(result).toContain('flex');
    expect(result).toContain('items-center');
    expect(result).toContain('active');
    expect(result).toContain('final-class');
    expect(result).not.toContain('disabled');
  });

  it('should handle performance with many classes', () => {
    const manyClasses = Array.from({ length: 100 }, (_, i) => `class-${i}`);
    const start = performance.now();
    const result = cn(...manyClasses);
    const end = performance.now();
    
    expect(result).toContain('class-0');
    expect(result).toContain('class-99');
    expect(end - start).toBeLessThan(10); // Should be very fast
  });
});
