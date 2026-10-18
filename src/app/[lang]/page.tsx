import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ShieldCheck, Sparkles, SlidersHorizontal, Truck } from "lucide-react";
import { purposeCards } from "@/components/purposes";
import { getDict, isLocale } from "@/i18n";
import { alternatesFor } from "@/i18n/meta";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { alternates: alternatesFor(lang) };
}

const featureIcons = [Sparkles, ShieldCheck, SlidersHorizontal, Truck];

export default async function Home({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const h = t.home;

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: lang,
    mainEntity: h.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(34,211,238,0.18),transparent),radial-gradient(40%_40%_at_90%_20%,rgba(139,92,246,0.18),transparent)]" />
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:py-24">
          <p className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-xs font-medium text-cyan-300">
            <Sparkles className="h-3.5 w-3.5" aria-hidden /> {h.badge}
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl">
            {h.h1a}{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">{h.h1b}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-slate-400 sm:text-lg">{h.sub}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href={`/${lang}/build`} className="btn-primary w-full sm:w-auto">{h.cta1} <ArrowRight className="h-4 w-4" aria-hidden /></Link>
            <Link href={`/${lang}/contact`} className="btn-ghost w-full sm:w-auto">{h.cta2}</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12" aria-labelledby="purposes">
        <h2 id="purposes" className="text-2xl font-bold text-white sm:text-3xl">{h.purposesH}</h2>
        <p className="mt-2 text-slate-400">{h.purposesSub}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {purposeCards.map(({ id, Icon }) => (
            <Link key={id} href={`/${lang}/build?purpose=${id}`} className="card group transition hover:border-cyan-500/60 hover:bg-slate-900">
              <Icon className="h-8 w-8 text-cyan-400" aria-hidden />
              <h3 className="mt-3 text-lg font-semibold text-white">{t.purposes[id].title}</h3>
              <p className="mt-1 text-sm text-slate-400">{t.purposes[id].blurb}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-cyan-300">
                {h.startBuilding} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12" aria-labelledby="how">
        <h2 id="how" className="text-2xl font-bold text-white sm:text-3xl">{h.howH}</h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {h.steps.map((s, i) => (
            <li key={s.title} className="card">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 font-bold text-white">{i + 1}</span>
              <h3 className="mt-3 font-semibold text-white">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-400">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12" aria-labelledby="why">
        <h2 id="why" className="text-2xl font-bold text-white sm:text-3xl">{h.whyH}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {h.features.map((f, i) => {
            const Icon = featureIcons[i];
            return (
              <div key={f.title} className="card">
                <Icon className="h-6 w-6 text-violet-400" aria-hidden />
                <h3 className="mt-3 font-semibold text-white">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{f.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12" aria-labelledby="faq">
        <h2 id="faq" className="text-2xl font-bold text-white sm:text-3xl">{h.faqH}</h2>
        <div className="mt-6 space-y-3">
          {h.faqs.map((f) => (
            <details key={f.q} className="card group">
              <summary className="cursor-pointer font-medium text-white">{f.q}</summary>
              <p className="mt-2 text-sm text-slate-400">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-3xl bg-gradient-to-r from-cyan-600/30 to-violet-600/30 p-8 text-center ring-1 ring-slate-700 sm:p-12">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">{h.ctaH}</h2>
          <p className="mt-2 text-slate-300">{h.ctaText}</p>
          <Link href={`/${lang}/build`} className="btn-primary mt-6">{h.startBuilding} <ArrowRight className="h-4 w-4" aria-hidden /></Link>
        </div>
      </section>
    </>
  );
}
