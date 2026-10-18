"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cpu, Languages, Menu, X } from "lucide-react";
import { useState } from "react";
import { site } from "@/config/site";
import type { Dict, Locale } from "@/i18n";

export default function Header({ lang, nav }: { lang: Locale; nav: Dict["nav"] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { href: `/${lang}`, label: nav.home },
    { href: `/${lang}/build`, label: nav.build },
    { href: `/${lang}/about`, label: nav.about },
    { href: `/${lang}/contact`, label: nav.contact },
  ];

  // Same page in the other language; the cookie remembers the choice for future visits.
  const other: Locale = lang === "en" ? "si" : "en";
  const switchHref = pathname.replace(new RegExp(`^/${lang}(?=/|$)`), `/${other}`);
  const rememberLocale = () => {
    document.cookie = `NEXT_LOCALE=${other}; path=/; max-age=31536000; samesite=lax`;
  };

  const switcher = (
    <Link
      href={switchHref}
      hrefLang={other}
      lang={other}
      onClick={rememberLocale}
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 hover:border-slate-500"
    >
      <Languages className="h-4 w-4" aria-hidden />
      {other === "si" ? "සිංහල" : "English"}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4">
        <Link href={`/${lang}`} className="flex items-center gap-2 text-lg font-bold text-white" onClick={() => setOpen(false)}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500">
            <Cpu className="h-5 w-5" aria-hidden />
          </span>
          {site.name}
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = l.href === `/${lang}` ? pathname === l.href : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${active ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"}`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {switcher}
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-lg border border-slate-800 md:hidden"
            aria-label={open ? nav.menuClose : nav.menuOpen}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav aria-label="Mobile" className="border-t border-slate-800 bg-slate-950 px-4 py-3 md:hidden">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-base font-medium text-slate-200 hover:bg-slate-900">
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
