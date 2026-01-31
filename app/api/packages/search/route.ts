// FILE: src/app/api/packages/search/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

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

      // ✅ select ONLY what you want to output
      select: {
        personal: {
          select: {
            biometrics_id: true,
            first_name: true,
            last_name: true,
          },
        },
      },

      take: 50,
    });

    // ✅ output ONLY person + biometrics_id
    return NextResponse.json(
      packages
        .map((p) => p.personal)
        .filter((x): x is NonNullable<typeof x> => Boolean(x))
        .map((p) => ({
          biometrics_id: p.biometrics_id,
          person: `${p.first_name} ${p.last_name}`.trim(),
        }))
    );
  } catch (err) {
    console.error("packages/search failed:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
