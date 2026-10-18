import path from "node:path";

// Your pictures are saved next to the training code, so the Python side can read them straight off the disk.
// The dev server runs from Style.io_Client, so this lands in Style.io_Server/ml/data/my-pictures.
export const PICTURES_DIR = path.join(process.cwd(), "..", "Style.io_Server", "ml", "data", "my-pictures");

// The photo types a browser can show and the model's image loader can open.
export const PICTURE_TYPES: Record<string, string> =
  {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };

const CONTENT_TYPES: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };

export type Picture = { name: string; url: string };

export function pictureUrl(name: string)
  {
    return `/api/pictures/${encodeURIComponent(name)}`;
  }

// Only plain file names saved by this app, so a request can't reach outside the folder.
export function isPictureName(name: string)
  {
    return /^[\w-]+\.(jpg|jpeg|png|webp)$/i.test(name);
  }

export function contentType(name: string)
  {
    return CONTENT_TYPES[name.split(".").pop()?.toLowerCase() ?? ""] ?? "application/octet-stream";
  }

// Named by when it came in plus the original name, so files sort by date and you can still tell them apart.
export function fileNameFor(file: File, extension: string)
  {
    const base = file.name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "picture";
    return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}-${base}.${extension}`;
  }
