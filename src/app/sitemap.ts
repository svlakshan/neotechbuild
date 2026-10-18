import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { LOCALES } from "@/i18n";

const PAGES = [
  { path: "", priority: 1 },
  { path: "/build", priority: 0.9 },
  { path: "/about", priority: 0.6 },
  { path: "/contact", priority: 0.6 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return LOCALES.flatMap((lang) =>
    PAGES.map(({ path, priority }) => ({
      url: `${site.url}/${lang}${path}`,
      lastModified: now,
      priority,
      alternates: { languages: Object.fromEntries(LOCALES.map((l) => [l, `${site.url}/${l}${path}`])) },
    })),
  );
}
