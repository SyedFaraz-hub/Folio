import type { JSONContent } from "@tiptap/core";
import { and, eq } from "drizzle-orm";

import type {
  DocumentDetail,
  DocumentList,
  DocumentSummary,
  PersonRef,
} from "@/features/documents/types";
import type { DocumentAccessList } from "@/features/sharing/types";

import { type Access, type DocumentAction, can, resolveAccess } from "./access";
import type { Database } from "./db/client";
import { type ShareRole, type User, documentShares, documents, users } from "./db/schema";
import { ApiError, forbidden, notFound } from "./http";
import { UNTITLED } from "./validations/documents";

export const EMPTY_DOC: JSONContent = { type: "doc", content: [{ type: "paragraph" }] };

const toPerson = (u: Pick<User, "id" | "name" | "email" | "initials" | "tone">): PersonRef => ({
  id: u.id,
  name: u.name,
  email: u.email,
  initials: u.initials,
  tone: u.tone,
});

// ---------------------------------------------------------------------------
// Access
// ---------------------------------------------------------------------------

/** Loads the document and the caller's access. Throws 404 when the caller can't see it. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function loadWithAccess(db: Database, userId: string, documentId: string) {
  if (!UUID.test(documentId)) throw notFound();
  const doc = await db.query.documents.findFirst({
    where: eq(documents.id, documentId),
    with: { owner: true, lastEditor: true, shares: true },
  });
  if (!doc) throw notFound();

  const share = doc.shares.find((s) => s.userId === userId);
  const access = resolveAccess(userId, doc.ownerId, share?.role);
  if (!access) throw notFound();
  return { doc, access };
}

function assertCan(access: Access, action: DocumentAction) {
  if (can(access, action)) return;
  const messages: Record<DocumentAction, string> = {
    read: "You don't have access to this document.",
    edit: "You have view-only access to this document.",
    rename: "Only the owner can rename this document.",
    share: "Only the owner can change sharing.",
    delete: "Only the owner can delete this document.",
  };
  throw forbidden(messages[action]);
}

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

export async function listDocuments(db: Database, userId: string): Promise<DocumentList> {
  const owned = await db.query.documents.findMany({
    where: eq(documents.ownerId, userId),
    columns: { content: false },
    with: { owner: true, lastEditor: true, shares: { columns: { userId: true } } },
  });

  const sharedRows = await db.query.documentShares.findMany({
    where: eq(documentShares.userId, userId),
    with: {
      document: {
        columns: { content: false },
        with: { owner: true, lastEditor: true, shares: { columns: { userId: true } } },
      },
    },
  });

  const byUpdated = (a: DocumentSummary, b: DocumentSummary) =>
    b.updatedAt.localeCompare(a.updatedAt);

  return {
    owned: owned
      .map((d) => summarize(d, "owner", d.owner, d.lastEditor, d.shares.length))
      .sort(byUpdated),
    shared: sharedRows
      .map((s) =>
        summarize(
          s.document,
          s.role,
          s.document.owner,
          s.document.lastEditor,
          s.document.shares.length,
        ),
      )
      .sort(byUpdated),
  };
}

function summarize(
  d: { id: string; title: string; updatedAt: Date },
  access: Access,
  owner: User,
  lastEditor: User | null,
  shareCount: number,
): DocumentSummary {
  return {
    id: d.id,
    title: d.title,
    updatedAt: d.updatedAt.toISOString(),
    access,
    owner: toPerson(owner),
    shareCount,
    lastEditedBy: lastEditor ? toPerson(lastEditor) : null,
  };
}

export async function getDocument(
  db: Database,
  userId: string,
  documentId: string,
): Promise<DocumentDetail> {
  const { doc, access } = await loadWithAccess(db, userId, documentId);
  return {
    ...summarize(doc, access, doc.owner, doc.lastEditor, doc.shares.length),
    content: doc.content,
    importedFrom: doc.importedFrom,
  };
}

export async function createDocument(
  db: Database,
  userId: string,
  input: { title?: string; content?: JSONContent; importedFrom?: string },
): Promise<DocumentDetail> {
  const [row] = await db
    .insert(documents)
    .values({
      ownerId: userId,
      title: input.title ?? UNTITLED,
      content: input.content ?? EMPTY_DOC,
      importedFrom: input.importedFrom ?? null,
      lastEditedBy: userId,
    })
    .returning({ id: documents.id });
  return getDocument(db, userId, row.id);
}

export async function updateDocument(
  db: Database,
  userId: string,
  documentId: string,
  input: { title?: string; content?: JSONContent },
): Promise<DocumentSummary> {
  const { access } = await loadWithAccess(db, userId, documentId);
  if (input.title !== undefined) assertCan(access, "rename");
  if (input.content !== undefined) assertCan(access, "edit");

  await db
    .update(documents)
    .set({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.content !== undefined ? { content: input.content } : {}),
      lastEditedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(documents.id, documentId));

  const {
    content: _content,
    importedFrom: _from,
    ...summary
  } = await getDocument(db, userId, documentId);
  return summary;
}

export async function deleteDocument(db: Database, userId: string, documentId: string) {
  const { access } = await loadWithAccess(db, userId, documentId);
  assertCan(access, "delete");
  await db.delete(documents).where(eq(documents.id, documentId));
}

// ---------------------------------------------------------------------------
// Sharing
// ---------------------------------------------------------------------------

/** [maya@folio.test, daniel@folio.test] → " Try maya@ or daniel@folio.test." */
export function suggestAccounts(emails: string[]): string {
  if (!emails.length) return "";
  const domain = emails[0].split("@")[1];
  if (!emails.every((e) => e.endsWith(`@${domain}`))) return ` Try ${emails.join(", ")}.`;
  const locals = emails.map((e) => `${e.split("@")[0]}@`);
  const last = locals.pop()!;
  return ` Try ${locals.length ? `${locals.join(", ")} or ` : ""}${last}${domain}.`;
}

