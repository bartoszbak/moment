type WallPageProps = {
  params: Promise<{ orgSlug: string }>;
};

export default async function WallPage({ params }: WallPageProps) {
  const { orgSlug } = await params;

  return (
    <main className="p-6">
      <h1 className="text-3xl font-semibold">{orgSlug} wall</h1>
      <p className="mt-2 text-slate-600">Infinite wall UI placeholder.</p>
    </main>
  );
}
