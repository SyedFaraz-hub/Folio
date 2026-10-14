import { describe, expect, it } from "vitest";

import { type Access, type DocumentAction, can, resolveAccess } from "./access";

const ACTIONS: DocumentAction[] = ["read", "edit", "rename", "share", "delete"];

const EXPECTED: Record<Access | "none", DocumentAction[]> = {
  owner: ["read", "edit", "rename", "share", "delete"],
  editor: ["read", "edit"],
  viewer: ["read"],
  none: [],
};

describe("can()", () => {
  for (const [role, allowed] of Object.entries(EXPECTED)) {
    for (const action of ACTIONS) {
      const expected = allowed.includes(action);
      it(`${role} ${expected ? "can" : "cannot"} ${action}`, () => {
        expect(can(role === "none" ? null : (role as Access), action)).toBe(expected);
      });
    }
  }
});

describe("resolveAccess()", () => {
  it("treats the owner as owner even if a share row exists", () => {
    expect(resolveAccess("u1", "u1", "viewer")).toBe("owner");
  });
  it("uses the share role for everyone else", () => {
    expect(resolveAccess("u2", "u1", "editor")).toBe("editor");
    expect(resolveAccess("u2", "u1", null)).toBeNull();
  });
});
