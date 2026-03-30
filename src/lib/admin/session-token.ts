/**
 * HMAC-based admin session cookie value (Edge + Node compatible via Web Crypto).
 * Replace with Auth.js admin role when auth ships.
 */

const SESSION_PAYLOAD = "takovic-admin-v1";

function bufferToBase64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function createAdminSessionToken(secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(SESSION_PAYLOAD));
  return bufferToBase64Url(sig);
}

export async function verifyAdminSessionToken(
  token: string | undefined,
  secret: string | undefined
): Promise<boolean> {
  if (!token || !secret) return false;
  try {
    const expected = await createAdminSessionToken(secret);
    return timingSafeEqualString(token, expected);
  } catch {
    return false;
  }
}

function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i)! ^ b.charCodeAt(i)!;
  }
  return out === 0;
}

/** Cookie name for admin dashboard session */
export const ADMIN_SESSION_COOKIE = "takovic_admin_session";
