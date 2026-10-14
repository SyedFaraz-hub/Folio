import type { ShareRole } from "./db/schema";

/**
 * Sharing model — the single source of truth for who may do what.
 *
 *            read  edit  rename  share  delete
 *   owner     ✓     ✓      ✓      ✓      ✓
 *   editor    ✓     ✓      ✗      ✗      ✗
 *   viewer    ✓     ✗      ✗      ✗      ✗
 *   (none)    ✗     ✗      ✗      ✗      ✗   → 404, so existence isn't leaked
 */
export type Access = "owner" | ShareRole;
export type DocumentAction = "read" | "edit" | "rename" | "share" | "delete";

const PERMISSIONS: Record<Access, ReadonlySet<DocumentAction>> = {
  owner: new Set(["read", "edit", "rename", "share", "delete"]),
  editor: new Set(["read", "edit"]),
  viewer: new Set(["read"]),
};

export function can(access: Access | null | undefined, action: DocumentAction): boolean {
  return !!access && PERMISSIONS[access].has(action);
}

export function resolveAccess(
  userId: string,
  ownerId: string,
  shareRole: ShareRole | null | undefined,
): Access | null {
  if (userId === ownerId) return "owner";
  return shareRole ?? null;
}
