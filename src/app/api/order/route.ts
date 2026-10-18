import { NextResponse } from "next/server";
import { partsById } from "@/data/catalog";
import { en } from "@/i18n/en";
import { issues, issueText, resolve, totalPrice } from "@/lib/compat";
import { notify } from "@/lib/mail";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { CATEGORIES, type Build } from "@/lib/types";

const clean = (v: unknown, max: number) => String(v ?? "").replace(/[\r\n]+/g, " ").trim().slice(0, max);

export async function POST(request: Request) {
  if (!rateLimit(`order:${clientIp(request)}`, 5, 60 * 60_000))
    return NextResponse.json({ error: "Too many orders from this connection. Please call us instead." }, { status: 429 });

  const body = await request.json().catch(() => null);
  const name = clean(body?.name, 100);
  const email = clean(body?.email, 150);
  const phone = clean(body?.phone, 40);
  const address = clean(body?.address, 300);
  if (!name || !phone || !address || !/^\S+@\S+\.\S+$/.test(email))
    return NextResponse.json({ error: "Please fill in your name, a valid email, phone and address." }, { status: 400 });

  const build = body?.build as Build;
  const ok = build && CATEGORIES.every((c) => partsById.get(build[c])?.category === c);
  if (!ok) return NextResponse.json({ error: "Invalid build." }, { status: 400 });
  const problems = issues(build);
  if (problems.length) return NextResponse.json({ error: issueText(problems[0], en) }, { status: 400 });

  // Prices come from the server catalog, never from the client.
  const parts = resolve(build);
  const lines = CATEGORIES.map((c) => `${en.categories[c].padEnd(14)} ${parts[c]!.name}  (LKR ${parts[c]!.price.toLocaleString("en-US")})`);
  const ref = `NT-${Date.now().toString(36).toUpperCase()}`;
  const text = [
    `Order ${ref}`,
    `Customer: ${name}`, `Email: ${email}`, `Phone: ${phone}`, `Address: ${address}`,
    `Notes: ${clean(body?.notes, 500) || "-"}`,
    "", ...lines, "", `TOTAL: LKR ${totalPrice(build).toLocaleString("en-US")}`,
  ].join("\n");

  try {
    await notify(`New PC order ${ref} – ${name}`, text, email);
    return NextResponse.json({ ok: true, ref });
  } catch (err) {
    console.error("[order]", err);
    return NextResponse.json({ error: "We could not send your order. Please contact us directly." }, { status: 500 });
  }
}
