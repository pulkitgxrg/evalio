"use client";
import { useState } from 'react';
import { Mail, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSubmitContactMutation } from '@/hooks/useContact';

export default function HelpPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Help Center</h1>

            <div className="bg-white rounded-lg shadow-xs border border-gray-200 p-6 md:p-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                    Frequently Asked Questions
                </h2>
                <div className="space-y-3">
                    <FAQItem
                        question="How do I access my past test results?"
                        answer="You can view all your past test attempts, scores, and detailed analysis in the 'History' tab from the sidebar."
                    />
                    <FAQItem
                        question="What happens if I lose internet connection during a test?"
                        answer="Don't worry! Your progress is saved locally. Once your connection is restored, you can resume from where you left off. However, the timer will continue to run."
                    />
                    <FAQItem
                        question="Can I retake a test?"
                        answer="Yes, you can attempt practice tests multiple times. However, specific scheduled exams may have a limit on the number of attempts allowed."
                    />
                    <FAQItem
                        question="How is my performance score calculated?"
                        answer="Your score is based on the number of correct answers. Some tests may also have negative marking as specified in the test instructions."
                    />
                </div>
            </div>

            <ContactForm />
        </div>
    );
}

function FAQItem({ question, answer }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-gray-200 rounded-md overflow-hidden bg-white">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
            >
                <span className="font-medium text-sm text-slate-700">{question}</span>
                {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </button>
            {isOpen && (
                <div className="p-4 pt-0 text-slate-500 text-sm leading-relaxed">
                    {answer}
                </div>
            )}
        </div>
    );
}

function ContactForm() {
    const [formData, setFormData] = useState({
        subject: '',
        message: ''
    });
    const contactMutation = useSubmitContactMutation();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await contactMutation.mutateAsync(formData);
            setFormData({ subject: '', message: '' });
        } catch {
            // surfaced via contactMutation.error below
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-xs border border-gray-200 p-6 md:p-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-1 flex items-center gap-2">
                <Mail size={20} className="text-slate-500" /> Contact Admin
            </h2>
            <p className="text-slate-500 mb-6 text-sm">Have a query that&apos;s not answered above? Send us a message directly.</p>

            {contactMutation.isSuccess ? (
                <div className="bg-[#f6fdff] border border-[#0ddc90]/20 rounded-md p-6 text-center">
                    <div className="w-10 h-10 bg-[#0ddc90]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Send size={16} className="text-[#0ddc90]" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 mb-1">Message Sent!</h3>
                    <p className="text-[#0ddc90] text-sm">We have received your query and will get back to you shortly.</p>
                    <button
                        onClick={() => contactMutation.reset()}
                        className="mt-4 text-sm font-medium text-blue-700 hover:text-blue-800 underline"
                    >
                        Send another message
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g., Issue with Test #123"
                            value={formData.subject}
                            onChange={e => setFormData({ ...formData, subject: e.target.value })}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
                        <textarea
                            required
                            rows={5}
                            placeholder="Describe your issue or query in detail..."
                            value={formData.message}
                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none text-sm"
                        ></textarea>
                    </div>

                    {contactMutation.isError && (
                        <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm border border-red-100">
                            {contactMutation.error?.message || "Something went wrong. Please try again."}
                        </div>
                    )}

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={contactMutation.isPending}
                            className="px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-md shadow-xs hover:bg-blue-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {contactMutation.isPending ? 'Sending...' : (
                                <>
                                    Send Message <Send size={14} />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
