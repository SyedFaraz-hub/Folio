import type { JSONContent } from "@tiptap/core";

import { apiFetch, json } from "@/lib/api-client";

import type { DocumentDetail, DocumentList, DocumentSummary } from "../types";

export interface NewDocumentInput {
  title?: string;
  content?: JSONContent;
  importedFrom?: string;
}

export const fetchDocuments = () => apiFetch<DocumentList>("/api/documents");

export const createDocument = (input: NewDocumentInput = {}) =>
  apiFetch<{ document: DocumentDetail }>("/api/documents", {
    method: "POST",
    body: json(input),
  }).then((r) => r.document);

export const updateDocument = (id: string, input: { title?: string; content?: JSONContent }) =>
  apiFetch<{ document: DocumentSummary }>(`/api/documents/${id}`, {
    method: "PATCH",
    body: json(input),
  }).then((r) => r.document);

export const deleteDocument = (id: string) =>
  apiFetch<void>(`/api/documents/${id}`, { method: "DELETE" });
