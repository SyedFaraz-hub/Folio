"use client";

import * as React from "react";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";

const TooltipProvider = TooltipPrimitive.Provider;

/** Small dark tooltip with an optional mono shortcut hint. */
function Tooltip({
  content,
  shortcut,
  children,
}: {
  content: React.ReactNode;
  shortcut?: string;
  children: React.ReactNode;
}) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          sideOffset={6}
          className="z-50 flex items-center gap-2 rounded-toggle bg-foreground px-2 py-1 text-xs font-medium text-white data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0"
        >
          {content}
          {shortcut ? (
            <span className="font-mono text-[11px] text-white/60">{shortcut}</span>
          ) : null}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

export { Tooltip, TooltipProvider };
