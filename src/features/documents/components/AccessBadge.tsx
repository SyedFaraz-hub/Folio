import { Badge, type BadgeProps } from "@/components/ui";

import { accessLabel, accessShortLabel, accessTone } from "../lib";
import type { DocumentSummary } from "../types";

export function AccessBadge({
  doc,
  short = false,
  ...props
}: { doc: DocumentSummary; short?: boolean } & Omit<BadgeProps, "tone">) {
  return (
    <Badge tone={accessTone(doc)} {...props}>
      {short ? accessShortLabel(doc) : accessLabel(doc)}
    </Badge>
  );
}
