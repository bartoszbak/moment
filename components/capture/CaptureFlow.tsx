"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { CameraCapture } from "@/components/capture/CameraCapture";
import { PhotoForm } from "@/components/capture/PhotoForm";
import { PhotoPreview } from "@/components/capture/PhotoPreview";

type CaptureFlowProps = {
  defaultEmail?: string;
  defaultName?: string;
  orgSlug: string;
};

export function CaptureFlow({ defaultEmail, defaultName, orgSlug }: CaptureFlowProps) {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.9fr)]">
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {imageDataUrl ? (
            <motion.div
              key="preview"
              initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <PhotoPreview imageDataUrl={imageDataUrl} onRetake={() => setImageDataUrl(null)} />
            </motion.div>
          ) : (
            <motion.div
              key="camera"
              initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <CameraCapture onCapture={setImageDataUrl} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-6">
        <motion.section
          className="rounded-[2rem] border border-slate-200/70 bg-slate-950 px-6 py-7 text-white shadow-[0_24px_80px_-36px_rgba(15,23,42,0.7)]"
          initial={reduceMotion ? undefined : { opacity: 0, x: 16 }}
          animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <p className="text-sm uppercase tracking-[0.28em] text-sky-200">Capture flow</p>
          <h2 className="mt-3 text-3xl font-semibold">Portraits that feel human, not corporate.</h2>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Keep the framing simple: shoulders visible, neutral background, and a little personality in the expression.
          </p>
        </motion.section>

        {imageDataUrl ? (
          <PhotoForm
            imageDataUrl={imageDataUrl}
            orgSlug={orgSlug}
            defaultEmail={defaultEmail}
            defaultName={defaultName}
          />
        ) : (
          <motion.div
            className="rounded-[2rem] border border-dashed border-slate-300 bg-white/70 p-6 text-sm text-slate-500"
            initial={reduceMotion ? undefined : { opacity: 0 }}
            animate={reduceMotion ? undefined : { opacity: 1 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            Capture a photo to unlock the member details form.
          </motion.div>
        )}
      </div>
    </div>
  );
}
