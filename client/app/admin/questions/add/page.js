"use client";

import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, Upload, FileSpreadsheet, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import * as XLSX from 'xlsx';

export default function AddQuestionPage() {
    const [activeTab, setActiveTab] = useState('manual');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        questionId: '',
        difficulty: 'Easy',
        question: '',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        option5: '',
        subject: '',
        topic: '',
        subTopic: '',
        correctAnswer: ''
    });

    const [bulkFile, setBulkFile] = useState(null);
    const [parsedData, setParsedData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [columnMapping, setColumnMapping] = useState({
        question: '',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        option5: '',
        correctAnswer: '',
        difficulty: '',
        topic: '',
        subTopic: ''
    });
    const [bulkPreview, setBulkPreview] = useState([]);
    const [defaultBulkDifficulty, setDefaultBulkDifficulty] = useState('Easy');

    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/subjects`);
                if (res.ok) {
                    const data = await res.json();
                    setSubjects(data);
                }
            } catch (err) {
                console.error("Failed to fetch subjects", err);
            }
        };
        fetchSubjects();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const options = [
                formData.option1.trim(),
                formData.option2.trim(),
                formData.option3.trim(),
                formData.option4.trim()
            ];

            if (formData.option5.trim()) {
                options.push(formData.option5.trim());
            }

            if (options.length < 4) {
                throw new Error("At least 4 options are required");
            }

            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (!user._id) {
                throw new Error("You must be logged in as admin");
            }

            if (!options.includes(formData.correctAnswer)) {
                throw new Error("Selected correct answer does not match any of the options. Please re-select the correct answer.");
            }

            if (!selectedSubject) {
                throw new Error("Please select a Subject first");
            }

            const payload = {
                difficulty: formData.difficulty,
                question: formData.question,
                options: options,
                subject: selectedSubject,
                topic: formData.topic,
                subTopic: formData.subTopic,
                correctAnswer: formData.correctAnswer
            };

            const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/questions`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'userId': user._id
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create question');
            }

            setSuccess('Question created successfully!');
            setFormData({
                difficulty: 'Easy',
                question: '',
                option1: '',
                option2: '',
                option3: '',
                option4: '',
                option5: '',
                topic: '',
                subTopic: '',
                correctAnswer: ''
            });

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setBulkFile(file);
        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

            if (data.length > 0) {
                const fileHeaders = data[0];
                setHeaders(fileHeaders);
                const rows = data.slice(1).filter(row => row.length > 0);
                setParsedData(rows);
                setBulkPreview(rows.slice(0, 5));

                const newMapping = { ...columnMapping };
                fileHeaders.forEach(header => {
                    const h = header.toString().toLowerCase();
                    if (h.includes('question')) newMapping.question = header;
                    if (h.includes('option 1') || h.includes('option1') || h.includes('a)')) newMapping.option1 = header;
                    if (h.includes('option 2') || h.includes('option2') || h.includes('b)')) newMapping.option2 = header;
                    if (h.includes('option 3') || h.includes('option3') || h.includes('c)')) newMapping.option3 = header;
                    if (h.includes('option 4') || h.includes('option4') || h.includes('d)')) newMapping.option4 = header;
                    if (h.includes('option 5') || h.includes('option5') || h.includes('e)')) newMapping.option5 = header;
                    if (h.includes('answer') || h.includes('correct')) newMapping.correctAnswer = header;
                    if (h.includes('difficulty') || h.includes('level')) newMapping.difficulty = header;
                    if (h.includes('topic') && !h.includes('sub')) newMapping.topic = header;
                    if (h.includes('sub') || h.includes('sub_topic') || h.includes('sub topic')) newMapping.subTopic = header;
                });
                setColumnMapping(newMapping);
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleBulkSubmit = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            if (!selectedSubject) throw new Error("Please select a Subject first from the dropdown above.");



            const requiredFields = ['question', 'option1', 'option2', 'option3', 'option4', 'correctAnswer'];
            for (const field of requiredFields) {
                if (!columnMapping[field]) throw new Error(`Please map the "${field}" column.`);
            }

            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (!user._id) throw new Error("You must be logged in as admin");

            const formattedQuestions = parsedData.map((row) => {
                const getVal = (field) => {
                    const index = headers.indexOf(columnMapping[field]);
                    return row[index] ? String(row[index]).trim() : '';
                };

                return {
                    question: getVal('question'),
                    options: [
                        getVal('option1'),
                        getVal('option2'),
                        getVal('option3'),
                        getVal('option4'),
                        getVal('option5')
                    ].filter(Boolean),
                    correctAnswer: getVal('correctAnswer'),
                    subject: selectedSubject,
                    difficulty: (() => {
                        const rawDiff = columnMapping['difficulty'] ? (getVal('difficulty') || defaultBulkDifficulty) : defaultBulkDifficulty;
                        if (!rawDiff) return 'Easy';
                        const lower = rawDiff.toLowerCase();
                        return lower.charAt(0).toUpperCase() + lower.slice(1);
                    })(),
                    topic: columnMapping['topic'] ? getVal('topic') : '',
                    subTopic: columnMapping['subTopic'] ? getVal('subTopic') : ''
                };
            });

            const validQuestions = formattedQuestions.filter(q => q.question && q.options.every(o => o));

            if (validQuestions.length === 0) throw new Error("No valid questions found to upload.");

            const BATCH_SIZE = 50;
            let totalUploaded = 0;
            const batches = [];

            for (let i = 0; i < validQuestions.length; i += BATCH_SIZE) {
                batches.push(validQuestions.slice(i, i + BATCH_SIZE));
            }

            for (let i = 0; i < batches.length; i++) {
                const batch = batches[i];

                const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/questions/bulk`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'userId': user._id
                    },
                    body: JSON.stringify({ questions: batch })
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || `Failed to upload batch ${i + 1}`);
                }

                totalUploaded += (data.count || 0);
            }

            setSuccess(`Successfully uploaded ${totalUploaded} questions!`);
            setBulkFile(null);
            setParsedData([]);
            setBulkPreview([]);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="max-w-5xl mx-auto pb-12">
            <div className="mb-8 flex items-center gap-4">
                <Link href="/admin" className="p-2 rounded-md hover:bg-slate-100 text-slate-500">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Add New Question</h1>
                    <p className="text-slate-500">Add a single question or upload in bulk</p>
                </div>
            </div>

            <div className="mb-6 space-y-4">
                <div className="bg-emerald-50/50 p-4 rounded-md border border-emerald-200">
                    <label className="block text-sm font-semibold text-slate-800 mb-2">Select Subject for Questions</label>
                    <div className="relative">
                        <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="w-full h-12 rounded-md border border-gray-200 px-4 pr-10 text-slate-700 font-medium bg-white focus:border-[#0ddc90] outline-none appearance-none cursor-pointer"
                        >
                            <option value="">-- Choose a Subject --</option>
                            {subjects.map(sub => (
                                <option key={sub._id} value={sub.name}>{sub.name}</option>
                            ))}
                        </select>
                        <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    </div>
                    <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                        <AlertCircle size={12} />
                        All questions added (Manual or Bulk) will be assigned to this subject. ID will be generated automatically.
                    </p>
                </div>

                <div className="flex bg-white p-1 rounded-md border border-gray-200 w-fit shadow-xs">
                    <button
                        onClick={() => setActiveTab('manual')}
                        className={`px-6 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'manual' ? 'bg-[#0ddc90] text-slate-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        <RefreshCw size={16} /> Manual Entry
                    </button>
                    <button
                        onClick={() => setActiveTab('bulk')}
                        className={`px-6 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'bulk' ? 'bg-[#0ddc90] text-slate-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        <Upload size={16} /> Bulk Upload
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-md p-8 border border-gray-200 shadow-xs">
                {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md text-sm font-medium flex items-center gap-2"><AlertCircle size={18} /> {error}</div>}
                {success && <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-md text-sm font-medium flex items-center gap-2"><CheckCircle size={18} /> {success}</div>}

                {activeTab === 'manual' && (
                    <form onSubmit={handleManualSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="difficulty" className="text-sm font-semibold text-slate-700">Difficulty</label>
                                <div className="flex bg-gray-50 p-1 rounded-md border border-gray-200">
                                    {['Easy', 'Medium', 'Hard'].map(level => (
                                        <button
                                            key={level}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, difficulty: level })}
                                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${formData.difficulty === level ? 'bg-white shadow-xs text-slate-800' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="topic" className="text-sm font-semibold text-slate-700">Topic (Optional)</label>
                                <input
                                    id="topic"
                                    type="text"
                                    value={formData.topic}
                                    onChange={handleChange}
                                    placeholder="e.g. Database Normalization"
                                    className="w-full h-12 rounded-md border border-gray-200 px-4 transition-colors focus:border-[#0ddc90] outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="subTopic" className="text-sm font-semibold text-slate-700">Sub Topic (Optional)</label>
                                <input
                                    id="subTopic"
                                    type="text"
                                    value={formData.subTopic}
                                    onChange={handleChange}
                                    placeholder="e.g. 3NF"
                                    className="w-full h-12 rounded-md border border-gray-200 px-4 transition-colors focus:border-[#0ddc90] outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="question" className="text-sm font-semibold text-slate-700">Question Text</label>
                            <textarea
                                id="question"
                                value={formData.question}
                                onChange={handleChange}
                                placeholder="Enter the question here..."
                                className="w-full h-32 rounded-md border border-gray-200 p-4 resize-none"
                                required
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-semibold text-slate-700">Options (Fill at least 4)</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {['option1', 'option2', 'option3', 'option4', 'option5'].map((opt, idx) => (
                                    <div key={opt} className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <input
                                            id={opt}
                                            type="text"
                                            value={formData[opt]}
                                            onChange={handleChange}
                                            placeholder={`Option ${idx + 1}${idx === 4 ? ' (Optional)' : ''}`}
                                            className={`w-full h-12 rounded-md border px-4 pl-12 transition-colors ${formData.correctAnswer === formData[opt] && formData[opt] ? 'border-emerald-500 bg-emerald-50/30' : 'border-gray-200'}`}
                                            required={idx < 4}
                                        />
                                        {formData[opt] && (
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, correctAnswer: formData[opt] })}
                                                className={`absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all ${formData.correctAnswer === formData[opt] ? 'bg-emerald-500 text-white shadow-sm' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                            >
                                                {formData.correctAnswer === formData[opt] ? 'Correct' : 'Mark Correct'}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {formData.correctAnswer === '' && <p className="text-xs text-red-400 font-medium ml-1">* Please mark one option as the correct answer</p>}
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading || !formData.correctAnswer}
                                className="h-12 px-8 rounded-md bg-[#0ddc90] text-slate-900 font-semibold hover:bg-[#0bc07d] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Save size={18} />
                                {loading ? 'Saving Question...' : 'Save Question'}
                            </button>
                        </div>
                    </form>
                )}

                {activeTab === 'bulk' && (
                    <div className="space-y-8">
                        <div className="border-2 border-dashed border-gray-200 rounded-md p-8 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors">
                            <input
                                type="file"
                                accept=".csv, .xlsx, .xls"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="bulkUpload"
                            />
                            <label htmlFor="bulkUpload" className="cursor-pointer flex flex-col items-center">
                                <FileSpreadsheet className="w-12 h-12 text-gray-300 mb-4" />
                                <p className="text-lg font-semibold text-gray-700">Click to upload CSV or Excel</p>
                                <p className="text-sm text-gray-400 mt-1">Supports .xlsx, .xls, .csv</p>
                            </label>
                            {bulkFile && (
                                <div className="mt-4 p-2 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-md inline-block">
                                    Selected: {bulkFile.name}
                                </div>
                            )}
                        </div>

                        <div className="bg-emerald-50/50 p-4 rounded-md border border-emerald-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div>
                                <h4 className="font-semibold text-slate-800 text-sm">Default Difficulty</h4>
                                <p className="text-xs text-gray-500">Used if &quot;Difficulty&quot; column is not mapped or empty.</p>
                            </div>
                            <div className="flex bg-white p-1 rounded-md border border-emerald-200">
                                {['Easy', 'Medium', 'Hard'].map(level => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => setDefaultBulkDifficulty(level)}
                                        className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${defaultBulkDifficulty === level ? 'bg-[#0ddc90] text-slate-900 shadow-xs' : 'text-gray-500 hover:bg-gray-50'}`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {parsedData.length > 0 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                                <div>
                                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Map Columns</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {Object.keys(columnMapping).map((key) => (
                                            <div key={key} className="space-y-1">
                                                <label className="text-xs font-semibold text-gray-500 uppercase">{key}</label>
                                                <select
                                                    value={columnMapping[key]}
                                                    onChange={(e) => setColumnMapping({ ...columnMapping, [key]: e.target.value })}
                                                    className="w-full h-10 rounded-md border border-gray-200 px-2 text-sm bg-white"
                                                >
                                                    <option value="">Select Column</option>
                                                    {headers.map((h, i) => (
                                                        <option key={i} value={h}>{h}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="border border-gray-200 rounded-md overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 font-semibold text-sm text-gray-700">Preview (First 5 Rows)</div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm whitespace-nowrap">
                                            <thead className="bg-white">
                                                <tr>
                                                    {headers.map((h, i) => <th key={i} className="px-4 py-2 font-medium text-gray-500 border-b border-gray-100">{h}</th>)}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {bulkPreview.map((row, i) => (
                                                    <tr key={i} className="even:bg-gray-50/50">
                                                        {row.map((cell, j) => (
                                                            <td key={j} className="px-4 py-2 text-gray-600 border-b border-gray-100">{cell}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button
                                        onClick={handleBulkSubmit}
                                        disabled={loading}
                                        className="h-12 px-8 rounded-md bg-[#0ddc90] text-slate-900 font-semibold hover:bg-[#0bc07d] transition-all disabled:opacity-50 flex items-center gap-2"
                                    >
                                        <Upload size={18} />
                                        {loading ? 'Uploading...' : `Upload ${parsedData.length} Questions`}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div >
    );
}
