"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { SAMPLE_PIECES, type Piece } from "@/lib/pieces";

type ClosetValue =
  {
    pieces: Piece[];
    addPhotos: (files: FileList | null) => void;
    removePiece: (id: string) => void;
  };

const ClosetContext = createContext<ClosetValue | null>(null);

// The closet lives above the pages, so it's the same on Match and on Closet as you move between them.
// It starts with the sample pieces and only lives in memory for now: a reload resets it until there's a server to keep it.
export function ClosetProvider({ children }: { children: ReactNode })
  {
    const [pieces, setPieces] = useState<Piece[]>(SAMPLE_PIECES);
    const piecesRef = useRef(pieces);

    useEffect(() =>
      {
        piecesRef.current = pieces;
      }, [pieces]);

    useEffect(() => () => piecesRef.current.forEach((piece) => piece.photoUrl?.startsWith("blob:") && URL.revokeObjectURL(piece.photoUrl)), []);

    // A photo you add comes in unsorted, named after its file, until it gets a proper name and a group.
    const addPhotos = useCallback((files: FileList | null) =>
      {
        if(!files?.length) return;

        const added: Piece[] = Array.from(files).filter((file) => file.type.startsWith("image/")).map((file) =>
          {
            const photoUrl = URL.createObjectURL(file);
            return { id: photoUrl, name: file.name.replace(/\.[^.]+$/, "") || "New piece", category: null, photoUrl };
          });

        setPieces((current) => [...added, ...current]);
      }, []);

    const removePiece = useCallback((id: string) =>
      {
        const piece = piecesRef.current.find((item) => item.id === id);
        if(piece?.photoUrl?.startsWith("blob:")) URL.revokeObjectURL(piece.photoUrl);
        setPieces((current) => current.filter((item) => item.id !== id));
      }, []);

    return <ClosetContext value={{ pieces, addPhotos, removePiece }}>{children}</ClosetContext>;
  }

export function useCloset()
  {
    const closet = useContext(ClosetContext);
    if(!closet) throw new Error("useCloset needs a ClosetProvider above it.");
    return closet;
  }
