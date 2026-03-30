import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function Tag({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded border-border/80 px-1.5 py-0 font-mono text-[10px] font-medium uppercase tracking-wide text-muted-foreground",
        className
      )}
    >
      {children}
    </Badge>
  );
}
