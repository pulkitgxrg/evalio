"use client";
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { useCurrentUser, useLogoutMutation } from '@/hooks/useAuth';

export default function LandingNavbar() {
  const { data: user, isPending: loading } = useCurrentUser({ retry: false });
  const logoutMutation = useLogoutMutation();
  const loggingOut = logoutMutation.isPending;

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      },
    });
  };

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-6xl z-50 bg-white/90 backdrop-blur-xl border border-white shadow-[0_8px_30px_-15px_rgba(0,0,0,0.12)] rounded-full">
      <div className="px-6 md:px-8 h-16 md:h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-2xl font-black tracking-[-0.04em] text-slate-900 hover:opacity-80 transition-opacity">
            Evalio.
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:block h-10 w-20 rounded-full bg-slate-200/80 animate-pulse" />
              <div className="h-10 w-24 rounded-full bg-slate-200/80 animate-pulse" />
            </div>
          ) : user ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-[#0ddc90] text-slate-900 flex items-center justify-center font-bold text-sm">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:inline">{user.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100/80 hover:bg-slate-200 rounded-full transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loggingOut ? (
                  <span className="h-4 w-4 rounded bg-slate-300 animate-pulse" />
                ) : (
                  <LogOut size={16} />
                )}
                <span className="hidden sm:inline">{loggingOut ? 'Logging out' : 'Logout'}</span>
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden sm:block px-4 py-2 text-[15px] font-semibold text-slate-700 hover:text-slate-900 transition-colors">Log in</Link>
              <Link href="/signup" className="px-6 py-2.5 text-[15px] font-bold text-slate-900 bg-[#0ddc90] rounded-full hover:bg-[#0bc07d] transition-all shadow-sm">
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
