import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { db } from "@/lib/prisma";

export const runtime = "nodejs";

const isUuid = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);

export async function GET() {
  try {
    const photosRoot = path.join(process.cwd(), "public", "photos");

    let biometricsFolders: string[] = [];
    try {
      biometricsFolders = await fs.readdir(photosRoot);
    } catch {
      return NextResponse.json({ ok: true, people: [] });
    }

    const people = [];

    for (const biometrics_id of biometricsFolders) {
      if (!isUuid(biometrics_id)) continue;

      const dir = path.join(photosRoot, biometrics_id);
      let files: string[] = [];
      try {
        files = await fs.readdir(dir);
      } catch {
        continue;
      }

      const photos = files
        .filter((f) => /\.(png|jpg|jpeg)$/i.test(f))
        .map((f) => `/photos/${biometrics_id}/${f}`);

      if (photos.length === 0) continue;

      // 🔥 get the name from DB
      const bio = await db.biometrics.findUnique({
        where: { biometrics_id },
        select: {
          personal_info: {
            select: {
              first_name: true,
              last_name: true,
            },
          },
        },
      });

      const name =
        bio?.personal_info
          ? `${bio.personal_info.first_name} ${bio.personal_info.last_name}`.trim()
          : biometrics_id; // fallback if not linked

      people.push({ biometrics_id, name, photos });
    }

    return NextResponse.json({ ok: true, people });
  } catch (err) {
    console.error("photos/index failed:", err);
    return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
  }
}
