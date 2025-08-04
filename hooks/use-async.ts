import { useState, useCallback, useEffect } from "react";

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  success: boolean;
}

export interface UseAsyncReturn<T> extends AsyncState<T> {
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
  setData: (data: T) => void;
  setError: (error: Error) => void;
}

export function useAsync<T = any>(
  asyncFunction?: (...args: any[]) => Promise<T>,
  immediate = false,
): UseAsyncReturn<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const execute = useCallback(
    async (...args: any[]): Promise<T> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        if (!asyncFunction) {
          throw new Error("No async function provided");
        }

        const data = await asyncFunction(...args);
        setState({
          data,
          loading: false,
          error: null,
          success: true,
        });
        return data;
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        setState({
          data: null,
          loading: false,
          error: errorObj,
          success: false,
        });
        throw errorObj;
      }
    },
    [asyncFunction],
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  const setData = useCallback((data: T) => {
    setState((prev) => ({ ...prev, data, success: true }));
  }, []);

  const setError = useCallback((error: Error) => {
    setState((prev) => ({ ...prev, error, success: false }));
  }, []);

  useEffect(() => {
    if (immediate && asyncFunction) {
      execute();
    }
  }, [execute, immediate, asyncFunction]);

  return {
    ...state,
    execute,
    reset,
    setData,
    setError,
  };
}

export function useAsyncCallback<T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  deps: React.DependencyList = [],
): UseAsyncReturn<T> {
  const callback = useCallback(asyncFunction, deps);
  return useAsync(callback, false);
}

// Hook for handling API calls with retry logic
export function useAsyncWithRetry<T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  maxRetries = 3,
  retryDelay = 1000,
): UseAsyncReturn<T> & { retry: () => Promise<T> } {
  const [retryCount, setRetryCount] = useState(0);
  const asyncHook = useAsync<T>();

  const executeWithRetry = useCallback(
    async (...args: any[]): Promise<T> => {
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          setRetryCount(attempt);
          const result = await asyncFunction(...args);
          setRetryCount(0);
          return result;
        } catch (error) {
          if (attempt === maxRetries) {
            throw error;
          }
          // Wait before retrying
          await new Promise((resolve) =>
            setTimeout(resolve, retryDelay * (attempt + 1)),
          );
        }
      }
      throw new Error("Max retries exceeded");
    },
    [asyncFunction, maxRetries, retryDelay],
  );

  const execute = useCallback(
    async (...args: any[]): Promise<T> => {
      asyncHook.setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const data = await executeWithRetry(...args);
        asyncHook.setState({
          data,
          loading: false,
          error: null,
          success: true,
        });
        return data;
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        asyncHook.setState({
          data: null,
          loading: false,
          error: errorObj,
          success: false,
        });
        throw errorObj;
      }
    },
    [executeWithRetry],
  );

  const retry = useCallback(async (): Promise<T> => {
    return execute();
  }, [execute]);

  return {
    ...asyncHook,
    execute,
    retry,
  };
}

export default useAsync;
