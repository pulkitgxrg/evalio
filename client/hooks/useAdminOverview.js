"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

function getCurrentUserId() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?._id || parsed?.user_id || null;
  } catch {
    return null;
  }
}

export function useAdminOverview(options = {}) {
  return useQuery({
    queryKey: queryKeys.admin.overview,
    queryFn: () => {
      const userId = getCurrentUserId();
      if (!userId) throw new Error("Not authenticated");
      return apiFetch("/api/v1/auth/admin/overview", { headers: { userId } });
    },
    ...options,
  });
}
