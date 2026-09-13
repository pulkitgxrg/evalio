"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, AlertCircle, Filter, Plus, Wand2, List } from 'lucide-react';

export default function CreateTestPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [subjects, setSubjects] = useState([]);

    const [mode, setMode] = useState('manual');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        duration: 30,
        subject: '',
        questions: []
    });

    const [excludeUsed, setExcludeUsed] = useState(true);
    const [genConfig, setGenConfig] = useState({
        topic: '',
        subTopic: '',
        difficultyCounts: {
            Easy: 0,
            Medium: 0,
            Hard: 0
        }
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/subjects`);
                if (res.ok) setSubjects(await res.json());
            } catch (err) {
                console.error("Failed to fetch subjects");
            }
        };
        fetchSubjects();
    }, []);

    useEffect(() => {
        if (!formData.subject || mode !== 'manual') return;

        const fetchQuestions = async () => {
            try {
                let url = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/questions?subject=${encodeURIComponent(formData.subject)}`;
                if (excludeUsed) {
                    url += '&excludeUsed=true';
                }
                const res = await fetch(url, { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    setQuestions(data);
                }
            } catch (err) {
                console.error("Failed to fetch questions");
            }
        };
        fetchQuestions();
    }, [formData.subject, excludeUsed, mode]);

    const [availableCounts, setAvailableCounts] = useState({ Easy: 0, Medium: 0, Hard: 0 });

    useEffect(() => {
        if (!formData.subject || mode !== 'generate') return;

        const fetchCounts = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/questions/available-counts`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'userId': user._id
                    },
                    body: JSON.stringify({
                        subject: formData.subject,
                        topic: genConfig.topic,
                        subTopic: genConfig.subTopic,
                        excludeUsed: excludeUsed
                    })
                });
                if (res.ok) {
                    setAvailableCounts(await res.json());
                }
            } catch (err) {
                console.error("Failed to fetch available counts");
            }
        };
        // Debounce slightly to avoid too many requests while typing
        const timer = setTimeout(fetchCounts, 500);
        return () => clearTimeout(timer);
    }, [formData.subject, genConfig.topic, genConfig.subTopic, excludeUsed, mode]);

    const handleQuestionToggle = (qId) => {
        setFormData(prev => {
            const exists = prev.questions.includes(qId);
            if (exists) {
                return { ...prev, questions: prev.questions.filter(id => id !== qId) };
            } else {
                return { ...prev, questions: [...prev.questions, qId] };
            }
        });
    };

    const handleGenerate = async () => {
        setLoading(true);
        setError('');
        try {
            const totalRequested = Object.values(genConfig.difficultyCounts).reduce((a, b) => a + Number(b), 0);
            if (totalRequested === 0) throw new Error("Please specify at least one question count.");

            for (const [level, count] of Object.entries(genConfig.difficultyCounts)) {
                if (count > availableCounts[level]) {
                    setError(`You requested ${count} ${level} questions but only ${availableCounts[level]} are available.`);
                    setLoading(false);
                    return;
                }
            }

            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/questions/generate`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'userId': user._id
                },
                body: JSON.stringify({
                    subject: formData.subject,
                    topic: genConfig.topic,
                    subTopic: genConfig.subTopic,
                    difficultyCounts: genConfig.difficultyCounts,
                    excludeUsed: excludeUsed
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to generate questions");

            const generatedIds = data.map(q => q.questionId);
            setFormData(prev => ({ ...prev, questions: generatedIds }));
            setQuestions(data);
            setSuccess(`Generated ${data.length} questions successfully!`);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (formData.questions.length === 0) {
            setError("Please select at least one question.");
            setLoading(false);
            return;
        }

        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/tests`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'userId': user._id
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to create test");

            setSuccess("Test created successfully!");
            setTimeout(() => {
                router.push('/admin/tests');
            }, 1500);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors"
            >
                <ArrowLeft size={20} /> Back
            </button>

            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Create New Test</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-md border border-gray-200 shadow-xs sticky top-6">
                        <h2 className="font-semibold text-xl text-slate-800 mb-4">Test Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full p-3 rounded-md border border-gray-200 focus:border-[#0ddc90] outline-none"
                                    placeholder="e.g. Midterm Exam"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Subject</label>
                                <select
                                    value={formData.subject}
                                    onChange={(e) => {
                                        setFormData({ ...formData, subject: e.target.value, questions: [] });
                                        setQuestions([]);
                                    }}
                                    className="w-full p-3 rounded-md border border-gray-200 focus:border-[#0ddc90] outline-none bg-white"
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map(s => (
                                        <option key={s._id} value={s.name}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Duration (minutes)</label>
                                <input
                                    type="number"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                    className="w-full p-3 rounded-md border border-gray-200 focus:border-[#0ddc90] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full p-3 rounded-md border border-gray-200 focus:border-[#0ddc90] outline-none h-24 resize-none"
                                    placeholder="Optional description..."
                                />
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={loading || !formData.title || !formData.subject || formData.questions.length === 0}
                                className="w-full bg-[#0ddc90] text-slate-900 py-3 rounded-md font-semibold hover:bg-[#0bc07d] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? 'Processing...' : <><Plus size={20} /> Create Test ({formData.questions.length})</>}
                            </button>

                            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                            {success && <p className="text-green-500 text-sm mt-2">{success}</p>}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white p-6 rounded-md border border-gray-200 shadow-xs">

                        <div className="flex p-1 bg-gray-100 rounded-md mb-6">
                            <button
                                onClick={() => setMode('manual')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${mode === 'manual' ? 'bg-white shadow-xs text-slate-800' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <List size={16} /> Manual Selection
                            </button>
                            <button
                                onClick={() => setMode('generate')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${mode === 'generate' ? 'bg-white shadow-xs text-slate-800' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Wand2 size={16} /> Auto Generate
                            </button>
                        </div>

                        {mode === 'generate' && (
                            <div className="mb-6 p-4 bg-emerald-50/50 rounded-md border border-emerald-100 space-y-4">
                                <h3 className="font-semibold text-slate-800">Generator Configuration</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Topic (Optional)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Normalization"
                                            value={genConfig.topic}
                                            onChange={e => setGenConfig({ ...genConfig, topic: e.target.value })}
                                            className="w-full p-2 rounded-md border border-gray-200 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Sub Topic (Optional)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 3NF"
                                            value={genConfig.subTopic}
                                            onChange={e => setGenConfig({ ...genConfig, subTopic: e.target.value })}
                                            className="w-full p-2 rounded-md border border-gray-200 text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 mb-2 block">Question Distribution</label>
                                    <div className="flex gap-4">
                                        {['Easy', 'Medium', 'Hard'].map(level => (
                                            <div key={level} className="flex-1">
                                                <label className="text-xs text-gray-500 mb-1 block">{level}</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={genConfig.difficultyCounts[level]}
                                                    onChange={e => setGenConfig({
                                                        ...genConfig,
                                                        difficultyCounts: {
                                                            ...genConfig.difficultyCounts,
                                                            [level]: parseInt(e.target.value) || 0
                                                        }
                                                    })}
                                                    className="w-full p-2 rounded-md border border-gray-200 text-sm"
                                                />
                                                <p className="text-[10px] text-gray-400 mt-1 uppercase font-semibold text-right">Maybe: {availableCounts[level]}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between items-center mt-2 px-1">
                                        <span className="text-xs text-emerald-700 font-medium">
                                            Total Available: {Object.values(availableCounts).reduce((a, b) => a + b, 0)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleGenerate}
                                        disabled={loading || !formData.subject}
                                        className="bg-[#0ddc90] text-slate-900 px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#0bc07d] transition-colors disabled:opacity-50"
                                    >
                                        Generate Questions
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-xl text-slate-800">
                                {mode === 'manual' ? 'Available Questions' : 'Generated Questions'} <span className="text-sm font-medium text-slate-500 ml-2">({questions.length})</span>
                            </h2>
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-slate-600 flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-100 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={excludeUsed}
                                        onChange={(e) => setExcludeUsed(e.target.checked)}
                                        className="w-4 h-4 text-[#0ddc90] rounded focus:ring-[#0ddc90]"
                                    />
                                    <Filter size={14} /> Exclude Used
                                </label>
                            </div>
                        </div>

                        {!formData.subject ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <AlertCircle size={48} className="mb-2 opacity-50" />
                                <p>Please select a subject to view questions</p>
                            </div>
                        ) : questions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <p>No questions found.</p>
                                {mode === 'generate' && <p className="text-sm mt-1">Configure and click &quot;Generate Questions&quot;</p>}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {questions.map((q) => (
                                    <div
                                        key={q.questionId}
                                        onClick={() => handleQuestionToggle(q.questionId)}
                                        className={`p-4 rounded-md border transition-all cursor-pointer hover:shadow-sm flex items-start gap-4 ${formData.questions.includes(q.questionId) ? 'border-[#0ddc90] bg-emerald-50/30' : 'border-gray-200 bg-white hover:border-[#0ddc90]/40'}`}
                                    >
                                        <div className={`mt-1 h-5 w-5 rounded border flex items-center justify-center shrink-0 transition-colors ${formData.questions.includes(q.questionId) ? 'bg-[#0ddc90] border-[#0ddc90]' : 'border-gray-300 bg-white'}`}>
                                            {formData.questions.includes(q.questionId) && <CheckCircle size={12} className="text-white" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-800">{q.question}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${q.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : q.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                    {q.difficulty}
                                                </span>
                                                {q.topic && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{q.topic}</span>}
                                                <span className="text-xs text-gray-400">ID: {q.questionId}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
