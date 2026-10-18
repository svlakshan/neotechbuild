"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, ArrowLeft, Check, Loader2, Plus, RefreshCw, Settings2, Sparkles } from "lucide-react";
import { partsByCategory } from "@/data/catalog";
import { candidateIssues, issues, issueText, requiredWatts, resolve, totalPrice } from "@/lib/compat";
import { CATEGORIES, PURPOSES, type Build, type Purpose, type Quote, type Requirements } from "@/lib/types";
import type { Dict, Locale } from "@/i18n";
import { purposeCards } from "./purposes";

type Step = "purpose" | "form" | "loading" | "quotes" | "done";

const money = (n: number) => `LKR ${n.toLocaleString("en-US")}`;
const STORAGE_KEY = "neotech-build-v1";

/** Everything the customer has chosen so far; kept across language switches and reloads. */
interface Saved {
  step: Step;
  req: Requirements;
  quotes: Quote[];
  builds: Record<string, Build>;
  selectedId: string | null;
  aiUsed: boolean;
  variation: number;
}

const TIER_ORDER = ["value", "balanced", "performance", "custom"] as const;

const INITIAL: Requirements = {
  purposes: [], budget: 300000, cpuBrand: "any", gpuBrand: "any", minRamGB: 0, minStorageGB: 0,
  size: "any", gpuMode: "auto", rgb: false, wifi: false, futureProof: false, notes: "",
};

