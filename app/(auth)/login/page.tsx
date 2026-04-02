import Link from "next/link";
import { redirect } from "next/navigation";
import { signInWithGoogle } from "@/app/(auth)/login/actions";
import { PageReveal } from "@/components/layout/page-reveal";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { getSessionUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getSessionUser();

  if (user) {
    redirect("/onboarding");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,hsl(var(--muted))_0%,transparent_45%),hsl(var(--background))] px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl items-center justify-center">
        <PageReveal delay={0.1} distance={20} className="w-full">
          <Card className="w-full shadow-xl">
            <CardHeader className="gap-3">
              <Badge variant="outline" className="w-fit">
                Login
              </Badge>
              <CardTitle>Sign in with your work Google account</CardTitle>
              <CardDescription>
                We use your Google email domain to find an existing organisation or route you into setup.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Alert>
                <AlertTitle>What happens next</AlertTitle>
                <AlertDescription>
                  If your domain already matches an organisation, you will be auto-joined and sent to that wall. Otherwise you will create the organisation first.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="justify-between gap-3">
              <Button variant="outline" nativeButton={false} render={<Link href="/" />}>
                Back home
              </Button>
              <form action={signInWithGoogle}>
                <Button type="submit">Continue with Google</Button>
              </form>
            </CardFooter>
          </Card>
        </PageReveal>
      </div>
    </main>
  );
}
