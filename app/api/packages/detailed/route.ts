// FILE: src/app/api/packages/detailed/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { jsonSafe } from "@/lib/serialize";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const shelterId = searchParams.get("shelter_id");

    const whereClause: any = {};

    if (status) {
      whereClause.status = status;
    }

    if (shelterId) {
      whereClause.shelter_id = shelterId;
    }

    const packages = await db.package.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      include: {
        personal: {
          select: {
            first_name: true,
            last_name: true
          }
        }
      },
      orderBy: { arrival_date: "desc" },
      take: 100,
    });

    const formattedPackages = packages.map((p: any) => ({
      package_id: p.package_id,
      personal_id: p.personal_id,
      recipient_name: `${p.personal.first_name} ${p.personal.last_name}`,
      status: p.status,
      operator: p.operator,
      arrival_date: p.arrival_date,
      expected_at: p.expected_at,
      handout_date: p.handout_date,
      shelter_id: p.shelter_id,
      verification_log_id: p.verification_log_id,
    }));

    return NextResponse.json(jsonSafe(formattedPackages));
  } catch (err) {
    console.error("packages/detailed API failed:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}