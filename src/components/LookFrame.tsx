"use client";

import { ViewTransition, useRef, useState, type DragEvent } from "react";

export const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export type Look = { url: string; name: string };

type LookFrameProps =
  {
    look: Look | null;
    notice: string | null;
    onFile: (file: File | undefined) => void;
  };

// Empty, it's a drop zone across the whole screen. Filled, it's the look, shaped like the pin it came from.
export function LookFrame({ look, notice, onFile }: LookFrameProps)
  {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);

    const handleDragOver = (event: DragEvent) =>
      {
        event.preventDefault();
        setDragging(true);
      };

    // Moving over the text inside fires a leave too; only count it when the file actually leaves.
    const handleDragLeave = (event: DragEvent) =>
      {
        if(!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false);
      };

    const handleDrop = (event: DragEvent) =>
      {
        event.preventDefault();
        setDragging(false);
        onFile(event.dataTransfer.files[0]);
      };

    const frameState = look ? "is-filled" : dragging ? "is-dragging" : "is-drop";

    return (
      <section aria-label="The look" style={{ animationDelay: "120ms" }} className="fade-in-slow flex min-h-0 min-w-0 flex-col">
        <input
          ref={inputRef}
          id="look"
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="peer sr-only"
          onChange={(event) =>
            {
              onFile(event.target.files?.[0]);
              event.target.value = "";
            }}
        />

        {/* Once there's a look, the only thing it needs above it is a way to swap it. */}
        {look && (
          <div style={{ animationDelay: "480ms" }} className="fade-in-slow flex h-8 items-center justify-end">
            <button type="button" onClick={() => inputRef.current?.click()} className="link-caption caption is-quiet">
              Replace
            </button>
          </div>
        )}

        {/* The frame animates only when a look comes in or gets swapped. Page changes leave it alone. */}
        <ViewTransition update={{ "look-add": "look-add", "look-replace": "look-replace", default: "none" }} default="none">
          <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={`frame relative overflow-hidden peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent ${look ? "look-frame mx-auto mt-3 aspect-[2/3] max-w-full lg:mx-0" : "drop-zone w-full"} ${frameState}`}>
            {look ? (
              // Keyed on the photo, so every new look gets its own curtain.
              <span key={look.url} className="look-curtain absolute inset-0 overflow-hidden">
                {/* A local blob preview, so next/image has nothing to optimise here. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={look.url} alt="The outfit you added" className="look-image h-full w-full object-cover" />
              </span>
            ) : (
              // Everything a drop area needs: an edge, an arrow, what to do, a button, and what it accepts.
              <label htmlFor="look" className="drop-label flex h-full cursor-pointer flex-col items-center justify-center p-6 text-center">
                <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="drop-icon size-8 text-text lg:size-10">
                  <path d="M12 15V3" />
                  <path d="m7 8 5-5 5 5" />
                  <path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
                </svg>

                <span key={dragging ? "dragging" : "idle"} className="swap-in display drop-title mt-6">
                  {dragging ? "Let go to add it" : (
                    <>
                      <span className="sm:hidden">Add a look</span>
                      <span className="hidden sm:inline">Drop a look here</span>
                    </>
                  )}
                </span>
                <span className="mt-3 text-sm text-text-secondary lg:text-base">
                  <span className="hidden sm:inline">or paste it with ⌘V</span>
                  <span className="sm:hidden">A screenshot or saved photo</span>
                </span>

                <span className="button-secondary caption mt-6">Choose a file</span>

                <span className="mt-4 text-xs text-text-secondary">PNG, JPEG or WebP</span>
                {/* The live region stays mounted so screen readers announce it; only the message inside fades in. */}
                <span aria-live="polite" className="mt-2 min-h-5 text-sm text-accent">
                  {notice && <span key={notice} className="fade-in">{notice}</span>}
                </span>
              </label>
            )}
          </div>
        </ViewTransition>
      </section>
    );
  }
