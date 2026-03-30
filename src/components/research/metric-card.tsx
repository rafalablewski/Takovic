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
        "surface-panel flex flex-col gap-1 p-3 sm:p-4",
        className
      )}
    >
      <span className="label-caps opacity-90">{label}</span>
      <span className="font-mono text-base font-medium tabular-nums tracking-tight text-foreground">
        {value}
      </span>
      {sub != null && (
        <span className="text-xs text-muted-foreground">{sub}</span>
      )}
    </div>
  );
}
