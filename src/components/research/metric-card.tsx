import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  sub,
  className,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "research-card flex flex-col gap-0.5 p-3",
        className
      )}
    >
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-base font-semibold tabular-nums text-foreground">
        {value}
      </span>
      {sub != null && (
        <span className="text-xs text-muted-foreground">{sub}</span>
      )}
    </div>
  );
}
