"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";
import { useCloset } from "@/components/ClosetProvider";

const LINKS = [
  { href: "/", label: "Match" },
  { href: "/closet", label: "Closet" },
  { href: "/saved", label: "Saved" },
];

// The current tab gets ink and a bar sitting on the header's bottom line; the rest stay grey.
// Before the page is running each tab draws its own bar. After that, one bar slides to whichever tab you pick.
export function NavLinks()
  {
    const pathname = usePathname();
    const { photos } = useCloset();
    const navRef = useRef<HTMLElement>(null);
    const barRef = useRef<HTMLSpanElement>(null);

    useLayoutEffect(() =>
      {
        const nav = navRef.current;
        const bar = barRef.current;
        if(!nav || !bar) return;

        // Putting the bar under the current tab, stretched to its width.
        const place = () =>
          {
            const current = nav.querySelector<HTMLElement>('[aria-current="page"]');
            if(!current)
              {
                nav.removeAttribute("data-ready");
                return;
              }

            bar.style.transform = `translateX(${current.offsetLeft}px) scaleX(${current.offsetWidth})`;
            nav.setAttribute("data-ready", "");
          };

        place();

        // The first placement jumps straight there; only later moves slide. Waiting a frame so the browser has
        // painted the bar in place before the transition switches on.
        const frame = requestAnimationFrame(() => nav.setAttribute("data-animate", ""));

        // Tabs change width when the fonts load or the closet count grows, so the bar follows them.
        const observer = new ResizeObserver(place);
        nav.querySelectorAll("a").forEach((link) => observer.observe(link));

        return () =>
          {
            cancelAnimationFrame(frame);
            observer.disconnect();
          };
      }, [pathname]);

    return (
      <nav ref={navRef} aria-label="Main" className="nav-rail relative flex">
        <ul className="flex items-stretch gap-5 sm:gap-8">
          {LINKS.map((link) =>
            {
              const current = pathname === link.href;

              return (
                <li key={link.href} className="flex">
                  <Link href={link.href} aria-current={current ? "page" : undefined} className="nav-tab caption">
                    {link.label}
                    {link.href === "/closet" && <span className="ml-1.5 tabular-nums text-text-secondary">{photos.length}</span>}
                  </Link>
                </li>
              );
            })}
        </ul>
        <span ref={barRef} aria-hidden className="nav-indicator" />
      </nav>
    );
  }
