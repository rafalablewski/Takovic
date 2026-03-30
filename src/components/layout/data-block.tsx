import * as React from "react";
import { cn } from "@/lib/utils";

/** Grouped data region: light surface, optional title row, no nested card soup. */
export function DataBlock({
  title,
  action,
  className,
  children,
}: {
  title?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("surface-panel rounded-xl p-4 sm:p-5", className)}>
      {title ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
          <h3 className="label-caps">{title}</h3>
          {action}
        </div>
      ) : null}
      {children}
    </div>
  );
}
