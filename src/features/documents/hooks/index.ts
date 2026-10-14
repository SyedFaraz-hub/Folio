"use client";

import { useRouter } from "next/navigation";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  type NewDocumentInput,
  createDocument,
  deleteDocument,
  fetchDocuments,
  updateDocument,
} from "../services";
import type { DocumentList, DocumentSummary } from "../types";

export const documentKeys = {
  all: ["documents"] as const,
  list: () => [...documentKeys.all, "list"] as const,
};

export function useDocuments(initialData?: DocumentList) {
  return useQuery({ queryKey: documentKeys.list(), queryFn: fetchDocuments, initialData });
}

/** Creates a document and opens it in the editor. */
export function useCreateDocument() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input?: NewDocumentInput) => createDocument(input),
    onSuccess: (doc) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
      router.push(`/documents/${doc.id}`);
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useRenameDocument(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (title: string) => updateDocument(id, { title }),
    onSuccess: (doc) => patchListCache(queryClient, doc),
  });
}

export function useDeleteDocument() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
      toast.success("Document deleted");
      router.push("/");
      router.refresh();
    },
    onError: (err) => toast.error(err.message),
  });
}

/** Keep the dashboard cache fresh after a save without refetching everything. */
export function patchListCache(
  queryClient: ReturnType<typeof useQueryClient>,
  doc: DocumentSummary,
) {
  queryClient.setQueryData<DocumentList>(documentKeys.list(), (list) => {
    if (!list) return list;
    const patch = (items: DocumentSummary[]) =>
      items.map((d) => (d.id === doc.id ? { ...d, ...doc, access: d.access } : d));
    return { owned: patch(list.owned), shared: patch(list.shared) };
  });
}
