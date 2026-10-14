import type { JSONContent } from "@tiptap/core";

export interface ImportResult {
  title: string;
  content: JSONContent;
  filename: string;
}

export type ImportItem =
  | { id: string; file: File; status: "uploading"; progress: number }
  | { id: string; file: File; status: "ready"; result: ImportResult }
  | { id: string; file: File; status: "error"; error: string };

export type ImportMode = "new" | "draft";
