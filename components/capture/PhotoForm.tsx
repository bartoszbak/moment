"use client";

import { FormEvent, useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";

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
  defaultEmail?: string;
  defaultName?: string;
};

export function PhotoForm({ imageDataUrl, orgSlug, defaultEmail = "", defaultName = "" }: PhotoFormProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const datalistId = useId();

  const [email, setEmail] = useState(defaultEmail);
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
          email,
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
    <motion.section
      className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.5)] backdrop-blur"
      initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-fuchsia-700">Step 3</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Add your details</h2>
        <p className="mt-2 max-w-xl text-sm text-slate-600">
          Until OAuth is wired, the capture flow uses your work email here to validate organisation access.
        </p>
      </div>

      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Work email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-500"
            placeholder="you@company.com"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Display name</span>
          <input
            type="text"
            required
            maxLength={80}
            autoComplete="name"
            value={memberName}
            onChange={(event) => setMemberName(event.target.value)}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-500"
            placeholder="Bartosz Bak"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Team</span>
          <input
            type="text"
            required
            maxLength={80}
            list={datalistId}
            value={team}
            onChange={(event) => setTeam(event.target.value)}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-500"
            placeholder="Engineering"
          />
          <datalist id={datalistId}>
            {TEAM_SUGGESTIONS.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </label>

        <div className="flex flex-wrap gap-2">
          {suggestedTeams.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTeam(item)}
              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              {item}
            </button>
          ))}
        </div>

        {error ? (
          <div
            role="alert"
            className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {error}
          </div>
        ) : null}

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting ? "Posting photo..." : "Post to wall"}
          </button>
          <p className="text-sm text-slate-500">Your photo will be uploaded and placed on the shared canvas.</p>
        </div>
      </form>
    </motion.section>
  );
}
