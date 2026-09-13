"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

function toQueryString(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, value);
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

/** Admin-only question list, e.g. filtered by subject when picking questions for a test. */
export function useAdminQuestions(params, options = {}) {
  return useQuery({
    queryKey: queryKeys.questions.list(params),
    queryFn: () => apiFetch(`/api/v1/questions${toQueryString(params)}`),
    ...options,
  });
}

export function useQuestionBank(params, options = {}) {
  return useQuery({
    queryKey: queryKeys.questions.bank(params),
    queryFn: () => apiFetch(`/api/v1/questions/bank${toQueryString(params)}`),
    ...options,
  });
}

export function useAvailableQuestionCounts(params, options = {}) {
  return useQuery({
    queryKey: queryKeys.questions.availableCounts(params),
    queryFn: () => apiFetch("/api/v1/questions/available-counts", { method: "POST", body: params }),
    ...options,
  });
}

export function useGenerateQuestionsMutation() {
  return useMutation({
    mutationFn: (payload) => apiFetch("/api/v1/questions/generate", { method: "POST", body: payload }),
  });
}

export function useCreateQuestionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => apiFetch("/api/v1/questions", { method: "POST", body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.questions.all });
    },
  });
}

const BULK_BATCH_SIZE = 50;

/** Uploads `questions` in batches of 50 and returns the total count actually created. */
export function useBulkCreateQuestionsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questions) => {
      let totalUploaded = 0;

      for (let i = 0; i < questions.length; i += BULK_BATCH_SIZE) {
        const batch = questions.slice(i, i + BULK_BATCH_SIZE);
        const data = await apiFetch("/api/v1/questions/bulk", {
          method: "POST",
          body: { questions: batch },
        });
        totalUploaded += data.count || 0;
      }

      return totalUploaded;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.questions.all });
    },
  });
}
