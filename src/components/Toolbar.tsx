import type { ReactNode } from "react";

type ToolbarProps =
  {
    title: string;
    subtitle?: ReactNode;
    children?: ReactNode;
  };

// The top of every screen: its name (and a line under it, if it has one) on the left, what you can do on the right.
export function Toolbar({ title, subtitle, children }: ToolbarProps)
  {
    return (
      <div className="flex min-h-[3.75rem] flex-wrap items-end justify-between gap-x-8 gap-y-4 pb-4">
        <div className="min-w-0">
          {/* The title rises out from under its baseline; everything else fades in after it. */}
          <h1 className="display text-[2rem] leading-none sm:text-[2.5rem]">
            <span className="line-mask"><span className="line-reveal">{title}</span></span>
          </h1>
          {subtitle && <p style={{ animationDelay: "180ms" }} className="fade-in-slow display mt-2 text-[1.125rem] leading-snug text-text-secondary sm:text-[1.25rem]">{subtitle}</p>}
        </div>
        {children && <div style={{ animationDelay: "240ms" }} className="fade-in-slow flex flex-wrap items-center gap-x-6 gap-y-3">{children}</div>}
      </div>
    );
  }
