import { NextResponse } from "next/server";
import { db  } from "@/lib/prisma";
import { jsonSafe } from "@/lib/serialize";

export const runtime = "nodejs";

const shelterSelect = {
  shelter_id: true,
  address: true,
  email: true,
  phone: true,
  status: true,
  updated_at: true,
  latitude: true,
  longitude: true,
} as const;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;

  const shelters = await db.shelter.findMany({
    where: status ? { status: status as any } : undefined,
    orderBy: { updated_at: "desc" },
    select: shelterSelect,
  });

  return NextResponse.json(jsonSafe(shelters));
}
