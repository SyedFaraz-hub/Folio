"use client";

import { type Editor, EditorContent } from "@tiptap/react";
import { Upload } from "lucide-react";

import { Badge } from "@/components/ui";
import type { DocumentDetail } from "@/features/documents/types";
import { firstName } from "@/lib/format";

function AccessChip({ doc }: { doc: DocumentDetail }) {
  if (doc.access === "owner")
    return (
      <Badge tone="owned" size="lg">
        You own this
      </Badge>
    );
  const owner = firstName(doc.owner.name);
  return doc.access === "editor" ? (
    <Badge tone="shared" size="lg">
      Shared by {owner} · can edit
    </Badge>
  ) : (
    <Badge tone="shared" size="lg">
      Shared by {owner} · view only
    </Badge>
  );
}

/** Grey canvas with a Letter-width white page, like the design's editor frame. */
export function PageCanvas({
  editor,
  doc,
  title,
}: {
  editor: Editor | null;
  doc: DocumentDetail;
  title: string;
}) {
  return (
    <div className="flex flex-1 items-start justify-center bg-canvas px-[clamp(8px,3vw,32px)] pt-8 pb-16">
      <article
        className="min-h-[1056px] max-w-[816px] min-w-0 flex-[0_1_816px] rounded-[4px] border border-[#e4e4e7] bg-background px-[clamp(24px,7vw,96px)] py-[clamp(28px,7vw,96px)] shadow-card"
        onClick={(e) => {
          // Clicking the page margin focuses the end of the document.
          if (e.target === e.currentTarget && editor?.isEditable) editor.chain().focus("end").run();
        }}
      >
        <div className="mb-[18px] flex flex-wrap gap-1.5">
          {doc.importedFrom ? (
            <Badge tone="private" size="lg">
              <Upload strokeWidth={2.2} /> Imported from {doc.importedFrom}
            </Badge>
          ) : null}
          <AccessChip doc={doc} />
        </div>
        <h1 className="m-0 mb-6 text-[38px] leading-[1.1] font-semibold tracking-[-0.035em] break-words text-foreground">
          {title || "Untitled document"}
        </h1>
        {editor ? (
          <EditorContent editor={editor} />
        ) : (
          <div aria-hidden className="flex flex-col gap-3 pt-1">
            {[92, 78, 85, 60].map((w) => (
              <span
                key={w}
                className="h-3 animate-pulse rounded bg-muted"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        )}
      </article>
    </div>
  );
}
