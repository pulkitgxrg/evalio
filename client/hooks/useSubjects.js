"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

export function useSubjects(year, options = {}) {
  return useQuery({
    queryKey: queryKeys.subjects.list(year ? { year } : undefined),
    queryFn: () =>
      apiFetch(year ? `/api/v1/subjects?year=${year}` : "/api/v1/subjects"),
    ...options,
  });
}

export function useCreateSubjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => apiFetch("/api/v1/subjects", { method: "POST", body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subjects.all });
    },
  });
}

export function useDeleteSubjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => apiFetch(`/api/v1/subjects/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subjects.all });
    },
  });
}
