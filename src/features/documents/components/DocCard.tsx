import Link from "next/link";

import { relativeTime } from "@/lib/format";

import { TONE_DOT, accessTone } from "../lib";
import type { DocumentSummary } from "../types";
import { AccessBadge } from "./AccessBadge";

/** "Jump back in" card with a miniature page thumbnail. */
export function DocCard({ doc }: { doc: DocumentSummary }) {
  return (
    <Link
      href={`/documents/${doc.id}`}
      prefetch={false}
      className="group flex flex-col overflow-hidden rounded-[14px] border border-border bg-background text-foreground no-underline shadow-card transition-shadow hover:shadow-popover"
    >
      <span aria-hidden className="flex h-32 justify-center overflow-hidden bg-sidebar pt-[18px]">
        <span className="flex w-[70%] flex-col gap-1.5 rounded-t-md bg-background px-3.5 pt-3.5 shadow-[0_1px_3px_rgba(15,15,18,0.08)] transition-transform group-hover:-translate-y-0.5">
          <span className="h-[7px] w-[70%] rounded-[3px] bg-foreground" />
          <span className="h-1 w-full rounded-sm bg-[#dedee3]" />
          <span className="h-1 w-[88%] rounded-sm bg-[#dedee3]" />
          <span
            className="mt-1 h-[5px] w-[40%] rounded-sm"
            style={{ background: TONE_DOT[accessTone(doc)] }}
          />
          <span className="h-1 w-[94%] rounded-sm bg-[#dedee3]" />
          <span className="h-1 w-[76%] rounded-sm bg-[#dedee3]" />
        </span>
      </span>
      <span className="flex flex-col gap-2 border-t border-divider px-3.5 pt-3 pb-3.5">
        <span className="truncate text-sm font-semibold">{doc.title}</span>
        <span className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span suppressHydrationWarning>Edited {relativeTime(doc.updatedAt)}</span>
          <AccessBadge doc={doc} short size="sm" />
        </span>
      </span>
    </Link>
  );
}
