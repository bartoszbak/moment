import Link from "next/link";
import { PageReveal } from "@/components/layout/page-reveal";
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
import { Separator } from "@/components/ui/separator";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,hsl(var(--muted))_0%,transparent_38%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--muted)/0.35)_100%)] px-6 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,28rem)]">
        <PageReveal delay={0.08}>
          <section className="flex flex-col gap-6">
            <Badge variant="outline" className="w-fit">
              Async team photo wall
            </Badge>
            <div className="flex flex-col gap-4">
              <h1 className="max-w-3xl text-5xl leading-tight font-semibold tracking-tight text-balance sm:text-6xl">
                Show up on the company wall without forcing everyone into the same room.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Faces is built for remote teams: sign in with your work account, take your portrait, and drop it onto a shared wall your whole organisation can explore.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" nativeButton={false} render={<Link href="/login" />}>
                Sign in with Google
              </Button>
              <Button variant="outline" size="lg" nativeButton={false} render={<Link href="/onboarding" />}>
                Preview onboarding
              </Button>
            </div>
          </section>
        </PageReveal>

        <PageReveal delay={0.16} distance={24}>
          <Card className="border-border/70 bg-card/95 shadow-xl">
            <CardHeader className="gap-3">
              <Badge variant="secondary" className="w-fit">
                Frontend refresh
              </Badge>
              <CardTitle>Now using official shadcn/ui primitives</CardTitle>
              <CardDescription>
                The app shell is now aligned to the shadcn/ui project structure, and the remaining screens will build on the same component set.
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="flex flex-col gap-4 pt-4">
              <div className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/50 px-3 py-2">
                <span className="text-sm text-muted-foreground">Capture flow</span>
                <Badge>Live</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/50 px-3 py-2">
                <span className="text-sm text-muted-foreground">Google auth</span>
                <Badge variant="outline">Next</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/50 px-3 py-2">
                <span className="text-sm text-muted-foreground">Infinite wall</span>
                <Badge variant="outline">Planned</Badge>
              </div>
            </CardContent>
            <CardFooter className="justify-between gap-3">
              <span className="text-sm text-muted-foreground">Build the wall after auth and org onboarding exist.</span>
              <Button variant="outline" nativeButton={false} render={<Link href="/login" />}>
                Continue
              </Button>
            </CardFooter>
          </Card>
        </PageReveal>
      </div>
    </main>
  );
}
