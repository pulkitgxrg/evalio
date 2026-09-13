"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { Activity, CheckCircle2, Clock3, FileText, ShieldCheck, Users } from 'lucide-react';

export default function AdminDashboard() {
    const [dashboard, setDashboard] = useState({
        stats: {
            usersCount: 0,
            testsCount: 0,
            testsTakenCount: 0,
            activeSessionsCount: 0
        },
        recentLogins: [],
        recentTestSessions: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAdminOverview = async () => {
            try {
                setLoading(true);
                setError('');

                const currentUserStr = localStorage.getItem('user');
                if (!currentUserStr) {
                    throw new Error('Not authenticated');
                }

                const currentUser = JSON.parse(currentUserStr);
                const headers = { userId: currentUser._id || currentUser.user_id };

                const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/auth/admin/overview`, {
                    credentials: 'include',
                    headers
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data?.error || 'Failed to fetch admin overview');
                }

                setDashboard({
                    stats: data?.stats || {
                        usersCount: 0,
                        testsCount: 0,
                        testsTakenCount: 0,
                        activeSessionsCount: 0
                    },
                    recentLogins: Array.isArray(data?.recentLogins) ? data.recentLogins : [],
                    recentTestSessions: Array.isArray(data?.recentTestSessions) ? data.recentTestSessions : []
                });
            } catch (error) {
                setError(error.message || 'Failed to fetch dashboard stats');
            } finally {
                setLoading(false);
            }
        };

        fetchAdminOverview();
    }, []);

    const statCards = useMemo(() => ([
        {
            label: 'Total Users',
            value: dashboard.stats.usersCount,
            icon: Users,
            iconClass: 'bg-slate-100 text-slate-700'
        },
        {
            label: 'Total Tests',
            value: dashboard.stats.testsCount,
            icon: FileText,
            iconClass: 'bg-emerald-50 text-emerald-600'
        },
        {
            label: 'Tests Taken',
            value: dashboard.stats.testsTakenCount,
            icon: CheckCircle2,
            iconClass: 'bg-cyan-50 text-cyan-700'
        },
        {
            label: 'Active Sessions',
            value: dashboard.stats.activeSessionsCount,
            icon: Activity,
            iconClass: 'bg-amber-50 text-amber-700'
        }
    ]), [dashboard.stats]);

    if (loading) {
        return (
            <div className="space-y-6 md:space-y-8 pb-10 animate-pulse">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="h-8 w-64 rounded-md bg-gray-200" />
                        <div className="h-4 w-80 rounded-md bg-gray-100" />
                    </div>
                    <div className="h-8 w-44 rounded-md bg-emerald-100/70" />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="rounded-md border border-gray-200 bg-white p-5 shadow-xs">
                            <div className="flex items-center justify-between">
                                <div className="h-4 w-24 rounded bg-gray-100" />
                                <div className="h-8 w-8 rounded-md bg-gray-100" />
                            </div>
                            <div className="mt-4 h-8 w-16 rounded bg-gray-200" />
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    {Array.from({ length: 2 }).map((_, panel) => (
                        <div key={panel} className="rounded-md border border-gray-200 bg-white shadow-xs overflow-hidden">
                            <div className="border-b border-gray-100 px-5 py-4">
                                <div className="h-5 w-44 rounded bg-gray-200" />
                            </div>
                            <div className="divide-y divide-gray-100">
                                {Array.from({ length: 4 }).map((__, row) => (
                                    <div key={row} className="px-5 py-4 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="h-4 w-36 rounded bg-gray-200" />
                                            <div className="h-5 w-16 rounded-full bg-gray-100" />
                                        </div>
                                        <div className="h-3 w-56 rounded bg-gray-100" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 md:space-y-8 pb-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Admin Control Center</h2>
                    <p className="mt-1 text-sm text-slate-500">Monitor recent logins, latest test activity, and platform growth.</p>
                </div>
                <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
                    <ShieldCheck size={14} />
                    Real-time admin insights
                </div>
            </div>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                {statCards.map((card) => (
                    <div key={card.label} className="rounded-md border border-gray-200 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-500">{card.label}</p>
                            <div className={`rounded-lg p-2 ${card.iconClass}`}>
                                <card.icon size={18} />
                            </div>
                        </div>
                        <p className="mt-4 text-3xl font-bold tracking-tight text-slate-800">{card.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <section className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-xs">
                    <div className="border-b border-gray-100 px-5 py-4">
                        <h3 className="text-base font-semibold text-slate-800">Recent Login Activity</h3>
                    </div>
                    <div className="max-h-105 overflow-y-auto">
                        {dashboard.recentLogins.length === 0 ? (
                            <div className="px-5 py-10 text-center text-sm text-slate-500">No recent login data available.</div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {dashboard.recentLogins.map((item) => (
                                    <div key={item.id} className="px-5 py-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">{item.user?.name}</p>
                                                <p className="text-xs text-slate-500">{item.user?.email}</p>
                                            </div>
                                            <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                                                {item.user?.role}
                                            </span>
                                        </div>
                                        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                                            <span className="flex items-center gap-1"><Clock3 size={12} /> {new Date(item.loggedInAt).toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                <section className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-xs">
                    <div className="border-b border-gray-100 px-5 py-4">
                        <h3 className="text-base font-semibold text-slate-800">Recent Test Submissions</h3>
                    </div>
                    <div className="max-h-105 overflow-y-auto">
                        {dashboard.recentTestSessions.length === 0 ? (
                            <div className="px-5 py-10 text-center text-sm text-slate-500">No recent test submissions yet.</div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {dashboard.recentTestSessions.map((item) => (
                                    <div key={item.id} className="px-5 py-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">{item.user?.name}</p>
                                                <p className="text-xs text-slate-500">{item.test?.title} · {item.test?.subject}</p>
                                            </div>
                                            <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700">
                                                {item.status}
                                            </span>
                                        </div>
                                        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                                            <span>Score: {item.score}/{item.totalQuestions}</span>
                                            <span>{new Date(item.submittedAt).toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
