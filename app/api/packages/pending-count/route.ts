import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const personalId = searchParams.get("personal_id");

    if (!personalId) {
      return NextResponse.json({ error: "personal_id is required" }, { status: 400 });
    }

    const count = await db.package.count({
      where: {
        personal_id: personalId,
        status: "pending", // matches your enum default
      },
    });

    return NextResponse.json({ personal_id: personalId, pending_count: count });
  } catch (err) {
    console.error("pending-count route failed:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
