"use client";

import * as React from "react";

import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

import { Tooltip } from "./tooltip";

/** 34px square toolbar control. Pressed state uses the brand soft/text pair. */
const toolbarButtonVariants = cva(
  "inline-flex h-[34px] items-center justify-center gap-1.5 rounded-toggle text-subtle-foreground transition-colors outline-none hover:bg-muted disabled:pointer-events-none disabled:opacity-40 aria-pressed:bg-brand-soft aria-pressed:text-brand-text [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      shape: { square: "w-[34px]", wide: "px-2.5 text-[13px] font-medium" },
    },
    defaultVariants: { shape: "square" },
  },
);

interface ToolbarButtonProps
  extends React.ComponentProps<"button">, VariantProps<typeof toolbarButtonVariants> {
  label: string;
  shortcut?: string;
  pressed?: boolean;
}

function ToolbarButton({
  className,
  shape,
  label,
  shortcut,
  pressed,
  ...props
}: ToolbarButtonProps) {
  return (
    <Tooltip content={label} shortcut={shortcut}>
      <button
        type="button"
        aria-label={shape === "wide" ? undefined : label}
        aria-pressed={pressed}
        // Keep editor selection when clicking toolbar buttons.
        onMouseDown={(e) => e.preventDefault()}
        className={cn(toolbarButtonVariants({ shape }), className)}
        {...props}
      />
    </Tooltip>
  );
}

function ToolbarDivider() {
  return <span aria-hidden className="mx-1 h-5 w-px bg-border" />;
}

export { ToolbarButton, ToolbarDivider, toolbarButtonVariants };
