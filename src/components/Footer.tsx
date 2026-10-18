import Link from "next/link";
import { site } from "@/config/site";
import type { Dict, Locale } from "@/i18n";

export default function Footer({ lang, dict }: { lang: Locale; dict: Dict }) {
  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="text-lg font-bold text-white">{site.name}</p>
          <p className="mt-2 text-sm text-slate-400">{dict.site.tagline}. {dict.footer.blurb}</p>
        </div>
        <nav aria-label="Footer" className="text-sm">
          <p className="mb-2 font-semibold text-white">{dict.footer.explore}</p>
          <ul className="space-y-1.5 text-slate-400">
            <li><Link href={`/${lang}/build`} className="hover:text-white">{dict.nav.build}</Link></li>
            <li><Link href={`/${lang}/about`} className="hover:text-white">{dict.nav.about}</Link></li>
            <li><Link href={`/${lang}/contact`} className="hover:text-white">{dict.nav.contact}</Link></li>
          </ul>
        </nav>
        <address className="text-sm not-italic text-slate-400">
          <p className="mb-2 font-semibold text-white">{dict.footer.contact}</p>
          <p><a href={`mailto:${site.email}`} className="hover:text-white">{site.email}</a></p>
          <p>{site.phone}</p>
          <p>{dict.site.hours}</p>
        </address>
      </div>
      <p className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {site.name}. {dict.footer.rights}
      </p>
    </footer>
  );
}
