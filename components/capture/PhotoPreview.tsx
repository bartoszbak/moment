"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type PhotoPreviewProps = {
  imageDataUrl: string;
  onRetake: () => void;
};

export function PhotoPreview({ imageDataUrl, onRetake }: PhotoPreviewProps) {
  return (
    <div>
      <Card className="shadow-lg">
        <CardHeader className="gap-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <Badge variant="outline" className="w-fit">
                Step 2
              </Badge>
              <CardTitle>Review your photo</CardTitle>
            </div>
            <Button type="button" variant="outline" onClick={onRetake}>
              Retake
            </Button>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <div className="overflow-hidden rounded-xl border border-border/70 bg-muted">
            <img
              src={imageDataUrl}
              alt="Preview of your captured portrait"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
