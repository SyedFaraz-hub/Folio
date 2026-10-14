"use client";

import { Toaster as Sonner } from "sonner";

/** Dark pill toasts, as in the design system's "Feedback" block. */
export function Toaster() {
  return (
    <Sonner
      position="bottom-center"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex items-center gap-2.5 rounded-card bg-foreground px-3.5 py-2.5 text-[13px] text-white shadow-toast font-sans",
          icon: "[&_svg]:size-3.5",
          success: "[&_[data-icon]]:text-[#7cd9a6]",
          error: "[&_[data-icon]]:text-[#ff9b9f]",
          actionButton: "ml-auto rounded-toggle bg-white/15 px-2 py-1 text-xs font-medium",
        },
      }}
    />
  );
}
