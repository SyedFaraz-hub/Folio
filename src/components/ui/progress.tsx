import { cn } from "@/lib/utils";

export function Progress({ value, className }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <span
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("block h-1 overflow-hidden rounded-full bg-divider", className)}
    >
      <span
        className="block h-full rounded-full bg-brand transition-[width] duration-200"
        style={{ width: `${pct}%` }}
      />
    </span>
  );
}