export async function listShares(
  db: Database,
  userId: string,
  documentId: string,
): Promise<DocumentAccessList> {
  const { doc } = await loadWithAccess(db, userId, documentId);
  // Anyone with access may see who else has access; only the owner may change it.
  const rows = await db.query.documentShares.findMany({
    where: eq(documentShares.documentId, documentId),
    with: { user: true },
  });
  return {
    owner: toPerson(doc.owner),
    shares: rows
      .map((r) => ({ user: toPerson(r.user), role: r.role }))
      .sort((a, b) => a.user.name.localeCompare(b.user.name)),
  };
}

export async function shareDocument(
  db: Database,
  userId: string,
  documentId: string,
  input: { email: string; role: ShareRole },
): Promise<DocumentAccessList> {
  const { doc, access } = await loadWithAccess(db, userId, documentId);
  assertCan(access, "share");

  const target = await db.query.users.findFirst({ where: eq(users.email, input.email) });
  if (!target) {
    const others = await db.select({ email: users.email }).from(users);
    const suggestion = suggestAccounts(others.map((u) => u.email).filter((e) => e !== input.email));
    throw new ApiError(
      404,
      "user_not_found",
      `No account uses ${input.email}.${suggestion}`,
      "email",
    );
  }
  if (target.id === doc.ownerId) {
    throw new ApiError(409, "already_owner", "You already own this document.", "email");
  }
  if (doc.shares.some((s) => s.userId === target.id)) {
    throw new ApiError(409, "already_shared", `${target.name} already has access.`, "email");
  }

  await db.insert(documentShares).values({ documentId, userId: target.id, role: input.role });
  return listShares(db, userId, documentId);
}

export async function updateShare(
  db: Database,
  userId: string,
  documentId: string,
  targetUserId: string,
  role: ShareRole,
): Promise<DocumentAccessList> {
  const { access } = await loadWithAccess(db, userId, documentId);
  assertCan(access, "share");
  const updated = await db
    .update(documentShares)
    .set({ role })
    .where(and(eq(documentShares.documentId, documentId), eq(documentShares.userId, targetUserId)))
    .returning({ userId: documentShares.userId });
  if (!updated.length) throw notFound("Share");
  return listShares(db, userId, documentId);
}

export async function removeShare(
  db: Database,
  userId: string,
  documentId: string,
  targetUserId: string,
): Promise<DocumentAccessList> {
  const { access } = await loadWithAccess(db, userId, documentId);
  assertCan(access, "share");
  const removed = await db
    .delete(documentShares)
    .where(and(eq(documentShares.documentId, documentId), eq(documentShares.userId, targetUserId)))
    .returning({ userId: documentShares.userId });
  if (!removed.length) throw notFound("Share");
  return listShares(db, userId, documentId);
}
