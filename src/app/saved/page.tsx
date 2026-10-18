import type { Metadata } from "next";
import Link from "next/link";
import { Toolbar } from "@/components/Toolbar";

export const metadata: Metadata = { title: "Saved" };

// Nothing gets saved until matching runs on the server, so for now this page only says where saved looks will go.
export default function SavedPage()
  {
    return (
      <div className="flex flex-col gap-6">
        <Toolbar title="Saved" />

        <div className="rise max-w-md" style={{ animationDelay: "60ms" }}>
          <p className="display text-[1.75rem] leading-tight">No saved looks yet.</p>
          <p className="mt-3 text-text-secondary">Looks you match end up here, with the pieces you picked for each.</p>
          <Link href="/" className="button-primary caption mt-8">Match a look</Link>
        </div>
      </div>
    );
  }
