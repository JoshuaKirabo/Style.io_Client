"use client";

import { addTransitionType, startTransition, useCallback, useEffect, useState } from "react";
import { ACCEPTED_TYPES, LookFrame, type Look } from "@/components/LookFrame";
import { MatchList } from "@/components/MatchList";
import { Toolbar } from "@/components/Toolbar";

// The Match screen: the look under the toolbar, and its matches beside it once there is a look.
export function LookBoard({ className = "" }: { className?: string })
  {
    const [look, setLook] = useState<Look | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    const takeLook = useCallback(async (file: File | undefined) =>
      {
        if(!file) return;

        if(!ACCEPTED_TYPES.includes(file.type))
          {
            setNotice("That file isn't a PNG, JPEG or WebP. Try another.");
            return;
          }

        setNotice(null);
        const url = URL.createObjectURL(file);

        // Decoding the photo first, so the curtain lifts off the picture instead of an empty frame.
        // If it won't decode, it goes in anyway and the browser shows what it can.
        const preview = new Image();
        preview.src = url;
        await preview.decode().catch(() => undefined);

        // Running it as a transition lets the frame animate from the drop area into the look. The type says
        // whether it's the first look or a swap, since those two move differently.
        startTransition(() =>
          {
            addTransitionType(look ? "look-replace" : "look-add");
            setLook({ url, name: file.name || "Pasted screenshot" });
          });
      }, [look]);

    // Letting go of the old preview whenever a new one replaces it, so it doesn't sit in memory.
    useEffect(() =>
      {
        return () =>
          {
            if(look) URL.revokeObjectURL(look.url);
          };
      }, [look]);

    // Screenshots usually live on the clipboard, so Cmd+V anywhere on the page works too.
    useEffect(() =>
      {
        const handlePaste = (event: ClipboardEvent) =>
          {
            const image = Array.from(event.clipboardData?.files ?? []).find((file) => file.type.startsWith("image/"));
            if(image) takeLook(image);
          };
        window.addEventListener("paste", handlePaste);
        return () => window.removeEventListener("paste", handlePaste);
      }, [takeLook]);

    return (
      <div className={`flex min-h-0 flex-col gap-6 ${className}`}>
        <Toolbar title="New match" subtitle={<>Turn any saved outfit into one <span className="text-accent">you already own.</span></>} />

        {/* Matches only show up once there's a look to match. */}
        <div className={`grid grid-cols-1 gap-8 lg:min-h-0 lg:flex-1 lg:gap-10 ${look ? "lg:grid-cols-[auto_minmax(0,1fr)]" : ""}`}>
          <LookFrame look={look} notice={notice} onFile={takeLook} />
          {look && <MatchList />}
        </div>
      </div>
    );
  }
