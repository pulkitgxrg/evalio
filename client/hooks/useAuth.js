"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

export function useCurrentUser(options = {}) {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => apiFetch("/api/v1/auth/me"),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: (credentials) =>
      apiFetch("/api/v1/auth/login", { method: "POST", body: credentials }),
  });
}

export function useSignupMutation() {
  return useMutation({
    mutationFn: (payload) =>
      apiFetch("/api/v1/auth/signup", { method: "POST", body: payload }),
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiFetch("/api/v1/auth/logout", { method: "POST" }),
    onSettled: () => {
      queryClient.clear();
    },
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (email) =>
      apiFetch("/api/v1/auth/resetPasswordToken", { method: "POST", body: { email } }),
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: ({ token, password, confirmPassword }) =>
      apiFetch(`/api/v1/auth/resetPassword/${token}`, {
        method: "POST",
        body: { password, confirm_password: confirmPassword },
      }),
  });
}

export function useVerifyEmail(token) {
  return useQuery({
    queryKey: ["auth", "verify", token],
    queryFn: () => apiFetch(`/api/v1/auth/verify/${token}`),
    enabled: Boolean(token),
    retry: false,
    staleTime: Infinity,
  });
}
