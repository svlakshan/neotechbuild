import { en, type Dict } from "./en";
import { si } from "./si";

export const LOCALES = ["en", "si"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const isLocale = (v: unknown): v is Locale => LOCALES.includes(v as Locale);
export const getDict = (lang: Locale): Dict => (lang === "si" ? si : en);

export const format = (tpl: string, vars: Record<string, string | number>) =>
  tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));

export type { Dict };
