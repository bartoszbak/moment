"use client";

import Link from "next/link";
import type { Route } from "next";
import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WallControls } from "@/components/wall/wall-controls";
import { PhotoGrid } from "@/components/wall/photo-grid";
import { type WallPhoto } from "@/components/wall/types";
import { WALL_CHUNK_SIZE, WALL_VIEWPORT_BUFFER } from "@/lib/wall";

type InfiniteCanvasProps = {
  captureHref: Route;
  initialPhotos: WallPhoto[];
  orgSlug: string;
  teams: string[];
  totalCount: number;
};

type Point = {
  x: number;
  y: number;
};

const MIN_SCALE = 0.65;
const MAX_SCALE = 1.6;
const SCALE_STEP = 0.12;
const DEFAULT_SCALE = 0.95;
const DEFAULT_VIEWPORT = { width: 1280, height: 720 };

function clampScale(scale: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

function getChunkIndices(min: number, max: number) {
  const start = Math.floor(min / WALL_CHUNK_SIZE);
  const end = Math.floor(max / WALL_CHUNK_SIZE);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function buildChunkKey(chunkX: number, chunkY: number, search: string, team: string) {
  return `${search}__${team}__${chunkX}:${chunkY}`;
}

function getChunkUrl(orgSlug: string, chunkX: number, chunkY: number, search: string, team: string) {
  const params = new URLSearchParams({
    orgSlug,
    chunkX: String(chunkX),
    chunkY: String(chunkY),
    chunkSize: String(WALL_CHUNK_SIZE)
  });

  if (search) {
    params.set("search", search);
  }

  if (team !== "All") {
    params.set("team", team);
  }

  return `/api/photos?${params.toString()}`;
}

export function InfiniteCanvas({
  captureHref,
  initialPhotos,
  orgSlug,
  teams,
  totalCount
}: InfiniteCanvasProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    lastX: number;
    lastY: number;
    lastTime: number;
  } | null>(null);
  const inertiaFrameRef = useRef<number | null>(null);
  const chunkCacheRef = useRef(new Map<string, WallPhoto[]>());
  const inFlightChunksRef = useRef(new Set<string>());
  const velocityRef = useRef<Point>({ x: 0, y: 0 });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("All");
  const [scale, setScale] = useState(DEFAULT_SCALE);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [chunkPhotos, setChunkPhotos] = useState<Record<string, WallPhoto[]>>({
    [buildChunkKey(0, 0, "", "All")]: initialPhotos
  });
  const [viewportSize, setViewportSize] = useState(DEFAULT_VIEWPORT);

  const deferredSearchQuery = useDeferredValue(searchQuery.trim().toLowerCase());

  useEffect(() => {
    if (!viewportRef.current || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (!entry) {
        return;
      }

      setViewportSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height
      });
    });

    observer.observe(viewportRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    chunkCacheRef.current.set(buildChunkKey(0, 0, "", "All"), initialPhotos);
  }, [initialPhotos]);

  useEffect(() => {
    return () => {
      if (inertiaFrameRef.current !== null) {
        cancelAnimationFrame(inertiaFrameRef.current);
      }
    };
  }, []);

  const viewportBounds = useMemo(() => {
    const halfWidth = viewportSize.width / (2 * scale) + WALL_VIEWPORT_BUFFER;
    const halfHeight = viewportSize.height / (2 * scale) + WALL_VIEWPORT_BUFFER;
    const centerX = -pan.x / scale;
    const centerY = -pan.y / scale;

    return {
      minX: centerX - halfWidth,
      maxX: centerX + halfWidth,
      minY: centerY - halfHeight,
      maxY: centerY + halfHeight
    };
  }, [pan.x, pan.y, scale, viewportSize.height, viewportSize.width]);

  const visibleChunkCoordinates = useMemo(() => {
    const chunkXs = getChunkIndices(viewportBounds.minX, viewportBounds.maxX);
    const chunkYs = getChunkIndices(viewportBounds.minY, viewportBounds.maxY);

    return chunkXs.flatMap((chunkX) => chunkYs.map((chunkY) => ({ chunkX, chunkY })));
  }, [viewportBounds.maxX, viewportBounds.maxY, viewportBounds.minX, viewportBounds.minY]);

  useEffect(() => {
    let cancelled = false;

    async function loadVisibleChunks() {
      for (const { chunkX, chunkY } of visibleChunkCoordinates) {
        const chunkKey = buildChunkKey(chunkX, chunkY, deferredSearchQuery, selectedTeam);

        if (chunkCacheRef.current.has(chunkKey) || inFlightChunksRef.current.has(chunkKey)) {
          continue;
        }

        inFlightChunksRef.current.add(chunkKey);

        try {
          const response = await fetch(
            getChunkUrl(orgSlug, chunkX, chunkY, deferredSearchQuery, selectedTeam)
          );
          const payload = (await response.json().catch(() => null)) as
            | { error?: string; photos?: WallPhoto[] }
            | null;

          if (!response.ok || !payload?.photos) {
            throw new Error(payload?.error ?? "Wall chunk load failed.");
          }

          if (cancelled) {
            return;
          }

          const nextPhotos = payload.photos;

          chunkCacheRef.current.set(chunkKey, nextPhotos);
          setChunkPhotos((current) => ({
            ...current,
            [chunkKey]: nextPhotos
          }));
        } catch (error) {
          if (!cancelled) {
            console.error(error);
          }
        } finally {
          inFlightChunksRef.current.delete(chunkKey);
        }
      }
    }

    void loadVisibleChunks();

    return () => {
      cancelled = true;
    };
  }, [deferredSearchQuery, orgSlug, selectedTeam, visibleChunkCoordinates]);

  const visiblePhotos = useMemo(() => {
    const photoMap = new Map<string, WallPhoto>();

    for (const { chunkX, chunkY } of visibleChunkCoordinates) {
      const chunkKey = buildChunkKey(chunkX, chunkY, deferredSearchQuery, selectedTeam);
      const photos = chunkPhotos[chunkKey] ?? chunkCacheRef.current.get(chunkKey) ?? [];

      for (const photo of photos) {
        photoMap.set(photo.id, photo);
      }
    }

    return Array.from(photoMap.values());
  }, [chunkPhotos, deferredSearchQuery, selectedTeam, visibleChunkCoordinates]);

  const highlightedPhotoId =
    deferredSearchQuery.length > 0 && visiblePhotos.length === 1 ? visiblePhotos[0]?.id : null;

  function stopInertia() {
    if (inertiaFrameRef.current !== null) {
      cancelAnimationFrame(inertiaFrameRef.current);
      inertiaFrameRef.current = null;
    }
  }

  function startInertia(initialVelocity: Point) {
    stopInertia();

    let nextVelocity = { ...initialVelocity };

    const tick = () => {
      nextVelocity = {
        x: nextVelocity.x * 0.92,
        y: nextVelocity.y * 0.92
      };

      if (Math.abs(nextVelocity.x) < 0.15 && Math.abs(nextVelocity.y) < 0.15) {
        inertiaFrameRef.current = null;
        return;
      }

      setPan((current) => ({
        x: current.x + nextVelocity.x * 16,
        y: current.y + nextVelocity.y * 16
      }));
      velocityRef.current = nextVelocity;
      inertiaFrameRef.current = requestAnimationFrame(tick);
    };

    inertiaFrameRef.current = requestAnimationFrame(tick);
  }

  function resetView() {
    stopInertia();
    setPan({ x: 0, y: 0 });
    setScale(DEFAULT_SCALE);
    velocityRef.current = { x: 0, y: 0 };
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    stopInertia();
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: pan.x,
      originY: pan.y,
      lastX: event.clientX,
      lastY: event.clientY,
      lastTime: performance.now()
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const dragState = dragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    const now = performance.now();
    const deltaTime = Math.max(1, now - dragState.lastTime);
    const deltaX = event.clientX - dragState.lastX;
    const deltaY = event.clientY - dragState.lastY;

    setPan({
      x: dragState.originX + event.clientX - dragState.startX,
      y: dragState.originY + event.clientY - dragState.startY
    });
    velocityRef.current = {
      x: deltaX / deltaTime,
      y: deltaY / deltaTime
    };

    dragStateRef.current = {
      ...dragState,
      lastX: event.clientX,
      lastY: event.clientY,
      lastTime: now
    };
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (dragStateRef.current?.pointerId !== event.pointerId) {
      return;
    }

    dragStateRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
    startInertia(velocityRef.current);
  }

  function handleWheel(event: React.WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    stopInertia();

    const nextScale = clampScale(scale + (event.deltaY < 0 ? SCALE_STEP : -SCALE_STEP));

    if (nextScale === scale) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const pointX = event.clientX - rect.left - rect.width / 2;
    const pointY = event.clientY - rect.top - rect.height / 2;
    const worldX = (pointX - pan.x) / scale;
    const worldY = (pointY - pan.y) / scale;

    setScale(nextScale);
    setPan({
      x: pointX - worldX * nextScale,
      y: pointY - worldY * nextScale
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <WallControls
        totalCount={totalCount}
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
            ref={viewportRef}
            className="relative h-[72vh] cursor-grab overflow-hidden bg-[radial-gradient(circle_at_top,hsl(var(--muted)/0.85)_0%,transparent_30%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--muted)/0.35)_100%)] active:cursor-grabbing"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
          >
            {visiblePhotos.length > 0 ? (
              <PhotoGrid
                highlightedPhotoId={highlightedPhotoId}
                photos={visiblePhotos}
                panX={pan.x}
                panY={pan.y}
                scale={scale}
                viewportHeight={viewportSize.height}
                viewportWidth={viewportSize.width}
              />
            ) : null}

            {totalCount === 0 ? (
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
                <p className="text-sm font-medium">No matching people in this viewport</p>
                <p className="text-sm text-muted-foreground">
                  Pan the canvas or clear the current search and team filters.
                </p>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
