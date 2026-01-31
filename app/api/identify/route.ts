import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function euclidean(a: number[], b: number[]) {
  let s = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    s += d * d;
  }
  return Math.sqrt(s);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  const { descriptor } = body as { descriptor: number[] };

  if (!Array.isArray(descriptor) || descriptor.length !== 128) {
    return NextResponse.json(
      { ok: false, error: "descriptor must be an array of length 128" },
      { status: 400 }
    );
  }

  const rows = await prisma.faceDescriptor.findMany({
    include: { user: true },
  });

  if (rows.length === 0) {
    return NextResponse.json({ ok: true, match: null, reason: "no enrolled faces" });
  }

  let best = {
    userId: rows[0].userId,
    label: (rows[0].user as any)?.name ?? (rows[0].user as any)?.email ?? "user",
    distance: Number.POSITIVE_INFINITY,
  };

  for (const r of rows) {
    const dist = euclidean(descriptor, r.descriptor);
    if (dist < best.distance) {
      best = {
        userId: r.userId,
        label: (r.user as any)?.name ?? (r.user as any)?.email ?? "user",
        distance: dist,
      };
    }
  }

  const THRESHOLD = 0.5; // tune later

  if (best.distance > THRESHOLD) {
    return NextResponse.json({
      ok: true,
      match: null,
      bestCandidate: best,
      threshold: THRESHOLD,
    });
  }

  return NextResponse.json({
    ok: true,
    match: best,
    threshold: THRESHOLD,
  });
}
