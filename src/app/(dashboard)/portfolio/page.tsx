import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Plus } from "lucide-react";

export default function PortfolioPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Portfolio</h1>
        <p className="text-sm text-muted-foreground">
          Holdings, performance, and allocation
        </p>
      </div>

      {/* Empty State */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
            <Briefcase className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            Portfolio tracking coming soon
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Connect your brokerage or add holdings manually to track your portfolio
            performance, allocation, and gain/loss in real time.
          </p>
          <Button className="mt-6 gap-1.5" size="sm" disabled>
            <Plus className="h-4 w-4" />
            Add Holdings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