export default function BuildWizard({ lang, dict }: { lang: Locale; dict: Dict }) {
  const t = dict.build;
  const [step, setStep] = useState<Step>("purpose");
  const [req, setReq] = useState<Requirements>(INITIAL);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [builds, setBuilds] = useState<Record<string, Build>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [aiUsed, setAiUsed] = useState(true);
  const [variation, setVariation] = useState(0);
  const [error, setError] = useState("");
  const [ordering, setOrdering] = useState(false);
  const [ref, setRef] = useState("");
  const detailRef = useRef<HTMLDivElement>(null);

  const set = <K extends keyof Requirements>(k: K, v: Requirements[K]) => setReq((r) => ({ ...r, [k]: v }));

  const [restored, setRestored] = useState(false);

  // Restore progress (e.g. after switching language, which loads a different URL).
  useEffect(() => {
    let saved: Saved | null = null;
    try {
      saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null");
    } catch {
      /* storage unavailable or corrupt: start fresh */
    }
    if (saved?.req) {
      setReq({ ...INITIAL, ...saved.req });
      setQuotes(saved.quotes ?? []);
      setBuilds(saved.builds ?? {});
      setSelectedId(saved.selectedId ?? null);
      setAiUsed(saved.aiUsed ?? true);
      setVariation(saved.variation ?? 0);
      setStep(saved.step === "quotes" && !saved.quotes?.length ? "form" : saved.step);
    } else {
      const p = new URLSearchParams(window.location.search).get("purpose");
      if (PURPOSES.includes(p as Purpose)) setReq((r) => withPurposes(r, [p as Purpose]));
    }
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;
    try {
      // "loading" and "done" are transient: come back to the form / start page instead.
      const savedStep: Step = step === "loading" ? "form" : step === "done" ? "purpose" : step;
      const data: Saved = { step: savedStep, req, quotes, builds, selectedId, aiUsed, variation };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* ignore quota / privacy-mode errors */
    }
  }, [restored, step, req, quotes, builds, selectedId, aiUsed, variation]);

  /** Add/remove a purpose, then re-derive sensible default budget and memory from the selection. */
  function togglePurpose(p: Purpose) {
    setReq((r) => withPurposes(r, r.purposes.includes(p) ? r.purposes.filter((x) => x !== p) : [...r.purposes, p]));
  }

  function withPurposes(r: Requirements, purposes: Purpose[]): Requirements {
    if (!purposes.length) return { ...r, purposes, minRamGB: 0 };
    const cards = purposeCards.filter((c) => purposes.includes(c.id));
    const budget = Math.min(1_000_000, Math.max(...cards.map((c) => c.budget)) + (cards.length - 1) * 30_000);
    const needsMuchRam = purposes.some((x) => x !== "gaming" && x !== "personal" && x !== "office");
    const minRamGB = needsMuchRam ? 32 : purposes.includes("gaming") ? 16 : 8;
    return { ...r, purposes, budget, minRamGB };
  }

  async function generate(nextVariation = 0) {
    setError("");
    setVariation(nextVariation);
    const keepCustom = quotes.find((q) => q.id === "custom");
    setStep("loading");
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...req, lang, variation: nextVariation }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      const fresh: Quote[] = json.quotes;
      const all = keepCustom ? [...fresh, keepCustom] : fresh;
      setQuotes(all);
      setBuilds((prev) => ({
        ...Object.fromEntries(fresh.map((q) => [q.id, q.build])),
        ...(keepCustom ? { custom: prev.custom } : {}),
      }));
      setAiUsed(json.aiUsed);
      setSelectedId(null);
      setOrdering(false);
      setStep("quotes");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.error);
      setStep("form");
    }
  }

  function select(id: string) {
    setSelectedId(id);
    setOrdering(false);
    requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function createCustom() {
    const base = builds[selectedId ?? ""] ?? builds.balanced;
    const custom: Quote = { id: "custom", summary: "", build: base, total: totalPrice(base), source: "rules" };
    setBuilds((b) => ({ ...b, custom: { ...base } }));
    setQuotes((qs) => [...qs.filter((q) => q.id !== "custom"), custom]);
    select("custom");
  }

  const swap = (cat: keyof Build, id: string) =>
    setBuilds((b) => ({ ...b, [selectedId!]: { ...b[selectedId!], [cat]: id } }));

  const ordered = useMemo(
    () => [...quotes].sort((a, b) => TIER_ORDER.indexOf(a.id as never) - TIER_ORDER.indexOf(b.id as never)),
    [quotes],
  );
  const selected = quotes.find((q) => q.id === selectedId);
  const build = selectedId ? builds[selectedId] : undefined;
  const problems = useMemo(() => (build ? issues(build) : []), [build]);
  const tier = (id: string) => t.tiers[id as keyof typeof t.tiers] ?? t.tiers.custom;

  return (
    <div>
      {step === "purpose" && (
        <section aria-labelledby="pp">
          <h1 id="pp" className="text-3xl font-extrabold text-white sm:text-4xl">{t.purposeH}</h1>
          <p className="mt-2 text-slate-400">{t.purposeSub}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {purposeCards.map(({ id, Icon }) => {
              const on = req.purposes.includes(id);
              return (
                <button key={id} type="button" aria-pressed={on} onClick={() => togglePurpose(id)}
                  className={`card relative text-left transition ${on ? "border-cyan-400 bg-slate-900 ring-1 ring-cyan-400" : "hover:border-cyan-500/60 hover:bg-slate-900"}`}>
                  <span className={`absolute right-4 top-4 grid h-6 w-6 place-items-center rounded-full border ${on ? "border-cyan-400 bg-cyan-400 text-slate-950" : "border-slate-600"}`}>
                    {on && <Check className="h-4 w-4" aria-hidden />}
                  </span>
                  <Icon className="h-8 w-8 text-cyan-400" aria-hidden />
                  <h2 className="mt-3 text-lg font-semibold text-white">{dict.purposes[id].title}</h2>
                  <p className="mt-1 text-sm text-slate-400">{dict.purposes[id].blurb}</p>
                </button>
              );
            })}
          </div>
          <div className="sticky bottom-4 mt-6 flex flex-col items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/90 p-4 backdrop-blur sm:flex-row sm:justify-between">
            <p className="text-sm text-slate-400">
              {req.purposes.length
                ? `${t.selected} ${req.purposes.map((p) => dict.purposes[p].title).join(", ")}`
                : t.noneSelected}
            </p>
            <button type="button" className="btn-primary w-full sm:w-auto" onClick={() => setStep("form")}>
              {req.purposes.length ? t.customize : t.skip}
            </button>
          </div>
        </section>
      )}

      {(step === "form" || step === "loading") && (
        <form onSubmit={(e) => { e.preventDefault(); generate(0); }} className="mx-auto max-w-2xl">
          <button type="button" onClick={() => setStep("purpose")} className="mb-4 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" aria-hidden /> {t.changePurposes}
          </button>
          <h1 className="text-3xl font-extrabold text-white">{t.formH}</h1>
          <p className="mt-1 text-slate-400">{t.formSub}</p>

          <div className="card mt-6 space-y-5">
            <fieldset>
              <legend className="label">{t.purposesLegend}</legend>
              <div className="flex flex-wrap gap-2">
                {purposeCards.map((p) => {
                  const on = req.purposes.includes(p.id);
                  return (
                    <button key={p.id} type="button" aria-pressed={on} onClick={() => togglePurpose(p.id)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition ${on ? "border-cyan-400 bg-cyan-400/15 text-cyan-200" : "border-slate-700 text-slate-300 hover:border-slate-500"}`}>
                      {dict.purposes[p.id].title}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div>
              <label htmlFor="budget" className="label">{t.budget}: <span className="text-cyan-300">{money(req.budget)}</span></label>
              <input id="budget" type="range" min={100000} max={1000000} step={10000} value={req.budget} onChange={(e) => set("budget", Number(e.target.value))} className="w-full accent-cyan-400" />
              <div className="flex justify-between text-xs text-slate-500"><span>{money(100000)}</span><span>{money(1000000)}</span></div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Select id="cpub" label={t.cpuBrand} value={req.cpuBrand} onChange={(v) => set("cpuBrand", v as Requirements["cpuBrand"])}
                options={[["any", t.noPref], ["Intel", "Intel"], ["AMD", "AMD"]]} />
              <Select id="gpub" label={t.gpuBrand} value={req.gpuBrand} onChange={(v) => set("gpuBrand", v as Requirements["gpuBrand"])}
                options={[["any", t.noPref], ["NVIDIA", "NVIDIA"], ["AMD", "AMD"]]} />
              <Select id="gpum" label={t.gpuMode} value={req.gpuMode} onChange={(v) => set("gpuMode", v as Requirements["gpuMode"])}
                options={[["auto", t.gpuAuto], ["dedicated", t.gpuDedicated], ["integrated", t.gpuIntegrated]]} />
              <Select id="size" label={t.size} value={req.size} onChange={(v) => set("size", v as Requirements["size"])}
                options={[["any", t.sizeAny], ["compact", t.sizeCompact]]} />
              <Select id="ram" label={t.ram} value={String(req.minRamGB)} onChange={(v) => set("minRamGB", Number(v))}
                options={[["0", t.noPref], ...[8, 16, 32, 64].map((n) => [String(n), `${n} GB`] as [string, string])]} />
              <Select id="sto" label={t.storage} value={String(req.minStorageGB)} onChange={(v) => set("minStorageGB", Number(v))}
                options={[["0", t.noPref], ...[500, 1000, 2000, 4000].map((n) => [String(n), n >= 1000 ? `${n / 1000} TB` : `${n} GB`] as [string, string])]} />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Check3 checked={req.rgb} onChange={(v) => set("rgb", v)} label={t.rgb} />
              <Check3 checked={req.wifi} onChange={(v) => set("wifi", v)} label={t.wifi} />
              <Check3 checked={req.futureProof} onChange={(v) => set("futureProof", v)} label={t.futureProof} />
            </div>

            <div>
              <label htmlFor="notes" className="label">{t.notes}</label>
              <textarea id="notes" rows={3} maxLength={400} value={req.notes} onChange={(e) => set("notes", e.target.value)} placeholder={t.notesPh} className="input" />
            </div>

            {error && <p role="alert" className="rounded-lg bg-red-950/50 p-3 text-sm text-red-300">{error}</p>}
            <button className="btn-primary w-full" disabled={step === "loading"}>
              {step === "loading"
                ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden /> {t.generating}</>
                : <><Sparkles className="h-4 w-4" aria-hidden /> {t.generate}</>}
            </button>
          </div>
        </form>
      )}

      {step === "quotes" && (
        <div>
          <h1 className="text-3xl font-extrabold text-white">{t.quotesH}</h1>
          <p className="mt-1 text-slate-400">{t.quotesSub}</p>
          {!aiUsed && <p className="mt-2 text-sm text-amber-300">{t.aiBusy}</p>}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button type="button" className="btn-primary" onClick={() => generate(variation + 1)}>
              <RefreshCw className="h-4 w-4" aria-hidden /> {t.regenerate}
            </button>
            <button type="button" className="btn-ghost" onClick={() => setStep("form")}>
              <Settings2 className="h-4 w-4" aria-hidden /> {t.editReq}
            </button>
            {!quotes.some((q) => q.id === "custom") && (
              <button type="button" className="btn-ghost" onClick={createCustom}>
                <Plus className="h-4 w-4" aria-hidden /> {t.createCustom}
              </button>
            )}
          </div>

          {/* All quotations side by side */}
          <ul className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {ordered.map((q) => {
              const b = builds[q.id];
              const on = q.id === selectedId;
              const qIssues = issues(b);
              const parts = resolve(b);
              return (
                <li key={q.id} className={`card flex flex-col ${on ? "border-cyan-400 ring-1 ring-cyan-400" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-lg font-bold text-white">{tier(q.id).label}</h2>
                      <p className="text-xs text-slate-400">{tier(q.id).tagline}</p>
                    </div>
                    {on && <Check className="h-5 w-5 shrink-0 text-cyan-400" aria-hidden />}
                  </div>
                  <p className="mt-3 text-3xl font-extrabold text-white">{money(totalPrice(b))}</p>
                  {q.summary && <p className="mt-2 text-sm text-slate-300">{q.summary}</p>}
                  <dl className="mt-4 flex-1 space-y-2 border-t border-slate-800 pt-3 text-sm">
                    {CATEGORIES.map((c) => (
                      <div key={c} className="flex items-baseline justify-between gap-3">
                        <div className="min-w-0">
                          <dt className="text-[11px] uppercase tracking-wide text-slate-500">{dict.categories[c]}</dt>
                          <dd className="truncate text-slate-200" title={parts[c]?.name}>{parts[c]?.name}</dd>
                        </div>
                        <dd className="shrink-0 text-xs text-slate-400">{money(parts[c]?.price ?? 0)}</dd>
                      </div>
                    ))}
                  </dl>
                  {qIssues.length > 0 && (
                    <p className="mt-3 flex items-center gap-1.5 text-xs text-amber-300"><AlertTriangle className="h-3.5 w-3.5" aria-hidden /> {t.fixFirst}</p>
                  )}
                  <button type="button" aria-pressed={on} onClick={() => select(q.id)} className={`mt-4 w-full ${on ? "btn-ghost" : "btn-primary"}`}>
                    {on ? t.isSelected : t.select}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Customize + order the selected quotation */}
          {selected && build && (
            <div ref={detailRef} className="mt-10 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white">{t.customizeH}: <span className="text-cyan-300">{tier(selected.id).label}</span></h2>
              <p className="mt-1 text-sm text-slate-400">{t.customizeHint}</p>

              <div className="mt-5 grid gap-6 lg:grid-cols-3">
                <ul className="space-y-3 lg:col-span-2">
                  {CATEGORIES.map((cat) => {
                    const current = resolve(build)[cat]!;
                    return (
                      <li key={cat} className="card">
                        <label htmlFor={`sel-${cat}`} className="text-xs font-semibold uppercase tracking-wide text-slate-500">{dict.categories[cat]}</label>
                        <div className="mt-1 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-medium text-white">{current.name}</p>
                            <p className="text-xs text-slate-400">{current.specs}</p>
                          </div>
                          <p className="shrink-0 font-semibold text-cyan-300">{money(current.price)}</p>
                        </div>
                        <select id={`sel-${cat}`} className="input mt-3" value={current.id} onChange={(e) => swap(cat, e.target.value)}>
                          {partsByCategory(cat).map((p) => {
                            const existing = new Set(problems.map((i) => i.id));
                            const bad = p.id !== current.id && candidateIssues(build, p).some((i) => !existing.has(i.id));
                            return <option key={p.id} value={p.id}>{p.name} – {money(p.price)}{bad ? `  ${t.mayBeIncompatible}` : ""}</option>;
                          })}
                        </select>
                      </li>
                    );
                  })}
                </ul>

                <aside className="lg:sticky lg:top-24 lg:self-start">
                  <div className="card">
                    <h3 className="font-semibold text-white">{t.summary}</h3>
                    <dl className="mt-3 space-y-1 text-sm text-slate-400">
                      <div className="flex justify-between gap-2"><dt>{t.power}</dt><dd>{requiredWatts(resolve(build).cpu, resolve(build).gpu)}W</dd></div>
                      <div className="flex justify-between gap-2"><dt>{t.parts}</dt><dd>{CATEGORIES.length}</dd></div>
                    </dl>
                    <p className="mt-4 flex items-baseline justify-between gap-2 border-t border-slate-800 pt-4">
                      <span className="text-slate-300">{t.total}</span>
                      <span className="text-2xl font-extrabold text-white">{money(totalPrice(build))}</span>
                    </p>
                    {problems.length > 0 ? (
                      <div role="alert" className="mt-4 rounded-lg bg-amber-950/50 p-3 text-sm text-amber-300">
                        <p className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4" aria-hidden /> {t.fixFirst}</p>
                        <ul className="mt-1 list-disc space-y-1 pl-5">{problems.map((p) => <li key={p.id}>{issueText(p, dict)}</li>)}</ul>
                      </div>
                    ) : (
                      <p className="mt-4 flex items-center gap-2 text-sm text-emerald-400"><Check className="h-4 w-4" aria-hidden /> {t.allOk}</p>
                    )}
                    <button type="button" className="btn-primary mt-4 w-full" disabled={problems.length > 0} onClick={() => setOrdering(true)}>
                      {t.placeOrder}
                    </button>
                  </div>
                </aside>
              </div>

              {ordering && problems.length === 0 && (
                <OrderForm t={t} build={build} total={totalPrice(build)} onDone={(r) => { setRef(r); setStep("done"); }} />
              )}
            </div>
          )}
        </div>
      )}

      {step === "done" && (
        <div className="mx-auto max-w-xl text-center" role="status">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-500/20 text-emerald-400"><Check className="h-7 w-7" aria-hidden /></span>
          <h1 className="mt-4 text-3xl font-extrabold text-white">{t.doneH}</h1>
          <p className="mt-2 text-slate-400">{t.doneRef} <strong className="text-white">{ref}</strong>. {t.doneText}</p>
          <button className="btn-ghost mt-6" onClick={() => { setReq(INITIAL); setQuotes([]); setSelectedId(null); setStep("purpose"); }}>{t.another}</button>
        </div>
      )}
    </div>
  );
}

function Select({ id, label, value, onChange, options }: {
  id: string; label: string; value: string; onChange: (v: string) => void; options: [string, string][];
}) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <select id={id} className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}

function Check3({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 shrink-0 accent-cyan-400" />
      {label}
    </label>
  );
}

function OrderForm({ t, build, total, onDone }: { t: Dict["build"]; build: Build; total: number; onDone: (ref: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch("/api/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, build }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      onDone(json.ref);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.error);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card mt-8 max-w-2xl space-y-4" aria-labelledby="order-h">
      <h2 id="order-h" className="text-xl font-bold text-white">{t.orderH} · {money(total)}</h2>
      <p className="text-sm text-slate-400">{t.orderNote}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label htmlFor="o-name" className="label">{t.fullName}</label><input id="o-name" name="name" required maxLength={100} autoComplete="name" className="input" /></div>
        <div><label htmlFor="o-phone" className="label">{t.phone}</label><input id="o-phone" name="phone" type="tel" required maxLength={40} autoComplete="tel" className="input" /></div>
      </div>
      <div><label htmlFor="o-email" className="label">{t.email}</label><input id="o-email" name="email" type="email" required maxLength={150} autoComplete="email" className="input" /></div>
      <div><label htmlFor="o-addr" className="label">{t.address}</label><textarea id="o-addr" name="address" required rows={2} maxLength={300} autoComplete="street-address" className="input" /></div>
      <div><label htmlFor="o-notes" className="label">{t.orderNotes}</label><textarea id="o-notes" name="notes" rows={2} maxLength={500} className="input" /></div>
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      <button className="btn-primary w-full sm:w-auto" disabled={busy}>{busy ? t.sending : t.submit}</button>
    </form>
  );
}
