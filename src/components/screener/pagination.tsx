"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";

interface ScreenerPaginationProps {
  currentPage: number;
  /** Rows on this page */
  pageRowCount: number;
  pageSize: number;
  /** Total rows matching filters (all pages) */
  totalMatching: number;
}

export function ScreenerPagination({
  currentPage,
  pageRowCount,
  pageSize,
  totalMatching,
}: ScreenerPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const hasNextPage = currentPage * pageSize < totalMatching;
  const hasPrevPage = currentPage > 1;

  const goToPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page <= 1) {
        params.delete("page");
      } else {
        params.set("page", page.toString());
      }
      const query = params.toString();
      router.push(query ? `/screener?${query}` : "/screener");
    },
    [router, searchParams]
  );

  const start = (currentPage - 1) * pageSize + 1;
  const end = pageRowCount > 0 ? start + pageRowCount - 1 : 0;

  return (
    <div className="flex items-center justify-between border-t border-border px-5 py-3">
      <p className="text-xs text-muted-foreground tabular-nums">
        {pageRowCount > 0
          ? `Showing ${start}–${end} of ${totalMatching}`
          : `0 of ${totalMatching} results`}
      </p>
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          disabled={!hasPrevPage}
          onClick={() => goToPage(currentPage - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          disabled={!hasNextPage}
          onClick={() => goToPage(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
