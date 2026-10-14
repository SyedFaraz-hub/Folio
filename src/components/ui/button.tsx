import * as React from "react";

import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-control font-medium transition-[background-color,color,box-shadow,opacity] duration-150 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /** Black — the primary action (New document, Done, Create document) */
        default: "bg-primary text-primary-foreground hover:bg-primary/85",
        /** Violet — brand highlight (Share, Invite) */
        brand: "bg-brand text-white hover:bg-brand-text",
        outline: "border border-border bg-background text-foreground shadow-panel hover:bg-sidebar",
        ghost: "bg-transparent text-foreground hover:bg-muted",
        destructive: "bg-destructive text-white hover:bg-destructive-text",
        link: "h-auto px-0 text-brand-text underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-[13px] [&_svg]:size-3.5",
        md: "h-9 px-3.5 text-sm [&_svg]:size-[15px]",
        lg: "h-11 px-5 text-[15px] [&_svg]:size-4",
        icon: "size-9 [&_svg]:size-4",
        "icon-sm": "size-8 rounded-toggle [&_svg]:size-3.5",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  },
);

export interface ButtonProps
  extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Leading icon (swapped for a spinner while `loading`) */
  icon?: React.ReactNode;
  /** Shows a spinner and disables the button while an action is in progress */
  loading?: boolean;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  icon,
  loading = false,
  disabled,
  children,
  type,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className);

  if (asChild) {
    return (
      <Slot className={classes} aria-disabled={disabled || loading || undefined} {...props}>
        {children}
      </Slot>
    );
  }

  return (
    <button
      type={type ?? "button"}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Loader2 className="animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  );
}

export { Button, buttonVariants };
