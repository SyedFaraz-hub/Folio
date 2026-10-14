import type { JSONContent } from "@tiptap/core";

import type { Access } from "@/lib/access";
import type { UserTone } from "@/lib/db/schema";

export type { Access } from "@/lib/access";

export interface PersonRef {
  id: string;
  name: string;
  email: string;
  initials: string;
  tone: UserTone;
}

export interface DocumentSummary {
  id: string;
  title: string;
  updatedAt: string;
  access: Access;
  owner: PersonRef;
  /** Number of people the document is shared with (owner-visible). */
  shareCount: number;
  lastEditedBy: PersonRef | null;
}

export interface DocumentDetail extends DocumentSummary {
  content: JSONContent;
  importedFrom: string | null;
}

export interface DocumentList {
  owned: DocumentSummary[];
  shared: DocumentSummary[];
}

export type DocumentFilter = "all" | "owned" | "shared";
