import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Teach tailwind-merge about our custom radius/shadow tokens so `cn()` overrides work.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      rounded: [{ rounded: ["toggle", "control", "card", "panel", "dialog"] }],
      shadow: [{ shadow: ["panel", "card", "popover", "dialog", "toast", "tab"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
