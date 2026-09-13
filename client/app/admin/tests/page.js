"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Edit, Plus, Trash2 } from 'lucide-react';

export default function TestManagementPage() {
    const router = useRouter();
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState('');

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        try {
            setLoading(true);
            setError('');

            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/tests`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.error || 'Failed to fetch tests');
            }

            setTests(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || 'Failed to fetch tests');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTest = async (testId, testTitle) => {
        if (!confirm(`Are you sure you want to delete "${testTitle}"?`)) {
            return;
        }

        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/tests/${testId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    userId: user._id
                }
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data?.error || 'Failed to delete test');
            }

            setTests((prev) => prev.filter((t) => t._id !== testId));
        } catch (err) {
            setError(err.message || 'Failed to delete test');
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 pb-10 animate-pulse">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="h-8 w-52 rounded-md bg-gray-200" />
                        <div className="h-4 w-72 rounded-md bg-gray-100" />
                    </div>
                    <div className="h-9 w-28 rounded-md bg-emerald-100/70" />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="rounded-md border border-gray-200 bg-white p-6 shadow-xs">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="h-10 w-10 rounded-md bg-gray-100" />
                                <div className="h-5 w-16 rounded-full bg-gray-100" />
                            </div>
                            <div className="h-6 w-3/4 rounded bg-gray-200" />
                            <div className="mt-2 h-4 w-1/2 rounded bg-gray-100" />
                            <div className="mt-3 h-4 w-full rounded bg-gray-100" />
                            <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2">
                                <div className="h-9 rounded-md bg-gray-100" />
                                <div className="h-9 rounded-md bg-gray-100" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Test Management</h2>
                    <p className="mt-1 text-sm text-slate-500">Edit tests or view all questions for each test.</p>
                </div>
                <button
                    onClick={() => router.push('/admin/tests/add')}
                    className="inline-flex items-center gap-2 rounded-md bg-[#0ddc90] px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-[#0bc07d]"
                >
                    <Plus size={16} /> Create Test
                </button>
            </div>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {tests.map((test) => (
                    <div key={test._id} className="flex flex-col justify-between rounded-md border border-gray-200 bg-white p-6 shadow-xs transition-all hover:border-[#0ddc90]/40 hover:shadow-sm">
                        <div>
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                                    <BookOpen size={20} />
                                </div>
                                <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600">
                                    {test.subject}
                                </span>
                            </div>

                            <h3 className="text-lg font-semibold text-slate-800">{test.title}</h3>
                            <p className="mt-1 text-sm text-slate-500">{test.questions?.length || 0} questions · {test.duration || 0} mins</p>
                            <p className="mt-3 line-clamp-2 text-sm text-slate-500">{test.description || 'No description provided.'}</p>
                        </div>

                        <div className="mt-6 grid grid-cols-[1fr_1fr_auto] gap-2 border-t border-gray-100 pt-4">
                            <button
                                onClick={() => router.push(`/admin/tests/${test._id}/edit`)}
                                className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-white py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                                <Edit size={15} /> Edit
                            </button>
                            <button
                                onClick={() => router.push(`/admin/tests/${test._id}`)}
                                className="rounded-md border border-gray-200 bg-gray-50 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                            >
                                View Questions
                            </button>
                            <button
                                onClick={() => handleDeleteTest(test._id, test.title)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    </div>
                ))}

                <button
                    onClick={() => router.push('/admin/tests/add')}
                    className="min-h-55 rounded-md border-2 border-dashed border-gray-200 p-6 text-left text-slate-400 transition hover:border-[#0ddc90]/40 hover:text-slate-700"
                >
                    <Plus size={30} className="mb-2" />
                    <p className="text-base font-semibold">Create New Test</p>
                    <p className="text-sm">Build a new test from manual or generated questions.</p>
                </button>
            </div>

            {tests.length === 0 && (
                <div className="rounded-md border border-gray-200 bg-white p-8 text-center text-sm text-slate-500">
                    No tests found.
                </div>
            )}
        </div>
    );
}
