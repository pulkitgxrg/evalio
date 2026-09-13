"use client";
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useVerifyEmail } from '@/hooks/useAuth';

export default function VerifyEmail() {
    const { token } = useParams();
    const { isPending, isError, data, error } = useVerifyEmail(token);

    const status = isPending ? 'verifying' : isError ? 'error' : 'success';
    const message = isError
        ? (error?.message || 'Verification failed. Invalid or expired token.')
        : (data?.message || 'Email verified successfully!');

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="text-center">
                    {status === 'verifying' && (
                        <>
                            <div className="mx-auto h-12 w-12 text-[#0a3a30]">
                                <svg className="animate-spin h-12 w-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                            <h2 className="mt-6 text-3xl font-bold text-[#0a3a30]">Verifying...</h2>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100">
                                <svg className="h-8 w-8 text-[#0a3a30]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <h2 className="mt-6 text-3xl font-bold text-[#0a3a30]">Verified!</h2>
                            <p className="mt-2 text-sm text-gray-600">{message}</p>
                            <div className="mt-6">
                                <Link href="/login" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#0a3a30] hover:bg-[#022c22] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0a3a30] transition-all hover:-translate-y-0.5">
                                    Go to Login
                                </Link>
                            </div>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-50">
                                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </div>
                            <h2 className="mt-6 text-3xl font-bold text-[#0a3a30]">Verification Failed</h2>
                            <p className="mt-2 text-sm text-gray-600">{message}</p>
                            <div className="mt-6">
                                <Link href="/login" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#0a3a30] hover:bg-[#022c22] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0a3a30] transition-all hover:-translate-y-0.5">
                                    Back to Login
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
