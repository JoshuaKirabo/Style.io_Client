"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { useCloset } from "@/components/ClosetProvider";
import { PieceArt } from "@/components/PieceArt";
import type { Piece } from "@/lib/pieces";

type PieceDetailProps =
  {
    piece: Piece | null;
    onClose: () => void;
  };

const WIDE = "(min-width: 64rem)";

// Where a flick would carry the sheet if you let it coast, the same way a scroll slows down.
function project(velocity: number, rate = 0.998)
  {
    return (velocity / 1000) * rate / (1 - rate);
  }

// Past the top the sheet still follows your finger, just less and less the further you pull.
function rubberband(distance: number, size: number)
  {
    return (distance * size * 0.55) / (size + 0.55 * Math.abs(distance));
  }

// Everything about one piece. On desktop it sits beside the grid; on a phone it's a sheet you can pull down.
export function PieceDetail({ piece, onClose }: PieceDetailProps)
  {
    const { removePiece } = useCloset();
    const panelRef = useRef<HTMLElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    const drag = useRef<{ startY: number; samples: { y: number; t: number }[] } | null>(null);

    // Holding on to the last piece so the sheet still shows it while it slides away on a phone.
    const [shown, setShown] = useState(piece);
    if(piece && piece !== shown) setShown(piece);

    // Counting each time the panel opens from closed. Opening brings the details in fresh; switching pieces while
    // it's open only swaps what changed.
    const [wasOpen, setWasOpen] = useState(piece !== null);
    const [opening, setOpening] = useState(0);
    const [openedWith, setOpenedWith] = useState(piece?.id ?? null);
    if((piece !== null) !== wasOpen)
      {
        setWasOpen(piece !== null);
        if(piece)
          {
            setOpening((count) => count + 1);
            setOpenedWith(piece.id);
          }
      }

    // On a phone the sheet covers the page, so focus goes into it and the page behind stops scrolling.
    useEffect(() =>
      {
        if(!piece) return;

        if(!window.matchMedia(WIDE).matches) closeRef.current?.focus({ preventScroll: true });
        document.documentElement.setAttribute("data-sheet-open", "");

        const handleKey = (event: KeyboardEvent) =>
          {
            if(event.key === "Escape") onClose();
          };
        window.addEventListener("keydown", handleKey);

        return () =>
          {
            window.removeEventListener("keydown", handleKey);
            document.documentElement.removeAttribute("data-sheet-open");
          };
      }, [piece, onClose]);

    // The sheet sticks to your finger from where you grabbed it. Letting go, it works out where the flick was
    // headed and either closes or settles back up.
    const handlePointerDown = (event: PointerEvent<HTMLDivElement>) =>
      {
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = { startY: event.clientY, samples: [{ y: event.clientY, t: event.timeStamp }] };
        panelRef.current?.setAttribute("data-dragging", "");
      };

    const handlePointerMove = (event: PointerEvent<HTMLDivElement>) =>
      {
        const panel = panelRef.current;
        if(!drag.current || !panel) return;

        const distance = event.clientY - drag.current.startY;
        const offset = distance > 0 ? distance : rubberband(distance, panel.offsetHeight);
        panel.style.transform = `translateY(${offset}px)`;

        drag.current.samples = [...drag.current.samples, { y: event.clientY, t: event.timeStamp }].slice(-5);
      };

    const handlePointerUp = (event: PointerEvent<HTMLDivElement>) =>
      {
        const panel = panelRef.current;
        if(!drag.current || !panel) return;

        const { startY, samples } = drag.current;
        const first = samples[0];
        const elapsed = event.timeStamp - first.t;
        const velocity = elapsed > 0 ? ((event.clientY - first.y) / elapsed) * 1000 : 0;
        const landing = event.clientY - startY + project(velocity);

        drag.current = null;
        panel.removeAttribute("data-dragging");
        panel.style.transform = "";

        // Taking the transform off hands it back to the stylesheet, which carries on from wherever the finger left it.
        if(landing > panel.offsetHeight * 0.4) onClose();
      };

    const remove = (id: string) =>
      {
        removePiece(id);
        onClose();
      };

    // Only a switch gets the crossfade; on opening, the whole block is already coming in.
    const swap = shown && shown.id !== openedWith ? "detail-swap" : "";

    return (
      <>
        <button type="button" tabIndex={-1} aria-hidden data-open={piece ? "" : undefined} onClick={onClose} className="sheet-scrim" />

        <aside ref={panelRef} aria-label="Piece details" data-open={piece ? "" : undefined} className="piece-panel">
          <div onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} className="sheet-handle">
            <span aria-hidden className="sheet-grip" />
          </div>

          {/* With nothing picked, the desktop panel says what will show up here. A phone just keeps the sheet down. */}
          {!piece && (
            <div className="frame hidden aspect-[3/4] max-h-[min(42dvh,24rem)] w-full flex-col items-center justify-center p-6 text-center lg:mt-11 lg:flex">
              <p className="display text-[1.5rem] leading-tight">Pick a piece</p>
            </div>
          )}

          {shown && (
            // Keyed on the opening, so the details come in fresh when the panel opens. Switching pieces while it's open
            // keeps the frame and buttons still and only swaps the photo and the words.
            <div key={opening} className={`swap-in ${piece ? "" : "lg:hidden"}`}>
              <div className="flex h-8 items-center justify-between gap-4">
                <span key={shown.id} className={`${swap} caption text-text-secondary`}>{shown.category ?? "Not sorted yet"}</span>
                <button ref={closeRef} type="button" onClick={onClose} aria-label="Close details" className="icon-button">
                  <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="size-5">
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              </div>

              <PanelPhoto piece={shown} />

              <h2 key={`name-${shown.id}`} style={{ animationDelay: "40ms" }} className={`${swap} display mt-6 text-[1.75rem] leading-[1.1] tracking-[-0.015em]`}>{shown.name}</h2>

              <div className="mt-8 flex flex-col items-stretch gap-2">
                <Link href="/" className="button-primary caption">Find outfits with this</Link>
                <button type="button" onClick={() => remove(shown.id)} className="link-caption caption is-quiet self-center">Remove from closet</button>
              </div>
            </div>
          )}
        </aside>
      </>
    );
  }

