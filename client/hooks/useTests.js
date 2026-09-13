"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

export function useTests(options = {}) {
  return useQuery({
    queryKey: queryKeys.tests.list(),
    queryFn: () => apiFetch("/api/v1/tests"),
    ...options,
  });
}

export function useTest(testId, options = {}) {
  return useQuery({
    queryKey: queryKeys.tests.detail(testId),
    queryFn: () => apiFetch(`/api/v1/tests/${testId}`),
    enabled: Boolean(testId),
    ...options,
  });
}

export function useAdminTest(testId, options = {}) {
  return useQuery({
    queryKey: queryKeys.tests.adminDetail(testId),
    queryFn: () => apiFetch(`/api/v1/tests/${testId}/admin`),
    enabled: Boolean(testId),
    ...options,
  });
}

export function useCreateTestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => apiFetch("/api/v1/tests", { method: "POST", body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tests.all });
    },
  });
}

export function useUpdateTestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ testId, ...payload }) =>
      apiFetch(`/api/v1/tests/${testId}`, { method: "PUT", body: payload }),
    onSuccess: (_data, { testId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tests.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tests.detail(testId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tests.adminDetail(testId) });
    },
  });
}

export function useDeleteTestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (testId) => apiFetch(`/api/v1/tests/${testId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tests.all });
    },
  });
}
