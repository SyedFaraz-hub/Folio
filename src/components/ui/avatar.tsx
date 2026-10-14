import * as React from "react";

import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const avatarVariants = cva(
  "inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold",
  {
    variants: {
      tone: {
        brand: "bg-brand-soft text-brand-text",
        shared: "bg-shared-soft text-shared-text",
        success: "bg-success-soft text-success-text",
      },
      size: {
        xs: "size-[22px] text-[10px]",
        sm: "size-[30px] text-[11px]",
        md: "size-8 text-xs",
        lg: "size-9 text-[13px]",
      },
      /** A ring means the person is viewing now (same colour as their cursor). */
      presence: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        presence: true,
        tone: "brand",
        className: "shadow-[0_0_0_2px_#fff,0_0_0_4px_var(--brand)]",
      },
      {
        presence: true,
        tone: "shared",
        className: "shadow-[0_0_0_2px_#fff,0_0_0_4px_var(--shared)]",
      },
      {
        presence: true,
        tone: "success",
        className: "shadow-[0_0_0_2px_#fff,0_0_0_4px_var(--success)]",
      },
    ],
    defaultVariants: { tone: "brand", size: "md", presence: false },
  },
);

export interface AvatarProps
  extends Omit<React.ComponentProps<"span">, "children">, VariantProps<typeof avatarVariants> {
  initials: string;
  name?: string;
}

function Avatar({ className, tone, size, presence, initials, name, ...props }: AvatarProps) {
  return (
    <span
      className={cn(avatarVariants({ tone, size, presence }), className)}
      title={name}
      aria-label={name}
      role={name ? "img" : undefined}
      {...props}
    >
      {initials}
    </span>
  );
}

export { Avatar, avatarVariants };
