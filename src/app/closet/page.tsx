import type { Metadata } from "next";
import { ClosetGrid } from "@/components/ClosetGrid";

export const metadata: Metadata = { title: "Closet" };

export default function ClosetPage()
  {
    return <ClosetGrid />;
  }
