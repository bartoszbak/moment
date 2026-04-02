"use client";

import { useEffect, useRef, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

type CameraCaptureProps = {
  onCapture: (imageDataUrl: string) => void;
};

export function CameraCapture({ onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
    <div>
      <Card className="shadow-lg">
        <CardHeader className="gap-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <Badge variant="outline" className="w-fit">
                Step 1
              </Badge>
              <CardTitle>Take your portrait</CardTitle>
            </div>
            <Badge>Webcam</Badge>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="flex flex-col gap-4 pt-4">
          <div className="overflow-hidden rounded-xl border border-border/70 bg-muted">
            {cameraState === "idle" ? (
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
            ) : null}
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={cameraState === "idle" ? "hidden" : "aspect-[4/3] w-full object-cover"}
            />
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {error ? (
            <Alert variant="destructive">
              <AlertTitle>Camera error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-between gap-3">
          {cameraState === "ready" ? (
            <Button onClick={handleCapture}>Snap photo</Button>
          ) : (
            <Button onClick={startCamera} disabled={cameraState === "starting"}>
              {cameraState === "starting" ? "Starting camera..." : "Enable camera"}
            </Button>
          )}
          <span className="text-sm text-muted-foreground">
            Use a front-facing camera with soft light for the best result.
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}
