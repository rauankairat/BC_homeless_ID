import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import crypto from "crypto";

type Payload = {
  shelter_id: string; // REQUIRED UUID (existing Shelter row)
  first_name: string;
  middle_name?: string;
  last_name: string;

  aliases?: string[];
  past_names?: string[];
  past_surnames?: string[];
  preferred_name?: string; // not in schema, but allowed in payload if you want to ignore/store elsewhere

  DOB: string; // "YYYY-MM-DD" from <input type="date" />
  responsible_worker_ids?: string[]; // UUID strings
  referees?: unknown; // Prisma Json?
};

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v
  );
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(String).map((s) => s.trim()).filter(Boolean);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Payload;

    // ---- required checks ----
    if (!body.first_name?.trim()) {
      return NextResponse.json(
        { error: 'Field "first_name" is required.' },
        { status: 400 }
      );
    }
    if (!body.last_name?.trim()) {
      return NextResponse.json(
        { error: 'Field "last_name" is required.' },
        { status: 400 }
      );
    }
    if (!body.DOB?.trim()) {
      return NextResponse.json(
        { error: 'Field "DOB" is required.' },
        { status: 400 }
      );
    }
    if (!body.shelter_id?.trim()) {
      return NextResponse.json(
        { error: 'Field "shelter_id" is required.' },
        { status: 400 }
      );
    }
    if (!isUuid(body.shelter_id)) {
      return NextResponse.json(
        { error: "shelter_id must be a UUID." },
        { status: 400 }
      );
    }

    // DOB parse (store as @db.Date)
    // Use UTC noon to avoid timezone day-shift issues
    const dob = new Date(`${body.DOB}T12:00:00.000Z`);
    if (Number.isNaN(dob.getTime())) {
      return NextResponse.json(
        { error: "DOB must be a valid date (YYYY-MM-DD)." },
        { status: 400 }
      );
    }

    // Arrays
    const aliases = normalizeStringArray(body.aliases);
    const past_names = normalizeStringArray(body.past_names);
    const past_surnames = normalizeStringArray(body.past_surnames);

    // responsible_worker_ids must be UUIDs (schema: String[] @db.Uuid)
    const workerIds = normalizeStringArray(body.responsible_worker_ids);
    for (const id of workerIds) {
      if (!isUuid(id)) {
        return NextResponse.json(
          { error: `Invalid worker UUID in responsible_worker_ids: ${id}` },
          { status: 400 }
        );
      }
    }

    // ---- generate required UUIDs ----
    const personal_id = crypto.randomUUID();
    const biometrics_id = crypto.randomUUID();
    const consent_id = crypto.randomUUID();
    const location_contact_id = crypto.randomUUID(); // required scalar field in PersonalInfo
    const photo_id = crypto.randomUUID();

    // referees Json? handling:
    // - undefined => don't set
    // - null => set JSON null (Prisma.JsonNull)
    // - else => set the value
    const refereesValue =
      body.referees === undefined
        ? undefined
        : body.referees === null
        ? Prisma.JsonNull
        : (body.referees as Prisma.InputJsonValue);

    // ---- create PersonalInfo using ONLY checked create style (relations) ----
    // IMPORTANT: do NOT include shelter_id/biometrics_id/consent_id scalars here,
    // because that flips Prisma into UncheckedCreateInput and breaks nested creates.
    const created = await db.personalInfo.create({
      data: {
        personal_id,
        location_contact_id,

        first_name: body.first_name.trim(),
        middle_name: body.middle_name?.trim() || null,
        last_name: body.last_name.trim(),

        aliases,
        past_names,
        past_surnames,

        DOB: dob,
        responsible_worker_ids: workerIds,

        referees: refereesValue,

        shelter: {
          connect: { shelter_id: body.shelter_id },
        },
        biometrics: {
          create: {
            biometrics_id,
            photo_id,
          },
        },
        consent: {
          create: {
            consent_id,
          },
        },
      },
      include: {
        shelter: true,
        biometrics: true,
        consent: true,
      },
    });

    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (err: any) {
    // Common Prisma errors show up here (e.g., shelter_id not found, unique collisions)
    console.error(err);

    // Optional: nicer message for "connect failed" (shelter_id doesn't exist)
    const message = typeof err?.message === "string" ? err.message : "Server error";
    const isConnectError =
      message.includes("connect") && message.includes("records") && message.includes("not found");

    return NextResponse.json(
      {
        error: isConnectError
          ? "Shelter not found. shelter_id must reference an existing Shelter row."
          : "Server error creating personal info.",
        detail: message,
      },
      { status: 500 }
    );
  }
}
