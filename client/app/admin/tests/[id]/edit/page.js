"use client";

import React, { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import { useSubjects } from '@/hooks/useSubjects';
import { useTest, useUpdateTestMutation } from '@/hooks/useTests';
import { useQuestionBank } from '@/hooks/useQuestions';

function EditTestLoadingSkeleton() {
    return (
        <div className="space-y-6 pb-10 animate-pulse">
            <div className="h-4 w-32 rounded bg-gray-100" />
            <div className="space-y-2">
                <div className="h-8 w-64 rounded-md bg-gray-200" />
                <div className="h-4 w-96 rounded-md bg-gray-100" />
            </div>
            <div className="rounded-md border border-gray-200 bg-white p-6 shadow-xs space-y-4">
                <div className="h-10 rounded-md bg-gray-100" />
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="h-10 rounded-md bg-gray-100" />
                    <div className="h-10 rounded-md bg-gray-100" />
                </div>
                <div className="h-24 rounded-md bg-gray-100" />
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {Array.from({ length: 2 }).map((_, panel) => (
                        <div key={panel} className="rounded-md border border-gray-200 p-3 space-y-3">
                            <div className="h-5 w-40 rounded bg-gray-200" />
                            {Array.from({ length: 4 }).map((__, row) => (
                                <div key={row} className="h-12 rounded-md bg-gray-100" />
                            ))}
                        </div>
                    ))}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                    <div className="h-9 w-24 rounded-md bg-gray-100" />
                    <div className="h-9 w-32 rounded-md bg-emerald-100/70" />
                </div>
            </div>
        </div>
    );
}

export default function EditTestPage() {
    const router = useRouter();
    const params = useParams();
    const testId = params?.id;

    const { data: test, isPending: testLoading, error: testError } = useTest(testId);
    const { data: subjects = [] } = useSubjects();

    if (testLoading) {
        return <EditTestLoadingSkeleton />;
    }

    if (testError) {
        return (
            <div className="space-y-4">
                <button
                    onClick={() => router.push('/admin/tests')}
                    className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800"
                >
                    <ArrowLeft size={16} /> Back to tests
                </button>
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{testError.message}</div>
            </div>
        );
    }

    return <EditTestForm testId={testId} test={test} subjects={subjects} />;
}

function EditTestForm({ testId, test, subjects }) {
    const router = useRouter();
    const updateTestMutation = useUpdateTestMutation();

    const initialQuestionObjects = Array.isArray(test?.questions) ? test.questions : [];

    const [form, setForm] = useState({
        title: test?.title || '',
        subject: test?.subject || '',
        duration: test?.duration || 30,
        description: test?.description || '',
        questions: initialQuestionObjects.map((question) => question?.questionId).filter(Boolean)
    });

    const [currentQuestions, setCurrentQuestions] = useState(initialQuestionObjects.map((question) => ({
        questionId: question.questionId,
        question: question.question || '',
        topic: question.topic || '',
        subTopic: question.subTopic || ''
    })));

    const [removeSelection, setRemoveSelection] = useState([]);
    const [addSelection, setAddSelection] = useState([]);
    const [questionSearch, setQuestionSearch] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { data: bankData, isPending: questionBankLoading, error: bankError } = useQuestionBank(
        { subject: form.subject, excludeUsed: true, page: 1, limit: 5000 },
        { enabled: Boolean(form.subject) }
    );

    const addedQuestionIds = useMemo(() => new Set(form.questions), [form.questions]);

    const filteredQuestionBank = useMemo(() => {
        const questionBank = Array.isArray(bankData?.questions) ? bankData.questions : [];
        const query = questionSearch.trim().toLowerCase();

        return questionBank
            .filter((question) => !addedQuestionIds.has(question.questionId))
            .filter((question) => (
                !query
                || question.question?.toLowerCase().includes(query)
                || question.questionId?.toLowerCase().includes(query)
                || question.topic?.toLowerCase().includes(query)
                || question.subTopic?.toLowerCase().includes(query)
            ));
    }, [bankData, questionSearch, addedQuestionIds]);

    const toggleRemoveSelection = (questionId) => {
        setRemoveSelection((prev) => (
            prev.includes(questionId)
                ? prev.filter((id) => id !== questionId)
                : [...prev, questionId]
        ));
    };

    const toggleAddSelection = (questionId) => {
        setAddSelection((prev) => (
            prev.includes(questionId)
                ? prev.filter((id) => id !== questionId)
                : [...prev, questionId]
        ));
    };

    const handleDeleteSelectedFromTest = () => {
        if (removeSelection.length === 0) return;

        setForm((prev) => ({
            ...prev,
            questions: prev.questions.filter((questionId) => !removeSelection.includes(questionId))
        }));

        setCurrentQuestions((prev) => prev.filter((question) => !removeSelection.includes(question.questionId)));
        setRemoveSelection([]);
    };

    const handleAddSelectedToTest = () => {
        if (addSelection.length === 0) return;

        const questionsToAdd = filteredQuestionBank.filter((question) => addSelection.includes(question.questionId));

        setForm((prev) => {
            const existing = new Set(prev.questions);
            const newIds = questionsToAdd
                .map((question) => question.questionId)
                .filter((questionId) => !existing.has(questionId));

            return {
                ...prev,
                questions: [...prev.questions, ...newIds]
            };
        });

        setCurrentQuestions((prev) => {
            const existing = new Set(prev.map((question) => question.questionId));
            const additions = questionsToAdd
                .filter((question) => !existing.has(question.questionId))
                .map((question) => ({
                    questionId: question.questionId,
                    question: question.question || '',
                    topic: question.topic || '',
                    subTopic: question.subTopic || ''
                }));

            return [...prev, ...additions];
        });

        setAddSelection([]);
    };

    const handleSubjectChange = (nextSubject) => {
        setForm((prev) => ({ ...prev, subject: nextSubject, questions: [] }));
        setCurrentQuestions([]);
        setRemoveSelection([]);
        setAddSelection([]);
    };

    const handleSave = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        try {
            await updateTestMutation.mutateAsync({
                testId,
                title: form.title,
                subject: form.subject,
                duration: Number(form.duration),
                description: form.description,
                questions: form.questions
            });

            setSuccess('Test updated successfully');
            setTimeout(() => {
                router.push('/admin/tests');
            }, 700);
        } catch (err) {
            setError(err.message || 'Failed to update test');
        }
    };

    const displayError = error || bankError?.message;
    const saving = updateTestMutation.isPending;

    return (
        <div className="space-y-6 pb-10">
            <button
                onClick={() => router.push('/admin/tests')}
                className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800"
            >
                <ArrowLeft size={16} /> Back to tests
            </button>

            <div>
                <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Edit Test Questions</h2>
                <p className="mt-1 text-sm text-slate-500">Select by checkbox, delete selected from test, and add selected from unused question bank.</p>
            </div>

            {displayError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{displayError}</div>
            )}
            {success && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>
            )}

            <form onSubmit={handleSave} className="space-y-4 rounded-md border border-gray-200 bg-white p-6 shadow-xs">
                <input
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full rounded-md border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#0ddc90]"
                    placeholder="Title"
                />

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <select
                        value={form.subject}
                        onChange={(e) => handleSubjectChange(e.target.value)}
                        className="rounded-md border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#0ddc90]"
                    >
                        <option value="">Select subject</option>
                        {subjects.map((subject) => (
                            <option key={subject._id} value={subject.name}>{subject.name}</option>
                        ))}
                    </select>

                    <input
                        type="number"
                        min="1"
                        value={form.duration}
                        onChange={(e) => setForm((prev) => ({ ...prev, duration: Number(e.target.value) || 1 }))}
                        className="rounded-md border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#0ddc90]"
                        placeholder="Duration in minutes"
                    />
                </div>

                <textarea
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="h-24 w-full rounded-md border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#0ddc90]"
                    placeholder="Description"
                />

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    <div className="space-y-3 rounded-md border border-gray-200 p-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-slate-700">Questions In This Test: {currentQuestions.length}</p>
                            <button
                                type="button"
                                onClick={handleDeleteSelectedFromTest}
                                disabled={removeSelection.length === 0}
                                className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
                            >
                                <Trash2 size={12} /> Delete Selected
                            </button>
                        </div>

                        <div className="max-h-96 space-y-2 overflow-y-auto">
                            {currentQuestions.length === 0 ? (
                                <div className="rounded-lg bg-gray-50 px-3 py-4 text-center text-xs text-slate-500">
                                    No questions currently in this test.
                                </div>
                            ) : (
                                currentQuestions.map((question) => (
                                    <label key={`current-${question.questionId}`} className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs">
                                        <input
                                            type="checkbox"
                                            checked={removeSelection.includes(question.questionId)}
                                            onChange={() => toggleRemoveSelection(question.questionId)}
                                            className="mt-0.5"
                                        />
                                        <div>
                                            <p className="font-semibold text-slate-700">{question.questionId}</p>
                                            <p className="text-slate-500">{question.question}</p>
                                        </div>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="space-y-3 rounded-md border border-gray-200 p-3">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm font-semibold text-slate-700">Add From Unused Question Bank</p>
                            <input
                                type="text"
                                value={questionSearch}
                                onChange={(e) => setQuestionSearch(e.target.value)}
                                placeholder="Search question bank"
                                className="w-full rounded-md border border-gray-200 px-3 py-1.5 text-xs outline-none focus:border-[#0ddc90] sm:w-56"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleAddSelectedToTest}
                            disabled={addSelection.length === 0}
                            className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50/60 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                        >
                            <Plus size={12} /> Add Selected
                        </button>

                        {questionBankLoading ? (
                            <div className="space-y-2 animate-pulse">
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <div key={index} className="h-12 rounded-md bg-gray-100" />
                                ))}
                            </div>
                        ) : (
                            <div className="max-h-96 space-y-2 overflow-y-auto">
                                {filteredQuestionBank.length === 0 ? (
                                    <div className="rounded-lg bg-gray-50 px-3 py-4 text-center text-xs text-slate-500">
                                        No unused questions available for this subject.
                                    </div>
                                ) : (
                                    filteredQuestionBank.map((question) => (
                                        <label key={`bank-${question.questionId}`} className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs">
                                            <input
                                                type="checkbox"
                                                checked={addSelection.includes(question.questionId)}
                                                onChange={() => toggleAddSelection(question.questionId)}
                                                className="mt-0.5"
                                            />
                                            <div>
                                                <p className="font-semibold text-slate-700">{question.questionId}</p>
                                                <p className="text-slate-500">{question.question}</p>
                                            </div>
                                        </label>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <button
                        type="button"
                        onClick={() => router.push('/admin/tests')}
                        className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-md bg-[#0ddc90] px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-[#0bc07d] disabled:opacity-60"
                    >
                        <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
