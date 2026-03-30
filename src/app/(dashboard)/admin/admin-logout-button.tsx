"use client";

import { Button } from "@/components/ui/button";

export function AdminLogoutButton() {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="text-xs"
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        window.location.href = "/admin/login";
      }}
    >
      Sign out
    </Button>
  );
}
