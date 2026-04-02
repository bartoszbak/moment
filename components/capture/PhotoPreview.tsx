"use client";

import { motion, useReducedMotion } from "motion/react";

type PhotoPreviewProps = {
  imageDataUrl: string;
  onRetake: () => void;
};

export function PhotoPreview({ imageDataUrl, onRetake }: PhotoPreviewProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.5)] backdrop-blur"
      initial={reduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
      animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700">Step 2</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Review your photo</h2>
        </div>
        <button
          type="button"
          onClick={onRetake}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          Retake
        </button>
      </div>

      <div className="mt-5 overflow-hidden rounded-[1.75rem] bg-slate-100">
        <img src={imageDataUrl} alt="Preview of your captured portrait" className="aspect-[4/3] w-full object-cover" />
      </div>
    </motion.section>
  );
}
