import * as React from "react";

import { cn } from "@/lib/utils";

/** 36px control. Invalid state is driven by `aria-invalid` so it stays accessible. */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "h-9 w-full min-w-0 rounded-control border border-input bg-background px-3 text-sm text-foreground transition-[border-color,box-shadow] outline-none placeholder:text-muted-foreground",
        "focus-visible:border-brand focus-visible:shadow-[0_0_0_3px_rgba(91,75,245,0.18)] focus-visible:outline-none",
        "aria-invalid:border-[#e5484d] aria-invalid:shadow-[0_0_0_3px_rgba(229,72,77,0.12)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

/** Inline validation text under a field. */
function FieldError({ className, ...props }: React.ComponentProps<"p">) {
  if (!props.children) return null;
  return <p className={cn("m-0 text-[13px] text-destructive-text", className)} {...props} />;
}

export { FieldError, Input };
