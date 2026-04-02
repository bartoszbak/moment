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

export default function AnimationsDevPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,hsl(var(--muted))_0%,transparent_42%),hsl(var(--background))] px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl flex-col justify-center gap-6">
        <PageReveal delay={0.06}>
          <div className="flex flex-col gap-4">
            <Badge variant="outline" className="w-fit">
              Animations Dev
            </Badge>
            <h1 className="max-w-3xl text-5xl leading-tight font-semibold tracking-tight text-balance">
              Route motion should feel like the page is being revealed, not blinked.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              This page exists to tune transition timing and reveal distance without animating already-visible content.
            </p>
          </div>
        </PageReveal>

        <div className="grid gap-6 md:grid-cols-3">
          <PageReveal delay={0.12}>
            <Card className="h-full shadow-xl">
              <CardHeader>
                <CardTitle>Overlay wipe</CardTitle>
                <CardDescription>Route changes animate a separate layer, not the live page tree.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">
                That keeps typography stable while sections reveal underneath the transition layer.
              </CardContent>
            </Card>
          </PageReveal>

          <PageReveal delay={0.18}>
            <Card className="h-full shadow-xl">
              <CardHeader>
                <CardTitle>Staggered reveal</CardTitle>
                <CardDescription>Page sections enter with a short ease-out and small vertical travel.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">
                The effect is visible after navigation, but absent on the first load.
              </CardContent>
            </Card>
          </PageReveal>

          <PageReveal delay={0.24}>
            <Card className="h-full shadow-xl">
              <CardHeader>
                <CardTitle>No blur</CardTitle>
                <CardDescription>The transition uses only transform and opacity-safe motion.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">
                No full-page filter effects, no soft text, and no hydration replay.
              </CardContent>
            </Card>
          </PageReveal>
        </div>

        <PageReveal delay={0.3}>
          <div className="flex flex-wrap gap-3">
            <Button nativeButton={false} render={<Link href="/" />}>
              Test home
            </Button>
            <Button variant="outline" nativeButton={false} render={<Link href="/onboarding" />}>
              Test onboarding
            </Button>
            <Button variant="outline" nativeButton={false} render={<Link href="/login" />}>
              Test login
            </Button>
          </div>
        </PageReveal>
      </div>
    </main>
  );
}
