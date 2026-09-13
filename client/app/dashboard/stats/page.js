"use client";

import { useMemo } from 'react';
import {
    Trophy,
    Target,
    BookOpen,
    TrendingUp,
    Clock,
    CheckCircle,
    BarChart3
} from 'lucide-react';
import { StatsPageSkeleton } from '@/components/dashboard/StatsPageSkeleton';
import { useSessionStats, useSessionHistory } from '@/hooks/useSessions';

export default function StatsPage() {
    const { data: statsData, isPending: statsPending, error: statsError } = useSessionStats();
    const { data: historyData, isPending: historyPending, error: historyError } = useSessionHistory();

    const loading = statsPending || historyPending;
    const error = statsError?.message || historyError?.message;

    const stats = useMemo(() => {
        if (!statsData || !historyData) return null;

        const attempts = Array.isArray(historyData) ? historyData : [];
        const bestScore = attempts.length > 0
            ? Math.max(...attempts.map((a) => Number(a.score) || 0))
            : 0;
        const totalCorrect = attempts.reduce((sum, a) => sum + (Number(a.correctAnswers) || 0), 0);
        const totalIncorrect = attempts.reduce((sum, a) => sum + (Number(a.incorrectAnswers) || 0), 0);
        const totalAnswered = totalCorrect + totalIncorrect;

        const subjectStats = {};
        (statsData.subjectAnalysis || []).forEach((item) => {
            subjectStats[item.subject] = {
                count: item.totalTests,
                averageScore: item.accuracy
            };
        });

        const recentAttempts = attempts.slice(0, 5).map((attempt) => ({
            id: attempt._id,
            testTitle: attempt.test?.title || 'Unknown Test',
            subject: attempt.test?.subject || 'Unknown',
            score: Number(attempt.score) || 0,
            completedAt: attempt.submittedAt || attempt.updatedAt || attempt.createdAt
        }));

        return {
            totalTests: statsData.overview?.totalTests || 0,
            averageScore: statsData.overview?.averageScore || 0,
            bestScore,
            totalAnswered,
            totalCorrect,
            subjectStats,
            recentAttempts
        };
    }, [statsData, historyData]);

    if (loading) {
        return <StatsPageSkeleton />;
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center">
                    <p className="text-red-500 font-medium mb-2">Failed to load stats</p>
                    <p className="text-gray-400 text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Statistics</h1>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    label="Tests Taken"
                    value={stats?.totalTests || 0}
                />
                <StatCard
                    label="Average Score"
                    value={`${stats?.averageScore || 0}%`}
                />
                <StatCard
                    label="Best Score"
                    value={`${stats?.bestScore || 0}%`}
                />
                <StatCard
                    label="Questions Answered"
                    value={stats?.totalAnswered || 0}
                />
            </div>

            {stats?.subjectStats && Object.keys(stats.subjectStats).length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs mt-8">
                    <h2 className="text-lg font-semibold text-slate-800 mb-6">Performance by Subject</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(stats.subjectStats).map(([subject, data]) => (
                            <div
                                key={subject}
                                className="bg-white rounded-md p-4 border border-gray-200 hover:border-[#0ddc90]/40 transition-colors shadow-xs"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-semibold text-slate-700 capitalize">{subject}</span>
                                    <span className="text-[11px] border border-gray-200 text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full font-medium">
                                        {data.count} tests
                                    </span>
                                </div>
                                <div className="flex items-baseline gap-1 mt-1">
                                    <span className="text-2xl font-semibold text-slate-800">{data.averageScore}%</span>
                                    <span className="text-gray-400 text-xs mb-1 font-medium">avg</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {stats?.recentAttempts && stats.recentAttempts.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs mt-8">
                    <h2 className="text-lg font-semibold text-slate-800 mb-6">Recent Activity</h2>

                    <div className="space-y-0">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 pb-2 border-b border-gray-200 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                            <div className="col-span-5">Test Name</div>
                            <div className="col-span-3">Subject</div>
                            <div className="col-span-2">Results</div>
                            <div className="col-span-2 text-right">Date</div>
                        </div>

                        {stats.recentAttempts.map((attempt) => (
                            <div
                                key={attempt.id}
                                className="grid grid-cols-12 gap-4 py-4 border-b border-gray-100 items-center hover:bg-slate-50 transition-colors"
                            >
                                <div className="col-span-5 font-medium text-slate-800">
                                    {attempt.testTitle}
                                </div>
                                <div className="col-span-3 text-slate-500 capitalize text-sm">
                                    {attempt.subject}
                                </div>
                                <div className="col-span-2">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${attempt.score >= 70
                                            ? 'border-emerald-200 text-emerald-700 bg-emerald-50/50'
                                            : attempt.score >= 50
                                                ? 'border-amber-200 text-amber-700 bg-amber-50/50'
                                                : 'border-red-200 text-red-700 bg-red-50/50'
                                        }`}>
                                        {attempt.score}%
                                    </span>
                                </div>
                                <div className="col-span-2 text-right text-sm text-slate-500">
                                    {new Date(attempt.completedAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {stats?.totalTests === 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="text-gray-400" size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">No tests taken yet</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Start taking tests to see your performance statistics here. Your progress will be tracked automatically.
                    </p>
                </div>
            )}
        </div>
    );
}

function StatCard({ label, value }) {
    return (
        <div className="border border-gray-200 rounded-md p-5 bg-white flex flex-col gap-1.5 shadow-xs">
            <span className="text-[13px] text-gray-500 font-medium tracking-wide">{label}</span>
            <span className="text-2xl font-semibold text-slate-800">{value}</span>
        </div>
    );
}
