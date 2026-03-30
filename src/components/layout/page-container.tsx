import * as React from "react";
import { cn } from "@/lib/utils";

/** Max-width column for dashboard + research views (1200–1400px band). */
export function PageContainer({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative z-10 mx-auto w-full max-w-[1360px] px-6 lg:px-8",
        className
      )}
    >
      {children}
    </div>
  );
}
