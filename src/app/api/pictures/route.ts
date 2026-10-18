import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileNameFor, isPictureName, PICTURE_TYPES, PICTURES_DIR, pictureUrl, type Picture } from "@/lib/my-pictures";

// Every picture in the folder, newest first.
export async function GET()
  {
    await mkdir(PICTURES_DIR, { recursive: true });
    const names = (await readdir(PICTURES_DIR)).filter(isPictureName).sort().reverse();
    const pictures: Picture[] = names.map((name) => ({ name, url: pictureUrl(name) }));

    return Response.json(pictures);
  }

// Saves each photo you send. Anything that isn't a JPEG, PNG or WebP is skipped.
export async function POST(request: Request)
  {
    const form = await request.formData();
    const files = form.getAll("files").filter((entry): entry is File => entry instanceof File && entry.type in PICTURE_TYPES);

    await mkdir(PICTURES_DIR, { recursive: true });

    const saved: Picture[] = [];
    for(const file of files)
      {
        const name = fileNameFor(file, PICTURE_TYPES[file.type]);
        await writeFile(path.join(PICTURES_DIR, name), Buffer.from(await file.arrayBuffer()));
        saved.push({ name, url: pictureUrl(name) });
      }

    return Response.json(saved.reverse(), { status: saved.length ? 201 : 400 });
  }
