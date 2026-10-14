"use client";

import { useRef } from "react";

import { toast } from "sonner";

import { useRenameDocument } from "@/features/documents/hooks";
import { cn } from "@/lib/utils";
import { titleSchema } from "@/lib/validations";

/** Inline rename in the breadcrumb. Saves on blur/Enter, Escape reverts. Owner only. */
export function TitleInput({
  documentId,
  title,
  onTitleChange,
  canRename,
}: {
  documentId: string;
  title: string;
  onTitleChange: (title: string) => void;
  canRename: boolean;
}) {
  // `title` is the live (possibly uncommitted) value owned by the parent; `saved` is the last
  // value persisted, used to revert on Escape or a failed rename.
  const saved = useRef(title);
  const rename = useRenameDocument(documentId);

  const commit = () => {
    const parsed = titleSchema.safeParse(title);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid title");
      onTitleChange(saved.current);
      return;
    }
    const next = parsed.data;
    onTitleChange(next);
    if (next === saved.current) return;

    const previous = saved.current;
    saved.current = next;
    onTitleChange(next);
    rename.mutate(next, {
      onError: (err) => {
        toast.error(err.message);
        saved.current = previous;
        onTitleChange(previous);
      },
    });
  };

  if (!canRename) {
    return (
      <span className="truncate px-2 py-1.5 text-sm font-medium text-foreground">{title}</span>
    );
  }

  return (
    <>
      <label htmlFor="doc-title" className="sr-only">
        Document title
      </label>
      <input
        id="doc-title"
        value={title}
        maxLength={200}
        onChange={(e) => onTitleChange(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") {
            onTitleChange(saved.current);
            requestAnimationFrame(() => e.currentTarget?.blur());
          }
        }}
        size={Math.min(Math.max(title.length, 8), 48)}
        className={cn(
          "min-w-0 rounded-toggle border border-transparent bg-transparent px-2 py-1.5 text-sm font-medium text-foreground outline-none",
          "hover:border-border focus:border-brand focus:shadow-[0_0_0_3px_rgba(91,75,245,0.18)]",
        )}
      />
    </>
  );
}
