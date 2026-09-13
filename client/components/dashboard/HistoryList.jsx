import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';
import { useSessionHistory } from '@/hooks/useSessions';

export function HistoryList() {
    const { data: history = [], isPending } = useSessionHistory();

    if (isPending) {
        return (
            <div className="space-y-4 max-w-6xl mx-auto animate-pulse">
                <div className="h-6 w-32 rounded bg-gray-200" />
                <div className="bg-white border border-gray-200 rounded-md shadow-xs overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-50/50">
                        <div className="col-span-5 h-4 bg-gray-200 rounded w-24"></div>
                        <div className="col-span-3 h-4 bg-gray-200 rounded w-16"></div>
                        <div className="col-span-2 h-4 bg-gray-200 rounded w-12"></div>
                        <div className="col-span-2 h-4 bg-gray-200 rounded w-16 ml-auto"></div>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="grid grid-cols-12 gap-4 p-4 items-center">
                                <div className="col-span-5 space-y-2">
                                    <div className="h-4 w-40 rounded bg-gray-200" />
                                    <div className="h-3 w-24 rounded bg-gray-100" />
                                </div>
                                <div className="col-span-3">
                                    <div className="h-5 w-20 rounded bg-gray-200" />
                                </div>
                                <div className="col-span-2">
                                    <div className="h-4 w-12 rounded bg-gray-200" />
                                </div>
                                <div className="col-span-2 flex justify-end">
                                    <div className="h-4 w-16 rounded bg-gray-200" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-500">No test history found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 max-w-6xl mx-auto">
            <h3 className="font-semibold text-slate-800 text-lg">Recent Attempts</h3>
            <div className="bg-white border border-gray-200 rounded-lg shadow-xs overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-50/50 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    <div className="col-span-5">Test Name</div>
                    <div className="col-span-3">Status</div>
                    <div className="col-span-2">Score</div>
                    <div className="col-span-2 text-right">Action</div>
                </div>

                <div className="divide-y divide-gray-100">
                    {history.map((session) => (
                        <div key={session._id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 transition-colors">
                            <div className="col-span-5">
                                <h4 className="font-medium text-slate-800">{session.test?.title || 'Unknown Test'}</h4>
                                <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                                    <Calendar size={10} /> {new Date(session.createdAt).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="col-span-3">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${(session.status === 'SUBMITTED' || session.status === 'EXPIRED') ? 'border-emerald-200 text-emerald-700 bg-emerald-50/50' : 'border-amber-200 text-amber-700 bg-amber-50/50'}`}>
                                    {(session.status === 'SUBMITTED' || session.status === 'EXPIRED') ? 'Completed' : 'In Progress'}
                                </span>
                            </div>

                            <div className="col-span-2 text-sm font-medium text-slate-700">
                                {session.score ?? '-'}/{session.totalQuestions || '?'}
                            </div>

                            <div className="col-span-2 text-right">
                                <Link
                                    href={`/dashboard/review/${session._id}`}
                                    className="inline-flex items-center gap-1 text-sm font-medium text-[#0bc07d] hover:text-[#0ddc90] transition-colors"
                                >
                                    Review <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
