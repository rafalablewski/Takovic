"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

/** Shared section chrome for Business Operations sub-tabs (Ethereum, ETH Purchases, etc.). */
export function CoverageSectionCollapsible({
  title,
  icon,
  badge,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          {icon}
          <span className="text-sm font-medium text-foreground truncate">{title}</span>
          {badge}
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>
      {open && <CardContent className="px-5 pb-5 pt-0">{children}</CardContent>}
    </Card>
  );
}
