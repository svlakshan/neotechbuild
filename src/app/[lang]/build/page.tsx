import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BuildWizard from "@/components/BuildWizard";
import { getDict, isLocale } from "@/i18n";
import { alternatesFor } from "@/i18n/meta";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDict(lang);
  return { title: t.meta.buildTitle, description: t.meta.buildDesc, alternates: alternatesFor(lang, "/build") };
}

export default async function BuildPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <BuildWizard lang={lang} dict={getDict(lang)} />
    </div>
  );
}
