import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export const runtime = "nodejs"; // required for filesystem access

function sanitizeName(name: string) {
  // allow letters, digits, underscore, dash, space
  const cleaned = name.trim().replace(/[^\w\- ]+/g, "");
  return cleaned.slice(0, 40);
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const rawName = String(form.get("name") ?? "");
    const file = form.get("file");

    if (!rawName) {
      return NextResponse.json({ ok: false, error: "Missing name" }, { status: 400 });
    }
    if (!(file instanceof Blob)) {
      return NextResponse.json({ ok: false, error: "Missing file" }, { status: 400 });
    }

    const name = sanitizeName(rawName);
    if (!name) {
      return NextResponse.json({ ok: false, error: "Invalid name" }, { status: 400 });
    }

    // Save into /public/labels/<Name>/<n>.png and update /public/labels/index.json
    const labelsRoot = path.join(process.cwd(), "public", "labels");
    const personDir = path.join(labelsRoot, name);
    const indexPath = path.join(labelsRoot, "index.json");

    await ensureDir(personDir);

    // Load or initialize index.json
    let index: Record<string, number> = {};
    try {
      const raw = await fs.readFile(indexPath, "utf-8");
      index = JSON.parse(raw);
    } catch {
      index = {};
      // ensure labels root exists
      await ensureDir(labelsRoot);
      await fs.writeFile(indexPath, JSON.stringify(index, null, 2), "utf-8");
    }

    const nextNumber = (index[name] ?? 0) + 1;
    const filename = `${nextNumber}.png`;
    const fullPath = path.join(personDir, filename);

    const buf = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(fullPath, buf);

    index[name] = nextNumber;
    await fs.writeFile(indexPath, JSON.stringify(index, null, 2), "utf-8");

    return NextResponse.json({
      ok: true,
      name,
      savedAs: `/labels/${name}/${filename}`,
      count: nextNumber,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
