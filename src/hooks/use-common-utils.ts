import { useCallback, useMemo, useRef, useEffect } from 'react';
import { debounce } from 'lodash-es';

// Hook para debouncing optimizado
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useMemo(
    () => debounce((...args: Parameters<T>) => callbackRef.current(...args), delay) as T,
    [delay]
  );
};

// Hook para throttling
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const callbackRef = useRef(callback);
  const lastRun = useRef(Date.now());

  callbackRef.current = callback;

  return useCallback(
    ((...args: Parameters<T>) => {
      if (Date.now() - lastRun.current >= delay) {
        callbackRef.current(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [delay]
  );
};

// Hook para memoización de objetos complejos
export const useStableMemo = <T>(factory: () => T, deps: React.DependencyList): T => {
  const ref = useRef<{ deps: React.DependencyList; value: T }>();

  if (!ref.current || !depsEqual(ref.current.deps, deps)) {
    ref.current = { deps: [...deps], value: factory() };
  }

  return ref.current.value;
};

// Función auxiliar para comparar dependencias
const depsEqual = (a: React.DependencyList, b: React.DependencyList): boolean => {
  if (a.length !== b.length) return false;
  return a.every((dep, i) => Object.is(dep, b[i]));
};

// Hook para formateo de moneda optimizado
export const useCurrencyFormatter = (locale: string = 'es-VE', currency: string = 'VES') => {
  return useMemo(() => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [locale, currency]);
};

// Hook para formateo de fechas optimizado
export const useDateFormatter = (locale: string = 'es-VE') => {
  return useMemo(() => ({
    short: new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    long: new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    time: new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
    }),
    relative: new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }),
  }), [locale]);
};

// Hook para formateo de números optimizado
export const useNumberFormatter = (locale: string = 'es-VE') => {
  return useMemo(() => ({
    decimal: new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }),
    integer: new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
    }),
    percentage: new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }),
  }), [locale]);
};

// Hook para validaciones comunes
export const useValidation = () => {
  return useMemo(() => ({
    email: (email: string): boolean => {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(email);
    },
    phone: (phone: string): boolean => {
      const regex = /^[\+]?[1-9][\d]{0,15}$/;
      return regex.test(phone.replace(/\s/g, ''));
    },
    required: (value: any): boolean => {
      if (typeof value === 'string') return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined;
    },
    minLength: (value: string, min: number): boolean => {
      return value.length >= min;
    },
    maxLength: (value: string, max: number): boolean => {
      return value.length <= max;
    },
    numeric: (value: string): boolean => {
      return !isNaN(Number(value)) && isFinite(Number(value));
    },
    positiveNumber: (value: string | number): boolean => {
      const num = typeof value === 'string' ? Number(value) : value;
      return !isNaN(num) && isFinite(num) && num > 0;
    },
  }), []);
};

// Hook para transformaciones de texto comunes
export const useTextTransforms = () => {
  return useMemo(() => ({
    capitalize: (text: string): string => {
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    },
    titleCase: (text: string): string => {
      return text.replace(/\w\S*/g, (txt) => 
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      );
    },
    truncate: (text: string, length: number, suffix: string = '...'): string => {
      if (text.length <= length) return text;
      return text.substring(0, length - suffix.length) + suffix;
    },
    slugify: (text: string): string => {
      return text
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
    },
    removeAccents: (text: string): string => {
      return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    },
  }), []);
};

// Hook para cálculos comunes
export const useCalculations = () => {
  return useMemo(() => ({
    percentage: (part: number, total: number): number => {
      if (total === 0) return 0;
      return Math.round((part / total) * 100 * 100) / 100;
    },
    discount: (original: number, discounted: number): number => {
      if (original === 0) return 0;
      return Math.round(((original - discounted) / original) * 100 * 100) / 100;
    },
    average: (numbers: number[]): number => {
      if (numbers.length === 0) return 0;
      return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    },
    sum: (numbers: number[]): number => {
      return numbers.reduce((sum, num) => sum + num, 0);
    },
    min: (numbers: number[]): number => {
      return Math.min(...numbers);
    },
    max: (numbers: number[]): number => {
      return Math.max(...numbers);
    },
    roundTo: (number: number, decimals: number): number => {
      const factor = Math.pow(10, decimals);
      return Math.round(number * factor) / factor;
    },
  }), []);
};

// Hook para clases CSS condicionales optimizado
export const useConditionalClasses = () => {
  return useCallback((baseClasses: string, conditionalClasses: Record<string, boolean>): string => {
    const classes = [baseClasses];
    
    Object.entries(conditionalClasses).forEach(([className, condition]) => {
      if (condition) {
        classes.push(className);
      }
    });
    
    return classes.join(' ').trim();
  }, []);
};

// Hook para memoización de callbacks pesados
export const useStableCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  const ref = useRef<{ deps: React.DependencyList; callback: T }>();

  if (!ref.current || !depsEqual(ref.current.deps, deps)) {
    ref.current = { deps: [...deps], callback };
  }

  return ref.current.callback;
};

// Hook para gestión de arrays optimizada
export const useArrayOperations = <T>() => {
  return useMemo(() => ({
    unique: (array: T[], key?: keyof T): T[] => {
      if (!key) return [...new Set(array)];
      const seen = new Set();
      return array.filter(item => {
        const value = item[key];
        if (seen.has(value)) return false;
        seen.add(value);
        return true;
      });
    },
    groupBy: <K extends keyof T>(array: T[], key: K): Record<string, T[]> => {
      return array.reduce((groups, item) => {
        const groupKey = String(item[key]);
        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(item);
        return groups;
      }, {} as Record<string, T[]>);
    },
    sortBy: <K extends keyof T>(array: T[], key: K, direction: 'asc' | 'desc' = 'asc'): T[] => {
      return [...array].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];
        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    },
    chunk: (array: T[], size: number): T[][] => {
      const chunks: T[][] = [];
      for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
      }
      return chunks;
    },
  }), []);
};

// Hook para gestión de storage optimizada
export const useOptimizedStorage = () => {
  const cache = useRef(new Map<string, any>());

  return useMemo(() => ({
    get: <T>(key: string, defaultValue?: T): T | undefined => {
      if (cache.current.has(key)) {
        return cache.current.get(key);
      }

      try {
        const item = localStorage.getItem(key);
        if (item === null) return defaultValue;
        const value = JSON.parse(item);
        cache.current.set(key, value);
        return value;
      } catch {
        return defaultValue;
      }
    },
    set: <T>(key: string, value: T): boolean => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        cache.current.set(key, value);
        return true;
      } catch {
        return false;
      }
    },
    remove: (key: string): boolean => {
      try {
        localStorage.removeItem(key);
        cache.current.delete(key);
        return true;
      } catch {
        return false;
      }
    },
    clear: (): boolean => {
      try {
        localStorage.clear();
        cache.current.clear();
        return true;
      } catch {
        return false;
      }
    },
  }), []);
};

// Hook para prevenir re-renders innecesarios
export const useRenderOptimization = () => {
  const renderCount = useRef(0);
  const lastRender = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    lastRender.current = Date.now();
  });

  return useMemo(() => ({
    renderCount: renderCount.current,
    lastRender: lastRender.current,
    isFirstRender: renderCount.current === 1,
  }), []);
};
