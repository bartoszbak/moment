"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CameraCapture } from "@/components/capture/CameraCapture";
import { PhotoForm } from "@/components/capture/PhotoForm";
import { PhotoPreview } from "@/components/capture/PhotoPreview";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type CaptureFlowProps = {
  defaultName?: string;
  orgSlug: string;
};

export function CaptureFlow({ defaultName, orgSlug }: CaptureFlowProps) {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const contentSwapTransition = {
    duration: 0.22,
    ease: [0.645, 0.045, 0.355, 1] as const
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.9fr)]">
      <div className="space-y-6">
        <AnimatePresence mode="wait" initial={false}>
          {imageDataUrl ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={contentSwapTransition}
            >
              <PhotoPreview imageDataUrl={imageDataUrl} onRetake={() => setImageDataUrl(null)} />
            </motion.div>
          ) : (
            <motion.div
              key="camera"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={contentSwapTransition}
            >
              <CameraCapture onCapture={setImageDataUrl} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-6">
        <Card className="shadow-lg">
          <CardHeader className="gap-3">
            <Badge className="w-fit">Capture flow</Badge>
            <CardTitle>Portraits that feel human, not corporate.</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="flex flex-col gap-4 pt-4">
            <p className="text-sm leading-6 text-muted-foreground">
              Keep the framing simple: shoulders visible, neutral background, and a little personality in the expression.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Natural light</Badge>
              <Badge variant="outline">Shoulders visible</Badge>
              <Badge variant="outline">Neutral background</Badge>
            </div>
          </CardContent>
        </Card>

        {imageDataUrl ? (
          <PhotoForm imageDataUrl={imageDataUrl} orgSlug={orgSlug} defaultName={defaultName} />
        ) : (
          <Alert>
            <AlertTitle>Details form locked</AlertTitle>
            <AlertDescription>
              Capture a photo first to unlock the member details form and upload action.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
