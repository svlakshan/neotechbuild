import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Inter, Noto_Sans_Sinhala } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { site } from "@/config/site";
import { getDict, isLocale, LOCALES } from "@/i18n";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });
const sinhala = Noto_Sans_Sinhala({ subsets: ["sinhala"], display: "swap" });

export const dynamicParams = false;
export const generateStaticParams = () => LOCALES.map((lang) => ({ lang }));

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDict(lang);
  const title = `${site.name} – ${dict.meta.homeTitle}`;
  return {
    metadataBase: new URL(site.url),
    title: { default: title, template: `%s | ${site.name}` },
    description: dict.site.description,
    keywords: ["custom PC", "build your PC", "gaming PC", "PC builder", "PC quotation", "Sri Lanka", "custom PC Sri Lanka", "PC build LKR"],
    openGraph: {
      type: "website",
      siteName: site.name,
      title,
      description: dict.site.description,
      url: `${site.url}/${lang}`,
      locale: lang === "si" ? "si_LK" : "en_US",
    },
    twitter: { card: "summary_large_image", title: site.name, description: dict.site.description },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = { themeColor: "#020617", width: "device-width", initialScale: 1 };

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDict(lang);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ComputerStore",
    name: site.name,
    description: dict.site.description,
    url: `${site.url}/${lang}`,
    email: site.email,
    telephone: site.phone,
    address: site.address,
    currenciesAccepted: "LKR",
    inLanguage: lang,
  };

  return (
    <html lang={lang}>
      <body className={`${lang === "si" ? sinhala.className : inter.className} flex min-h-screen flex-col`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-black">
          {dict.nav.skip}
        </a>
        <Header lang={lang} nav={dict.nav} />
        <main id="main" className="flex-1">{children}</main>
        <Footer lang={lang} dict={dict} />
      </body>
    </html>
  );
}
