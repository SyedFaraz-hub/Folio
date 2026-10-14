import Link from "next/link";

import { FileText } from "lucide-react";

import { Avatar } from "@/components/ui";
import { relativeTime } from "@/lib/format";

import type { DocumentSummary } from "../types";
import { AccessBadge } from "./AccessBadge";

/** "All documents" list: title · owner · access · edited. */
export function DocTable({ docs }: { docs: DocumentSummary[] }) {
  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-[620px] flex-col" role="list">
        {docs.map((doc) => (
          <Link
            key={doc.id}
            role="listitem"
            href={`/documents/${doc.id}`}
            prefetch={false}
            className="grid min-h-[52px] grid-cols-[minmax(0,3fr)_minmax(0,1.5fr)_minmax(0,1.3fr)_minmax(0,1fr)] items-center gap-4 rounded-control border-b border-muted px-3 text-foreground no-underline transition-colors hover:bg-sidebar"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <FileText
                className="size-4 shrink-0 text-muted-foreground"
                strokeWidth={1.9}
                aria-hidden
              />
              <span className="truncate text-sm font-medium">{doc.title}</span>
            </span>
            <span className="flex min-w-0 items-center gap-2 text-[13px] text-subtle-foreground">
              <Avatar initials={doc.owner.initials} tone={doc.owner.tone} size="xs" />
              <span className="truncate">{doc.access === "owner" ? "You" : doc.owner.name}</span>
            </span>
            <span>
              <AccessBadge doc={doc} />
            </span>
            <span className="text-right text-[13px] text-muted-foreground" suppressHydrationWarning>
              {relativeTime(doc.updatedAt)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
