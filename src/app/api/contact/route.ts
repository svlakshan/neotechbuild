import { NextResponse } from "next/server";
import { notify } from "@/lib/mail";
import { clientIp, rateLimit } from "@/lib/ratelimit";

const clean = (v: unknown, max: number) => String(v ?? "").replace(/[\r\n]+/g, " ").trim().slice(0, max);

export async function POST(request: Request) {
  if (!rateLimit(`contact:${clientIp(request)}`, 5, 60 * 60_000))
    return NextResponse.json({ error: "Too many messages. Please try again later." }, { status: 429 });
  const body = await request.json().catch(() => null);
  const name = clean(body?.name, 100);
  const email = clean(body?.email, 150);
  const message = String(body?.message ?? "").trim().slice(0, 2000);
  if (!name || !message || !/^\S+@\S+\.\S+$/.test(email))
    return NextResponse.json({ error: "Please fill in your name, a valid email and a message." }, { status: 400 });
  try {
    await notify(`Website enquiry from ${name}`, `From: ${name} <${email}>\n\n${message}`, email);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not send your message. Please email us directly." }, { status: 500 });
  }
}
