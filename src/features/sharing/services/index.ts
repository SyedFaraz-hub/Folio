import { apiFetch, json } from "@/lib/api-client";
import type { InviteInput } from "@/lib/validations";

import type { DocumentAccessList, ShareRole } from "../types";

const base = (documentId: string) => `/api/documents/${documentId}/shares`;

export const fetchShares = (documentId: string) => apiFetch<DocumentAccessList>(base(documentId));

export const inviteToDocument = (documentId: string, input: InviteInput) =>
  apiFetch<DocumentAccessList>(base(documentId), { method: "POST", body: json(input) });

export const changeShareRole = (documentId: string, userId: string, role: ShareRole) =>
  apiFetch<DocumentAccessList>(`${base(documentId)}/${userId}`, {
    method: "PATCH",
    body: json({ role }),
  });

export const revokeShare = (documentId: string, userId: string) =>
  apiFetch<DocumentAccessList>(`${base(documentId)}/${userId}`, { method: "DELETE" });
