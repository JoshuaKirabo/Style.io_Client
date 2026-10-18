// The pieces a look gets split into. Each one is matched against the closet on its own.
const PIECES = ["Top", "Bottom", "Outerwear", "Shoes", "Bag"];

// Closest first, three per piece.
const RANKS = [1, 2, 3];

export function MatchList()
  {
    return (
      <section aria-labelledby="matches-title" style={{ animationDelay: "120ms" }} className="rise flex min-h-0 min-w-0 flex-col">
        <div className="flex h-8 items-center justify-between gap-4">
          <h2 id="matches-title" className="caption">Matches</h2>
          <span className="caption text-text-secondary">Closest three</span>
        </div>

        <ol className="mt-3 grid lg:min-h-0 lg:flex-1 lg:grid-rows-5">
          {PIECES.map((piece) => (
            <li key={piece} className="flex h-24 min-h-0 items-center gap-4 py-2 lg:h-auto">
              <span className="caption w-24 shrink-0">{piece}</span>
              <div className="flex h-full min-w-0 gap-2">
                {RANKS.map((rank) => (
                  <span key={rank} aria-hidden className="frame aspect-[3/4] h-full shrink-0" />
                ))}
              </div>
              <span className="caption ml-auto tabular-nums text-text-secondary">
                <span aria-hidden>—</span>
                <span className="sr-only">No match yet</span>
              </span>
            </li>
          ))}
        </ol>
      </section>
    );
  }
