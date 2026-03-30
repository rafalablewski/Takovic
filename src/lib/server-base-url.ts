/**
 * Base URL for server-side fetch() to this app's own routes.
 * VERCEL_URL is hostname only (no protocol); NEXT_PUBLIC_APP_URL should be absolute.
 */
export function getServerBaseUrl(): string {
  const app = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (app) return app;

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    if (vercel.startsWith("http://") || vercel.startsWith("https://")) {
      return vercel;
    }
    return `https://${vercel}`;
  }

  return "http://localhost:3000";
}
