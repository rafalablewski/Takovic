"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";

interface ScreenerPaginationProps {
  currentPage: number;
  totalResults: number;
  pageSize: number;
}

export function ScreenerPagination({
  currentPage,
  totalResults,
  pageSize,
}: ScreenerPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const hasNextPage = totalResults === pageSize;
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
  const end = start + totalResults - 1;

  return (
    <div className="flex items-center justify-between border-t border-border px-5 py-3">
      <p className="text-xs text-muted-foreground tabular-nums">
        Showing {totalResults > 0 ? `${start}–${end}` : "0"} results
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
