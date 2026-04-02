export function getEmailDomain(email: string): string {
  const [, domain] = email.toLowerCase().trim().split("@");

  if (!domain) {
    throw new Error("Invalid email address.");
  }

  return domain;
}

export function slugifyOrganisationName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
