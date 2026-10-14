# Architecture note

## What I prioritised, and why

The brief asks for depth in a few areas rather than shallow coverage. I treated three things as the product:

1. **An editing loop that feels trustworthy.** You type, it saves, you reload, and it's exactly as you left it. Formatting is stored as structured Tiptap/ProseMirror JSON, not HTML. Autosave is debounced, sends one save at a time, and shows its state: Saving…, Saved, or Not saved with Retry.
2. **Sharing rules that are correct and visible.** Every permission decision comes from one table in `src/lib/access.ts`. The UI shows the outcome everywhere: badges, owner chips, a read-only editor, and Share/Delete appearing only for the owner.
3. **Import that produces real, editable documents.** Imported files pass through the editor's own schema, so whatever comes in is something the editor can render and edit.

Everything else was cut, or kept as thin as possible.

## Stack

| Layer | Choice | Reason |
|---|---|---|
| App | **Next.js 16** (App Router), React 19, TypeScript strict | One deployable unit for UI and API; server components load data on first paint |
| API | Route Handlers under `app/api` | Plain HTTP + JSON is easy to test with curl and to reason about; no server actions |
| DB | **Postgres** via **Drizzle**: **Neon** in production, **PGlite** locally and in tests | Relational data (users, documents, shares) fits SQL. Neon's free tier doesn't pause. PGlite means reviewers need no account and tests run against real Postgres |
| Editor | **Tiptap v3** (StarterKit) | Mature ProseMirror wrapper with a JSON document model |
| UI | Tailwind v4 tokens + Radix primitives + `cva` variants | Implements the provided design system 1:1 |
| Client data | TanStack Query (server state) + Zustand (save status) | Query cache shared by sidebar and dashboard, hydrated from the server render |
| Validation | Zod schemas in `lib/validations`, shared by forms and route handlers | One source of truth for limits and messages |

## Data model

```
users(id, email unique, name, initials, tone)
documents(id, owner_id → users, title, content jsonb, imported_from, last_edited_by → users, created_at, updated_at)
document_shares(document_id → documents ON DELETE CASCADE, user_id → users, role 'viewer'|'editor', PK(document_id, user_id))
```

Ownership is a column, not a share row, so a document can never have zero or two owners. The composite primary key on `document_shares` makes duplicate shares impossible at the database level.

## Access control

| | read | edit content | rename | share | delete |
|---|---|---|---|---|---|
| owner | ✓ | ✓ | ✓ | ✓ | ✓ |
| editor | ✓ | ✓ | | | |
| viewer | ✓ | | | | |
| no access | 404 | 404 | 404 | 404 | 404 |

- **Enforcement point:** every document operation in `lib/documents.ts` loads the document together with the caller's access, then checks it with `can(access, action)`.
- **No access returns 404, not 403**, so a document's existence isn't revealed to people outside it.
- **Insufficient role returns 403** with a specific message, e.g. "You have view-only access to this document."
- **`proxy.ts` is only an optimistic gate:** it redirects signed-out users and returns 401 for the API. Authorization happens in the service layer, not the proxy.
- **Rename is owner-only.** This is a deliberate simplification so the *editor* role means "content only". It's easy to change in the table.

## Auth (deliberately mocked)

- **Sign-in:** the user picks one of three seeded accounts. The server sets an HttpOnly, SameSite=Lax cookie holding an HS256 JWT signed with `AUTH_SECRET` (using `jose`).
- **Per-request check:** each request resolves the user from the database, so a stale cookie for a re-seeded user simply signs you out.
- **What's missing:** passwords, signup and OAuth. They're out of scope, and the sign-in screen says so.

## Import pipeline (`lib/import.ts`)

`/api/import` only parses: it converts the file and returns `{ title, content }` without saving anything. The client then does one of two things:
- **New document:** calls `POST /api/documents`.
- **Into the current draft:** inserts the content into the open editor, which autosaves through the normal edit path.

Because of this split, there is only one import code path, and import adds no extra permission checks.

**Conversion by file type:**
- `.txt`: blank lines become paragraphs and single newlines become hard breaks.
- `.md`: converted with `marked` (GFM). Raw HTML in the Markdown is dropped rather than trusted.
- `.docx`: checked for the zip signature first, then converted with `mammoth`.

**Rules for every file:**
- HTML results are normalised to editor JSON with `@tiptap/html`, using the **same extension list as the editor**, so anything the editor can't render is removed.
- A 2 MB limit and the extension rules are shared between the dialog's client-side pre-check and the server. The server is the authority.
- A leading H1 becomes the document title.

## Autosave and concurrency

- **When it saves:** 800 ms after the last change. Pending edits are also flushed when the tab is hidden and when you navigate away. If you close the tab with unsaved changes, the browser asks you to confirm.
- **One request at a time:** if you type during a save, exactly one follow-up save goes out afterwards with the latest content.
- **Last write wins:** concurrent edits by two people are *not* merged. This is the biggest known limitation (see below).

## Testing

`npm test` runs 39 tests:

- **`access.test.ts`:** the full role × action matrix.
- **`documents.test.ts`:** integration tests against **real Postgres (PGlite, in-memory) with the real migrations and seed**. They cover:
  - owned vs shared listing
  - 404 for strangers, including malformed IDs
  - viewer can't edit
  - editor can edit but not rename, share or delete
  - invite validation (unknown email with suggestion text, self-share, duplicate)
  - role change and revoke
  - cascade delete
- **`import.test.ts`:**
  - `.txt` and `.md` structure, with raw HTML dropped
  - a real `.docx` fixture
  - rejections: PDF, empty file, over 2 MB, a fake `.docx`, a binary `.txt`

I also ran a manual end-to-end pass:
- **HTTP:** a curl script through every API route, as all three users.
- **UI:** a headless-Chrome script covering sign-in, autosave persisting across a reload, rename, share errors, import as new and into the draft, read-only for viewers, and ⌘K search. The screenshots in `docs/screenshots` come from that run.

## Known limitations and what I'd build next (2–4 more hours)

1. **Real-time co-editing:** Yjs + Tiptap Collaboration over a WebSocket provider (e.g. Hocuspocus or Liveblocks). This would replace last-write-wins and enable the presence avatars and cursors in the design. The cheaper first step would be an `updated_at` version check that warns "Daniel edited this since you opened it".
2. **Presence indicators:** a heartbeat table plus polling. This was planned as a stretch item and cut for time.
3. **Version history:** snapshot `content` on save into a `document_versions` table and add a restore UI.
4. **Export:** Markdown/HTML via `@tiptap/html` `generateHTML`.
5. **Real auth:** Auth.js, plus invites for people without accounts.
6. **Operational hardening:** rate limiting on import, structured logging, Playwright tests in CI.

## Deliberately cut

- comments and suggestion mode
- fonts and colours beyond the design
- images and tables in documents
- public link sharing (Copy link still requires an explicit share)
- mobile-optimised editor chrome (layouts are responsive, but the editor is desktop-first)
