"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

type CameraCaptureProps = {
  onCapture: (imageDataUrl: string) => void;
};

export function CameraCapture({ onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduceMotion = useReducedMotion();

  const [cameraState, setCameraState] = useState<"idle" | "starting" | "ready">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  async function startCamera() {
    setError(null);
    setCameraState("starting");

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("This browser does not support camera access.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraState("ready");
    } catch (caughtError) {
      stopStream();
      setCameraState("idle");
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Camera access failed. Check browser permissions and try again."
      );
    }
  }

  function stopStream() {
    streamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });
    streamRef.current = null;
  }

  function handleCapture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      setError("Camera is not ready yet.");
      return;
    }

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) {
      setError("Could not read the camera frame. Try again.");
      return;
    }

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
      setError("Canvas is unavailable in this browser.");
      return;
    }

    context.drawImage(video, 0, 0, width, height);
    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.92);

    stopStream();
    setCameraState("idle");
    onCapture(imageDataUrl);
  }

  return (
    <motion.section
      className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.5)] backdrop-blur"
      initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-700">Step 1</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Take your portrait</h2>
        </div>
        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-800">
          Webcam
        </span>
      </div>

      <div className="mt-5 overflow-hidden rounded-[1.5rem] bg-slate-950">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="aspect-[4/3] w-full object-cover"
        />
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {error ? (
        <div
          role="alert"
          className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {error}
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        {cameraState === "ready" ? (
          <button
            type="button"
            onClick={handleCapture}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Snap photo
          </button>
        ) : (
          <button
            type="button"
            onClick={startCamera}
            disabled={cameraState === "starting"}
            className="rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-sky-300"
          >
            {cameraState === "starting" ? "Starting camera..." : "Enable camera"}
          </button>
        )}

        <p className="self-center text-sm text-slate-500">
          Use a front-facing camera with soft light for the best result.
        </p>
      </div>
    </motion.section>
  );
}
