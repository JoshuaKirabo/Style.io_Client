"use client";

import { useEffect, useState } from "react";

type SyncState = "idle" | "syncing" | "synced";

const LABELS: Record<SyncState, string> = { idle: "Sync pieces", syncing: "Syncing", synced: "Synced" };

// Pulls your pieces in again. There's no server to sync with yet, so for now it just walks through the states:
// syncing for a moment, a short "Synced", then back to ready.
export function SyncPiecesButton()
  {
    const [state, setState] = useState<SyncState>("idle");

    useEffect(() =>
      {
        if(state === "idle") return;

        const timer = setTimeout(() => setState(state === "syncing" ? "synced" : "idle"), state === "syncing" ? 1400 : 1800);
        return () => clearTimeout(timer);
      }, [state]);

    return (
      <button type="button" data-state={state} disabled={state !== "idle"} onClick={() => setState("syncing")} className="button-primary sync-button caption gap-2.5">
        <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="sync-icon size-4">
          {state === "synced" ? (
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          ) : (
            <>
              <path d="M20 11a8 8 0 0 0-14.3-4.9L4 8" />
              <path d="M4 4v4h4" />
              <path d="M4 13a8 8 0 0 0 14.3 4.9L20 16" />
              <path d="M20 20v-4h-4" />
            </>
          )}
        </svg>
        <span aria-live="polite">{LABELS[state]}</span>
      </button>
    );
  }
