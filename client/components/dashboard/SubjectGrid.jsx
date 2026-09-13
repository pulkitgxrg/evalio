import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '@/hooks/useAuth';
import { useSubjects } from '@/hooks/useSubjects';

export function SubjectGrid({
    linkPrefix = '/dashboard/subject',
    filterByUserYear = true,
    title = 'My Subjects',
    countLabel = 'Tests',
    viewLabel = 'View Tests',
    emptyLabel = 'tests'
}) {
    const { data: user, isPending: userPending } = useCurrentUser({ enabled: filterByUserYear });
    const userYear = user?.study_year || 1;

    const { data: subjects = [], isPending: subjectsPending } = useSubjects(
        filterByUserYear ? userYear : undefined,
        { enabled: !filterByUserYear || !userPending }
    );

    const loading = (filterByUserYear && userPending) || subjectsPending;

    if (loading) {
        return (
            <div className="flex flex-col h-full bg-transparent animate-pulse">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div className="space-y-3">
                        <div className="h-8 w-48 rounded-md bg-gray-200" />
                        <div className="h-4 w-72 rounded-md bg-gray-100" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-md p-5 border border-gray-200 flex flex-col h-full shadow-xs"
                        >
                            <div className="flex flex-col flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="h-5 w-16 rounded bg-gray-100" />
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="h-6 w-3/4 rounded bg-gray-200" />
                                    <div className="h-4 w-1/2 rounded bg-gray-100" />
                                </div>

                                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <div className="h-4 w-24 rounded bg-gray-100" />
                                    <div className="w-5 h-5 rounded bg-gray-100" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-transparent max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-1">{title}</h1>
                    <p className="text-sm text-slate-500">
                        {filterByUserYear ? `Year ${userYear} Curriculum` : 'All Years Curriculum'} • {subjects.length} Subjects Available
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
                {subjects.map((subject) => {
                    return (
                        <Link href={`${linkPrefix}/${subject._id}`} key={subject._id} className="group bg-white rounded-md p-5 border border-gray-200 hover:border-[#0ddc90]/40 hover:shadow-sm transition-all duration-200 flex flex-col h-full shadow-xs">
                            <div className="flex flex-col flex-1">
                                <div className="flex justify-between items-start mb-3">
                                    <span className={cn("text-[11px] font-semibold tracking-wide px-2 py-0.5 rounded border border-gray-200 bg-gray-50 text-slate-600")}>
                                        YEAR {subject.year || userYear}
                                    </span>
                                </div>

                                <h3 className="text-[17px] font-semibold text-slate-800 leading-snug mb-1.5 group-hover:text-[#0bc07d] transition-colors">
                                    {subject.name}
                                </h3>

                                <p className="text-[13px] text-slate-500 mb-5">
                                    {subject.questionCount !== undefined && countLabel === 'Questions'
                                      ? (subject.questionCount > 0 ? `${subject.questionCount} Questions` : 'No questions')
                                      : (subject.testCount > 0 ? `${subject.testCount} Tests` : `No ${emptyLabel}`)}
                                </p>

                                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-[13px] font-medium">
                                    <span className="text-slate-500 group-hover:text-[#0bc07d] transition-colors">{viewLabel}</span>
                                    <div className="text-slate-400 group-hover:text-[#0bc07d] transition-colors">
                                        &rarr;
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
                {subjects.length === 0 && (
                    <div className="col-span-full py-16 text-center text-slate-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <p className="text-sm font-medium text-slate-600">
                            {filterByUserYear ? `No subjects found for Year ${userYear}.` : 'No subjects found.'}
                        </p>
                        <p className="text-xs mt-1">Please contact your administrator.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
