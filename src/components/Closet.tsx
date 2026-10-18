"use client";

import { AddPiecesButton } from "@/components/AddPiecesButton";
import { useCloset } from "@/components/ClosetProvider";
import { PieceArt } from "@/components/PieceArt";

// Empty frames so the closet has a shape before anything is in it.
const GHOSTS = Array.from({ length: 12 }, (_, index) => index);

// The closet beside the matches. A strip that scrolls sideways on a phone, a column on desktop.
export function Closet()
  {
    const { pieces } = useCloset();
    const count = pieces.length;

    return (
      <section aria-labelledby="closet-title" style={{ animationDelay: "180ms" }} className="rise flex min-h-0 min-w-0 flex-col">
        <div className="flex h-8 items-center justify-between gap-4">
          <h2 id="closet-title" className="caption">
            Closet <span className="ml-1 tabular-nums text-text-secondary">{count}</span>
          </h2>
          <AddPiecesButton className="link-caption caption">+ Add</AddPiecesButton>
        </div>

        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:grid lg:min-h-0 lg:flex-1 lg:auto-rows-min closet-strip lg:overflow-x-hidden lg:overflow-y-auto lg:pb-0">
          {count === 0
            ? GHOSTS.map((ghost) => <li key={ghost} aria-hidden className="frame aspect-[3/4] w-14 shrink-0 lg:w-auto" />)
            : pieces.map((piece) => (
                <li key={piece.id} className="frame piece-surface fade-in aspect-[3/4] w-14 shrink-0 overflow-hidden lg:w-auto">
                  <PieceArt piece={piece} />
                </li>
              ))}
        </ul>
      </section>
    );
  }
