import { Suspense } from "react";
import { AdminLoginClient } from "./admin-login-client";

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-sm text-muted-foreground">
          Loading…
        </div>
      }
    >
      <AdminLoginClient />
    </Suspense>
  );
}
