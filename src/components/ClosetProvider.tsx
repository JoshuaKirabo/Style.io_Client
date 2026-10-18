"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

export type ClosetPhoto = { url: string; name: string };

type ClosetValue =
  {
    photos: ClosetPhoto[];
    addPhotos: (files: FileList | null) => void;
    removePhoto: (url: string) => void;
  };

const ClosetContext = createContext<ClosetValue | null>(null);

// The closet lives above the pages, so it's the same on Match and on Closet as you move between them.
// It's only in memory for now: a reload empties it until there's a server to keep it.
export function ClosetProvider({ children }: { children: ReactNode })
  {
    const [photos, setPhotos] = useState<ClosetPhoto[]>([]);
    const photosRef = useRef(photos);

    useEffect(() =>
      {
        photosRef.current = photos;
      }, [photos]);

    useEffect(() => () => photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.url)), []);

    const addPhotos = useCallback((files: FileList | null) =>
      {
        if(!files?.length) return;

        const added = Array.from(files).filter((file) => file.type.startsWith("image/")).map((file) => ({ url: URL.createObjectURL(file), name: file.name }));
        setPhotos((current) => [...added, ...current]);
      }, []);

    const removePhoto = useCallback((url: string) =>
      {
        URL.revokeObjectURL(url);
        setPhotos((current) => current.filter((photo) => photo.url !== url));
      }, []);

    return <ClosetContext value={{ photos, addPhotos, removePhoto }}>{children}</ClosetContext>;
  }

export function useCloset()
  {
    const closet = useContext(ClosetContext);
    if(!closet) throw new Error("useCloset needs a ClosetProvider above it.");
    return closet;
  }
