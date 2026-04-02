import { Role } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { getEmailDomain, slugifyOrganisationName } from "@/lib/org";

type Identity = {
  email: string;
  name: string | null;
};

export async function getOrganisationByDomain(domain: string) {
  return prisma.organisation.findUnique({
    where: {
      domain
    }
  });
}

export async function getOrganisationForUser(email: string) {
  return getOrganisationByDomain(getEmailDomain(email));
}

export async function ensureMemberForOrganisation(
  identity: Identity,
  organisationId: string,
  role: Role = Role.MEMBER
) {
  const existingMember = await prisma.member.findUnique({
    where: {
      email: identity.email
    }
  });

  if (existingMember && existingMember.orgId !== organisationId) {
    throw new Error("This email address already belongs to another organisation.");
  }

  return prisma.member.upsert({
    where: {
      email: identity.email
    },
    update: {
      name: identity.name
    },
    create: {
      email: identity.email,
      name: identity.name,
      orgId: organisationId,
      role
    }
  });
}

export async function ensureOrganisationAccess(identity: Identity, orgSlug: string) {
  const organisation = await prisma.organisation.findUnique({
    where: {
      slug: orgSlug
    }
  });

  if (!organisation) {
    return null;
  }

  if (getEmailDomain(identity.email) !== organisation.domain) {
    return { organisation, member: null } as const;
  }

  const member = await ensureMemberForOrganisation(identity, organisation.id);

  return { organisation, member } as const;
}

async function getUniqueOrganisationSlug(baseName: string) {
  const baseSlug = slugifyOrganisationName(baseName);

  if (!baseSlug) {
    throw new Error("Organisation name could not be converted into a slug.");
  }

  let nextSlug = baseSlug;
  let suffix = 2;

  while (
    await prisma.organisation.findUnique({
      where: {
        slug: nextSlug
      },
      select: {
        id: true
      }
    })
  ) {
    nextSlug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return nextSlug;
}

export async function createOrJoinOrganisation(identity: Identity, organisationName: string) {
  const domain = getEmailDomain(identity.email);
  const existingOrganisation = await getOrganisationByDomain(domain);

  if (existingOrganisation) {
    const member = await ensureMemberForOrganisation(identity, existingOrganisation.id);

    return {
      action: "joined" as const,
      member,
      organisation: existingOrganisation
    };
  }

  const slug = await getUniqueOrganisationSlug(organisationName);

  const result = await prisma.$transaction(async (transaction) => {
    const organisation = await transaction.organisation.create({
      data: {
        domain,
        name: organisationName,
        slug
      }
    });

    const member = await transaction.member.create({
      data: {
        email: identity.email,
        name: identity.name,
        orgId: organisation.id,
        role: Role.OWNER
      }
    });

    return {
      member,
      organisation
    };
  });

  return {
    action: "created" as const,
    ...result
  };
}
