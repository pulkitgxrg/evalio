"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";
import { useForgotPasswordMutation } from "@/hooks/useAuth";

export default function ForgetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const forgotPasswordMutation = useForgotPasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const data = await forgotPasswordMutation.mutateAsync(email);

      setSuccess(
        data.message ||
          "If this email is registered, we have sent you a password reset link.",
      );
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans">
      <div className="hidden w-1/2 bg-[#0a3a30] lg:flex items-center justify-center relative overflow-hidden p-12">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-emerald-500/20 rounded-full blur-[100px] opacity-40"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-teal-400/10 rounded-full blur-[100px] opacity-30"></div>

        <div className="relative z-10 max-w-lg text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Forgot your password?
          </h2>
          <p className="text-lg text-emerald-100/80 mb-8 leading-relaxed">
            No worries. Enter your email and we&apos;ll send you a secure link
            to reset your password.
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-24">
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute top-6 left-6 lg:left-auto lg:right-12 flex items-center text-gray-400 hover:text-[#0a3a30] transition-colors font-medium"
        >
          <ArrowLeft size={20} className="mr-2" /> Back
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0a3a30]">
            Reset your password
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Enter the email associated with your account and we&apos;ll email
            you a reset link.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium border border-emerald-100">
            {success}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label
              className="text-sm font-bold text-[#0a3a30] leading-none"
              htmlFor="email"
            >
              Email
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Mail size={18} />
              </span>
              <input
                className="flex h-12 w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a3a30]/20 focus-visible:border-[#0a3a30] transition-all"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@chitkara.edu.in"
                type="email"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={forgotPasswordMutation.isPending}
            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#0a3a30] px-8 text-sm font-bold text-white shadow-lg shadow-emerald-900/10 transition-all hover:bg-[#022c22] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {forgotPasswordMutation.isPending ? (
              <>
                <Loader2 className="animate-spin mr-2" size={18} />
                Sending reset link...
              </>
            ) : (
              "Send reset link"
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Remembered your password?{" "}
          <Link
            href="/login"
            className="font-bold text-[#0a3a30] hover:underline"
          >
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
