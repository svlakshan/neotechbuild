import { NextResponse, type NextRequest } from "next/server";

const LOCALES = ["en", "si"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) return NextResponse.next();

  const saved = req.cookies.get("NEXT_LOCALE")?.value;
  const accept = req.headers.get("accept-language") ?? "";
  const locale = saved && LOCALES.includes(saved) ? saved : /(^|,)\s*si\b/i.test(accept) ? "si" : "en";

  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/((?!api|_next|.*\\..*).*)"] };
