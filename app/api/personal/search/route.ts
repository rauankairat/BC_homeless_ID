import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

const isUuid = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    s
  );

function parseNameTokens(q: string) {
  // supports "Last, First Middle" and "First Middle Last"
  const trimmed = q.trim();
  if (!trimmed) return [];

  if (trimmed.includes(",")) {
    const [lastRaw, restRaw] = trimmed.split(",", 2);
    const last = lastRaw.trim();
    const rest = (restRaw ?? "").trim();
    const restParts = rest.split(/\s+/).filter(Boolean);
    // "Last, First" => [First, Last]
    // "Last, First Middle" => [First, Middle, Last]
    return restParts.length ? [...restParts, last] : [last];
  }

  return trimmed.split(/\s+/).filter(Boolean);
}

export async function GET(req: Request) {
  try {
    const q = new URL(req.url).searchParams.get("q")?.trim() || "";
    if (!q) return NextResponse.json([]);

    const uuid = isUuid(q);
    const parts = parseNameTokens(q);

    const exactNameClauses: any[] = [];

    // Exact: first + last
    if (parts.length === 2) {
      const [first, last] = parts;
      exactNameClauses.push({
        AND: [
          { first_name: { equals: first, mode: "insensitive" } },
          { last_name: { equals: last, mode: "insensitive" } },
        ],
      });
    }

    // Exact: first + middle + last
    if (parts.length === 3) {
      const [first, middle, last] = parts;
      exactNameClauses.push({
        AND: [
          { first_name: { equals: first, mode: "insensitive" } },
          { middle_name: { equals: middle, mode: "insensitive" } },
          { last_name: { equals: last, mode: "insensitive" } },
        ],
      });
    }

    const people = await db.personalInfo.findMany({
      where: uuid
        ? {
            OR: [
              { personal_id: q },
              // include these too if you want "id" to match any linked uuid fields
              { shelter_id: q },
              { location_contact_id: q },
              { biometrics_id: q },
              { consent_id: q },
            ],
          }
        : {
            OR: [
              // exact full-name matches
              ...exactNameClauses,

              // general "by names" fallback (partial)
              { first_name: { contains: q, mode: "insensitive" } },
              { middle_name: { contains: q, mode: "insensitive" } },
              { last_name: { contains: q, mode: "insensitive" } },

              // exact array membership
              { aliases: { has: q } },
              { past_names: { has: q } },
              { past_surnames: { has: q } },
            ],
          },
      select: {
        personal_id: true,
        first_name: true,
        middle_name: true,
        last_name: true,
        DOB: true,
        status: true,
        shelter_id: true,
        location_contact_id: true,
        biometrics_id: true,
        consent_id: true,
        update_date: true,
      },
      orderBy: [{ update_date: "desc" }],
      take: 50,
    });

    return NextResponse.json(
      people.map((p) => ({
        personal_id: p.personal_id,
        full_name: [p.first_name, p.middle_name, p.last_name].filter(Boolean).join(" "),
        first_name: p.first_name,
        middle_name: p.middle_name,
        last_name: p.last_name,
        DOB: p.DOB,
        status: p.status,
        shelter_id: p.shelter_id,
        location_contact_id: p.location_contact_id,
        biometrics_id: p.biometrics_id,
        consent_id: p.consent_id,
        updated_at: p.update_date,
      }))
    );
  } catch (err) {
    console.error("personal/search failed:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
