"use client";
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, CheckCircle, XCircle, LayoutList, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSubjects } from '@/hooks/useSubjects';
import { useQuestionBank } from '@/hooks/useQuestionBank';

export default function QuestionBankQuestionsPage() {
  const params = useParams();
  // Keyed by id so every navigation between subjects starts from fresh filter/page/answer state.
  return <QuestionBankView key={params.id} id={params.id} />;
}

function QuestionBankView({ id }) {
  const [selectedTaxonomy, setSelectedTaxonomy] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [revisionMode, setRevisionMode] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});

  const { data: subjects = [], isPending: subjectsPending } = useSubjects();
  const subjectName = subjects.find((s) => s._id === id)?.name || '';

  const taxonomyQuery = {};
  if (selectedTaxonomy !== 'all') {
    const [taxonomyType, ...rawValueParts] = selectedTaxonomy.split('::');
    const taxonomyValue = rawValueParts.join('::');
    if (taxonomyType === 'topic') taxonomyQuery.topic = taxonomyValue;
    if (taxonomyType === 'subTopic') taxonomyQuery.subTopic = taxonomyValue;
  }

  const { data: questionsResult, isPending: questionsPending } = useQuestionBank(
    { subject: subjectName, page: currentPage, limit: 50, ...taxonomyQuery },
    { enabled: Boolean(subjectName) }
  );
  const questions = React.useMemo(() => questionsResult?.questions || [], [questionsResult]);
  const totalPages = questionsResult?.totalPages || 1;
  const totalQuestions = questionsResult?.total || 0;

  const { data: taxonomyResult } = useQuestionBank(
    { subject: subjectName, page: 1, limit: 5000 },
    { enabled: Boolean(subjectName) }
  );
  const { availableTopics, availableSubTopics } = React.useMemo(() => {
    const questionList = taxonomyResult?.questions || [];
    return {
      availableTopics: [...new Set(questionList.map((q) => q.topic?.trim()).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b)),
      availableSubTopics: [...new Set(questionList.map((q) => q.subTopic?.trim()).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b)),
    };
  }, [taxonomyResult]);

  const loading = subjectsPending || (Boolean(subjectName) && questionsPending);

  const handleTaxonomyChange = (event) => {
    const taxonomyValue = event.target.value;
    setSelectedTaxonomy(taxonomyValue);
    setCurrentPage(1);
    setUserAnswers({});
  };

  const handleOptionSelect = (qId, option) => {
    if (revisionMode) return;
    if (userAnswers[qId]) return;

    setUserAnswers(prev => ({
      ...prev,
      [qId]: option
    }));
  };

  const resetPractice = () => {
    setUserAnswers({});
  };

  const groupedQuestions = React.useMemo(() => {
    return [{
      key: 'all-questions',
      title: '',
      questions
    }];
  }, [questions]);

  const questionNumberMap = React.useMemo(() => {
    const start = (currentPage - 1) * 50;
    return questions.reduce((acc, q, index) => {
      acc[q._id] = start + index + 1;
      return acc;
    }, {});
  }, [questions, currentPage]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/question-bank" className="p-1.5 rounded-md border border-transparent hover:border-gray-200 hover:bg-white text-slate-500 transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Question Bank</h1>
            <p className="text-sm text-slate-500 mt-1">
              {subjectName ? `${subjectName} • ${totalQuestions} Questions` : 'Loading...'}
            </p>
          </div>
        </div>

        {!loading && questions.length > 0 && (
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <div className="flex items-center bg-white rounded-lg p-1 border border-gray-200 shadow-xs w-full sm:w-auto mx-auto">
              <button
                onClick={() => setRevisionMode(false)}
                className={cn(
                  "cursor-pointer flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-all",
                  !revisionMode ? "bg-[#0ddc90] text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                Practice Mode
              </button>
              <button
                onClick={() => setRevisionMode(true)}
                className={cn(
                  "cursor-pointer flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2",
                  revisionMode ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <LayoutList size={16} /> Revision
              </button>
            </div>

            <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 shadow-xs px-3 py-2 w-full sm:w-auto mx-auto">
              <label htmlFor="topic-filter" className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                Topic
              </label>
              <select
                id="topic-filter"
                value={selectedTaxonomy}
                onChange={handleTaxonomyChange}
                className="text-sm text-slate-700 bg-transparent outline-none w-full sm:w-60 cursor-pointer"
              >
                <option value="all">All Questions</option>
                {availableTopics.length > 0 && (
                  <optgroup label="Topics">
                    {availableTopics.map((topic) => (
                      <option key={`topic-${topic}`} value={`topic::${topic}`}>
                        {topic}
                      </option>
                    ))}
                  </optgroup>
                )}
                {availableSubTopics.length > 0 && (
                  <optgroup label="Subtopics">
                    {availableSubTopics.map((subTopic) => (
                      <option key={`subTopic-${subTopic}`} value={`subTopic::${subTopic}`}>
                        {subTopic}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
          </div>
        )}
      </div>

      {!revisionMode && !loading && Object.keys(userAnswers).length > 0 && (
        <div className="flex justify-end mb-4">
          <button 
            onClick={resetPractice}
            className="text-sm text-slate-500 hover:text-slate-800 transition-colors underline underline-offset-4"
          >
            Reset Practice
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white border text-left border-gray-200 rounded-xl p-6 shadow-xs animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-5 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="space-y-3">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-10 bg-gray-100 rounded-lg w-full"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="py-16 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <BookOpen size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-medium text-slate-600">
            {selectedTaxonomy === 'all'
              ? 'No questions available for this subject.'
              : 'No questions available for the selected filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedQuestions.map((group) => (
            <div key={group.key} className="space-y-4">
              {group.questions.map((q) => {
                const hasAnswered = !!userAnswers[q._id];
                const selectedOpt = userAnswers[q._id];
                const questionNumber = questionNumberMap[q._id];

                return (
                  <div key={q._id} className="bg-white border border-gray-200 rounded-xl p-5 md:p-7 shadow-xs">
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <div className="flex items-start gap-3">
                        <span className="shrink-0 flex items-center justify-center w-7 h-7 rounded-sm bg-slate-100 text-slate-700 font-semibold text-sm">
                          {questionNumber}
                        </span>
                        <h3 className="text-base text-slate-800 font-medium leading-relaxed pt-0.5">
                          {q.question}
                        </h3>
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-slate-50 border border-slate-100",
                        q.difficulty === 'Easy' ? "text-emerald-600" :
                        q.difficulty === 'Medium' ? "text-amber-600" :
                        "text-rose-600"
                      )}>
                        {q.difficulty}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-10">
                      {q.options.map((option, optIdx) => {
                        const isCorrect = option === q.correctAnswer;
                        const isSelected = selectedOpt === option;

                        let bgClass = "bg-white hover:bg-slate-50 border-gray-200 cursor-pointer";
                        let textClass = "text-slate-600";
                        let icon = null;

                        if (revisionMode) {
                          if (isCorrect) {
                            bgClass = "bg-emerald-50 border-emerald-200 pointer-events-none";
                            textClass = "text-emerald-800 font-medium";
                            icon = <CheckCircle size={16} className="text-emerald-500" />;
                          } else {
                            bgClass = "bg-white border-gray-100 opacity-60 pointer-events-none";
                          }
                        } else if (hasAnswered) {
                          bgClass = "bg-white border-gray-200 cursor-default opacity-80";
                          if (isCorrect) {
                            bgClass = "bg-emerald-50 border-emerald-300";
                            textClass = "text-emerald-800 font-medium";
                            icon = <CheckCircle size={16} className="text-emerald-500" />;
                          } else if (isSelected && !isCorrect) {
                            bgClass = "bg-rose-50 border-rose-300";
                            textClass = "text-rose-800";
                            icon = <XCircle size={16} className="text-rose-500" />;
                          }
                        }

                        const optLetter = String.fromCharCode(65 + optIdx);

                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleOptionSelect(q._id, option)}
                            className={cn(
                              "relative flex items-center justify-between p-3 rounded-lg border transition-all duration-200",
                              bgClass
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <span className={cn(
                                "flex items-center justify-center w-6 h-6 rounded-md text-xs font-semibold",
                                revisionMode && isCorrect ? "bg-emerald-200/50 text-emerald-700" :
                                hasAnswered && isCorrect ? "bg-emerald-200/50 text-emerald-700" :
                                hasAnswered && isSelected ? "bg-rose-200/50 text-rose-700" :
                                "bg-slate-100 text-slate-500"
                              )}>
                                {optLetter}
                              </span>
                              <span className={cn("text-sm", textClass)}>{option}</span>
                            </div>
                            {icon}
                          </div>
                        );
                      })}
                    </div>

                    {(revisionMode || hasAnswered) && (q.topic || q.subTopic) && (
                      <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap gap-2 pl-10">
                       {q.topic && <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-500">{q.topic}</span>}
                       {q.subTopic && <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-500">{q.subTopic}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-center pt-8 pb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md border border-gray-200 text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="px-4 text-sm font-medium text-slate-700">
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-md border border-gray-200 text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
