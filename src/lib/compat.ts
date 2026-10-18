import { partsById } from "@/data/catalog";
import { format } from "@/i18n";
import type { Dict } from "@/i18n/en";
import { CATEGORIES, type Build, type Part } from "./types";

/** A language-neutral compatibility problem; render it with `issueText`. */
export interface Issue {
  /** stable id, handy for comparing issues */
  id: string;
  key: keyof Dict["issues"];
  vars: Record<string, string | number>;
}

const issue = (key: Issue["key"], vars: Issue["vars"]): Issue => ({ id: key + JSON.stringify(vars), key, vars });
export const issueText = (i: Issue, dict: Dict) => format(dict.issues[i.key], i.vars);

export function resolve(build: Partial<Build>): Partial<Record<keyof Build, Part>> {
  const out: Partial<Record<keyof Build, Part>> = {};
  for (const c of CATEGORIES) {
    const p = build[c] ? partsById.get(build[c]!) : undefined;
    if (p && p.category === c) out[c] = p;
  }
  return out;
}

export function totalPrice(build: Partial<Build>): number {
  return Object.values(resolve(build)).reduce((s, p) => s + (p?.price ?? 0), 0);
}

export function requiredWatts(cpu?: Part, gpu?: Part): number {
  return Math.ceil((((cpu?.tdp ?? 0) + (gpu?.tdp ?? 0) + 100) * 1.2) / 50) * 50;
}

/** Returns compatibility problems (empty = compatible). */
export function issues(build: Partial<Build>): Issue[] {
  const { cpu, motherboard: mb, ram, gpu, psu, case: pcCase, cooler } = resolve(build);
  const out: Issue[] = [];
  if (cpu && mb && cpu.socket !== mb.socket)
    out.push(issue("socket", { cpu: cpu.name, socket: cpu.socket!, mb: mb.name, mbSocket: mb.socket! }));
  if (mb && ram && mb.ramType !== ram.ramType)
    out.push(issue("ram", { mb: mb.name, type: mb.ramType!, ram: ram.name, ramType: ram.ramType! }));
  if (mb && pcCase && !pcCase.supports?.includes(mb.formFactor!))
    out.push(issue("form", { case: pcCase.name, ff: mb.formFactor! }));
  if (cpu && gpu && gpu.brand === "Integrated" && !cpu.igpu) out.push(issue("igpu", { cpu: cpu.name }));
  if (cpu && psu) {
    const need = requiredWatts(cpu, gpu);
    if ((psu.watts ?? 0) < need) out.push(issue("psu", { watts: need }));
  }
  if (cpu && cooler && (cooler.coolerTdp ?? 0) < (cpu.tdp ?? 0))
    out.push(issue("cooler", { cooler: cooler.name, cpu: cpu.name }));
  return out;
}

/** Problems that would exist if `candidate` replaced the current part in its category. */
export function candidateIssues(build: Build, candidate: Part): Issue[] {
  return issues({ ...build, [candidate.category]: candidate.id });
}
