export default function CapturePage({ params }: { params: { orgSlug: string } }) {
  return (
    <main className="p-6">
      <h1 className="text-3xl font-semibold">Capture for {params.orgSlug}</h1>
      <p className="mt-2 text-slate-600">Camera capture flow placeholder.</p>
    </main>
  );
}
