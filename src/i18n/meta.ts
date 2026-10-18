import { LOCALES, type Locale } from "./index";

/** Canonical + hreflang alternates so Google serves the right language version. */
export function alternatesFor(lang: Locale, path = "") {
  return {
    canonical: `/${lang}${path}`,
    languages: {
      ...Object.fromEntries(LOCALES.map((l) => [l, `/${l}${path}`])),
      "x-default": `/en${path}`,
    },
  };
}
