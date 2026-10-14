import * as React from "react";

import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Violet = yours, amber = shared with you, grey = private.
 * Each tone has its own lightness so the meaning doesn't rely on hue alone.
 */
const badgeVariants = cva(
  "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full font-medium [&_svg]:size-3 [&_svg]:shrink-0",
  {
    variants: {
      tone: {
        owned: "bg-brand-soft text-brand-text",
        shared: "bg-shared-soft text-shared-text",
        private: "bg-neutral-soft text-neutral-text",
        success: "bg-success-soft text-success-text",
        destructive: "bg-destructive-soft text-destructive-text",
      },
      size: {
        sm: "h-5 px-2 text-xs",
        md: "h-[22px] px-2 text-xs",
        lg: "h-[26px] px-2.5 text-xs",
      },
    },
    defaultVariants: { tone: "private", size: "md" },
  },
);

export interface BadgeProps
  extends React.ComponentProps<"span">, VariantProps<typeof badgeVariants> {}

function Badge({ className, tone, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
