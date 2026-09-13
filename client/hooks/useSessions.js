"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

export function useSessionStats(options = {}) {
  return useQuery({
    queryKey: queryKeys.sessions.stats,
    queryFn: () => apiFetch("/api/v1/sessions/stats"),
    ...options,
  });
}

export function useSessionHistory(options = {}) {
  return useQuery({
    queryKey: queryKeys.sessions.history,
    queryFn: () => apiFetch("/api/v1/sessions/history"),
    ...options,
  });
}
