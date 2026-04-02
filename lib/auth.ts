import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { redirect } from "next/navigation";

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

export type SessionUser = {
  email: string;
  name: string | null;
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  providers: [
    Google({
      clientId: getRequiredEnv("GOOGLE_CLIENT_ID"),
      clientSecret: getRequiredEnv("GOOGLE_CLIENT_SECRET")
    })
  ],
  callbacks: {
    async signIn({ user }) {
      return Boolean(user.email);
    },
    async session({ session, token }) {
      if (session.user && typeof token.email === "string") {
        session.user.email = token.email;
      }

      if (session.user && typeof token.name === "string") {
        session.user.name = token.name;
      }

      return session;
    }
  }
});

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  const user = session?.user;
  const email = user?.email?.trim().toLowerCase();

  if (!email) {
    return null;
  }

  return {
    email,
    name: user?.name?.trim() || null
  };
}

export async function requireSessionUser() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
