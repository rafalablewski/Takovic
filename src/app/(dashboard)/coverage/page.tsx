import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllCoveredStocks } from "@/data/coverage/registry";
import { BookOpen, ChevronRight, Clock } from "lucide-react";

export default function CoverageIndexPage() {
  const stocks = getAllCoveredStocks();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Coverage</h1>
        <p className="text-sm text-muted-foreground">
          Stocks under active research coverage with structured analysis
        </p>
      </div>

      {stocks.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">
              No stocks under coverage yet
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {stocks.map((stock) => (
            <Link key={stock.ticker} href={`/coverage/${stock.ticker}`}>
              <Card className="transition-colors hover:bg-muted/30 cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{stock.name}</span>
                        <Badge variant="secondary" className="text-[10px]">{stock.ticker}</Badge>
                        <Badge
                          className={
                            stock.status === "active"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 text-[10px]"
                              : "bg-gray-100 text-gray-600 text-[10px]"
                          }
                        >
                          {stock.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{stock.sector}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{stock.description}</p>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60 pt-0.5">
                        <Clock className="h-3 w-3" />
                        Coverage since {stock.coverageDate} &middot; {stock.analyst}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground/40" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
