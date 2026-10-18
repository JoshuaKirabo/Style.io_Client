"use client";

import type { Piece } from "@/lib/pieces";

// Hiding a photo that didn't load, so the frame stays an empty grey backdrop instead of a broken image.
// The ref catches ones that failed before the page was running; onError catches the rest.
function hideIfBroken(img: HTMLImageElement | null)
  {
    if(img?.complete && img.naturalWidth === 0) img.dataset.missing = "";
  }

// A piece's photo, or an empty frame until the file is there.
export function PieceArt({ piece }: { piece: Piece })
  {
    if(!piece.photoUrl) return <span aria-hidden className="block h-full w-full" />;

    return (
      // Local files and blob previews, so next/image isn't needed until the photos come from a server.
      // Keyed on the photo, so a new one starts out visible again.
      // eslint-disable-next-line @next/next/no-img-element
      <img key={piece.photoUrl} ref={hideIfBroken} src={piece.photoUrl} alt={piece.name} onError={(event) => (event.currentTarget.dataset.missing = "")} className="piece-photo h-full w-full object-cover" />
    );
  }
