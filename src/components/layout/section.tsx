import * as React from "react";
import { cn } from "@/lib/utils";

export function Section({
  title,
  description,
  action,
  className,
  children,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("space-y-4", className)}>
      {(title || description || action) && (
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0 space-y-1">
            {title ? (
              <h2 className="label-caps">{title}</h2>
            ) : null}
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
