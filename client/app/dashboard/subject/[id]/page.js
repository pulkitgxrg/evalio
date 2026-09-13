"use client";
import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, FileText, ChevronRight } from 'lucide-react';
import { SubjectDetailsSkeleton } from '@/components/dashboard/SubjectDetailsSkeleton';
import { useCurrentUser } from '@/hooks/useAuth';
import { useSubjects } from '@/hooks/useSubjects';
import { useTests } from '@/hooks/useTests';

export default function SubjectDetailsPage() {
  const params = useParams();
  const { data: user, isPending: userPending } = useCurrentUser();
  const userYear = user?.study_year || null;

  const { data: subjects = [], isPending: subjectsPending } = useSubjects(undefined, {
    enabled: !userPending,
  });
  const subject = subjects.find((s) => s._id === params.id);
  const subjectName = subject?.name || '';

  const { data: tests = [], isPending: testsPending } = useTests(
    subject ? { subject: subject.name, year: userYear || undefined } : undefined,
    { enabled: Boolean(subject) }
  );

  const loading = userPending || subjectsPending || (Boolean(subject) && testsPending);

  if (loading) {
    return <SubjectDetailsSkeleton />;
  }

  if (!subjectName) {
    return <div className="p-8 text-center text-gray-500">Subject not found.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/subject" className="p-1.5 rounded-md border border-transparent hover:border-gray-200 hover:bg-white text-slate-500 transition-all">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">{subjectName}</h1>
          <p className="text-sm text-slate-500 mt-1">
            Available tests and assessments{userYear ? ` • Year ${userYear}` : ''}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
        {tests.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <FileText size={32} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">No tests available for this subject yet.</p>
          </div>
        ) : (
          tests.map((test) => (
            <div
              key={test._id}
              className="group bg-white rounded-md border border-gray-200 p-5 shadow-xs hover:border-[#0ddc90]/40 hover:shadow-sm transition-all duration-200 flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="bg-gray-50 text-slate-600 border border-gray-200 text-[11px] font-semibold tracking-wide px-2 py-0.5 rounded">
                  {test.difficulty || 'Assessment'}
                </span>
                <div className="text-slate-400 text-[11px] font-medium tracking-wide bg-gray-50 px-2 py-0.5 rounded border border-transparent">{test.questions?.length || 0} Qs</div>
              </div>

              <h3 className="text-[17px] font-semibold text-slate-800 leading-snug mb-2 group-hover:text-[#0bc07d] transition-colors line-clamp-2">
                {test.title}
              </h3>

              <p className="text-[13px] text-slate-500 mb-6 line-clamp-2 flex-grow">
                {test.description || 'No description provided.'}
              </p>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                <div className="flex items-center text-[12px] text-slate-500 font-medium gap-1.5">
                  <Clock size={14} className="text-slate-400" /> {test.duration} mins
                </div>
                <Link
                  href={`/dashboard/test/${test._id}`}
                  className="flex items-center gap-1 text-[13px] font-medium text-slate-500 group-hover:text-[#0bc07d] transition-colors"
                >
                  Start <span className="text-slate-400 group-hover:text-[#0bc07d]">&rarr;</span>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
