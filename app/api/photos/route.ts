import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEmailDomain } from "@/lib/org";
import { uploadImageDataUrl } from "@/lib/cloudinary";

const MAX_IMAGE_DATA_URL_LENGTH = 14_000_000;

function getCanvasPosition(index: number) {
  if (index === 0) {
    return { x: 0, y: 0 };
  }

  const cellSize = 320;
  const ring = Math.ceil((Math.sqrt(index + 1) - 1) / 2);
  const sideLength = ring * 2;
  const maxValue = (ring * 2 + 1) ** 2 - 1;
  const offset = maxValue - index;
  const side = Math.floor(offset / sideLength);
  const position = offset % sideLength;

  if (side === 0) {
    return { x: ring * cellSize, y: (-ring + position) * cellSize };
  }

  if (side === 1) {
    return { x: (ring - position) * cellSize, y: ring * cellSize };
  }

  if (side === 2) {
    return { x: -ring * cellSize, y: (ring - position) * cellSize };
  }

  return { x: (-ring + position) * cellSize, y: -ring * cellSize };
}

function validateRequiredString(value: unknown, fieldName: string, maxLength: number) {
  if (typeof value !== "string") {
    throw new Error(`${fieldName} is required.`);
  }

  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error(`${fieldName} is required.`);
  }

  if (trimmed.length > maxLength) {
    throw new Error(`${fieldName} is too long.`);
  }

  return trimmed;
}

export async function GET(request: NextRequest) {
  const orgSlug = request.nextUrl.searchParams.get("orgSlug");

  if (!orgSlug) {
    return NextResponse.json({ error: "orgSlug is required." }, { status: 400 });
  }

  const photos = await prisma.photo.findMany({
    where: {
      org: {
        slug: orgSlug
      }
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 100
  });

  return NextResponse.json({ photos });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const orgSlug = validateRequiredString(body.orgSlug, "orgSlug", 120);
    const email = validateRequiredString(body.email, "email", 320).toLowerCase();
    const memberName = validateRequiredString(body.memberName, "memberName", 80);
    const team = validateRequiredString(body.team, "team", 80);
    const imageDataUrl = validateRequiredString(body.imageDataUrl, "imageDataUrl", MAX_IMAGE_DATA_URL_LENGTH);

    if (!imageDataUrl.startsWith("data:image/")) {
      return NextResponse.json({ error: "imageDataUrl must be a valid image data URL." }, { status: 400 });
    }

    const organisation = await prisma.organisation.findUnique({
      where: {
        slug: orgSlug
      }
    });

    if (!organisation) {
      return NextResponse.json({ error: "Organisation not found." }, { status: 404 });
    }

    const emailDomain = getEmailDomain(email);

    if (emailDomain !== organisation.domain) {
      return NextResponse.json(
        { error: `Email domain must match ${organisation.domain}.` },
        { status: 403 }
      );
    }

    const existingMember = await prisma.member.findUnique({
      where: {
        email
      }
    });

    if (existingMember && existingMember.orgId !== organisation.id) {
      return NextResponse.json(
        { error: "This email address already belongs to another organisation." },
        { status: 409 }
      );
    }

    const uploadedUrl = await uploadImageDataUrl(imageDataUrl);

    const [member, photoCount] = await prisma.$transaction([
      prisma.member.upsert({
        where: {
          email
        },
        update: {
          name: memberName
        },
        create: {
          email,
          name: memberName,
          orgId: organisation.id
        }
      }),
      prisma.photo.count({
        where: {
          orgId: organisation.id
        }
      })
    ]);

    const { x, y } = getCanvasPosition(photoCount);

    const photo = await prisma.photo.create({
      data: {
        memberId: member.id,
        memberName,
        orgId: organisation.id,
        team,
        url: uploadedUrl,
        x,
        y
      }
    });

    return NextResponse.json({ photo }, { status: 201 });
  } catch (caughtError) {
    const message = caughtError instanceof Error ? caughtError.message : "Photo create failed.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
