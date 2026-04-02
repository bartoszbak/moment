"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { slugifyOrganisationName } from "@/lib/org";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type OrganisationOnboardingFormProps = {
  defaultName: string;
  domain: string;
};

export function OrganisationOnboardingForm({
  defaultName,
  domain
}: OrganisationOnboardingFormProps) {
  const router = useRouter();
  const [organisationName, setOrganisationName] = useState(defaultName);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const slugPreview = useMemo(() => slugifyOrganisationName(organisationName), [organisationName]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orgs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: organisationName
        })
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string; organisation?: { slug: string } }
        | null;

      if (!response.ok || !payload?.organisation?.slug) {
        throw new Error(payload?.error ?? "Organisation setup failed.");
      }

      router.push(`/${payload.organisation.slug}/wall`);
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Organisation setup failed."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <FieldSet>
        <FieldLegend variant="label">Organisation setup</FieldLegend>
        <FieldDescription>
          Your Google Workspace domain decides who can join this organisation.
        </FieldDescription>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="organisationName">Organisation name</FieldLabel>
            <Input
              id="organisationName"
              required
              maxLength={120}
              autoComplete="organization"
              value={organisationName}
              onChange={(event) => setOrganisationName(event.target.value)}
              placeholder="Acme Corp"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="domain">Google Workspace domain</FieldLabel>
            <Input id="domain" value={domain} readOnly disabled />
            <FieldDescription>
              Only people signing in with <span className="font-medium text-foreground">@{domain}</span> can access this wall.
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="slugPreview">Wall slug preview</FieldLabel>
            <Input
              id="slugPreview"
              value={slugPreview ? `/${slugPreview}/wall` : ""}
              readOnly
              disabled
            />
            <FieldDescription>
              The slug is generated from the organisation name and made unique automatically.
            </FieldDescription>
          </Field>

          <Field>
            <FieldError>{error}</FieldError>
          </Field>
        </FieldGroup>
      </FieldSet>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Organisation setup failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Creating the organisation also makes you the initial owner.
        </p>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating organisation..." : "Create organisation"}
        </Button>
      </div>
    </form>
  );
}
