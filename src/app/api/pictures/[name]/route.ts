import { readFile, rm } from "node:fs/promises";
import path from "node:path";
import { contentType, isPictureName, PICTURES_DIR } from "@/lib/my-pictures";

// One picture's file, for the grid to show.
export async function GET(_request: Request, context: RouteContext<"/api/pictures/[name]">)
  {
    const { name } = await context.params;
    if(!isPictureName(name)) return new Response(null, { status: 404 });

    try
      {
        const file = await readFile(path.join(PICTURES_DIR, name));
        return new Response(file, { headers: { "Content-Type": contentType(name), "Cache-Control": "private, max-age=31536000, immutable" } });
      }
    catch
      {
        return new Response(null, { status: 404 });
      }
  }

// Takes a picture out of the folder for good.
export async function DELETE(_request: Request, context: RouteContext<"/api/pictures/[name]">)
  {
    const { name } = await context.params;
    if(!isPictureName(name)) return new Response(null, { status: 404 });

    await rm(path.join(PICTURES_DIR, name), { force: true });
    return new Response(null, { status: 204 });
  }
