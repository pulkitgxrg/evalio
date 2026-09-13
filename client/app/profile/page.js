"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  GraduationCap,
  Save,
  Loader2,
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { useProfile, useUpdateProfileMutation } from "@/hooks/useProfile";

export default function ProfilePage() {
  const router = useRouter();
  const { data, isPending: loading, error: fetchError } = useProfile();

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50/30 font-sans text-slate-900">
        <Sidebar />
        <div className="flex flex-1 items-center justify-center pl-64">
          <div className="flex items-center gap-3 text-gray-500">
            <Loader2 className="animate-spin" size={22} />
            <span className="text-sm font-medium">Loading profile...</span>
          </div>
        </div>
      </div>
    );
  }

  return <ProfileForm router={router} initialProfile={data} loadError={fetchError} />;
}

function ProfileForm({ router, initialProfile, loadError }) {
  const updateProfileMutation = useUpdateProfileMutation();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profile, setProfile] = useState({
    name: initialProfile?.name || "",
    email: initialProfile?.email || "",
    createdAt: initialProfile?.createdAt || "",
    role: initialProfile?.role || "",
    study_year: initialProfile?.study_year ?? "",
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const body = {
        name: profile.name,
        email: profile.email,
        study_year: Number(profile.study_year) || profile.study_year,
      };

      const result = await updateProfileMutation.mutateAsync(body);
      setSuccess(result.message || "Profile updated successfully");
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  };

  const saving = updateProfileMutation.isPending;
  const formattedDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString()
    : "-";
  const displayError = error || loadError?.message;

  return (
    <div className="flex min-h-screen bg-gray-50/30 font-sans text-slate-900">
      <Sidebar />
      <div className="flex flex-1 flex-col pl-64 transition-all duration-300">
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="w-full max-w-4xl mx-auto rounded-lg pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800 mb-6"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>

            <div className="bg-white rounded-lg shadow-xs border border-gray-200 p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-lg font-semibold border border-slate-200">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
                      Your Profile
                    </h1>
                    <p className="text-sm text-slate-500">
                      Manage your personal information and study details.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar size={12} />
                    <span>Joined: {formattedDate}</span>
                  </div>
                </div>
              </div>

              {(displayError || success) && (
                <div className="mb-6 space-y-2">
                  {displayError && (
                    <div className="rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
                      {displayError}
                    </div>
                  )}
                  {success && (
                    <div className="rounded-md border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 font-medium">
                      {success}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-4">
                <div className="md:col-span-2 space-y-6">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="name"
                        className="text-[13px] font-medium text-slate-700"
                      >
                        Full Name
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                          <User size={16} />
                        </span>
                        <input
                          id="name"
                          value={profile.name}
                          onChange={handleChange}
                          className="w-full h-10 rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0ddc90]/20 focus:border-[#0ddc90] transition-all font-medium text-slate-800"
                          placeholder="Your full name"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="email"
                        className="text-[13px] font-medium text-slate-700"
                      >
                        Email
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                          <Mail size={16} />
                        </span>
                        <input
                          id="email"
                          type="email"
                          value={profile.email}
                          disabled
                          className="w-full h-10 rounded-md border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-slate-500 cursor-not-allowed"
                          placeholder="you@chitkara.edu.in"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="study_year"
                        className="text-[13px] font-medium text-slate-700"
                      >
                        Study Year
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                          <GraduationCap size={16} />
                        </span>
                        <input
                          id="study_year"
                          type="number"
                          min="1"
                          max="4"
                          value={profile.study_year}
                          onChange={handleChange}
                          className="w-full h-10 rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0ddc90]/20 focus:border-[#0ddc90] transition-all font-medium text-slate-800"
                          placeholder="1"
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-md bg-[#0ddc90] px-5 py-2 text-sm font-bold text-slate-900 shadow-xs hover:bg-[#0bc07d] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="animate-spin" size={16} />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={16} />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="space-y-4">
                  <div className="rounded-md border border-gray-200 bg-gray-50/50 p-5">
                    <p className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase mb-4">
                      Account Summary
                    </p>
                    <div className="space-y-3 text-[13px]">
                      <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                        <span className="text-slate-500">Username</span>
                        <span className="font-medium text-slate-800">
                          {profile.name || "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                        <span className="text-slate-500">Role</span>
                        <span className="font-medium capitalize text-slate-800">
                          {profile.role || "student"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                        <span className="text-slate-500">Study Year</span>
                        <span className="font-medium text-slate-800">
                          {profile.study_year || "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-slate-500">Member Since</span>
                        <span className="font-medium text-slate-800">
                          {formattedDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                    <p className="text-[11px] font-semibold text-amber-800 uppercase mb-1.5 tracking-wider">
                      Note
                    </p>
                    <p className="text-[13px] text-amber-700 leading-relaxed">
                      Make sure your email and study year are accurate. They are
                      used to personalize your tests and subjects.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
