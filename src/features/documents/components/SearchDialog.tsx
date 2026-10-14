"use client";

import { useEffect, useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { FileText, Search } from "lucide-react";

import { Dialog, DialogContent } from "@/components/ui";
import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

import { useDocuments } from "../hooks";
import { TONE_DOT, accessTone, filterDocuments } from "../lib";

/** ⌘K quick-open over owned + shared documents (client-side title match). */
export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const router = useRouter();
  const { data } = useDocuments();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const results = useMemo(
    () => (data ? filterDocuments(data, "all", query).slice(0, 8) : []),
    [data, query],
  );

  const go = (id: string) => {
    onOpenChange(false);
    setQuery("");
    router.push(`/documents/${id}`);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setQuery("");
      }}
    >
      <DialogContent title="Search documents" className="max-w-[560px] gap-0 pb-2">
        <div className="mx-5 mt-3 flex items-center gap-2 rounded-control border border-border px-3 focus-within:border-brand focus-within:shadow-[0_0_0_3px_rgba(91,75,245,0.18)]">
          <Search className="size-4 text-muted-foreground" aria-hidden />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") setActive((i) => Math.min(i + 1, results.length - 1));
              if (e.key === "ArrowUp") setActive((i) => Math.max(i - 1, 0));
              if (e.key === "Enter" && results[active]) go(results[active].id);
            }}
            placeholder="Search by title"
            aria-label="Search by title"
            className="h-10 flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        <div className="mt-2 flex max-h-[360px] flex-col overflow-y-auto px-3" role="listbox">
          {results.length === 0 ? (
            <p className="m-0 px-2 py-6 text-center text-sm text-muted-foreground">
              No matching documents
            </p>
          ) : (
            results.map((doc, i) => (
              <button
                key={doc.id}
                type="button"
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(doc.id)}
                className={cn(
                  "flex h-10 items-center gap-2.5 rounded-toggle px-2 text-left text-sm",
                  i === active && "bg-muted",
                )}
              >
                <FileText className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.9} />
                <span className="flex-1 truncate">{doc.title}</span>
                <span
                  className="size-1.5 rounded-[2px]"
                  style={{ background: TONE_DOT[accessTone(doc)] }}
                />
                <span className="w-20 text-right text-xs text-muted-foreground">
                  {relativeTime(doc.updatedAt)}
                </span>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Global ⌘K / Ctrl+K shortcut. */
export function useSearchShortcut(onOpen: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onOpen]);
}
