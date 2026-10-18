"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import { ACCEPTED_TYPES } from "@/components/LookFrame";
import { Toolbar } from "@/components/Toolbar";
import type { Picture } from "@/lib/my-pictures";

// Your own photos for the model to learn from. They're saved to a folder beside the training code, not kept
// in the browser, so they're still there after a reload.
export function MyPictures()
  {
    const inputRef = useRef<HTMLInputElement>(null);
    const [pictures, setPictures] = useState<Picture[] | null>(null);
    const [adding, setAdding] = useState(false);
    const [dragging, setDragging] = useState(false);

    useEffect(() =>
      {
        let live = true;
        fetch("/api/pictures").then((response) => response.json()).then((list: Picture[]) => live && setPictures(list));

        return () =>
          {
            live = false;
          };
      }, []);

    const add = async (files: FileList | null) =>
      {
        const accepted = Array.from(files ?? []).filter((file) => ACCEPTED_TYPES.includes(file.type));
        if(!accepted.length) return;

        const form = new FormData();
        accepted.forEach((file) => form.append("files", file));

        setAdding(true);
        try
          {
            const response = await fetch("/api/pictures", { method: "POST", body: form });
            if(response.ok)
              {
                const saved: Picture[] = await response.json();
                setPictures((current) => [...saved, ...(current ?? [])]);
              }
          }
        finally
          {
            setAdding(false);
          }
      };

    // Gone from the grid straight away; the file is deleted behind it.
    const remove = (name: string) =>
      {
        setPictures((current) => current?.filter((picture) => picture.name !== name) ?? current);
        fetch(`/api/pictures/${encodeURIComponent(name)}`, { method: "DELETE" });
      };

    const handleDragOver = (event: DragEvent) =>
      {
        event.preventDefault();
        setDragging(true);
      };

    // Moving over the photos inside fires a leave too; only count it when the file actually leaves.
    const handleDragLeave = (event: DragEvent) =>
      {
        if(!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false);
      };

    const handleDrop = (event: DragEvent) =>
      {
        event.preventDefault();
        setDragging(false);
        add(event.dataTransfer.files);
      };

    const count = pictures?.length ?? 0;

    return (
      <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className="flex flex-1 flex-col gap-6">
        <input
          ref={inputRef}
          id="pictures"
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          multiple
          className="peer sr-only"
          onChange={(event) =>
            {
              add(event.target.files);
              event.target.value = "";
            }}
        />

        <Toolbar title="My pictures">
          {count > 0 && (
            <button type="button" disabled={adding} onClick={() => inputRef.current?.click()} className="button-primary caption">
              {adding ? "Adding" : "Add pictures"}
            </button>
          )}
        </Toolbar>

        {pictures && count === 0 && (
          // Nothing yet, so the whole page is the drop area, the same as Match before a look is in.
          <div style={{ animationDelay: "120ms" }} className={`fade-in-slow frame drop-zone w-full peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent ${dragging ? "is-dragging" : "is-drop"}`}>
            <label htmlFor="pictures" className="drop-label flex h-full cursor-pointer flex-col items-center justify-center p-6 text-center">
              <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="drop-icon size-8 text-text lg:size-10">
                <path d="M12 15V3" />
                <path d="m7 8 5-5 5 5" />
                <path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
              </svg>

              <span key={adding ? "adding" : dragging ? "dragging" : "idle"} className="swap-in display drop-title mt-6">
                {adding ? "Adding" : dragging ? "Let go to add them" : (
                  <>
                    <span className="sm:hidden">Add pictures</span>
                    <span className="hidden sm:inline">Drop pictures here</span>
                  </>
                )}
              </span>

              <span className="button-secondary caption mt-8">Choose files</span>
              <span className="mt-4 text-xs text-text-secondary">PNG, JPEG or WebP</span>
            </label>
          </div>
        )}

        {count > 0 && (
          <section aria-label="Pictures" data-dragging={dragging ? "" : undefined} style={{ animationDelay: "120ms" }} className="pictures-grid rise">
            <ul className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-6 lg:grid-cols-4 xl:grid-cols-5">
              {pictures?.map((picture) => (
                <li key={picture.name} className="picture-tile fade-in relative">
                  <span className="frame piece-surface block aspect-[3/4] overflow-hidden">
                    {/* Served from the local folder, so next/image has nothing to optimise here. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={picture.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </span>
                  <button type="button" onClick={() => remove(picture.name)} aria-label="Remove picture" className="picture-remove">
                    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="size-4">
                      <path d="M6 6l12 12M18 6 6 18" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    );
  }
