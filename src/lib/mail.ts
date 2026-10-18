import "server-only";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import nodemailer from "nodemailer";

export async function notify(subject: string, text: string, replyTo?: string): Promise<"emailed" | "saved"> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, ORDER_TO_EMAIL } = process.env;
  if (SMTP_HOST && ORDER_TO_EMAIL) {
    const transport = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    });
    await transport.sendMail({ from: SMTP_USER || ORDER_TO_EMAIL, to: ORDER_TO_EMAIL, replyTo, subject, text });
    return "emailed";
  }
  // No SMTP configured: keep the message so it is never lost during development.
  console.log(`\n=== ${subject} ===\n${text}\n`);
  try {
    const dir = path.join(process.cwd(), "data");
    await mkdir(dir, { recursive: true });
    await appendFile(path.join(dir, "orders.jsonl"), JSON.stringify({ at: new Date().toISOString(), subject, text }) + "\n");
  } catch {
    /* read-only filesystem (e.g. serverless) – console log above is the fallback */
  }
  return "saved";
}
