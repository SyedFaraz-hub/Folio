import { cn } from "@/lib/utils";

/** Folio mark: violet tile with a folded page. */
export function Logo({ size = 26, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center bg-brand", className)}
      style={{ width: size, height: size, borderRadius: size * 0.3 }}
      aria-hidden
    >
      <svg
        width={size * 0.55}
        height={size * 0.55}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#fff"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 4h7l4 4v12H7z" />
      </svg>
    </span>
  );
}
