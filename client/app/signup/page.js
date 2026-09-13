"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useSignupMutation } from '@/hooks/useAuth';

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const signupMutation = useSignupMutation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    year: '',
    password: '',
    confirm_password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    try {
      await signupMutation.mutateAsync(formData);

      setSuccess("Signup successful! Please check your email for verification.");
      setTimeout(() => {
        router.push('/login');
      }, 3000);

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
          <h2 className="text-4xl font-bold text-white mb-6">Join Evalio Today</h2>
          <p className="text-lg text-emerald-100/80 mb-8 leading-relaxed">
            Create your account to track progress, take custom tests, and master new skills.
          </p>
          <div className="relative w-full aspect-video rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden group p-1">
            <div className="w-full h-full bg-[#0a3a30]/50 rounded-xl flex flex-col overflow-hidden relative">
              <div className="h-8 border-b border-white/5 flex items-center px-4 gap-2 bg-white/5">
                <div className="w-2 h-2 rounded-full bg-white/20"></div>
                <div className="w-2 h-2 rounded-full bg-white/20"></div>
                <div className="ml-auto w-12 h-2 bg-white/10 rounded-full"></div>
              </div>
              <div className="flex flex-1 p-3 gap-3">
                <div className="w-1/3 h-full flex flex-col gap-2">
                  <div className="h-20 bg-white/5 rounded-lg border border-white/5 p-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 mb-2"></div>
                  </div>
                  <div className="flex-1 bg-white/5 rounded-lg border border-white/5 p-2 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 to-transparent"></div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-8 bg-white/5 rounded-lg border border-white/5 flex items-center px-2">
                    <div className="w-16 h-2 bg-white/10 rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-10 bg-white/5 rounded-lg border border-white/5 flex items-center px-2 gap-2">
                      <div className="w-6 h-6 rounded bg-white/10"></div>
                      <div className="w-20 h-2 bg-white/10 rounded-full"></div>
                    </div>
                    <div className="h-10 bg-white/5 rounded-lg border border-white/5 flex items-center px-2 gap-2">
                      <div className="w-6 h-6 rounded bg-white/10"></div>
                      <div className="w-24 h-2 bg-white/10 rounded-full"></div>
                    </div>
                    <div className="h-10 bg-white/5 rounded-lg border border-white/5 flex items-center px-2 gap-2">
                      <div className="w-6 h-6 rounded bg-white/10"></div>
                      <div className="w-16 h-2 bg-white/10 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-24 overflow-y-auto max-h-screen">
        <Link href="/" className="absolute top-6 left-6 lg:left-auto lg:right-12 flex items-center text-gray-400 hover:text-[#0a3a30] transition-colors font-medium">
          <ArrowLeft size={20} className="mr-2" /> Back to Home
        </Link>
        <div className="mb-8 mt-10">
          <h1 className="text-3xl font-bold text-[#0a3a30]">Create an Account</h1>
          <p className="mt-2 text-sm text-gray-500">
            Enter your details to get started
          </p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">{success}</div>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#0a3a30] leading-none" htmlFor="name">Full Name</label>
            <input
              className="flex h-12 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a3a30]/20 focus-visible:border-[#0a3a30] transition-all"
              id="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Aarav Mittal"
              type="text"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-[#0a3a30] leading-none" htmlFor="email">Email</label>
            <input
              className="flex h-12 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a3a30]/20 focus-visible:border-[#0a3a30] transition-all"
              id="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="aarav****.be**@chitkara.edu.in"
              type="email"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-[#0a3a30] leading-none" htmlFor="year">Year of Study</label>
            <select
              className="flex h-12 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a3a30]/20 focus-visible:border-[#0a3a30] transition-all appearance-none"
              id="year"
              value={formData.year}
              onChange={handleChange}
              required
            >
              <option value="">Select Year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-[#0a3a30] leading-none" htmlFor="password">Password</label>
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

          <div className="space-y-2">
            <label className="text-sm font-bold text-[#0a3a30] leading-none" htmlFor="confirm_password">Confirm Password</label>
            <input
              className="flex h-12 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a3a30]/20 focus-visible:border-[#0a3a30] transition-all"
              id="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              type="password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={signupMutation.isPending}
            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#0a3a30] px-8 text-sm font-bold text-white shadow-lg shadow-emerald-900/10 transition-all hover:bg-[#022c22] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {signupMutation.isPending ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-[#0a3a30] hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}