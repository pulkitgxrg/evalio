"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Lock, Loader2 } from "lucide-react";
import { useResetPasswordMutation } from "@/hooks/useAuth";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(token ? "" : "Invalid reset link.");
  const [success, setSuccess] = useState("");
  const resetPasswordMutation = useResetPasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setSuccess("");

    try {
      await resetPasswordMutation.mutateAsync({ token, password, confirmPassword });

      setSuccess("Password reset successfully. You can now log in.");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="flex items-center text-gray-400 hover:text-[#0a3a30] transition-colors text-sm font-medium"
        >
          <ArrowLeft size={18} className="mr-1" /> Back to login
        </button>

        <div className="text-center">
          <h2 className="mt-2 text-2xl font-bold text-[#0a3a30]">
            Set a new password
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Choose a strong password to secure your account.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium border border-emerald-100">
            {success}
          </div>
        )}

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-bold text-[#0a3a30] leading-none"
            >
              New Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock size={18} />
              </span>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-3 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a3a30]/20 focus-visible:border-[#0a3a30] transition-all"
                placeholder="Enter new password"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-bold text-[#0a3a30] leading-none"
            >
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock size={18} />
              </span>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-3 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a3a30]/20 focus-visible:border-[#0a3a30] transition-all"
                placeholder="Re-enter new password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={resetPasswordMutation.isPending}
            className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#0a3a30] px-6 text-sm font-bold text-white shadow-lg shadow-emerald-900/10 transition-all hover:bg-[#022c22] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {resetPasswordMutation.isPending ? (
              <>
                <Loader2 className="animate-spin mr-2" size={18} />
                Updating password...
              </>
            ) : (
              "Update password"
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-400">
          By resetting your password, you confirm that you recognize this
          account and understand this action cannot be undone.
        </p>
      </div>
    </div>
  );
}