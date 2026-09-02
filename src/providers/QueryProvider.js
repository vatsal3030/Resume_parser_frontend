"use client";

import { QueryClient, QueryClientProvider } from"@tanstack/react-query";
import { useState } from"react";

/**
 * QueryProvider — Wraps the app with TanStack Query's QueryClientProvider.
 * Creates a stable QueryClient instance per component lifecycle.
 * 
 * Configuration follows the architecture plan:
 * - 5min stale time for most queries
 * - 30min garbage collection
 * - 2 retries with exponential backoff
 * - No refetch on window focus (brutalist UX: user-driven)
 */
export function QueryProvider({ children }) {
 const [queryClient] = useState(
 () =>
 new QueryClient({
 defaultOptions: {
 queries: {
 staleTime: 5 * 60 * 1000, // 5 minutes
 gcTime: 30 * 60 * 1000, // 30 minutes cache
 retry: 2,
 retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
 refetchOnWindowFocus: false,
 },
 mutations: {
 retry: 1,
 },
 },
 })
 );

 return (
 <QueryClientProvider client={queryClient}>
 {children}
 </QueryClientProvider>
 );
}
