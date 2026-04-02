"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type WallPhoto } from "@/components/wall/types";

type PhotoCardProps = {
  photo: WallPhoto;
  isHighlighted?: boolean;
};

function getRotation(id: string) {
  let hash = 0;

  for (const character of id) {
    hash = (hash * 31 + character.charCodeAt(0)) % 97;
  }

  return (hash % 7) - 3;
}

function formatJoinedLabel(createdAt: string) {
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const deltaDays = Math.max(0, Math.round((now - created) / 86_400_000));

  if (deltaDays === 0) {
    return "Joined today";
  }

  if (deltaDays === 1) {
    return "Joined 1 day ago";
  }

  return `Joined ${deltaDays} days ago`;
}

export function PhotoCard({ photo, isHighlighted = false }: PhotoCardProps) {
  return (
    <Card
      className={cn(
        "w-56 overflow-hidden border-border/70 bg-card/95 shadow-xl transition-shadow duration-200",
        isHighlighted ? "ring-2 ring-primary/60 shadow-2xl" : "hover:shadow-2xl"
      )}
      style={{
        transform: `rotate(${getRotation(photo.id)}deg)`
      }}
    >
      <div className="aspect-[4/5] bg-muted">
        <img
          src={photo.url}
          alt={`${photo.memberName}'s portrait`}
          className="size-full object-cover"
        />
      </div>
      <CardContent className="flex flex-col gap-3 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <p className="truncate font-medium">{photo.memberName}</p>
            <p className="truncate text-sm text-muted-foreground">{photo.memberEmail}</p>
          </div>
          <Badge variant="secondary">{photo.team}</Badge>
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {formatJoinedLabel(photo.createdAt)}
        </p>
      </CardContent>
    </Card>
  );
}
