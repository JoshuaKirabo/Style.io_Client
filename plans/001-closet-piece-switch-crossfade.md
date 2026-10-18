# 001 — Switch pieces in the closet panel without moving the whole panel

- **Status**: DONE (2026-10-19; the date line had become a "Cut out of …" line on disk, so step 2 keyed that instead)
- **Commit**: none (Style.io is not a git repository; plan written 2026-10-19)
- **Severity**: HIGH
- **Category**: Physicality & origin / Purpose & frequency
- **Estimated scope**: 2 files — `src/components/PieceDetail.tsx` (~60 lines changed), `src/app/globals.css` (~35 lines added)

## Problem

On the Closet screen (desktop, `/closet`), picking one piece and then another (e.g. "Olive mini skirt" → "Khaki cargo
pants") replays an entrance on the **entire** details panel: the category label, the close button, the photo frame,
the name, the date line and both buttons all fade from 0, blur from 4px and slide up 0.15em at once. Most of that
content is identical between the two pieces — the frame, the close button and both buttons don't change at all — so
the panel looks like it's being rebuilt rather than updated. That's what reads as cheap. Switching pieces is one of
the most frequent actions on this screen.

The cause is the `key` on the panel's wrapper, which remounts everything when the piece changes:

```tsx
/* src/components/PieceDetail.tsx:127-130 — current */
{shown && (
  // Keyed on the piece, so switching between pieces brings the new one into focus instead of cutting over.
  <div key={shown.id} className={`swap-in ${piece ? "" : "lg:hidden"}`}>
```

```css
/* src/app/globals.css:660-663 (inside @media (prefers-reduced-motion: no-preference)) — current */
.swap-in
   {
      animation: swap-in var(--motion-medium) var(--ease-out) both;
   }

/* src/app/globals.css:784-792 — current */
@keyframes swap-in
   {
      from
         {
            opacity: 0;
            filter: blur(4px);
            transform: translateY(0.15em);
         }
   }
```

A second, smaller problem: the photo is an `<img>` keyed on its URL (`src/components/PieceArt.tsx:21`), so on a switch
the old photo disappears immediately and the frame can show its grey backdrop for a frame or two while the new photo
decodes.

## Target

**Opening the panel from closed keeps today's behavior exactly** (whole block plays `swap-in`; on a phone the sheet
slides up). Only **switching from one piece to another while the panel is open** changes:

| Element | On switch |
| --- | --- |
| Close button, photo frame (border/size), "Find outfits with this", "Remove from closet" | Do not move, fade or re-render visibly. Completely still. |
| Photo | New photo is laid **over** the old one inside the same frame and fades up once decoded: opacity 0→1 and scale 1.02→1, `280ms` (`var(--motion-medium)`), `var(--ease-out)` = `cubic-bezier(0.22, 1, 0.36, 1)`. The old photo stays underneath until the fade ends, so the frame never goes empty. |
| Category label (top-left caption) | Crossfades in place: opacity 0→1 with `filter: blur(2px)`→none, `200ms` (`var(--motion-base)`), `var(--ease-out)`, delay `0ms`. **No translate.** |
| Name (`h2`) | Same as category, delay `40ms`. |
| Date / source line | Same as category, delay `80ms`. |

New CSS added:

```css
/* Switching pieces in the panel. The new photo waits, hidden, until it has decoded. */
.photo-swap[data-swap]:not([data-ready])
   {
      opacity: 0;
   }

/* inside the existing @media (prefers-reduced-motion: no-preference) block */
.photo-swap[data-swap][data-ready]
   {
      animation: photo-swap var(--motion-medium) var(--ease-out) both;
   }

.detail-swap
   {
      animation: detail-swap var(--motion-base) var(--ease-out) both;
   }

/* next to the other @keyframes */
@keyframes photo-swap
   {
      from
         {
            opacity: 0;
            transform: scale(1.02);
         }
   }

@keyframes detail-swap
   {
      from
         {
            opacity: 0;
            filter: blur(2px);
         }
   }
```

With `prefers-reduced-motion: reduce`: no animation at all on switch — the new photo appears as soon as it's decoded,
text swaps instantly. (The `.detail-swap` and `.photo-swap[data-ready]` rules live inside the `no-preference` block, so
this happens automatically; the component also drops the old photo right away under reduced motion, see step 3.)

## Repo conventions to follow

- **Code style is the owner's**: braces on their own line, indented one level past the statement (see any function in
  `src/components/PieceDetail.tsx`), `if(` with no space, one-sentence plain comments that describe what the user
  sees. CSS braces are indented 3 spaces at top level, 9 inside a media query (see `src/app/globals.css:637-663`).
- Motion tokens are in `src/app/globals.css:16-25`. Use only `--motion-base`, `--motion-medium`, `--ease-out`. Do not
  add new tokens or raw cubic-beziers.
- Entrance animations live inside `@media (prefers-reduced-motion: no-preference)` at `src/app/globals.css:637`;
  keyframes are grouped at `src/app/globals.css:759-830`. Exemplar: `.swap-in` + `@keyframes swap-in`.
- Render-time state syncing (no effect) is the existing pattern: `src/components/PieceDetail.tsx:37-38`
  (`if(piece && piece !== shown) setShown(piece);`).

## Steps

