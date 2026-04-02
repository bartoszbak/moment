"use client";

import { PhotoCard } from "@/components/wall/photo-card";
import { type WallPhoto } from "@/components/wall/types";

type PhotoGridProps = {
  highlightedPhotoId: string | null;
  photos: WallPhoto[];
  panX: number;
  panY: number;
  scale: number;
  viewportHeight: number;
  viewportWidth: number;
};

export function PhotoGrid({
  highlightedPhotoId,
  photos,
  panX,
  panY,
  scale,
  viewportHeight,
  viewportWidth
}: PhotoGridProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <div
        className="relative size-0 origin-center touch-none select-none will-change-transform"
        style={{
          transform: `translate(${panX}px, ${panY}px) scale(${scale})`
        }}
      >
        <div
          className="absolute border border-dashed border-border/60 bg-background/35"
          style={{
            left: -viewportWidth,
            top: -viewportHeight,
            width: viewportWidth * 2,
            height: viewportHeight * 2,
            borderRadius: 48
          }}
        />

        {photos.map((photo) => (
          <div
            key={photo.id}
            className="absolute"
            style={{
              left: photo.x,
              top: photo.y,
              transform: "translate(-50%, -50%)"
            }}
          >
            <PhotoCard photo={photo} isHighlighted={photo.id === highlightedPhotoId} />
          </div>
        ))}
      </div>
    </div>
  );
}
