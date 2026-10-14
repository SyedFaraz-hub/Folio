# Submission: Folio

**Live product:** https://folio-collaborative-document-editor.vercel.app
**Walkthrough video:** see `VIDEO_URL.txt`

**Test accounts.** No password is needed; pick one on the sign-in screen and use **Switch** to change user:

| Account | Email |
|---|---|
| Maya Okafor | `maya@folio.test` |
| Daniel Reyes | `daniel@folio.test` |
| Priya Nair | `priya@folio.test` |

## What's included

| Item | Location |
|---|---|
| Source code | `src/`, `drizzle/` (SQL migrations), `scripts/` (migrate/seed) |
| README with local setup and run instructions | `README.md` |
| Architecture note | `docs/ARCHITECTURE.md` |
| AI workflow note | `docs/AI_WORKFLOW.md` |
| Automated tests (39) | `src/lib/*.test.ts`, fixtures in `src/test/` |
| Screenshots | `docs/screenshots/` |
| Sample files for testing import | `docs/sample-imports/` (.docx, .md, .txt + a PDF that shows the unsupported-file message) |
| Walkthrough video link | `VIDEO_URL.txt` |
| This file | `SUBMISSION.md` |

## Status

**Working end to end:**
- **Documents:** create, rename, edit, autosave, reopen and delete.
- **Formatting:** bold, italic, underline, H1–H3, bulleted and numbered lists, undo/redo. All of it persists as structured JSON.
- **Import:** `.txt`, `.md` and `.docx` up to 2 MB, either as a new document or into the current draft, with clear errors for unsupported files.
- **Sharing:**
  - Each document has one owner, who invites people by email as *Can edit* or *Can view*.
  - The owner can change roles or remove access.
  - The dashboard separates owned documents from shared ones.
  - Viewers get a read-only editor.
  - The server enforces every rule: 404 for people without access, 403 for actions their role doesn't allow.
- **Persistence:** Postgres. Neon in production; embedded PGlite locally so no account is needed.
- **Search:** ⌘K quick-open.

**Incomplete or intentionally cut:**
- real-time co-editing and the presence avatars/cursors shown in the design (saving is last-write-wins)
- comments, version history and export
- real authentication (sign-in is mocked with seeded accounts)

**Next 2–4 hours:**
1. Yjs-based real-time collaboration and presence.
2. A conflict warning based on the document version.
3. Version history with restore.
4. Markdown export.
5. Playwright end-to-end tests in CI.
