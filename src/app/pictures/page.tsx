import type { Metadata } from "next";
import { MyPictures } from "@/components/MyPictures";

export const metadata: Metadata = { title: "My pictures" };

export default function PicturesPage()
  {
    return <MyPictures />;
  }
