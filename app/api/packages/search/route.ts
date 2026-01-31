// FILE: src/app/api/packages/search/route.ts
import { NextResponse } from "next/server";
import { db  } from "@/lib/prisma";

const isUuid = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);

export async function GET(req: Request) {
  try {
    const q = new URL(req.url).searchParams.get("q")?.trim() || "";
    if (!q) return NextResponse.json([]);

    const uuid = isUuid(q);

    const packages = await db.package.findMany({
      where: uuid
        ? {
            OR: [{ package_id: q }, { personal_id: q }],
          }
        : {
            personal: {
              is: {
                OR: [
                  { first_name: { contains: q, mode: "insensitive" } },
                  { last_name: { contains: q, mode: "insensitive" } },
                  { aliases: { has: q } },
                  { past_names: { has: q } },
                  { past_surnames: { has: q } },
                ],
              },
            },
          },
      include: { personal: { select: { first_name: true, last_name: true } } },
      take: 50,
    });

    return NextResponse.json(
      packages.map((p) => ({
        package_id: p.package_id,
        personal_id: p.personal_id,
        recipient_name: `${p.personal.first_name} ${p.personal.last_name}`,
        status: p.status,
      }))
    );
  } catch (err) {
    console.error("packages/search failed:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
