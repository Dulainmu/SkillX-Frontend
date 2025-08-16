import { useState, useEffect, useRef, useCallback } from 'react';
import { getAllUserProgress, getAllSubmissions, getAllAchievements, getAllLearningJourneys } from '@/api/adminApi';

interface UseRealTimeDataOptions {
  interval?: number; // Polling interval in milliseconds
  enabled?: boolean; // Whether to enable real-time updates
  onDataUpdate?: (data: any) => void; // Callback when data changes
  onError?: (error: Error) => void; // Error callback
}

interface UseRealTimeDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  refresh: () => void; // Manual refresh function
  pause: () => void; // Pause real-time updates
  resume: () => void; // Resume real-time updates
  isPaused: boolean;
}

export function useRealTimeData<T>(
  fetchFunction: () => Promise<T>,
  options: UseRealTimeDataOptions = {}
): UseRealTimeDataReturn<T> {
  const {
    interval = 5000, // Default 5 seconds
    enabled = true,
    onDataUpdate,
    onError
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (isPaused) return;

    try {
      setLoading(true);
      setError(null);

      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      const result = await fetchFunction();
      
      // Check if data has actually changed
      const hasChanged = JSON.stringify(result) !== JSON.stringify(data);
      
      if (hasChanged) {
        setData(result);
        setLastUpdated(new Date());
        onDataUpdate?.(result);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err);
        onError?.(err);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, data, isPaused, onDataUpdate, onError]);

  const startPolling = useCallback(() => {
    if (!enabled || isPaused) return;

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Initial fetch
    fetchData();

    // Set up polling interval
    intervalRef.current = setInterval(fetchData, interval);
  }, [enabled, isPaused, interval, fetchData]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const pause = useCallback(() => {
    setIsPaused(true);
    stopPolling();
  }, [stopPolling]);

  const resume = useCallback(() => {
    setIsPaused(false);
    startPolling();
  }, [startPolling]);

  // Start/stop polling based on enabled state
  useEffect(() => {
    if (enabled && !isPaused) {
      startPolling();
    } else {
      stopPolling();
    }

    // Cleanup on unmount
    return () => {
      stopPolling();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [enabled, isPaused, startPolling, stopPolling]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh,
    pause,
    resume,
    isPaused
  };
}

// Specialized hooks for different data types
export function useRealTimeUserProgress(options?: UseRealTimeDataOptions) {
  return useRealTimeData(
    () => getAllUserProgress(),
    { interval: 10000, ...options } // 10 seconds for user progress
  );
}

export function useRealTimeProjectSubmissions(options?: UseRealTimeDataOptions) {
  return useRealTimeData(
    () => getAllSubmissions(),
    { interval: 8000, ...options } // 8 seconds for submissions
  );
}

export function useRealTimeAchievements(options?: UseRealTimeDataOptions) {
  return useRealTimeData(
    () => getAllAchievements(),
    { interval: 15000, ...options } // 15 seconds for achievements
  );
}

export function useRealTimeLearningJourneys(options?: UseRealTimeDataOptions) {
  return useRealTimeData(
    () => getAllLearningJourneys(),
    { interval: 20000, ...options } // 20 seconds for learning journeys
  );
}
