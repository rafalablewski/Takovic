import { Badge } from "@/components/ui/badge";
import {
  sentimentBadgeVariant,
  sentimentLabel,
} from "@/lib/utils";

export function SentimentBadge({ sentiment }: { sentiment: string }) {
  return (
    <Badge
      variant={sentimentBadgeVariant(sentiment)}
      className="text-[10px] font-medium"
    >
      {sentimentLabel(sentiment)}
    </Badge>
  );
}
