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
        "rounded-lg border-white/15 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground backdrop-blur-sm",
        className
      )}
    >
      {children}
    </Badge>
  );
}
