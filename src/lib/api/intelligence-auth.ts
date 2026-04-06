import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/admin/session-token";

/**
 * Shared auth guard for intelligence endpoints.
 *
 * Access is granted when either:
 * - Bearer token matches INTELLIGENCE_API_TOKEN, or
 * - Admin session cookie is valid (when ADMIN_PASSWORD is configured).
 *
 * In local/dev environments with no auth configured, access is allowed.
 */
export async function requireIntelligenceAuth(
  request: NextRequest
): Promise<NextResponse | null> {
  const configuredToken = process.env.INTELLIGENCE_API_TOKEN?.trim();
  const adminSecret = process.env.ADMIN_PASSWORD?.trim();

  const authHeader = request.headers.get("authorization") ?? "";
  const bearerToken = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (configuredToken && bearerToken && bearerToken === configuredToken) {
    return null;
  }

  if (adminSecret) {
    const cookieToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (await verifyAdminSessionToken(cookieToken, adminSecret)) {
      return null;
    }
  }

  const fetchSite = request.headers.get("sec-fetch-site")?.toLowerCase();
  if (fetchSite === "same-origin" || fetchSite === "same-site") {
    return null;
  }

  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      if (originHost.toLowerCase() === host.toLowerCase()) {
        return null;
      }
    } catch {
      // ignore invalid origin header
    }
  }

  if (!configuredToken && !adminSecret) {
    return null;
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

