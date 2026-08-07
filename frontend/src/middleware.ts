import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, readSession } from "./lib/session";

/**
 * Frontend route guard — the first of the two auth layers.
 *
 * This exists purely so people are not shown a page they cannot use: it
 * redirects rather than protects. The real enforcement is `requireAuth` /
 * `requireRole` on the Express API, because a determined user can always call
 * the API directly and skip this entirely.
 */

const USER_ROUTES = ["/account", "/checkout"];
const ADMIN_ROUTES = ["/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const needsUser = USER_ROUTES.some((route) => pathname.startsWith(route));
  const needsAdmin = ADMIN_ROUTES.some((route) => pathname.startsWith(route));
  if (!needsUser && !needsAdmin) return NextResponse.next();

  const session = await readSession(request.cookies.get(SESSION_COOKIE)?.value);

  if (!session) {
    const login = new URL("/login", request.url);
    // Remember where they were headed so login can send them back.
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  if (needsAdmin && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/account/orders", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/checkout/:path*", "/admin/:path*"],
};
