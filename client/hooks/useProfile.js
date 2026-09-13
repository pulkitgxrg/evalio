"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

export function useProfile(options = {}) {
  return useQuery({
    queryKey: queryKeys.profile.detail,
    queryFn: () => apiFetch("/api/v1/users/profile"),
    ...options,
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) =>
      apiFetch("/api/v1/users/profile", { method: "PUT", body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.detail });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}
