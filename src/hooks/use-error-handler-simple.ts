import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

interface ErrorHandlerOptions {
  showToast?: boolean;
  toastTitle?: string;
  logLevel?: 'error' | 'warn' | 'debug';
  context?: Record<string, any>;
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

  return {
    handleError,
  };
};
