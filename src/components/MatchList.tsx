import type { CSSProperties } from "react";

// The pieces a look gets split into. Each one is matched against the closet on its own.
const PIECES = ["Top", "Bottom", "Outerwear", "Shoes", "Bag"];

// Closest first, three per piece.
const RANKS = [1, 2, 3];

// Each row and slot carries its place in line, so the stylesheet can set them out one after another.
export function MatchList()
  {
    return (
      <section aria-labelledby="matches-title" className="match-list flex min-h-0 min-w-0 flex-col">
        <div className="match-head flex h-8 items-center justify-between gap-4">
          <h2 id="matches-title" className="caption">Matches</h2>
          <span className="caption text-text-secondary">Closest three</span>
        </div>

        <ol className="mt-3 grid lg:min-h-0 lg:flex-1 lg:grid-rows-5">
          {PIECES.map((piece, row) => (
            <li key={piece} style={{ "--row": row } as CSSProperties} className="match-row flex h-24 min-h-0 items-center gap-4 py-2 lg:h-auto">
              <span className="line-mask w-24 shrink-0">
                <span className="match-label line-reveal caption">{piece}</span>
              </span>
              <div className="flex h-full min-w-0 gap-2">
                {RANKS.map((rank, index) => (
                  <span key={rank} aria-hidden style={{ "--rank": index } as CSSProperties} className="match-slot frame aspect-[3/4] h-full shrink-0" />
                ))}
              </div>
              <span className="match-score caption ml-auto tabular-nums text-text-secondary">
                <span aria-hidden>—</span>
                <span className="sr-only">No match yet</span>
              </span>
            </li>
          ))}
        </ol>
      </section>
    );
  }
