"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { finalizeExpiredSessionsOnClient } from "@/store/useTestStore";
import { useLoginMutation } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const loginMutation = useLoginMutation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await loginMutation.mutateAsync(formData);

      localStorage.setItem(
        "user",
        JSON.stringify({
          username: data.username,
          _id: data.user_id,
          role: data.role,
        }),
      );

      await finalizeExpiredSessionsOnClient();

      if (data.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans">
      <div className="hidden w-1/2 bg-[#0a3a30] lg:flex items-center justify-center relative overflow-hidden p-12">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-emerald-500/20 rounded-full blur-[100px] opacity-40"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-teal-400/10 rounded-full blur-[100px] opacity-30"></div>

        <div className="relative z-10 max-w-lg text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Welcome back to Evalio
          </h2>
          <p className="text-lg text-emerald-100/80 mb-8 leading-relaxed">
            Continue your journey with us.
          </p>
          <div className="relative w-full aspect-video rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden group p-1">
            <div className="w-full h-full bg-[#0a3a30]/50 rounded-xl flex flex-col overflow-hidden relative">
              <div className="h-8 border-b border-white/5 flex items-center px-4 gap-2 bg-white/5">
                <div className="w-2 h-2 rounded-full bg-red-500/40"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-500/40"></div>
                <div className="w-2 h-2 rounded-full bg-green-500/40"></div>
                <div className="ml-auto w-16 h-2 bg-white/10 rounded-full"></div>
              </div>
              <div className="flex flex-1 p-3 gap-3">
                <div className="w-12 h-full bg-white/5 rounded-lg flex flex-col items-center gap-3 py-3 border border-white/5">
                  <div className="w-6 h-6 rounded-md bg-emerald-500/20"></div>
                  <div className="w-8 h-[1px] bg-white/10 my-1"></div>
                  <div className="w-4 h-4 rounded-sm bg-white/10"></div>
                  <div className="w-4 h-4 rounded-sm bg-white/10"></div>
                  <div className="w-4 h-4 rounded-sm bg-white/10"></div>
                </div>
                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex gap-3 h-20">
                    <div className="flex-1 bg-white/5 rounded-lg border border-white/5 p-2 flex flex-col justify-end">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 mb-auto"></div>
                      <div className="w-10 h-2 bg-white/20 rounded-full"></div>
                    </div>
                    <div className="flex-1 bg-white/5 rounded-lg border border-white/5 p-2 flex flex-col justify-end">
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 mb-auto"></div>
                      <div className="w-10 h-2 bg-white/20 rounded-full"></div>
                    </div>
                    <div className="flex-1 bg-white/5 rounded-lg border border-white/5 p-2 flex flex-col justify-end">
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 mb-auto"></div>
                      <div className="w-10 h-2 bg-white/20 rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex-1 bg-white/5 rounded-lg border border-white/5 p-3 flex flex-col gap-2 relative overflow-hidden">
                    <div className="w-24 h-3 bg-white/10 rounded-md"></div>
                    <div className="flex items-end gap-1 h-12 mt-auto opacity-50">
                      <div className="w-4 h-6 bg-emerald-500/30 rounded-t-sm"></div>
                      <div className="w-4 h-10 bg-emerald-500/30 rounded-t-sm"></div>
                      <div className="w-4 h-8 bg-emerald-500/30 rounded-t-sm"></div>
                      <div className="w-4 h-12 bg-emerald-500/30 rounded-t-sm"></div>
                      <div className="w-4 h-5 bg-emerald-500/30 rounded-t-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-24">
        <Link
          href="/"
          className="absolute top-6 left-6 lg:left-auto lg:right-12 flex items-center text-gray-400 hover:text-[#0a3a30] transition-colors font-medium"
        >
          <ArrowLeft size={20} className="mr-2" /> Back to Home
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0a3a30]">Sign in</h1>
          <p className="mt-2 text-sm text-gray-500">
            Enter your email below to login to your account
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
            {error}
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
            <input
              className="flex h-12 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a3a30]/20 focus-visible:border-[#0a3a30] transition-all"
              id="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="user@chitkara.edu.in"
              type="email"
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                className="text-sm font-bold text-[#0a3a30] leading-none"
                htmlFor="password"
              >
                Password
              </label>
              <Link
                href="/forget-password"
                className="text-sm font-medium text-emerald-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                className="flex h-12 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a3a30]/20 focus-visible:border-[#0a3a30] transition-all pr-10"
                id="password"
                value={formData.password}
                onChange={handleChange}
                type={showPassword ? "text" : "password"}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#0a3a30] px-8 text-sm font-bold text-white shadow-lg shadow-emerald-900/10 transition-all hover:bg-[#022c22] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loginMutation.isPending ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-bold text-[#0a3a30] hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
