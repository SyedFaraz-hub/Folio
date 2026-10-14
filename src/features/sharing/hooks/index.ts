"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { documentKeys } from "@/features/documents/hooks";
import type { InviteInput } from "@/lib/validations";

import { changeShareRole, fetchShares, inviteToDocument, revokeShare } from "../services";
import type { DocumentAccessList, ShareRole } from "../types";

export const shareKeys = {
  all: ["shares"] as const,
  forDocument: (documentId: string) => [...shareKeys.all, documentId] as const,
};

export function useShares(documentId: string, enabled = true) {
  return useQuery({
    queryKey: shareKeys.forDocument(documentId),
    queryFn: () => fetchShares(documentId),
    enabled,
  });
}

function useShareMutation<V>(
  documentId: string,
  fn: (vars: V) => Promise<DocumentAccessList>,
  options: { toastOnError?: boolean } = {},
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (list) => {
      queryClient.setQueryData(shareKeys.forDocument(documentId), list);
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
    },
    onError: (err) => {
      if (options.toastOnError !== false) toast.error(err.message);
    },
  });
}

/** Errors are shown inline under the invite field, so no toast here. */
export const useInvite = (documentId: string) =>
  useShareMutation(documentId, (input: InviteInput) => inviteToDocument(documentId, input), {
    toastOnError: false,
  });

export const useChangeRole = (documentId: string) =>
  useShareMutation(documentId, ({ userId, role }: { userId: string; role: ShareRole }) =>
    changeShareRole(documentId, userId, role),
  );

export const useRevokeShare = (documentId: string) =>
  useShareMutation(documentId, (userId: string) => revokeShare(documentId, userId));
