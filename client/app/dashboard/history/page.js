"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
    History,
    Calendar,
    Clock,
    ChevronLeft,
    ChevronRight,
    FileText,
    Trophy
} from 'lucide-react';
import { HistoryPageSkeleton } from '@/components/dashboard/HistoryPageSkeleton';
import { useSessionHistory } from '@/hooks/useSessions';

export default function HistoryPage() {
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const { data: allHistory, isPending: loading, error: fetchError } = useSessionHistory();
    const error = fetchError?.message;

    const { history, pagination } = useMemo(() => {
        const data = allHistory || [];
        const pages = Math.max(1, Math.ceil(data.length / pageSize));
        const start = (page - 1) * pageSize;

        return {
            history: data.slice(start, start + pageSize),
            pagination: { total: data.length, page, pages }
        };
    }, [allHistory, page]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            setPage(newPage);
        }
    };

    if (loading) {
        return <HistoryPageSkeleton />;
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center">
                    <p className="text-red-500 font-medium mb-2">Failed to load history</p>
                    <p className="text-gray-400 text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Test History</h1>
                    <p className="text-sm text-slate-500 mt-1">View all your past test attempts and scores</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <FileText size={16} />
                    <span>{pagination.total} total attempts</span>
                </div>
            </div>

            {history.length > 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg shadow-xs overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-50/50 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                        <div className="col-span-5">Test Name</div>
                        <div className="col-span-2 text-center">Score</div>
                        <div className="col-span-2 text-center">Questions</div>
                        <div className="col-span-2 text-right">Date</div>
                        <div className="col-span-1 text-right">Action</div>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {history.map((attempt) => {
                            const accuracy = attempt.totalQuestions > 0
                                ? Math.round((attempt.correctAnswers / attempt.totalQuestions) * 100)
                                : 0;
                            const completedAt = attempt.submittedAt || attempt.updatedAt || attempt.createdAt;

                            return (
                                <div
                                    key={attempt._id}
                                    className="grid grid-cols-12 gap-4 px-4 py-4 items-center hover:bg-slate-50 transition-colors"
                                >
                                    <div className="col-span-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                                                <History className="text-slate-500" size={14} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-slate-800 truncate">
                                                    {attempt.test?.title || 'Unknown Test'}
                                                </p>
                                                <p className="text-xs text-slate-500 capitalize truncate mt-0.5">
                                                    {attempt.test?.subject || 'Unknown Subject'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-span-2 flex justify-center">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${accuracy >= 70
                                            ? 'border-emerald-200 text-emerald-700 bg-emerald-50/50'
                                            : accuracy >= 50
                                                ? 'border-amber-200 text-amber-700 bg-amber-50/50'
                                                : 'border-red-200 text-red-700 bg-red-50/50'
                                            }`}>
                                            {accuracy}%
                                        </span>
                                    </div>

                                    <div className="col-span-2 text-center text-sm">
                                        <span className="text-slate-700 font-medium">
                                            {attempt.correctAnswers}/{attempt.totalQuestions}
                                        </span>
                                        <span className="text-slate-400 text-xs ml-1">correct</span>
                                    </div>

                                    <div className="col-span-2 text-right">
                                        <div className="flex items-center justify-end gap-1.5 text-slate-500">
                                            <Calendar size={12} />
                                            <span className="text-xs">
                                                {new Date(completedAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-end gap-1.5 text-slate-400 mt-1">
                                            <Clock size={10} />
                                            <span className="text-[11px]">
                                                {new Date(completedAt).toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="col-span-1 flex justify-end">
                                        <Link
                                            href={attempt.reviewPath || `/dashboard/review/${attempt._id}`}
                                            className="px-2 py-1.5 rounded-md border border-gray-200 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors bg-white shadow-xs"
                                        >
                                            Review
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {pagination.pages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50 border-t border-gray-200 text-sm">
                            <p className="text-slate-500">
                                Page <span className="font-medium text-slate-700">{pagination.page}</span> of <span className="font-medium text-slate-700">{pagination.pages}</span>
                            </p>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1 || loading}
                                    className="p-1.5 rounded-md border border-gray-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xs"
                                    aria-label="Previous page"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.pages || loading}
                                    className="p-1.5 rounded-md border border-gray-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xs"
                                    aria-label="Next page"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-xs">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <Trophy className="text-slate-400" size={24} />
                    </div>
                    <h3 className="text-base font-semibold text-slate-800 mb-1">No test history yet</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                        Complete your first test to start tracking your progress. All your test attempts will appear here.
                    </p>
                </div>
            )}
        </div>
    );
}
