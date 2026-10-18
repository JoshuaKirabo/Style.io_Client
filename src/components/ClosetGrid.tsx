"use client";

import { useCallback, useState } from "react";
import { useCloset } from "@/components/ClosetProvider";
import { PieceArt } from "@/components/PieceArt";
import { PieceDetail } from "@/components/PieceDetail";
import { SyncPiecesButton } from "@/components/SyncPiecesButton";
import { Toolbar } from "@/components/Toolbar";
import { CATEGORIES, type Category, type Piece } from "@/lib/pieces";

type Filter = "All" | Category | "Unsorted";

function inFilter(piece: Piece, filter: Filter)
  {
    if(filter === "All") return true;
    if(filter === "Unsorted") return piece.category === null;
    return piece.category === filter;
  }

// Everything you own, by group. Pick a piece to see its details beside the grid, or in a sheet on a phone.
export function ClosetGrid()
  {
    const { pieces } = useCloset();
    const [filter, setFilter] = useState<Filter>("All");
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Only groups with something in them get a tab, so eight groups don't turn into a row of zeros.
    const filters: Filter[] = ["All", ...[...CATEGORIES, "Unsorted" as const].filter((option) => pieces.some((piece) => inFilter(piece, option)))];

    const shown = pieces.filter((piece) => inFilter(piece, filter));
    const selected = pieces.find((piece) => piece.id === selectedId) ?? null;

    // Closing hands focus back to the tile you opened, so the keyboard picks up where it left off.
    const close = useCallback(() =>
      {
        setSelectedId(null);
        if(selectedId) requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-piece="${CSS.escape(selectedId)}"]`)?.focus({ preventScroll: true }));
      }, [selectedId]);

    return (
      <div className="flex flex-col gap-6">
        <Toolbar title="Closet" subtitle="Everything you own, ready to match.">
          <SyncPiecesButton />
        </Toolbar>

        <div style={{ animationDelay: "60ms" }} className="rise">
          {/* The groups sit on a hairline like the nav does, with the one you're in underlined. */}
          <div role="group" aria-label="Show" className="filter-rail flex gap-6 overflow-x-auto sm:gap-8">
            {filters.map((option) =>
              {
                const total = pieces.filter((piece) => inFilter(piece, option)).length;

                return (
                  <button key={option} type="button" aria-pressed={filter === option} onClick={() => setFilter(option)} className="filter-tab caption">
                    {option}
                    <span className="ml-1.5 tabular-nums text-text-secondary">{total}</span>
                  </button>
                );
              })}
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start xl:grid-cols-[minmax(0,1fr)_21rem] xl:gap-14">
          <section aria-label="Pieces" style={{ animationDelay: "120ms" }} className="rise min-w-0">
            {shown.length > 0 ? (
              <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 xl:grid-cols-4">
                {shown.map((piece) => (
                  <li key={piece.id} className="fade-in">
                    <PieceTile piece={piece} selected={piece.id === selectedId} onSelect={() => setSelectedId((current) => (current === piece.id ? null : piece.id))} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="max-w-sm py-12">
                <p className="display text-[1.5rem] leading-tight">{filter === "All" ? "Your closet is empty." : `No ${filter.toLowerCase()} yet.`}</p>
                <p className="mt-2 text-text-secondary">Add a photo of a piece and it’ll show up here.</p>
                {filter !== "All" && <button type="button" onClick={() => setFilter("All")} className="link-caption caption mt-4">Show everything</button>}
              </div>
            )}
          </section>

          <PieceDetail piece={selected} onClose={close} />
        </div>
      </div>
    );
  }

type PieceTileProps =
  {
    piece: Piece;
    selected: boolean;
    onSelect: () => void;
  };

// A piece in the grid: its photo, its name and the group it's in.
function PieceTile({ piece, selected, onSelect }: PieceTileProps)
  {
    return (
      <button type="button" data-piece={piece.id} aria-pressed={selected} onClick={onSelect} className="piece-tile block w-full text-left">
        <span className="piece-frame frame piece-surface block aspect-[3/4] overflow-hidden">
          <PieceArt piece={piece} />
        </span>
        <span className="mt-3 block truncate">{piece.name}</span>
        <span className="mt-1 block text-sm text-text-secondary">{piece.category ?? "Not sorted yet"}</span>
      </button>
    );
  }
