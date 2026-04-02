"use client";

import { FormEvent, useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const TEAM_SUGGESTIONS = [
  "Engineering",
  "Design",
  "Product",
  "Operations",
  "Marketing",
  "Sales",
  "Support",
  "People"
];

type PhotoFormProps = {
  imageDataUrl: string;
  orgSlug: string;
  defaultName?: string;
};

export function PhotoForm({ imageDataUrl, orgSlug, defaultName = "" }: PhotoFormProps) {
  const router = useRouter();
  const datalistId = useId();

  const [memberName, setMemberName] = useState(defaultName);
  const [team, setTeam] = useState(TEAM_SUGGESTIONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggestedTeams = useMemo(() => {
    const normalized = team.trim().toLowerCase();

    if (!normalized) {
      return TEAM_SUGGESTIONS;
    }

    return TEAM_SUGGESTIONS.filter((item) => item.toLowerCase().includes(normalized));
  }, [team]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/photos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          imageDataUrl,
          memberName,
          orgSlug,
          team
        })
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Photo upload failed.");
      }

      router.push(`/${orgSlug}/wall`);
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Photo upload failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <Card className="shadow-lg">
        <CardHeader className="gap-3">
          <Badge variant="outline" className="w-fit">
            Step 3
          </Badge>
          <CardTitle>Add your details</CardTitle>
          <CardDescription className="max-w-xl">
            Your Google session already identifies you. Add the display name and team label that should appear on the wall card.
          </CardDescription>
        </CardHeader>
        <Separator />
        <form onSubmit={handleSubmit}>
          <CardContent className="pt-4">
            <FieldSet>
              <FieldLegend variant="label">Member details</FieldLegend>
              <FieldDescription>
                These values are saved with the photo card that will appear on the wall.
              </FieldDescription>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="memberName">Display name</FieldLabel>
                  <Input
                    id="memberName"
                    type="text"
                    required
                    maxLength={80}
                    autoComplete="name"
                    value={memberName}
                    onChange={(event) => setMemberName(event.target.value)}
                    placeholder="Bartosz Bak"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="team">Team</FieldLabel>
                  <Input
                    id="team"
                    type="text"
                    required
                    maxLength={80}
                    list={datalistId}
                    value={team}
                    onChange={(event) => setTeam(event.target.value)}
                    placeholder="Engineering"
                  />
                  <datalist id={datalistId}>
                    {TEAM_SUGGESTIONS.map((item) => (
                      <option key={item} value={item} />
                    ))}
                  </datalist>
                  <FieldDescription>
                    Pick a common team, or type your own if it is not listed.
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel>Quick team pick</FieldLabel>
                  <ToggleGroup
                    multiple={false}
                    variant="outline"
                    value={team ? [team] : []}
                    onValueChange={(value) => {
                      const nextValue = value[0];

                      if (nextValue) {
                        setTeam(nextValue);
                      }
                    }}
                    className="flex w-full flex-wrap gap-2"
                    spacing={2}
                  >
                    {suggestedTeams.map((item) => (
                      <ToggleGroupItem key={item} value={item}>
                        {item}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </Field>

                <Field>
                  <FieldError>{error}</FieldError>
                </Field>
              </FieldGroup>
            </FieldSet>

            {error ? (
              <Alert variant="destructive" className="mt-5">
                <AlertTitle>Upload failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
          </CardContent>
          <CardFooter className="justify-between gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Posting photo..." : "Post to wall"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Your photo will be uploaded and placed on the shared canvas.
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