1. **`src/components/PieceDetail.tsx` — track when the panel opens from closed.** Directly below the existing lines

   ```tsx
   const [shown, setShown] = useState(piece);
   if(piece && piece !== shown) setShown(piece);
   ```

   add:

   ```tsx
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
   ```

2. **Same file — re-key the wrapper on the opening, not the piece, and key only the text that changes.** In the JSX:

   - Replace the comment + opening tag
     ```tsx
     // Keyed on the piece, so switching between pieces brings the new one into focus instead of cutting over.
     <div key={shown.id} className={`swap-in ${piece ? "" : "lg:hidden"}`}>
     ```
     with
     ```tsx
     // Keyed on the opening, so the details come in fresh when the panel opens. Switching pieces while it's open
     // keeps the frame and buttons still and only swaps the photo and the words.
     <div key={opening} className={`swap-in ${piece ? "" : "lg:hidden"}`}>
     ```
   - Just above the `return (`, add:
     ```tsx
     // Only a switch gets the crossfade; on opening, the whole block is already coming in.
     const swap = shown && shown.id !== openedWith ? "detail-swap" : "";
     ```
   - Category span: change
     `<span className="caption text-text-secondary">{shown.category ?? "Not sorted yet"}</span>` to
     `<span key={shown.id} className={`${swap} caption text-text-secondary`}>{shown.category ?? "Not sorted yet"}</span>`
   - Name: change `<h2 className="display mt-6 ...">` to
     `<h2 key={`name-${shown.id}`} style={{ animationDelay: "40ms" }} className={`${swap} display mt-6 text-[1.75rem] leading-[1.1] tracking-[-0.015em]`}>`
   - Date line: change `<p className="mt-2 text-sm text-text-secondary">` to
     `<p key={`source-${shown.id}`} style={{ animationDelay: "80ms" }} className={`${swap} mt-2 text-sm text-text-secondary`}>`
   - Replace the photo frame
     ```tsx
     <div className="frame piece-surface mt-3 aspect-[3/4] max-h-[min(42dvh,24rem)] w-full overflow-hidden">
       <PieceArt piece={shown} />
     </div>
     ```
     with `<PanelPhoto piece={shown} />`.
   - Leave the close button, the `Link`, and the "Remove from closet" button untouched (no keys, no classes).

3. **Same file — add `PanelPhoto` below `PieceDetail`.** `type Piece`, `useEffect` and `useState` are already
   imported.

   ```tsx
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
   ```

4. **`src/app/globals.css` — add the hidden-until-decoded rule.** Directly after the `.piece-photo[data-missing]` rule
   (`src/app/globals.css:~325`), add the `.photo-swap[data-swap]:not([data-ready])` rule from **Target** with the
   comment shown there. It must be **outside** any media query.

5. **Same file — add the two animation rules** inside the existing `@media (prefers-reduced-motion: no-preference)`
   block, directly after the `.swap-in` rule (`src/app/globals.css:660-663`):

   ```css
         /* Switching pieces: the new photo settles in over the old one, and the words change in place. */
         .photo-swap[data-swap][data-ready]
            {
               animation: photo-swap var(--motion-medium) var(--ease-out) both;
            }

         .detail-swap
            {
               animation: detail-swap var(--motion-base) var(--ease-out) both;
            }
   ```

6. **Same file — add the two keyframes** directly after `@keyframes swap-in` (`src/app/globals.css:784-792`), exactly
   as in **Target**.

## Boundaries

- Do NOT change `@keyframes swap-in` or `.swap-in` — they're also used by the drop prompt elsewhere.
- Do NOT change `PieceArt.tsx`, `ClosetGrid.tsx`, the sheet drag logic, the sheet/scrim CSS, or the tile styles.
- Do NOT add any dependency (no Framer Motion / Motion). CSS + React state only.
- Do NOT add new motion tokens or raw easing values.
- If any quoted "current" code doesn't match what's in the file, STOP and report instead of improvising.

## Verification

- **Mechanical**: from `Style.io_Client/`, `npx tsc --noEmit` and `npm run lint` both pass with no new errors. No
  React "duplicate key" warning in the browser console when switching pieces.
- **Feel check** (desktop width ≥ 1024px, `npm run dev`, open `/closet`, add at least 3 pieces with photos):
  - Click piece A. The panel comes in exactly as before (whole block fades/blurs up).
  - Click piece B. The close button, the frame's border and both buttons do **not** move or flicker. Only the photo,
    the category, the name and the date line change.
  - The photo never shows the grey backdrop mid-switch — B fades up over A, with a barely visible settle (scale 1.02→1).
  - Text arrives in a short cascade: category, then name (+40ms), then date (+80ms). No vertical movement.
  - DevTools → Animations panel → 10% speed: confirm there is no `translateY` on anything during a switch, and the
    frame element itself has no animation.
  - Click A, B, C quickly. Nothing restarts the whole panel; the last-clicked piece always ends up showing. (A brief
    pop of the half-faded middle photo is acceptable.)
  - Close the panel (×), then open a **different** piece: the panel comes in fresh with no crossfade from the old
    photo. On a phone-width window, the sheet slides up with the new piece already in it — no double exposure.
  - Rendering panel → emulate `prefers-reduced-motion: reduce`: switching swaps photo and text instantly, no fade, no
    leftover old photo under a piece that has no photo.
- **Done when**: switching between two open pieces animates only the photo and the three text lines, using the values
  above, and opening/closing behaves exactly as before.
