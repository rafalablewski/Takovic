"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportScreenerCSV } from "@/lib/export";

interface ScreenerExportButtonProps {
  stocks: {
    symbol: string;
    name: string;
    sector: string;
    price: number;
    marketCap: number;
    volume: number;
    change: number;
  }[];
}

export function ScreenerExportButton({ stocks }: ScreenerExportButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5 text-xs"
      disabled={stocks.length === 0}
      onClick={() => exportScreenerCSV(stocks)}
    >
      <Download className="h-3.5 w-3.5" />
      Export CSV
    </Button>
  );
}
