'use client';

import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * useRealtimeSubscription — Gradual migration hook.
 * 
 * When ENABLE_REALTIME is true, subscribes to Supabase Realtime changes.
 * When false, falls back to polling at the specified interval.
 * 
 * This allows gradual migration from polling → realtime without rewriting consumers.
 * 
 * @param {Object} options
 * @param {string} options.table - The Supabase table to subscribe to
 * @param {string} options.event - 'INSERT' | 'UPDATE' | 'DELETE' | '*'
 * @param {string} [options.filterColumn] - Column name to filter on (e.g., 'user_id')
 * @param {string} [options.filterValue] - Value to match (e.g., userId)
 * @param {Function} options.onData - Callback when new data arrives (from realtime or poll)
 * @param {Function} options.pollFn - Async function to call when polling (fallback)
 * @param {number} [options.pollIntervalMs=60000] - Polling interval in ms
 * @param {boolean} [options.enabled=true] - Whether to activate the subscription
 */
export function useRealtimeSubscription({
  table,
  event = '*',
  filterColumn,
  filterValue,
  onData,
  pollFn,
  pollIntervalMs = 60000,
  enabled = true,
}) {
  const channelRef = useRef(null);
  const pollRef = useRef(null);

  const enableRealtime = process.env.NEXT_PUBLIC_ENABLE_REALTIME === 'true';

  const startPolling = useCallback(() => {
    if (pollFn) {
      pollFn(); // Initial fetch
      pollRef.current = setInterval(pollFn, pollIntervalMs);
    }
  }, [pollFn, pollIntervalMs]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    if (enableRealtime && table) {
      // === REALTIME MODE ===
      const filter = filterColumn && filterValue
        ? `${filterColumn}=eq.${filterValue}`
        : undefined;

      const channel = supabase
        .channel(`realtime-${table}-${filterValue || 'global'}`)
        .on(
          'postgres_changes',
          { event, schema: 'public', table, filter },
          (payload) => {
            if (onData) onData(payload.new || payload.old || payload);
          }
        )
        .subscribe();

      channelRef.current = channel;

      // Also do an initial fetch
      if (pollFn) pollFn();

      return () => {
        supabase.removeChannel(channel);
        channelRef.current = null;
      };
    } else {
      // === POLLING FALLBACK ===
      startPolling();
      return () => stopPolling();
    }
  }, [enabled, enableRealtime, table, event, filterColumn, filterValue, onData, pollFn, startPolling, stopPolling]);

  return {
    isRealtime: enableRealtime,
    isPolling: !enableRealtime,
  };
}
