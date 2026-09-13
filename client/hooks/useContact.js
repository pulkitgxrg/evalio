"use client";

import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export function useSubmitContactMutation() {
  return useMutation({
    mutationFn: ({ subject, message }) => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user._id) throw new Error("User not found. Please log in.");

      return apiFetch("/api/v1/contact", {
        method: "POST",
        body: { userId: user._id, subject, message },
      });
    },
  });
}
