/**
 * React 19.1 use() API Implementation and Async Utilities
 * Enhanced async data fetching and state management hooks
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { AsyncState } from '@/types/utils';

// Simulate React 19.1 use() API for async data fetching
// Note: This is a polyfill-like implementation until React 19.1 is stable
export function use<T>(promise: Promise<T>): T {
  // This is a simplified implementation
  // In actual React 19.1, this would handle Suspense automatically
  throw promise;
}

// Enhanced async state hook
export function useAsyncState<T>(
  initialData?: T
): [AsyncState<T>, (data: T) => void, (error: string) => void, (loading: boolean) => void] {
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData || null,
    loading: false,
    error: null,
  });

  const setData = useCallback((data: T) => {
    setState({
      data,
      loading: false,
      error: null,
    });
  }, []);

  const setError = useCallback((error: string) => {
    setState(prev => ({
      ...prev,
      loading: false,
      error,
    }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({
      ...prev,
      loading,
      error: loading ? null : prev.error,
    }));
  }, []);

  return [state, setData, setError, setLoading];
}

// Generic async operation hook
export function useAsync<T, P extends any[] = []>(
  asyncFunction: (...args: P) => Promise<T>,
  dependencies: any[] = []
) {
  const [state, setData, setError, setLoading] = useAsyncState<T>();

  const execute = useCallback(
    async (...args: P) => {
      try {
        setLoading(true);
        const result = await asyncFunction(...args);
        setData(result);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        throw err;
      }
    },
    [asyncFunction, setData, setError, setLoading]
  );

  // Auto-execute on mount if no parameters required
  useEffect(() => {
    if (dependencies.length === 0 && asyncFunction.length === 0) {
      execute();
    }
  }, dependencies);

  return {
    ...state,
    execute,
    reset: () => setData(null as T),
  };
}

// API data fetching hook with caching
export function useApiData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    initialData?: T;
    refreshInterval?: number;
    enabled?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
  } = {}
) {
  const {
    initialData,
    refreshInterval,
    enabled = true,
    onSuccess,
    onError,
  } = options;

  const [state, setData, setError, setLoading] = useAsyncState<T>(initialData);
  const [lastFetch, setLastFetch] = useState<number>(0);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      const result = await fetcher();
      setData(result);
      setLastFetch(Date.now());
      onSuccess?.(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [fetcher, enabled, setData, setError, setLoading, onSuccess, onError]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [fetchData, enabled]);

  // Refresh interval
  useEffect(() => {
    if (refreshInterval && enabled) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval, enabled]);

  const refresh = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  const isStale = useMemo(() => {
    if (!refreshInterval) return false;
    return Date.now() - lastFetch > refreshInterval;
  }, [lastFetch, refreshInterval]);

  return {
    ...state,
    refresh,
    isStale,
    lastFetch: new Date(lastFetch),
  };
}

// Mutation hook for data updates
export function useMutation<T, P extends any[] = []>(
  mutationFunction: (...args: P) => Promise<T>,
  options: {
    onSuccess?: (data: T, variables: P) => void;
    onError?: (error: string, variables: P) => void;
    onSettled?: (data: T | null, error: string | null, variables: P) => void;
  } = {}
) {
  const { onSuccess, onError, onSettled } = options;
  const [state, setData, setError, setLoading] = useAsyncState<T>();

  const mutate = useCallback(
    async (...args: P) => {
      try {
        setLoading(true);
        const result = await mutationFunction(...args);
        setData(result);
        onSuccess?.(result, args);
        onSettled?.(result, null, args);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Mutation failed';
        setError(errorMessage);
        onError?.(errorMessage, args);
        onSettled?.(null, errorMessage, args);
        throw err;
      }
    },
    [mutationFunction, setData, setError, setLoading, onSuccess, onError, onSettled]
  );

  const reset = useCallback(() => {
    setData(null as T);
  }, [setData]);

  return {
    ...state,
    mutate,
    reset,
  };
}

// Debounced async operation hook
export function useDebouncedAsync<T, P extends any[] = []>(
  asyncFunction: (...args: P) => Promise<T>,
  delay: number = 300
) {
  const [state, setData, setError, setLoading] = useAsyncState<T>();
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const debouncedExecute = useCallback(
    (...args: P) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const newTimeoutId = setTimeout(async () => {
        try {
          setLoading(true);
          const result = await asyncFunction(...args);
          setData(result);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'An error occurred';
          setError(errorMessage);
        }
      }, delay);

      setTimeoutId(newTimeoutId);
    },
    [asyncFunction, delay, timeoutId, setData, setError, setLoading]
  );

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return {
    ...state,
    execute: debouncedExecute,
  };
}