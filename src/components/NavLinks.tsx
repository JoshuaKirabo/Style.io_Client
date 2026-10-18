"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCloset } from "@/components/ClosetProvider";

const LINKS = [
  { href: "/", label: "Match" },
  { href: "/closet", label: "Closet" },
  { href: "/saved", label: "Saved" },
];

// The current tab gets ink and a bar sitting on the header's bottom line; the rest stay grey.
export function NavLinks()
  {
    const pathname = usePathname();
    const { photos } = useCloset();

    return (
      <nav aria-label="Main" className="flex">
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
      </nav>
    );
  }
