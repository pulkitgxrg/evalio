import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trophy, Target, Activity, AlertCircle } from 'lucide-react';
import { useSessionStats } from '@/hooks/useSessions';

export function StatsOverview() {
    const { data: stats, isPending } = useSessionStats();

    if (isPending) return <div className="h-64 animate-pulse bg-gray-100 rounded-md"></div>;

    if (!stats || !stats.overview) return null;

    const { overview, subjectAnalysis } = stats;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-md shadow-xs border border-gray-200 flex items-center gap-4">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
                        <Trophy size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Average Score</p>
                        <h3 className="text-3xl font-bold text-gray-900">{overview.averageScore}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-md shadow-xs border border-gray-200 flex items-center gap-4">
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
                        <Target size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Accuracy</p>
                        <h3 className="text-3xl font-bold text-gray-900">{overview.averageAccuracy}%</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-md shadow-xs border border-gray-200 flex items-center gap-4">
                    <div className="p-4 bg-purple-50 text-purple-600 rounded-xl">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Tests Taken</p>
                        <h3 className="text-3xl font-bold text-gray-900">{overview.totalTests}</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-md shadow-xs border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Subject Performance</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={subjectAnalysis} layout="vertical" margin={{ left: 20 }}>
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis type="category" dataKey="subject" width={100} tick={{ fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="accuracy" radius={[0, 4, 4, 0]} barSize={20}>
                                    {subjectAnalysis.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.accuracy >= 60 ? '#10b981' : '#f59e0b'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-md shadow-xs border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <AlertCircle size={20} className="text-red-500" /> Areas for Improvement
                    </h3>
                    <div className="space-y-4">
                        {subjectAnalysis.filter(s => s.weakness).length === 0 ? (
                            <p className="text-gray-500 text-sm">Great job! You are performing well across all subjects.</p>
                        ) : (
                            subjectAnalysis.filter(s => s.weakness).map(subject => (
                                <div key={subject.subject} className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                                    <div>
                                        <h4 className="font-bold text-gray-900">{subject.subject}</h4>
                                        <p className="text-xs text-red-600 mt-1">Accuracy: {subject.accuracy}% ({subject.totalTests} tests)</p>
                                    </div>
                                    <button className="px-4 py-2 bg-white text-red-600 text-xs font-bold rounded-lg shadow-sm border border-red-100 hover:bg-red-50">
                                        Practice
                                    </button>
                                </div>
                            ))
                        )}

                        {subjectAnalysis.length === 0 && <p className="text-gray-500">Complete a test to see your analysis.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
