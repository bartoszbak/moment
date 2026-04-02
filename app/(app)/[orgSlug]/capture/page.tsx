import { redirect } from "next/navigation";
import { CaptureFlow } from "@/components/capture/CaptureFlow";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSessionUser } from "@/lib/auth";
import { ensureOrganisationAccess } from "@/lib/organisations";

type CapturePageProps = {
  params: Promise<{ orgSlug: string }>;
};

export default async function CapturePage({ params }: CapturePageProps) {
  const { orgSlug } = await params;
  const user = await requireSessionUser();
  const access = await ensureOrganisationAccess(user, orgSlug);

  if (!access?.organisation || !access.member) {
    redirect("/onboarding");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,hsl(var(--muted))_0%,transparent_45%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--muted)/0.3)_100%)] px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <Card className="border-border/70 bg-card/95 shadow-lg">
          <CardHeader className="gap-3">
            <Badge variant="outline" className="w-fit">
              Capture
            </Badge>
            <CardTitle className="text-4xl tracking-tight sm:text-5xl">
              Create the card that lands on <span className="text-primary">{orgSlug}</span>&apos;s wall.
            </CardTitle>
          </CardHeader>
          <CardContent className="max-w-3xl text-base leading-7 text-muted-foreground">
            Snap your photo, review it, and add the details that will appear on the shared team canvas.
          </CardContent>
        </Card>

        <CaptureFlow orgSlug={orgSlug} defaultName={access.member.name ?? user.name ?? ""} />
      </div>
    </main>
  );
}
