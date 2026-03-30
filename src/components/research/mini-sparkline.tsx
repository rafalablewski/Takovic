import { cn } from "@/lib/utils";

export function MiniSparkline({
  values,
  className,
  positive,
}: {
  values: number[];
  className?: string;
  positive?: boolean;
}) {
  if (values.length < 2) {
    return (
      <div
        className={cn("h-8 w-20 rounded bg-muted/40", className)}
        aria-hidden
      />
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 80;
  const h = 28;
  const pad = 2;

  const coords = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = pad + (1 - (v - min) / range) * (h - pad * 2);
    return { x, y };
  });

  const d =
    coords.length > 0
      ? coords
          .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
          .join(" ")
      : "";

  const stroke =
    positive === undefined
      ? "var(--chart-line)"
      : positive
        ? "var(--up)"
        : "var(--down)";

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={cn("h-8 w-20", className)}
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
