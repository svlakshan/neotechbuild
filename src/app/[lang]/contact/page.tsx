import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import ContactForm from "@/components/ContactForm";
import { site } from "@/config/site";
import { getDict, isLocale } from "@/i18n";
import { alternatesFor } from "@/i18n/meta";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDict(lang);
  return { title: t.meta.contactTitle, description: t.meta.contactDesc, alternates: alternatesFor(lang, "/contact") };
}

export default async function ContactPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDict(lang);
  const t = dict.contact;

  const info = [
    { Icon: Mail, text: site.email, href: `mailto:${site.email}` },
    { Icon: Phone, text: site.phone, href: `tel:${site.phone.replace(/\s/g, "")}` },
    { Icon: MapPin, text: site.address },
    { Icon: Clock, text: dict.site.hours },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <h1 className="text-3xl font-extrabold text-white sm:text-5xl">{t.h1}</h1>
      <p className="mt-4 max-w-2xl text-slate-400">{t.intro}</p>
      <div className="mt-8 grid gap-6 md:grid-cols-5">
        <ul className="card space-y-4 md:col-span-2">
          {info.map(({ Icon, text, href }) => (
            <li key={text} className="flex items-start gap-3 text-sm">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" aria-hidden />
              {href ? <a href={href} className="text-slate-200 hover:text-white">{text}</a> : <span className="text-slate-300">{text}</span>}
            </li>
          ))}
        </ul>
        <div className="card md:col-span-3">
          <ContactForm t={t} />
        </div>
      </div>
    </div>
  );
}
