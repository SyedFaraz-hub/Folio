import { beforeEach, describe, expect, it } from "vitest";

import { createTestDb } from "@/test/db";

import type { Database } from "./db/client";
import {
  createDocument,
  deleteDocument,
  getDocument,
  listDocuments,
  listShares,
  removeShare,
  shareDocument,
  suggestAccounts,
  updateDocument,
  updateShare,
} from "./documents";
import { ApiError } from "./http";

const CONTENT = {
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: "Hello" }] }],
};

async function expectApiError(promise: Promise<unknown>, status: number, code?: string) {
  const err = await promise.then(
    () => null,
    (e: unknown) => e,
  );
  expect(err).toBeInstanceOf(ApiError);
  expect((err as ApiError).status).toBe(status);
  if (code) expect((err as ApiError).code).toBe(code);
  return err as ApiError;
}

describe("documents + sharing (PGlite integration)", () => {
  let db: Database;
  let maya: string;
  let daniel: string;
  let priya: string;
  let docId: string;

  beforeEach(async () => {
    ({ db, maya, daniel, priya } = await createTestDb());
    docId = (await createDocument(db, maya, { title: "Plan", content: CONTENT })).id;
  });

  it("lists owned and shared documents separately with the caller's access", async () => {
    await shareDocument(db, maya, docId, { email: "daniel@folio.test", role: "viewer" });

    const forMaya = await listDocuments(db, maya);
    const forDaniel = await listDocuments(db, daniel);

    expect(forMaya.owned.find((d) => d.id === docId)).toMatchObject({
      access: "owner",
      shareCount: 1,
    });
    expect(forMaya.shared.some((d) => d.id === docId)).toBe(false);
    expect(forDaniel.shared.find((d) => d.id === docId)).toMatchObject({
      access: "viewer",
      owner: { name: "Maya Okafor" },
    });
    expect(forDaniel.owned.some((d) => d.id === docId)).toBe(false);
  });

  it("hides documents from people without access (404, not 403)", async () => {
    await expectApiError(getDocument(db, priya, docId), 404, "not_found");
    await expectApiError(updateDocument(db, priya, docId, { content: CONTENT }), 404);
    await expectApiError(deleteDocument(db, priya, docId), 404);
    await expectApiError(listShares(db, priya, docId), 404);
    await expectApiError(getDocument(db, maya, "not-a-uuid"), 404);
  });

  it("lets a viewer read but not edit", async () => {
    await shareDocument(db, maya, docId, { email: "daniel@folio.test", role: "viewer" });

    const doc = await getDocument(db, daniel, docId);
    expect(doc.content).toEqual(CONTENT);
    await expectApiError(updateDocument(db, daniel, docId, { content: CONTENT }), 403, "forbidden");
  });

  it("lets an editor edit content and records them as last editor, but not rename/share/delete", async () => {
    await shareDocument(db, maya, docId, { email: "daniel@folio.test", role: "editor" });
    const edited = {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "Edited by Daniel" }] }],
    };

    await updateDocument(db, daniel, docId, { content: edited });
    const seenByMaya = await getDocument(db, maya, docId);
    expect(seenByMaya.content).toEqual(edited);
    expect(seenByMaya.lastEditedBy?.name).toBe("Daniel Reyes");

    await expectApiError(updateDocument(db, daniel, docId, { title: "Mine now" }), 403);
    await expectApiError(
      shareDocument(db, daniel, docId, { email: "priya@folio.test", role: "editor" }),
      403,
    );
    await expectApiError(deleteDocument(db, daniel, docId), 403);
  });

  it("validates invites: unknown email, self-share and duplicates", async () => {
    const unknown = await expectApiError(
      shareDocument(db, maya, docId, { email: "sam@folio.test", role: "editor" }),
      404,
      "user_not_found",
    );
    expect(unknown.message).toMatch(/^No account uses sam@folio\.test\. Try /);
    expect(unknown.field).toBe("email");

    await expectApiError(
      shareDocument(db, maya, docId, { email: "maya@folio.test", role: "editor" }),
      409,
      "already_owner",
    );

    await shareDocument(db, maya, docId, { email: "daniel@folio.test", role: "editor" });
    await expectApiError(
      shareDocument(db, maya, docId, { email: "daniel@folio.test", role: "viewer" }),
      409,
      "already_shared",
    );
  });

  it("changes roles and revokes access", async () => {
    await shareDocument(db, maya, docId, { email: "daniel@folio.test", role: "editor" });

    const afterDowngrade = await updateShare(db, maya, docId, daniel, "viewer");
    expect(afterDowngrade.shares).toEqual([
      expect.objectContaining({ role: "viewer", user: expect.objectContaining({ id: daniel }) }),
    ]);
    await expectApiError(updateDocument(db, daniel, docId, { content: CONTENT }), 403);

    await removeShare(db, maya, docId, daniel);
    await expectApiError(getDocument(db, daniel, docId), 404);
    expect((await listDocuments(db, daniel)).shared.some((d) => d.id === docId)).toBe(false);
  });

  it("deletes the document together with its shares", async () => {
    await shareDocument(db, maya, docId, { email: "daniel@folio.test", role: "editor" });
    await deleteDocument(db, maya, docId);

    await expectApiError(getDocument(db, maya, docId), 404);
    expect((await listDocuments(db, daniel)).shared.some((d) => d.id === docId)).toBe(false);
  });
});

describe("suggestAccounts()", () => {
  it("formats seeded accounts like the design copy", () => {
    expect(suggestAccounts(["maya@folio.test", "daniel@folio.test", "priya@folio.test"])).toBe(
      " Try maya@, daniel@ or priya@folio.test.",
    );
    expect(suggestAccounts([])).toBe("");
  });
});
