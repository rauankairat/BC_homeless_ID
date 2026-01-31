import { Prisma } from "@prisma/client";

export const jsonSafe = (value: unknown): any => {
  if (value === null || value === undefined) return value;

  // Prisma 7.x Decimal (most reliable check)
  if (Prisma.Decimal.isDecimal(value)) return (value as Prisma.Decimal).toNumber();

  if (typeof value === "bigint") return value.toString();
  if (value instanceof Date) return value.toISOString();

  if (Array.isArray(value)) return value.map(jsonSafe);

  if (typeof value === "object") {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = jsonSafe(v);
    }
    return out;
  }

  return value;
};
