"use client";

import * as React from "react";

import * as SelectPrimitive from "@radix-ui/react-select";
import { type VariantProps, cva } from "class-variance-authority";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;
const SelectValue = SelectPrimitive.Value;

const triggerVariants = cva(
  "inline-flex items-center justify-between gap-1.5 rounded-toggle text-[13px] font-medium whitespace-nowrap text-foreground outline-none disabled:opacity-50 [&>svg]:size-3 [&>svg]:shrink-0 [&>svg]:opacity-60",
  {
    variants: {
      variant: {
        /** Grey pill — role picker inside the invite row */
        filled: "h-[34px] bg-muted px-2.5 hover:bg-[#e8e8ec]",
        /** Borderless — per-person role in the access list, toolbar block type */
        ghost: "h-8 bg-transparent px-2 hover:bg-muted",
      },
    },
    defaultVariants: { variant: "ghost" },
  },
);

function SelectTrigger({
  className,
  variant,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & VariantProps<typeof triggerVariants>) {
  return (
    <SelectPrimitive.Trigger className={cn(triggerVariants({ variant }), className)} {...props}>
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown strokeWidth={2.4} />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position={position}
        sideOffset={6}
        className={cn(
          "z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-card border border-border bg-background p-1 shadow-popover",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0",
          className,
        )}
        {...props}
      >
        <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

const selectItemVariants = cva(
  "relative flex h-8 cursor-default items-center rounded-toggle pr-8 pl-2.5 text-[13px] font-medium outline-none select-none data-[disabled]:opacity-40",
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

function SelectItem({
  className,
  tone,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item> & VariantProps<typeof selectItemVariants>) {
  return (
    <SelectPrimitive.Item className={cn(selectItemVariants({ tone }), className)} {...props}>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute right-2.5">
        <Check className="size-3.5 text-brand-text" strokeWidth={2.6} />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({ className }: { className?: string }) {
  return <SelectPrimitive.Separator className={cn("my-1 h-px bg-divider", className)} />;
}

export { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue };
