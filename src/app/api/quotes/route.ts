import { NextResponse } from "next/server";
import { generateQuotes } from "@/lib/gemini";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { isLocale } from "@/i18n";
import { PURPOSES, type Purpose, type Requirements } from "@/lib/types";

export const maxDuration = 60;

const pick = <T extends string>(v: unknown, allowed: readonly T[], d: T): T =>
  allowed.includes(v as T) ? (v as T) : d;
const num = (v: unknown, min: number, max: number, d: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : d;
};
/** Purposes are optional: an empty list means "general use". */
const purposesFrom = (v: unknown): Purpose[] => (Array.isArray(v) ? PURPOSES.filter((p) => v.includes(p)) : []);

export async function POST(request: Request) {
  if (!rateLimit(`quotes:${clientIp(request)}`, 15, 10 * 60_000))
    return NextResponse.json({ error: "Too many requests. Please try again in a few minutes." }, { status: 429 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const req: Requirements = {
    purposes: purposesFrom(body.purposes),
    budget: num(body.budget, 100_000, 2_000_000, 300_000),
    cpuBrand: pick(body.cpuBrand, ["any", "Intel", "AMD"], "any"),
    gpuBrand: pick(body.gpuBrand, ["any", "NVIDIA", "AMD"], "any"),
    minRamGB: num(body.minRamGB, 0, 64, 16),
    minStorageGB: num(body.minStorageGB, 0, 4000, 500),
    size: pick(body.size, ["any", "compact"], "any"),
    gpuMode: pick(body.gpuMode, ["auto", "dedicated", "integrated"], "auto"),
    rgb: Boolean(body.rgb),
    wifi: Boolean(body.wifi),
    futureProof: Boolean(body.futureProof),
    notes: String(body.notes ?? "").slice(0, 400),
  };
  const lang = isLocale(body.lang) ? body.lang : "en";
  const variation = num(body.variation, 0, 50, 0);

  try {
    return NextResponse.json(await generateQuotes(req, lang, variation));
  } catch (err) {
    console.error("[quotes]", err);
    return NextResponse.json({ error: "We could not build a quote for those requirements. Try a higher budget." }, { status: 422 });
  }
}
