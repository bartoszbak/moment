import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { PageReveal } from "@/components/layout/page-reveal";
import { requireSessionUser } from "@/lib/auth";
import { ensureOrganisationAccess } from "@/lib/organisations";
import { prisma } from "@/lib/prisma";

type WallPageProps = {
  params: Promise<{ orgSlug: string }>;
};

export default async function WallPage({ params }: WallPageProps) {
  const { orgSlug } = await params;
  const user = await requireSessionUser();
  const access = await ensureOrganisationAccess(user, orgSlug);

  if (!access?.organisation || !access.member) {
    redirect("/onboarding");
  }

  const photos = await prisma.photo.findMany({
    where: {
      orgId: access.organisation.id
    },
    include: {
      member: true
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 12
  });

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,hsl(var(--muted))_0%,transparent_42%),hsl(var(--background))] px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <PageReveal delay={0.08}>
          <Card className="border-border/70 bg-card/95 shadow-lg">
            <CardHeader className="gap-3">
              <Badge variant="outline" className="w-fit">
                Shared wall
              </Badge>
              <CardTitle className="text-4xl tracking-tight sm:text-5xl">
                {access.organisation.name}
              </CardTitle>
              <CardDescription>
                Signed in as <span className="font-medium text-foreground">{user.email}</span>. The infinite canvas is still the next phase, but the org-gated wall route is now live.
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                {photos.length} photo{photos.length === 1 ? "" : "s"} currently on the wall.
              </p>
              <Button nativeButton={false} render={<Link href={`/${orgSlug}/capture`} />}>
                Add your photo
              </Button>
            </CardFooter>
          </Card>
        </PageReveal>

        <PageReveal delay={0.16}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {photos.length > 0 ? (
              photos.map((photo) => (
                <Card key={photo.id} className="overflow-hidden shadow-lg">
                  <div className="aspect-[4/3] bg-muted">
                    <img
                      src={photo.url}
                      alt={`${photo.memberName}'s portrait`}
                      className="size-full object-cover"
                    />
                  </div>
                  <CardContent className="flex flex-col gap-2 pt-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{photo.memberName}</p>
                      <Badge variant="secondary">{photo.team}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {photo.member.email}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
                <CardContent className="flex flex-col gap-4 py-10">
                  <p className="text-lg font-medium">No portraits yet</p>
                  <p className="text-sm text-muted-foreground">
                    Start the wall by capturing the first team photo for this organisation.
                  </p>
                  <div>
                    <Button nativeButton={false} render={<Link href={`/${orgSlug}/capture`} />}>
                      Open capture flow
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </PageReveal>
      </div>
    </main>
  );
}
