import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/i18n";
import { alternatesFor } from "@/i18n/meta";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDict(lang);
  return { title: t.meta.aboutTitle, description: t.meta.aboutDesc, alternates: alternatesFor(lang, "/about") };
}

export default async function AboutPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang).about;

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <h1 className="text-3xl font-extrabold text-white sm:text-5xl">{t.h1}</h1>
      <p className="mt-5 text-lg text-slate-300">{t.p1}</p>
      <p className="mt-4 text-slate-400">{t.p2}</p>

      <h2 className="mt-12 text-2xl font-bold text-white">{t.valuesH}</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {t.values.map((v) => (
          <div key={v.title} className="card">
            <h3 className="font-semibold text-white">{v.title}</h3>
            <p className="mt-1 text-sm text-slate-400">{v.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-col gap-3 sm:flex-row">
        <Link href={`/${lang}/build`} className="btn-primary">{t.cta1}</Link>
        <Link href={`/${lang}/contact`} className="btn-ghost">{t.cta2}</Link>
      </div>
    </div>
  );
}
