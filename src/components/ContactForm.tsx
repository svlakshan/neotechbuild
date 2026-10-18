"use client";

import { useState } from "react";
import type { Dict } from "@/i18n";

export default function ContactForm({ t }: { t: Dict["contact"] }) {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    setError("");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.error);
      setState("idle");
    }
  }

  if (state === "done") return <p role="status" className="text-emerald-400">{t.done}</p>;

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="c-name" className="label">{t.name}</label>
        <input id="c-name" name="name" required maxLength={100} autoComplete="name" className="input" />
      </div>
      <div>
        <label htmlFor="c-email" className="label">{t.email}</label>
        <input id="c-email" name="email" type="email" required maxLength={150} autoComplete="email" className="input" />
      </div>
      <div>
        <label htmlFor="c-msg" className="label">{t.message}</label>
        <textarea id="c-msg" name="message" required rows={5} maxLength={2000} className="input" />
      </div>
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      <button className="btn-primary w-full sm:w-auto" disabled={state === "sending"}>
        {state === "sending" ? t.sending : t.send}
      </button>
    </form>
  );
}
