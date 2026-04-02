export default function WallPage({ params }: { params: { orgSlug: string } }) {
  return (
    <main className="p-6">
      <h1 className="text-3xl font-semibold">{params.orgSlug} wall</h1>
      <p className="mt-2 text-slate-600">Infinite wall UI placeholder.</p>
    </main>
  );
}
