"use client";

import { AddPiecesButton } from "@/components/AddPiecesButton";
import { useCloset } from "@/components/ClosetProvider";
import { Toolbar } from "@/components/Toolbar";

const GHOSTS = Array.from({ length: 16 }, (_, index) => index);

// Everything you own, in one grid. Each piece can come out again.
export function ClosetGrid()
  {
    const { photos, removePhoto } = useCloset();
    const count = photos.length;

    return (
      <div className="flex flex-col gap-6">
        <Toolbar title="Closet">
          <p className="caption tabular-nums text-text-secondary">
            {count === 0 ? "Nothing here yet" : `${count} ${count === 1 ? "piece" : "pieces"}`}
          </p>
          <AddPiecesButton className="button-primary caption">Add pieces</AddPiecesButton>
        </Toolbar>

        {count === 0 && (
          <div className="rise max-w-md" style={{ animationDelay: "60ms" }}>
            <p className="display text-[1.75rem] leading-tight">Start with what you wear most.</p>
            <p className="mt-3 text-text-secondary">One piece per photo, on a plain background if you can.</p>
          </div>
        )}

        <ul style={{ animationDelay: "120ms" }} className="rise grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-8">
          {count === 0
            ? GHOSTS.map((ghost) => <li key={ghost} aria-hidden className="frame aspect-[3/4]" />)
            : photos.map((photo) => (
                <li key={photo.url} className="tile frame is-filled fade-in relative aspect-[3/4] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.url} alt={photo.name} className="h-full w-full object-cover" />
                  <button type="button" onClick={() => removePhoto(photo.url)} aria-label={`Remove ${photo.name}`} className="tile-remove caption">
                    Remove
                  </button>
                </li>
              ))}
        </ul>
      </div>
    );
  }
