import { parts, partsByCategory } from "@/data/catalog";
import { format, getDict, type Locale } from "@/i18n";
import { requiredWatts, totalPrice } from "./compat";
import type { Build, Part, Purpose, Quote, Requirements } from "./types";

type Weights = { cpu: number; gpu: number; ram: number; storage: number };

const WEIGHTS: Record<Purpose, Weights> = {
  personal: { cpu: 1, gpu: 0.5, ram: 0.6, storage: 0.6 },
  office: { cpu: 1, gpu: 0.1, ram: 0.5, storage: 0.5 },
  "graphic-design": { cpu: 1, gpu: 1, ram: 1, storage: 0.7 },
  gaming: { cpu: 0.8, gpu: 2, ram: 0.5, storage: 0.4 },
  "video-editing": { cpu: 1.2, gpu: 1.2, ram: 1.2, storage: 0.9 },
  programming: { cpu: 1.2, gpu: 0.2, ram: 1, storage: 0.7 },
};
/** Used when the customer picked no purpose at all. */
const GENERAL: Weights = { cpu: 1, gpu: 0.6, ram: 0.6, storage: 0.6 };

export const TIER_IDS = ["value", "balanced", "performance"] as const;
const TIER_FACTOR = { value: 0.85, balanced: 1, performance: 1.15 } as const;

const cheapest = (list: Part[]) => list.reduce<Part | undefined>((a, p) => (!a || p.price < a.price ? p : a), undefined);

/** Deterministic, compatibility-safe builder used as fallback and to repair AI output. */
export function buildForBudget(req: Requirements, cap: number): Build | null {
  // Several purposes: take the strongest need per component so every use case is served.
  const ws = req.purposes.length ? req.purposes.map((p) => WEIGHTS[p]) : [GENERAL];
  const w: Weights = {
    cpu: Math.max(...ws.map((x) => x.cpu)),
    gpu: Math.max(...ws.map((x) => x.gpu)),
    ram: Math.max(...ws.map((x) => x.ram)),
    storage: Math.max(...ws.map((x) => x.storage)),
  };
  const pass = (p: Part, brand: string) => brand === "any" || p.brand === brand;
  const cpus = partsByCategory("cpu").filter((p) => pass(p, req.cpuBrand));
  const gpus = partsByCategory("gpu").filter((p) => {
    const integrated = p.brand === "Integrated";
    if (req.gpuMode === "dedicated") return !integrated && pass(p, req.gpuBrand);
    if (req.gpuMode === "integrated") return integrated;
    return integrated || pass(p, req.gpuBrand);
  });
  const rams = partsByCategory("ram").filter((p) => (p.sizeGB ?? 0) >= req.minRamGB);
  const stores = partsByCategory("storage").filter((p) => (p.capacityGB ?? 0) >= req.minStorageGB);
  const mbs = partsByCategory("motherboard").filter(
    (m) => (!req.wifi || m.wifi) && (!req.futureProof || m.ramType === "DDR5"),
  );
  const psus = partsByCategory("psu");
  const coolers = partsByCategory("cooler");
  const cases = partsByCategory("case").filter((c) => req.size !== "compact" || c.compact);
  const rgbCases = cases.filter((c) => c.rgb);

  let best: { build: Build; score: number } | null = null;
  for (const cpu of cpus) {
    const cooler = cheapest(coolers.filter((c) => (c.coolerTdp ?? 0) >= (cpu.tdp ?? 0)));
    if (!cooler) continue;
    for (const mb of mbs.filter((m) => m.socket === cpu.socket)) {
      const fits = (c: Part) => c.supports?.includes(mb.formFactor!);
      const pcCase = cheapest(req.rgb && rgbCases.some(fits) ? rgbCases.filter(fits) : cases.filter(fits));
      if (!pcCase) continue;
      for (const ram of rams.filter((r) => r.ramType === mb.ramType)) {
        for (const gpu of gpus) {
          if (gpu.brand === "Integrated" && !cpu.igpu) continue;
          const psu = cheapest(psus.filter((p) => (p.watts ?? 0) >= requiredWatts(cpu, gpu)));
          if (!psu) continue;
          for (const storage of stores) {
            const build: Build = {
              cpu: cpu.id, motherboard: mb.id, ram: ram.id, gpu: gpu.id,
              storage: storage.id, psu: psu.id, case: pcCase.id, cooler: cooler.id,
            };
            if (totalPrice(build) > cap) continue;
            const score =
              w.cpu * cpu.perf + w.gpu * gpu.perf + w.ram * ram.perf + w.storage * storage.perf + 0.2 * mb.perf;
            if (!best || score > best.score) best = { build, score };
          }
        }
      }
    }
  }
  return best?.build ?? null;
}

/** Progressively drop soft preferences until something compatible fits. */
function relaxations(req: Requirements): Requirements[] {
  return [
    req,
    { ...req, wifi: false, futureProof: false, rgb: false },
    { ...req, wifi: false, futureProof: false, rgb: false, cpuBrand: "any", gpuBrand: "any", gpuMode: "auto" },
    { ...req, wifi: false, futureProof: false, rgb: false, cpuBrand: "any", gpuBrand: "any", gpuMode: "auto", size: "any", minRamGB: 0, minStorageGB: 0 },
  ];
}

/** Budget too low: fall back to the cheapest build that still meets the requirements. */
function cheapestValid(req: Requirements): Build | null {
  for (const r of relaxations(req)) {
    for (let cap = 100_000; cap <= 2_000_000; cap += 25_000) {
      const b = buildForBudget(r, cap);
      if (b) return b;
    }
  }
  return null;
}

export function describePurposes(req: Requirements, lang: Locale): string {
  const dict = getDict(lang);
  return req.purposes.length
    ? req.purposes.map((p) => dict.purposes[p].title).join(" + ")
    : dict.build.generalUse;
}

export function rulesQuote(req: Requirements, tier: (typeof TIER_IDS)[number], lang: Locale): Quote {
  const cap = req.budget * TIER_FACTOR[tier];
  let build: Build | null = null;
  for (const r of relaxations(req)) {
    build = buildForBudget(r, cap);
    if (build) break;
  }
  build ??= cheapestValid(req);
  if (!build) throw new Error("No compatible build found for these requirements.");
  return {
    id: tier,
    summary: format(getDict(lang).build.rulesSummary, { purposes: describePurposes(req, lang) }),
    build,
    total: totalPrice(build),
    source: "rules",
  };
}

export const catalogForPrompt = () =>
  parts
    .map((p) => `${p.id} | ${p.category} | ${p.name} | LKR ${p.price} | ${p.specs}${p.wifi ? " · WiFi" : ""}`)
    .join("\n");
