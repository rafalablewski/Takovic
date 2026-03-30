"use client";

import * as React from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type SortDir = "asc" | "desc" | null;

export type DataTableColumn<T> = {
  id: string;
  header: string;
  accessor?: (row: T) => React.ReactNode;
  sortValue?: (row: T) => number | string | null;
  className?: string;
  headClassName?: string;
  numeric?: boolean;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  caption?: string;
  dense?: boolean;
  stickyHeader?: boolean;
  getRowKey: (row: T, index: number) => string;
};

export function DataTable<T>({
  columns,
  data,
  caption,
  dense,
  stickyHeader,
  getRowKey,
}: DataTableProps<T>) {
  const [sortId, setSortId] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<SortDir>(null);

  const sorted = React.useMemo(() => {
    if (!sortId || !sortDir) return data;
    const col = columns.find((c) => c.id === sortId);
    if (!col?.sortValue) return data;
    const mul = sortDir === "asc" ? 1 : -1;
    return [...data].sort((a, b) => {
      const va = col.sortValue!(a);
      const vb = col.sortValue!(b);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === "number" && typeof vb === "number") {
        return (va - vb) * mul;
      }
      return String(va).localeCompare(String(vb)) * mul;
    });
  }, [data, sortId, sortDir, columns]);

  function toggleSort(id: string) {
    const col = columns.find((c) => c.id === id);
    if (!col?.sortValue) return;
    if (sortId !== id) {
      setSortId(id);
      setSortDir("desc");
      return;
    }
    if (sortDir === "desc") {
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortId(null);
      setSortDir(null);
    } else {
      setSortDir("desc");
    }
  }

  return (
    <Table>
      {caption && <TableCaption>{caption}</TableCaption>}
      <TableHeader
        className={cn(
          stickyHeader &&
            "sticky top-0 z-10 border-b border-white/[0.06] bg-[var(--background)] shadow-none"
        )}
      >
        <TableRow className="hover:bg-transparent">
          {columns.map((col) => {
            const active = sortId === col.id;
            const sortable = Boolean(col.sortValue);
            return (
              <TableHead
                key={col.id}
                className={cn(
                  col.headClassName,
                  col.numeric && "text-right",
                  sortable && "cursor-pointer select-none hover:text-foreground"
                )}
                onClick={() => sortable && toggleSort(col.id)}
              >
                <span className="inline-flex items-center gap-1">
                  {col.header}
                  {sortable && active && sortDir === "asc" && (
                    <ArrowUp className="h-3 w-3" aria-hidden />
                  )}
                  {sortable && active && sortDir === "desc" && (
                    <ArrowDown className="h-3 w-3" aria-hidden />
                  )}
                </span>
              </TableHead>
            );
          })}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((row, i) => (
          <TableRow key={getRowKey(row, i)}>
            {columns.map((col) => (
              <TableCell
                key={col.id}
                className={cn(
                  dense && "py-2 text-xs",
                  col.numeric && "text-right tabular-nums",
                  col.className
                )}
              >
                {col.accessor ? col.accessor(row) : null}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
