import Link from "next/link";
import { redirect } from "next/navigation";
import { signOutToLogin } from "@/app/(auth)/login/actions";
import { PageReveal } from "@/components/layout/page-reveal";
import { OrganisationOnboardingForm } from "@/components/onboarding/OrganisationOnboardingForm";
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
import { Separator } from "@/components/ui/separator";
import { requireSessionUser } from "@/lib/auth";
import { getOrganisationForUser } from "@/lib/organisations";
import { getEmailDomain } from "@/lib/org";

function getDefaultOrganisationName(domain: string) {
  const [label] = domain.split(".");

  return label
    ?.split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || "My Organisation";
}

export default async function OnboardingPage() {
  const user = await requireSessionUser();
  const organisation = await getOrganisationForUser(user.email);

  if (organisation) {
    redirect(`/${organisation.slug}/wall`);
  }

  const domain = getEmailDomain(user.email);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,hsl(var(--muted))_0%,transparent_42%),hsl(var(--background))] px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-2xl items-center justify-center">
        <PageReveal delay={0.1} distance={20} className="w-full">
          <Card className="w-full shadow-xl">
            <CardHeader className="gap-3">
              <Badge variant="secondary" className="w-fit">
                Onboarding
              </Badge>
              <CardTitle>Create or join your organisation</CardTitle>
              <CardDescription>
                Signed in as <span className="font-medium text-foreground">{user.email}</span>. No organisation exists for this domain yet, so you can create the first one now.
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="flex flex-col gap-4 pt-4">
              <Alert>
                <AlertTitle>Domain-gated access</AlertTitle>
                <AlertDescription>
                  Everyone who signs in with <span className="font-medium text-foreground">@{domain}</span> will automatically join this organisation as a member.
                </AlertDescription>
              </Alert>
              <OrganisationOnboardingForm
                defaultName={getDefaultOrganisationName(domain)}
                domain={domain}
              />
            </CardContent>
            <CardFooter className="justify-between gap-3">
              <Button variant="outline" nativeButton={false} render={<Link href="/" />}>
                Back home
              </Button>
              <form action={signOutToLogin}>
                <Button type="submit">Switch account</Button>
              </form>
            </CardFooter>
          </Card>
        </PageReveal>
      </div>
    </main>
  );
}
