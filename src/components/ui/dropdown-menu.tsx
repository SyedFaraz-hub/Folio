"use client";

import * as React from "react";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

function DropdownMenuContent({
  className,
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[180px] rounded-card border border-border bg-background p-1 shadow-popover",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

const itemVariants = cva(
  "flex h-8 cursor-default items-center gap-2 rounded-toggle px-2.5 text-[13px] font-medium outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-40 [&_svg]:size-3.5",
  {
    variants: {
      tone: {
        default: "text-foreground data-[highlighted]:bg-muted",
        destructive: "text-destructive-text data-[highlighted]:bg-destructive-soft",
      },
    },
    defaultVariants: { tone: "default" },
  },
);

function DropdownMenuItem({
  className,
  tone,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & VariantProps<typeof itemVariants>) {
  return (
    <DropdownMenuPrimitive.Item className={cn(itemVariants({ tone }), className)} {...props} />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator className={cn("my-1 h-px bg-divider", className)} {...props} />
  );
}

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
};
