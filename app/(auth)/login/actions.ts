"use server";

import { signIn, signOut } from "@/lib/auth";

export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/onboarding" });
}

export async function signOutToLogin() {
  await signOut({ redirectTo: "/login" });
}
