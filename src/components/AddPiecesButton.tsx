"use client";

import { useRef, type ReactNode } from "react";
import { useCloset } from "@/components/ClosetProvider";

// A button that opens the file picker and drops whatever you choose into the closet.
export function AddPiecesButton({ className, children }: { className: string; children: ReactNode })
  {
    const inputRef = useRef<HTMLInputElement>(null);
    const { addPhotos } = useCloset();

    return (
      <>
        <button type="button" onClick={() => inputRef.current?.click()} className={className}>
          {children}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(event) =>
            {
              addPhotos(event.target.files);
              event.target.value = "";
            }}
        />
      </>
    );
  }
