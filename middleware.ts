import { type NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/admin/session-token";

/**
 * Guards /admin (except /admin/login).
 * Cookie: set via POST /api/admin/login with ADMIN_DASHBOARD_SECRET.
 * Alternatively: Authorization: Bearer <ADMIN_DASHBOARD_SECRET> on each request.
 * TODO: Replace with Auth.js role === "admin".
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    return NextResponse.next();
  }

  const secret = process.env.ADMIN_DASHBOARD_SECRET;
  if (!secret) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("reason", "unset");
    return NextResponse.redirect(url);
  }

  const bearer = request.headers.get("authorization");
  if (bearer?.startsWith("Bearer ")) {
    const token = bearer.slice(7);
    // Bearer value = same as ADMIN_DASHBOARD_SECRET (for scripts / API clients)
    if (timingSafeEqualUtf8(token, secret)) {
      return NextResponse.next();
    }
  }

  const cookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (await verifyAdminSessionToken(cookie, secret)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

function timingSafeEqualUtf8(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  if (ab.length !== bb.length) return false;
  let out = 0;
  for (let i = 0; i < ab.length; i++) out |= ab[i]! ^ bb[i]!;
  return out === 0;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
