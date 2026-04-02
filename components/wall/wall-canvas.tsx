"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { PhotoCard, type WallPhoto } from "@/components/wall/photo-card";
import { WallControls } from "@/components/wall/wall-controls";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Point = {
  x: number;
  y: number;
};

type WallCanvasProps = {
  captureHref: Route;
  photos: WallPhoto[];
};

const MIN_SCALE = 0.7;
const MAX_SCALE = 1.5;
const SCALE_STEP = 0.1;
const CARD_WIDTH = 224;
const CARD_HEIGHT = 340;
const CANVAS_PADDING = 220;

function clampScale(scale: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

export function WallCanvas({ captureHref, photos }: WallCanvasProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("All");
  const [scale, setScale] = useState(0.95);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const teams = useMemo(
    () => Array.from(new Set(photos.map((photo) => photo.team))).sort(),
    [photos]
  );

  const filteredPhotos = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return photos.filter((photo) => {
      const matchesSearch =
        !normalizedQuery || photo.memberName.toLowerCase().includes(normalizedQuery);
      const matchesTeam = selectedTeam === "All" || photo.team === selectedTeam;

      return matchesSearch && matchesTeam;
    });
  }, [photos, searchQuery, selectedTeam]);

  const hasActiveFilters = searchQuery.trim().length > 0 || selectedTeam !== "All";
  const visiblePhotos = hasActiveFilters ? filteredPhotos : photos;

  const canvasMetrics = useMemo(() => {
    const sourcePhotos = visiblePhotos.length > 0 ? visiblePhotos : photos;

    if (sourcePhotos.length === 0) {
      return {
        height: 640,
        normalizedPhotos: [] as Array<WallPhoto & Point>,
        width: 960
      };
    }

    const minX = Math.min(...sourcePhotos.map((photo) => photo.x)) - CANVAS_PADDING;
    const maxX = Math.max(...sourcePhotos.map((photo) => photo.x)) + CANVAS_PADDING;
    const minY = Math.min(...sourcePhotos.map((photo) => photo.y)) - CANVAS_PADDING;
    const maxY = Math.max(...sourcePhotos.map((photo) => photo.y)) + CANVAS_PADDING;

    return {
      width: maxX - minX + CARD_WIDTH,
      height: maxY - minY + CARD_HEIGHT,
      normalizedPhotos: sourcePhotos.map((photo) => ({
        ...photo,
        x: photo.x - minX,
        y: photo.y - minY
      }))
    };
  }, [photos, visiblePhotos]);

  function resetView() {
    setPan({ x: 0, y: 0 });
    setScale(0.95);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: pan.x,
      originY: pan.y
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const dragState = dragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    setPan({
      x: dragState.originX + event.clientX - dragState.startX,
      y: dragState.originY + event.clientY - dragState.startY
    });
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (dragStateRef.current?.pointerId === event.pointerId) {
      dragStateRef.current = null;
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  const highlightedPhotoId =
    searchQuery.trim().length > 0 && filteredPhotos.length === 1 ? filteredPhotos[0]?.id : null;

  return (
    <div className="flex flex-col gap-6">
      <WallControls
        totalCount={photos.length}
        visibleCount={visiblePhotos.length}
        searchQuery={searchQuery}
        selectedTeam={selectedTeam}
        teams={teams}
        zoomPercent={Math.round(scale * 100)}
        onSearchChange={setSearchQuery}
        onTeamChange={setSelectedTeam}
        onZoomIn={() => setScale((current) => clampScale(current + SCALE_STEP))}
        onZoomOut={() => setScale((current) => clampScale(current - SCALE_STEP))}
        onResetView={resetView}
      />

      <Card className="overflow-hidden border-border/70 bg-card/95 shadow-xl">
        <CardContent className="p-0">
          <div
            className="relative h-[72vh] cursor-grab overflow-hidden bg-[radial-gradient(circle_at_top,hsl(var(--muted)/0.85)_0%,transparent_30%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--muted)/0.35)_100%)] active:cursor-grabbing"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {photos.length > 0 && visiblePhotos.length > 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="relative origin-center touch-none select-none transition-transform duration-200 ease-out"
                  style={{
                    height: canvasMetrics.height,
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                    width: canvasMetrics.width
                  }}
                >
                  <div className="absolute inset-0 rounded-[2rem] border border-dashed border-border/60 bg-background/45" />

                  {canvasMetrics.normalizedPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="absolute"
                      style={{
                        left: photo.x,
                        top: photo.y,
                        transform: "translate(-50%, -50%)"
                      }}
                    >
                      <PhotoCard
                        photo={photo}
                        isHighlighted={photo.id === highlightedPhotoId}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {photos.length === 0 ? (
              <div className="flex size-full items-center justify-center p-8">
                <div className="flex max-w-md flex-col items-center gap-3 text-center">
                  <p className="text-lg font-medium">No portraits yet</p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Start the wall by capturing the first team photo for this organisation.
                  </p>
                  <Button nativeButton={false} render={<Link href={captureHref} />}>
                    Open capture flow
                  </Button>
                </div>
              </div>
            ) : visiblePhotos.length === 0 ? (
              <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-2xl border border-border/70 bg-card/95 px-4 py-3 shadow-lg">
                <p className="text-sm font-medium">No matching people</p>
                <p className="text-sm text-muted-foreground">
                  Clear the search or team filter to see the rest of the wall.
                </p>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
