import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import {
  createOrJoinOrganisation,
  getOrganisationForUser
} from "@/lib/organisations";
import { getEmailDomain } from "@/lib/org";

function validateOrganisationName(value: unknown) {
  if (typeof value !== "string") {
    throw new Error("Organisation name is required.");
  }

  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error("Organisation name is required.");
  }

  if (trimmed.length > 120) {
    throw new Error("Organisation name is too long.");
  }

  return trimmed;
}

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const organisation = await getOrganisationForUser(user.email);

  return NextResponse.json({
    domain: getEmailDomain(user.email),
    organisation
  });
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const organisationName = validateOrganisationName(body.name);
    const result = await createOrJoinOrganisation(user, organisationName);

    return NextResponse.json(result, { status: result.action === "created" ? 201 : 200 });
  } catch (caughtError) {
    const message =
      caughtError instanceof Error ? caughtError.message : "Organisation setup failed.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
