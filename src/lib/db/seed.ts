import type { JSONContent } from "@tiptap/core";

import type { Database } from "./client";
import { type ShareRole, type UserTone, documentShares, documents, users } from "./schema";

export const SEED_USERS = [
  { email: "maya@folio.test", name: "Maya Okafor", initials: "MO", tone: "brand" },
  { email: "daniel@folio.test", name: "Daniel Reyes", initials: "DR", tone: "shared" },
  { email: "priya@folio.test", name: "Priya Nair", initials: "PN", tone: "success" },
] as const satisfies ReadonlyArray<{
  email: string;
  name: string;
  initials: string;
  tone: UserTone;
}>;

type SeedEmail = (typeof SEED_USERS)[number]["email"];

// --- tiny Tiptap JSON builders -------------------------------------------------
const text = (value: string, marks?: string[]): JSONContent => ({
  type: "text",
  text: value,
  ...(marks ? { marks: marks.map((type) => ({ type })) } : {}),
});
const p = (...content: (string | JSONContent)[]): JSONContent => ({
  type: "paragraph",
  content: content.map((c) => (typeof c === "string" ? text(c) : c)),
});
const h = (level: 1 | 2 | 3, value: string): JSONContent => ({
  type: "heading",
  attrs: { level },
  content: [text(value)],
});
const list = (type: "bulletList" | "orderedList", items: string[]): JSONContent => ({
  type,
  content: items.map((item) => ({ type: "listItem", content: [p(item)] })),
});
const doc = (...content: JSONContent[]): JSONContent => ({ type: "doc", content });

const ONBOARDING = doc(
  p(text("How new engineers get productive in their first two weeks.", ["italic"])),
  h(2, "Goals"),
  p(
    "Every new hire should ship a ",
    text("small, reviewed change", ["bold"]),
    " in week one and own a ",
    text("real feature", ["italic"]),
    " by the end of week two. We measure onboarding by ",
    text("time to first merged PR", ["underline"]),
    ", not checklist completion.",
  ),
  h(2, "Week one"),
  list("bulletList", [
    "Laptop, accounts and repo access ready before day one",
    "Pair with a buddy on a scoped bug fix",
    "Read the architecture note and leave one question",
  ]),
  h(2, "Week two"),
  list("orderedList", [
    "Pick a feature from the onboarding backlog",
    "Write a one-page plan and share it for review",
    "Demo it at the Friday team sync",
  ]),
);

interface SeedDoc {
  title: string;
  owner: SeedEmail;
  content: JSONContent;
  hoursAgo: number;
  shares: Partial<Record<SeedEmail, ShareRole>>;
}

const SEED_DOCS: SeedDoc[] = [
  {
    title: "Q4 onboarding plan",
    owner: "maya@folio.test",
    content: ONBOARDING,
    hoursAgo: 0.1,
    shares: { "daniel@folio.test": "editor", "priya@folio.test": "viewer" },
  },
  {
    title: "Design review notes — editor toolbar",
    owner: "daniel@folio.test",
    content: doc(
      h(2, "Decisions"),
      list("bulletList", [
        "Group undo/redo, block type, marks and lists",
        "Keep the toolbar to one row",
      ]),
      h(2, "Open questions"),
      p("Do we need a font size control, or are headings enough?"),
    ),
    hoursAgo: 1,
    shares: { "maya@folio.test": "editor" },
  },
  {
    title: "Customer interview synthesis",
    owner: "maya@folio.test",
    content: doc(
      h(2, "Themes"),
      list("orderedList", [
        "Sharing is the main reason teams switch",
        "Imports must keep headings",
      ]),
    ),
    hoursAgo: 26,
    shares: {},
  },
  {
    title: "Launch checklist",
    owner: "maya@folio.test",
    content: doc(
      h(2, "Before launch"),
      list("bulletList", ["Seed demo accounts", "Smoke-test sharing", "Record walkthrough"]),
    ),
    hoursAgo: 30,
    shares: { "priya@folio.test": "editor" },
  },
  {
    title: "Hiring rubric — full stack",
    owner: "priya@folio.test",
    content: doc(
      h(2, "Signals"),
      list("bulletList", ["Product judgment", "Full stack execution", "Clear communication"]),
    ),
    hoursAgo: 24 * 4,
    shares: { "maya@folio.test": "viewer" },
  },
  {
    title: "API naming conventions",
    owner: "daniel@folio.test",
    content: doc(
      h(2, "Rules"),
      p("Use ", text("plural nouns", ["bold"]), " for collections and kebab-case paths."),
    ),
    hoursAgo: 24 * 13,
    shares: { "maya@folio.test": "viewer" },
  },
];

/** Idempotent-ish: wipes Folio tables and inserts the demo data. */
export async function seedDatabase(db: Database) {
  await db.delete(documentShares);
  await db.delete(documents);
  await db.delete(users);

  // One insert per user so created_at preserves the design's order (Maya, Daniel, Priya).
  const inserted = [];
  for (const user of SEED_USERS) {
    const [row] = await db.insert(users).values(user).returning();
    inserted.push(row);
  }
  const idByEmail = new Map(inserted.map((u) => [u.email, u.id]));
  const id = (email: SeedEmail) => idByEmail.get(email)!;

  for (const seed of SEED_DOCS) {
    const at = new Date(Date.now() - seed.hoursAgo * 3_600_000);
    const [row] = await db
      .insert(documents)
      .values({
        title: seed.title,
        ownerId: id(seed.owner),
        content: seed.content,
        lastEditedBy: id(seed.owner),
        createdAt: at,
        updatedAt: at,
      })
      .returning({ id: documents.id });

    const shares = Object.entries(seed.shares) as [SeedEmail, ShareRole][];
    if (shares.length) {
      await db
        .insert(documentShares)
        .values(shares.map(([email, role]) => ({ documentId: row.id, userId: id(email), role })));
    }
  }

  return { users: inserted.length, documents: SEED_DOCS.length };
}
