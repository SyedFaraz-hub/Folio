import { FileText, Upload } from "lucide-react";

import { Button } from "@/components/ui";

import type { DocumentFilter } from "../types";

const COPY: Record<DocumentFilter, { title: string; body: string }> = {
  all: {
    title: "No documents yet",
    body: "Create a document or import a .txt, .md or .docx file.",
  },
  owned: {
    title: "You haven’t created anything yet",
    body: "Start a blank document or import a file.",
  },
  shared: {
    title: "Nothing shared with you yet",
    body: "When someone shares a document with you, it shows up here.",
  },
};

export function EmptyState({
  filter,
  query,
  onCreate,
  onImport,
  creating,
}: {
  filter: DocumentFilter;
  query?: string;
  onCreate: () => void;
  onImport: () => void;
  creating?: boolean;
}) {
  const copy = query
    ? { title: `No documents match “${query}”`, body: "Try a different title." }
    : COPY[filter];
  return (
    <div className="flex flex-col items-center gap-3 rounded-panel border border-dashed border-border px-6 py-14 text-center">
      <span className="flex size-11 items-center justify-center rounded-card border border-border bg-background text-muted-foreground shadow-panel">
        <FileText className="size-5" strokeWidth={1.9} />
      </span>
      <div className="flex flex-col gap-1">
        <p className="m-0 text-[15px] font-medium">{copy.title}</p>
        <p className="m-0 text-sm text-muted-foreground">{copy.body}</p>
      </div>
      {filter !== "shared" && !query ? (
        <div className="mt-2 flex gap-2">
          <Button variant="outline" icon={<Upload />} onClick={onImport}>
            Import
          </Button>
          <Button onClick={onCreate} loading={creating}>
            New document
          </Button>
        </div>
      ) : null}
    </div>
  );
}
