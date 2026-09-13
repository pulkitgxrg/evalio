import Link from "next/link";

export const metadata = {
  title: "Page Not Found | Evalio - 404 Error",
  description: "The page you're looking for on Evalio could not be found. Please return to the homepage or contact support if you need assistance.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-6 py-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald-300/35 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-teal-300/30 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-200/70" />
      </div>

      <section className="relative w-full max-w-2xl rounded-3xl border border-emerald-100 bg-white/90 p-10 shadow-xl backdrop-blur-sm">
        <p className="mb-3 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold tracking-wider text-emerald-700">
          ERROR 404
        </p>

        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          This page does not exist.
        </h1>

        <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
          The page may have been moved, deleted, or the URL might be incorrect.
          You can go back to the homepage or open your dashboard.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Go to Home
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Open Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
