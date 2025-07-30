import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

interface ErrorHandlerOptions {
  showToast?: boolean;
  toastTitle?: string;
  logLevel?: 'error' | 'warn' | 'debug';
  context?: Record<string, any>;
}

interface ApiErrorHandlerOptions extends ErrorHandlerOptions {
  endpoint?: string;
  method?: string;
  retryable?: boolean;
}

export const useErrorHandler = () => {
  const { toast } = useToast();

  const handleError = useCallback((
    error: Error | unknown,
    message: string,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      toastTitle = 'Error',
      logLevel = 'error',
      context = {}
    } = options;

    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    // Log error
    if (logLevel === 'error') {
      logger.error(message, errorObj, context);
    } else if (logLevel === 'warn') {
      logger.warn(message, context);
    } else {
      logger.debug(message, context);
    }

    // Show toast notification
    if (showToast) {
      toast({
        title: toastTitle,
        description: message,
        variant: 'destructive',
      });
    }

    return errorObj;
  }, [toast]);

  const handleApiError = useCallback((
    error: Error | unknown,
    message: string,
    options: ApiErrorHandlerOptions = {}
  ) => {
    const {
      endpoint = 'unknown',
      method = 'unknown',
      retryable = false,
      ...errorOptions
    } = options;

    const context = {
      endpoint,
      method,
      retryable,
      timestamp: new Date().toISOString(),
      ...errorOptions.context
    };

    logger.apiError(endpoint, error instanceof Error ? error : new Error(String(error)), context);

    if (errorOptions.showToast !== false) {
      toast({
        title: errorOptions.toastTitle || 'Error de conexión',
        description: message,
        variant: 'destructive',
      });
    }

    return error;
  }, [toast]);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    errorMessage: string,
    options: ErrorHandlerOptions = {}
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, errorMessage, options);
      return null;
    }
  }, [handleError]);

  const wrapAsync = useCallback(<TArgs extends any[], TReturn>(
    fn: (...args: TArgs) => Promise<TReturn>,
    errorMessage: string,
    options: ErrorHandlerOptions = {}
  ) => {
    return async (...args: TArgs): Promise<TReturn | null> => {
      try {
        return await fn(...args);
      } catch (error) {
        handleError(error, errorMessage, {
          ...options,
          context: {
            ...options.context,
            functionArgs: args,
          }
        });
        return null;
      }
    };
  }, [handleError]);

  return {
    handleError,
    handleApiError,
    handleAsyncError,
    wrapAsync,
  };
};

// Hook específico para errores de carrito
export const useCartErrorHandler = () => {
  const { handleError } = useErrorHandler();

  const handleCartError = useCallback((
    error: Error | unknown,
    action: string,
    productInfo?: { id: string; name?: string; quantity?: number }
  ) => {
    return handleError(error, `Error al ${action}`, {
      context: {
        action,
        product: productInfo,
        cartAction: true,
      }
    });
  }, [handleError]);

  return { handleCartError };
};

// Hook específico para errores de inventario
export const useInventoryErrorHandler = () => {
  const { handleError, handleApiError } = useErrorHandler();

  const handleInventoryError = useCallback((
    error: Error | unknown,
    operation: string,
    productData?: any
  ) => {
    return handleError(error, `Error en inventario: ${operation}`, {
      context: {
        operation,
        productData,
        module: 'inventory',
      }
    });
  }, [handleError]);

  const handleInventoryApiError = useCallback((
    error: Error | unknown,
    endpoint: string,
    method: string = 'GET'
  ) => {
    return handleApiError(error, 'Error al comunicarse con el servidor de inventario', {
      endpoint,
      method,
      retryable: method === 'GET',
    });
  }, [handleApiError]);

  return { handleInventoryError, handleInventoryApiError };
};
