import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function MetricChip({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  className?: string;
}) {
  const inner = (
    <div
      className={cn(
        "flex shrink-0 flex-col rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 py-2.5 transition-premium hover:border-white/[0.1] hover:bg-white/[0.04]",
        className
      )}
    >
      <span className="label-caps opacity-90">{label}</span>
      <span className="font-mono text-sm font-medium tabular-nums tracking-tight text-foreground">
        {value}
      </span>
    </div>
  );

  if (!hint) return inner;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{inner}</TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="max-w-xs rounded-lg border border-white/[0.1] bg-popover text-xs"
        >
          {hint}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