// The photo in the panel. Switching pieces lays the new photo over the old one and fades it up once it has
// loaded, so the frame never goes empty and nothing around it moves.
function PanelPhoto({ piece }: { piece: Piece })
  {
    const [last, setLast] = useState(piece);
    const [behind, setBehind] = useState<Piece | null>(null);
    const [ready, setReady] = useState(true);

    if(piece !== last)
      {
        setLast(piece);
        if(piece.id !== last.id)
          {
            setBehind(last);
            setReady(false);
          }
      }

    // Waiting for the new photo to decode, so it fades up whole instead of painting in.
    useEffect(() =>
      {
        if(ready) return;

        let cancelled = false;
        const finish = () =>
          {
            if(cancelled) return;
            setReady(true);
            // With reduced motion there's no fade to wait for, so the old photo goes straight away.
            if(window.matchMedia("(prefers-reduced-motion: reduce)").matches) setBehind(null);
          };

        if(!piece.photoUrl) finish();
        else
          {
            const image = new Image();
            image.src = piece.photoUrl;
            image.decode().then(finish, finish);
          }

        return () =>
          {
            cancelled = true;
          };
      }, [piece.photoUrl, ready]);

    return (
      <div className="frame piece-surface relative mt-3 aspect-[3/4] max-h-[min(42dvh,24rem)] w-full overflow-hidden">
        {behind && (
          <span aria-hidden className="absolute inset-0">
            <PieceArt piece={behind} />
          </span>
        )}
        <span key={piece.id} data-swap={behind ? "" : undefined} data-ready={ready ? "" : undefined} onAnimationEnd={() => setBehind(null)} className="photo-swap absolute inset-0">
          <PieceArt piece={piece} />
        </span>
      </div>
    );
  }
