import { useEffect, useRef, useState } from 'react';

/**
 * A hook for polling data periodically, pausing when the document is hidden
 * to save bandwidth and prevent unneeded re-renders.
 * 
 * @param {Function} fetchFn - Async function to call.
 * @param {number} intervalMs - Polling interval in milliseconds.
 * @param {boolean} enabled - Whether polling is active.
 */
export function usePolling(fetchFn, intervalMs = 30000, enabled = true) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const savedFetchFn = useRef(fetchFn);
  const timeoutRef = useRef(null);

  useEffect(() => {
    savedFetchFn.current = fetchFn;
  }, [fetchFn]);

  useEffect(() => {
    let mounted = true;

    const executePoll = async () => {
      if (!enabled) return;
      // Only poll if the tab is visible to save bandwidth
      if (document.visibilityState === 'hidden') {
        timeoutRef.current = setTimeout(executePoll, intervalMs);
        return;
      }

      try {
        const result = await savedFetchFn.current();
        if (mounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          timeoutRef.current = setTimeout(executePoll, intervalMs);
        }
      }
    };

    if (enabled) {
      setLoading(true);
      executePoll();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled) {
        // Immediate fetch if tab becomes visible again and we don't have a timeout running
        clearTimeout(timeoutRef.current);
        executePoll();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      mounted = false;
      clearTimeout(timeoutRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [intervalMs, enabled]);

  // Provide a manual refresh trigger
  const refetch = async () => {
    setLoading(true);
    try {
      const result = await savedFetchFn.current();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { data, error, loading, refetch };
}
