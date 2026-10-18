import Link from "next/link";
import { NavLinks } from "@/components/NavLinks";

export function SiteHeader()
  {
    return (
      <header className="shrink-0 border-b border-line">
        <div className="mx-auto flex h-14 max-w-7xl items-stretch gap-6 px-4 sm:h-16 sm:gap-12 sm:px-8">
          <Link href="/" className="nav-link wordmark flex items-center">
            Style<span className="text-text-secondary">.io</span>
          </Link>
          <NavLinks />
        </div>
      </header>
    );
  }
