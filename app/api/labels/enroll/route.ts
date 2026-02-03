<<<<<<< HEAD
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import { db } from "@/lib/prisma";

export const runtime = "nodejs";

const isUuid = (v: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

export async function POST(req: Request) {
  console.log("HIT: POST /api/labels/enroll");

  try {
    const form = await req.formData();

    // NOTE: client still sends field named "biometrics_id"
    const inputId = String(form.get("biometrics_id") ?? "").trim();
    const file = form.get("file");

    console.log("ENROLL inputId:", inputId);

    if (!inputId) {
      return NextResponse.json({ ok: false, error: "Missing biometrics_id" }, { status: 400 });
    }
    if (!(file instanceof Blob)) {
      return NextResponse.json({ ok: false, error: "Missing file" }, { status: 400 });
    }

    // Optional guards
    if (file.type && !["image/png", "image/jpeg"].includes(file.type)) {
      return NextResponse.json({ ok: false, error: "Only PNG/JPEG allowed" }, { status: 400 });
    }
    const MAX_BYTES = 6 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ ok: false, error: "File too large" }, { status: 413 });
    }

    // ---- Resolve to a real biometrics_id ----
    let biometrics_id: string | null = null;

    // 1) If it looks like a UUID, try it directly as biometrics_id
    if (isUuid(inputId)) {
      const exists = await db.biometrics.findUnique({
        where: { biometrics_id: inputId },
        select: { biometrics_id: true },
      });
      if (exists) biometrics_id = exists.biometrics_id;
    }

    // 2) If not found, treat inputId as personal_id and resolve via package -> personal
    // (uses ONLY names you've shown: package.personal_id and relation package.personal)
    if (!biometrics_id) {
      const row = await db.package.findFirst({
        where: { personal_id: inputId },
        select: { personal: { select: { biometrics_id: true } } },
      });

      biometrics_id = row?.personal?.biometrics_id ?? null;
    }

    if (!biometrics_id) {
      return NextResponse.json(
        { ok: false, error: "No biometrics_id found for provided id" },
        { status: 404 }
      );
    }

    // ---- Save file under resolved biometrics_id ----
    const photosRoot = path.join(process.cwd(), "public", "photos");
    const folder = path.join(photosRoot, biometrics_id);
    await ensureDir(folder);

    const randomId = crypto.randomUUID();
    const filename = `${randomId}.png`;
    const fullPath = path.join(folder, filename);

    const buf = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(fullPath, buf);

    return NextResponse.json({
      ok: true,
      biometrics_id,
      savedAs: `/photos/${biometrics_id}/${filename}`,
    });
  } catch (err) {
    console.error("ENROLL error:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
=======
>>>>>>> parent of eda0109 (Add Feature to add people foro face recognition)
