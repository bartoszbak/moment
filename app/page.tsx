import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Faces</h1>
      <p className="text-slate-600">Sign in with your work Google account to join your organisation's photo wall.</p>
      <Link href="/login" className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
        Sign in with Google
      </Link>
    </main>
  );
}
