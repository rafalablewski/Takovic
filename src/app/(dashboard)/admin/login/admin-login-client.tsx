"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function AdminLoginClient() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const unset = reason === "unset";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Login failed");
        return;
      }
      window.location.href = "/admin";
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 py-12">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Admin</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to view workflows, coverage, and prompt previews.
        </p>
      </div>

      {unset && (
        <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
          Set <code className="rounded bg-muted px-1">ADMIN_DASHBOARD_SECRET</code>{" "}
          in your environment to enable the admin dashboard.
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dashboard access</CardTitle>
          <CardDescription>
            Use the same value as{" "}
            <code className="text-xs">ADMIN_DASHBOARD_SECRET</code> in your env
            file.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-password"
                className="mb-1.5 block text-xs font-medium text-muted-foreground"
              >
                Secret
              </label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                disabled={unset}
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading || unset}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Link
        href="/"
        className="text-center text-sm text-muted-foreground hover:text-foreground"
      >
        Back to app
      </Link>
    </div>
  );
}
