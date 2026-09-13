"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Clock3 } from 'lucide-react';

export default function TestQuestionsPage() {
    const router = useRouter();
    const params = useParams();
    const testId = params?.id;

    const [test, setTest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!testId) return;

        const fetchTest = async () => {
            try {
                setLoading(true);
                setError('');

                const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/tests/${testId}/admin`, {
                    credentials: 'include'
                });
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data?.error || data?.message || 'Failed to fetch test');
                }

                setTest(data);
            } catch (err) {
                setError(err.message || 'Failed to fetch test details');
            } finally {
                setLoading(false);
             }
         };

         fetchTest();
     }, [testId]);

    if (loading) {
        return (
            <div className="space-y-6 pb-10 animate-pulse">
                <div className="h-4 w-32 rounded bg-gray-100" />

                <div className="rounded-md border border-gray-200 bg-white p-6 shadow-xs">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <div className="h-8 w-72 rounded-md bg-gray-200" />
                            <div className="h-4 w-96 rounded-md bg-gray-100" />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-7 w-24 rounded-full bg-gray-100" />
                            <div className="h-7 w-24 rounded-full bg-gray-100" />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="rounded-md border border-gray-200 bg-white p-6 shadow-xs">
                            <div className="flex items-center justify-between mb-4">
                                <div className="h-5 w-3/4 rounded bg-gray-200" />
                                <div className="h-5 w-16 rounded-full bg-gray-100" />
                            </div>
                            <div className="space-y-2">
                                {Array.from({ length: 4 }).map((__, opt) => (
                                    <div key={opt} className="h-9 rounded-md bg-gray-100" />
                                ))}
                            </div>
                            <div className="mt-3 h-3 w-52 rounded bg-gray-100" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

     if (error) {
         return (
             <div className="space-y-4">
                 <button
                     onClick={() => router.push('/admin/tests')}
                     className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800"
                 >
                     <ArrowLeft size={16} /> Back to tests
                 </button>
                 <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
             </div>
         );
     }

     return (
         <div className="space-y-6 pb-10">
             <button
                 onClick={() => router.push('/admin/tests')}
                 className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800"
             >
                 <ArrowLeft size={16} /> Back to tests
             </button>

             <div className="rounded-md border border-gray-200 bg-white p-6 shadow-xs">
                 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                     <div>
                         <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">{test?.title}</h2>
                         <p className="mt-1 text-sm text-slate-500">{test?.description || 'No description provided.'}</p>
                     </div>
                     <div className="flex items-center gap-3">
                         <span className="rounded-full border border-emerald-200 bg-emerald-50/60 px-3 py-1.5 text-sm font-medium text-emerald-700">
                             <BookOpen size={14} className="mr-1 inline" /> {test?.subject}
                         </span>
                         <span className="rounded-full border border-blue-200 bg-blue-50/60 px-3 py-1.5 text-sm font-medium text-blue-700">
                             <Clock3 size={14} className="mr-1 inline" /> {test?.duration} mins
                         </span>
                     </div>
                 </div>
             </div>

             <div className="space-y-4">
                 {(test?.questions || []).map((question, index) => (
                     <div key={question._id || question.questionId || index} className="rounded-md border border-gray-200 bg-white p-6 shadow-xs">
                         <div className="mb-4 flex items-start justify-between gap-4">
                             <h3 className="text-base font-semibold text-slate-800">Q{index + 1}. {question.question}</h3>
                             <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-slate-600">
                                 {question.difficulty}
                             </span>
                         </div>

                         <div className="grid gap-2">
                             {(question.options || []).map((option, optionIdx) => {
                                 const isCorrect = option === question.correctAnswer;
                                 return (
                                     <div
                                         key={`${question._id || question.questionId || index}-${optionIdx}`}
                                         className={`rounded-md border px-3 py-2 text-sm ${isCorrect ? 'border-emerald-300 bg-emerald-50/70 text-emerald-700' : 'border-gray-200 bg-gray-50 text-slate-700'}`}
                                     >
                                         {option}
                                     </div>
                                 );
                             })}
                         </div>

                         <div className="mt-3 text-xs text-slate-500">
                             Topic: {question.topic || 'N/A'} · Sub-topic: {question.subTopic || 'N/A'}
                         </div>
                     </div>
                 ))}
             </div>

             {(test?.questions || []).length === 0 && (
                 <div className="rounded-md border border-gray-200 bg-white p-8 text-center text-sm text-slate-500">
                     No questions found for this test.
                 </div>
             )}
         </div>
     );
 }
