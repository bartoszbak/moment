import { CaptureFlow } from "@/components/capture/CaptureFlow";

type CapturePageProps = {
  params: Promise<{ orgSlug: string }>;
  searchParams?: Promise<{ email?: string; name?: string }>;
};

export default async function CapturePage({ params, searchParams }: CapturePageProps) {
  const { orgSlug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#f8fafc_45%,#eef2ff_100%)] px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-700">Faces capture</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Create the card that lands on <span className="text-sky-700">{orgSlug}</span>&apos;s wall.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Snap your photo, review it, and add the details that will appear on the shared team canvas.
          </p>
        </div>

        <CaptureFlow
          orgSlug={orgSlug}
          defaultEmail={resolvedSearchParams?.email}
          defaultName={resolvedSearchParams?.name}
        />
      </div>
    </main>
  );
}
