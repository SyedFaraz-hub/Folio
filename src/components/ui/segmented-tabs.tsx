"use client";

import * as React from "react";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

/** Grey track with a raised white "pill" for the active tab (All / Owned / Shared with me). */
const Tabs = TabsPrimitive.Root;
const TabsContent = TabsPrimitive.Content;

const listVariants = cva("inline-flex gap-0.5 bg-muted p-[3px]", {
  variants: {
    size: { md: "rounded-control", lg: "flex w-full rounded-[11px]" },
  },
  defaultVariants: { size: "md" },
});

const triggerVariants = cva(
  "rounded-toggle px-3 text-[13px] font-medium whitespace-nowrap text-muted-foreground transition-colors outline-none hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-tab",
  {
    variants: {
      size: { md: "h-[30px]", lg: "h-8 flex-1" },
    },
    defaultVariants: { size: "md" },
  },
);

type Size = VariantProps<typeof listVariants>["size"];
const SizeContext = React.createContext<Size>("md");

function TabsList({
  className,
  size,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & { size?: Size }) {
  return (
    <SizeContext.Provider value={size}>
      <TabsPrimitive.List className={cn(listVariants({ size }), className)} {...props} />
    </SizeContext.Provider>
  );
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const size = React.useContext(SizeContext);
  return <TabsPrimitive.Trigger className={cn(triggerVariants({ size }), className)} {...props} />;
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
