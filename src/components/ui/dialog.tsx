"use client";

import * as React from "react";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;

interface DialogContentProps extends Omit<
  React.ComponentProps<typeof DialogPrimitive.Content>,
  "title"
> {
  title: React.ReactNode;
  /** Visually hidden unless provided as visible content elsewhere. */
  description?: string;
}

/** 20px-radius dialog with title row + close button (Share / Import designs). */
function DialogContent({
  className,
  title,
  description,
  children,
  onOpenAutoFocus,
  ...props
}: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#0f0f12]/30 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
      <DialogPrimitive.Content
        className={cn(
          "fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] max-w-[520px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-y-auto rounded-dialog border border-border bg-background shadow-dialog outline-none",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.98]",
          className,
        )}
        // Respect `autoFocus` inside the dialog (e.g. the invite field); otherwise focus the
        // dialog itself rather than the close button, so no stray focus ring appears on open.
        onOpenAutoFocus={(e) => {
          onOpenAutoFocus?.(e);
          if (e.defaultPrevented) return;
          e.preventDefault();
          const el = e.currentTarget as HTMLElement;
          if (!el.contains(document.activeElement)) el.focus();
        }}
        {...props}
      >
        <div className="flex items-center justify-between gap-4 pt-5 pr-5 pl-6">
          <DialogPrimitive.Title className="m-0 truncate text-lg font-semibold tracking-[-0.02em]">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Close
            aria-label="Close"
            className="flex size-9 shrink-0 items-center justify-center rounded-control text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" strokeWidth={2.2} />
          </DialogPrimitive.Close>
        </div>
        <DialogPrimitive.Description className={description ? "sr-only" : "hidden"}>
          {description}
        </DialogPrimitive.Description>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

function DialogBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-4 px-6 pt-4", className)} {...props} />;
}

/** Grey footer bar with rounded bottom corners. */
function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mt-5 flex flex-wrap items-center justify-end gap-2 rounded-b-dialog border-t border-divider bg-toolbar px-5 py-3.5",
        className,
      )}
      {...props}
    />
  );
}

export { Dialog, DialogBody, DialogClose, DialogContent, DialogFooter, DialogTrigger };
