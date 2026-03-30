import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/admin/session-token";

/**
 * Admin routes under this segment require a valid session cookie.
 * Runs on the Node.js runtime so `ADMIN_DASHBOARD_SECRET` is available on Vercel
 * (Edge Middleware often inlines env at build time and can miss project env vars).
 * TODO: Replace with Auth.js role === "admin".
 */
export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const secret = process.env.ADMIN_DASHBOARD_SECRET;
  if (!secret) {
    redirect("/admin/login?reason=unset");
  }

  const cookie = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await verifyAdminSessionToken(cookie, secret))) {
    redirect("/admin/login");
  }

  return <>{children}</>;
}
