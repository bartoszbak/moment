"use client";

import { SearchIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type WallControlsProps = {
  totalCount: number;
  visibleCount: number;
  searchQuery: string;
  selectedTeam: string;
  teams: string[];
  zoomPercent: number;
  onSearchChange: (value: string) => void;
  onTeamChange: (value: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
};

export function WallControls({
  totalCount,
  visibleCount,
  searchQuery,
  selectedTeam,
  teams,
  zoomPercent,
  onSearchChange,
  onTeamChange,
  onZoomIn,
  onZoomOut,
  onResetView
}: WallControlsProps) {
  const teamOptions = ["All", ...teams];

  return (
    <FieldSet className="rounded-3xl border border-border/70 bg-card/90 p-5 shadow-lg">
      <FieldLegend variant="label">Wall controls</FieldLegend>
      <FieldDescription>
        Search by teammate name, filter by team, then pan around the wall and zoom the board.
      </FieldDescription>

      <FieldGroup className="mt-4">
        <Field>
          <FieldLabel htmlFor="wall-search">Search people</FieldLabel>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="wall-search"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search by name"
              className="pl-9"
            />
          </div>
        </Field>

        <Field>
          <FieldLabel>Filter by team</FieldLabel>
          <ToggleGroup
            multiple={false}
            value={[selectedTeam]}
            onValueChange={(value) => onTeamChange(value[0] ?? "All")}
            variant="outline"
            className="flex w-full flex-wrap gap-2"
            spacing={2}
          >
            {teamOptions.map((team) => (
              <ToggleGroupItem key={team} value={team}>
                {team}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Field>

        <Field>
          <FieldLabel>Zoom and view</FieldLabel>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onZoomOut}>
              <ZoomOutIcon data-icon="inline-start" />
              Zoom out
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onZoomIn}>
              <ZoomInIcon data-icon="inline-start" />
              Zoom in
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={onResetView}>
              Reset view
            </Button>
            <span className="text-sm text-muted-foreground">{zoomPercent}%</span>
          </div>
        </Field>
      </FieldGroup>

      <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span>{visibleCount} visible</span>
        <span>{totalCount} total</span>
        <span>Drag inside the wall to pan</span>
      </div>
    </FieldSet>
  );
}
