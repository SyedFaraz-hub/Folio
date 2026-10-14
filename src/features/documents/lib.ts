import { firstName } from "@/lib/format";

import type { DocumentFilter, DocumentList, DocumentSummary } from "./types";

type Tone = "owned" | "shared" | "private";

/** Colour language: violet = yours & shared out, amber = shared with you, grey = private. */
export function accessTone(doc: DocumentSummary): Tone {
  if (doc.access !== "owner") return "shared";
  return doc.shareCount > 0 ? "owned" : "private";
}

/** Long label for the documents table: "Owner · shared with 2", "Shared · can view". */
export function accessLabel(doc: DocumentSummary): string {
  if (doc.access === "owner") {
    return doc.shareCount > 0 ? `Owner · shared with ${doc.shareCount}` : "Owner · private";
  }
  return doc.access === "editor" ? "Shared · can edit" : "Shared · can view";
}

/** Short label for cards: "Shared · 2", "Private", "From Daniel". */
export function accessShortLabel(doc: DocumentSummary): string {
  if (doc.access === "owner") return doc.shareCount > 0 ? `Shared · ${doc.shareCount}` : "Private";
  return `From ${firstName(doc.owner.name)}`;
}

export const TONE_DOT: Record<Tone, string> = {
  owned: "var(--brand)",
  shared: "var(--shared)",
  private: "#9a9ba6",
};

export function filterDocuments(list: DocumentList, filter: DocumentFilter, query = "") {
  const docs =
    filter === "owned"
      ? list.owned
      : filter === "shared"
        ? list.shared
        : [...list.owned, ...list.shared];
  const q = query.trim().toLowerCase();
  return docs
    .filter((d) => !q || d.title.toLowerCase().includes(q))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function parseFilter(value: string | null | undefined): DocumentFilter {
  return value === "owned" || value === "shared" ? value : "all";
}
