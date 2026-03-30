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
        "flex shrink-0 flex-col rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 shadow-[inset_0_1px_0_oklch(1_0_0/0.05)] backdrop-blur-md transition-premium hover:bg-white/[0.08]",
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
          className="max-w-xs rounded-lg border border-white/10 bg-popover/90 text-xs backdrop-blur-xl"
        >
          {hint}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
