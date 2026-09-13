"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

function buildQuery(params) {
  const search = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, value);
    }
  });
  return search.toString();
}

export function useQuestionBank(params, options = {}) {
  return useQuery({
    queryKey: queryKeys.questions.bank(params),
    queryFn: () => apiFetch(`/api/v1/questions/bank?${buildQuery(params)}`),
    ...options,
  });
}
