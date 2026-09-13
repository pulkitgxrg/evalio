"use client";

import React, { useState } from "react";
import { AlertCircle, BookOpen, CheckCircle, Plus, Trash2 } from "lucide-react";
import { useSubjects, useCreateSubjectMutation, useDeleteSubjectMutation } from "@/hooks/useSubjects";

export default function SubjectsPage() {
    const { data, isPending: loading, error: fetchError } = useSubjects();
    const createSubjectMutation = useCreateSubjectMutation();
    const deleteSubjectMutation = useDeleteSubjectMutation();

    const subjects = Array.isArray(data) ? data : [];

    const [newSubject, setNewSubject] = useState("");
    const [year, setYear] = useState(1);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const clearNotices = () => {
        setError("");
        setSuccess("");
    };

    const handleAddSubject = async (event) => {
        event.preventDefault();
        clearNotices();

        const trimmedSubject = newSubject.trim();
        if (!trimmedSubject) {
            setError("Subject name is required");
            return;
        }

        try {
            const data = await createSubjectMutation.mutateAsync({
                name: trimmedSubject,
                year: Number(year)
            });

            setSuccess(data?.message || "Subject created successfully");
            setNewSubject("");
            setYear(1);
        } catch (err) {
            setError(err.message || "Unable to create subject");
        }
    };

    const handleDeleteSubject = async (subjectId) => {
        clearNotices();

        const shouldDelete = window.confirm("Delete this subject? This action cannot be undone.");
        if (!shouldDelete) {
            return;
        }

        try {
            const data = await deleteSubjectMutation.mutateAsync(subjectId);
            setSuccess(data?.message || "Subject deleted successfully");
        } catch (err) {
            setError(err.message || "Unable to delete subject");
        }
    };

    const displayError = error || fetchError?.message;

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Subjects</h2>
                    <p className="text-sm text-slate-500">Manage subject catalog for tests and questions.</p>
                </div>
                <div className="rounded-md border border-emerald-200 bg-emerald-50/60 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                    Total Subjects: {subjects.length}
                </div>
            </div>

            <form
                onSubmit={handleAddSubject}
                className="rounded-md border border-gray-200 bg-white p-4 shadow-xs sm:p-5"
            >
                <div className="grid gap-3 sm:grid-cols-[1fr_140px_auto]">
                    <input
                        type="text"
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        placeholder="Enter subject name"
                        className="w-full rounded-md border border-gray-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#0ddc90]"
                    />

                    <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="rounded-md border border-gray-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#0ddc90]"
                    >
                        {[1, 2, 3, 4, 5].map((yr) => (
                            <option key={yr} value={yr}>
                                Year {yr}
                            </option>
                        ))}
                    </select>

                    <button
                        type="submit"
                        disabled={createSubjectMutation.isPending}
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-[#0ddc90] px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-[#0bc07d] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Plus size={16} />
                        {createSubjectMutation.isPending ? "Adding..." : "Add Subject"}
                    </button>
                </div>
            </form>

            {displayError && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle size={16} />
                    <span>{displayError}</span>
                </div>
            )}

            {success && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    <CheckCircle size={16} />
                    <span>{success}</span>
                </div>
            )}

            <div className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-160 text-left">
                        <thead className="border-b border-gray-200 bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">Subject</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">Year</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">Tests</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">Questions</th>
                                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                Array.from({ length: 6 }).map((_, row) => (
                                    <tr key={row} className="animate-pulse">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-md bg-gray-100" />
                                                <div className="h-4 w-32 rounded bg-gray-200" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><div className="h-4 w-14 rounded bg-gray-100" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-8 rounded bg-gray-100" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-10 rounded bg-gray-100" /></td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="inline-flex h-8 w-20 rounded-md bg-gray-100" />
                                        </td>
                                    </tr>
                                ))
                            ) : subjects.length > 0 ? (
                                subjects.map((subject) => (
                                    <tr key={subject._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="rounded-md bg-emerald-50 p-2 text-emerald-700">
                                                    <BookOpen size={16} />
                                                </span>
                                                <span className="text-sm font-semibold text-slate-800">{subject.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">Year {subject.year || 1}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{subject.testCount || 0}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{subject.questionCount || 0}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDeleteSubject(subject._id)}
                                                className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                                            >
                                                <Trash2 size={14} />
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                                        No subjects found. Add one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
