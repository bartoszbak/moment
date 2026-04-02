import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { PageReveal } from "@/components/layout/page-reveal";
import { InfiniteCanvas } from "@/components/wall/infinite-canvas";
import { type WallPhoto } from "@/components/wall/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { requireSessionUser } from "@/lib/auth";
import { ensureOrganisationAccess } from "@/lib/organisations";
import { prisma } from "@/lib/prisma";
import { getChunkBounds } from "@/lib/wall";

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

  const initialBounds = getChunkBounds(0, 0);
  const [photos, teamRows, totalCount] = await prisma.$transaction([
    prisma.photo.findMany({
      where: {
        orgId: access.organisation.id,
        x: {
          gte: initialBounds.minX,
          lt: initialBounds.maxX
        },
        y: {
          gte: initialBounds.minY,
          lt: initialBounds.maxY
        }
      },
      include: {
        member: true
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 200
    }),
    prisma.photo.findMany({
      where: {
        orgId: access.organisation.id
      },
      distinct: ["team"],
      orderBy: {
        team: "asc"
      },
      select: {
        team: true
      }
    }),
    prisma.photo.count({
      where: {
        orgId: access.organisation.id
      }
    })
  ]);

  const wallPhotos: WallPhoto[] = photos.map((photo) => ({
    id: photo.id,
    url: photo.url,
    memberName: photo.memberName,
    team: photo.team,
    x: photo.x,
    y: photo.y,
    createdAt: photo.createdAt.toISOString(),
    memberEmail: photo.member.email
  }));
  const captureHref = `/${orgSlug}/capture` as Route;

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
                Signed in as <span className="font-medium text-foreground">{user.email}</span>. This wall now loads by viewport chunk, with on-demand fetching as you pan and zoom through the organisation canvas.
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                {totalCount} portrait{totalCount === 1 ? "" : "s"} currently on the wall.
              </p>
              <Button nativeButton={false} render={<Link href={captureHref} />}>
                Add your photo
              </Button>
            </CardFooter>
          </Card>
        </PageReveal>

        <PageReveal delay={0.16}>
          <InfiniteCanvas
            captureHref={captureHref}
            initialPhotos={wallPhotos}
            orgSlug={orgSlug}
            teams={teamRows.map((row) => row.team)}
            totalCount={totalCount}
          />
        </PageReveal>
      </div>
    </main>
  );
}
