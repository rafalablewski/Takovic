/**
 * User session utilities.
 *
 * Placeholder until Auth.js v5 is implemented.
 * All components should read user data from here instead of hardcoding.
 */

export interface UserSession {
  name: string;
  email: string;
  initials: string;
  plan: "free" | "professional" | "enterprise";
  image?: string;
}

/**
 * Get user initials from name (first letter of each word, max 2 chars).
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Get the current user session.
 * Returns a placeholder until Auth.js is implemented.
 * TODO: Replace with Auth.js v5 `auth()` call.
 */
export async function getCurrentUser(): Promise<UserSession> {
  const name = process.env.DEFAULT_USER_NAME || "User";
  // TODO: Replace with: const session = await auth();
  return {
    name,
    email: process.env.DEFAULT_USER_EMAIL || "user@takovic.com",
    initials: getInitials(name),
    plan: (process.env.DEFAULT_USER_PLAN as UserSession["plan"]) || "professional",
  };
}
