# AI workflow note

> Sections marked ✏️ are for me (the candidate) to complete or adjust in my own words before submitting.

## Tools used

- **Claude Code** (Claude Opus 5.5, in VS Code) was the main pair-programmer for planning, scaffolding, implementation, tests and verification scripts.
- ✏️ *Design tool used to produce the six `folio-design` pages and the design system:* `<fill in>`
- **Headless Chrome via `puppeteer-core`**, driven by throwaway scripts, to click through the real UI and take screenshots for review.

## How I worked with it

1. **Planned before coding.** I shared the brief, my design files and two of my own repos as references for structure and conventions. AI drafted a plan, and I made the key decisions on it:
   - database: Neon + Drizzle
   - auth: mocked seeded accounts
   - project conventions taken from my reference repo
   - things I explicitly excluded (Sanity, email)
2. **Built in thin vertical slices:** schema and seed → service layer and tests → API → each screen. After each slice I ran typecheck, lint, tests or a real request before moving on.
3. **Verified behaviour, not just compilation:**
   - curl scripts through every API route as all three users
   - a headless-browser run checking autosave across a reload, rename, the share error state, import in both modes, and read-only for viewers
   - a comparison of the screenshots against the designs

## Where AI materially sped things up

- **Translating the design system into tokens and components:** colours, radii and shadows into Tailwind v4 `@theme`, and `cva` variants for Button, Badge, Avatar, Select and Tabs. The design exports were bundled HTML, and AI decoded them to read the exact values.
- **Boilerplate with a consistent shape:** route handlers, services, React Query hooks and barrel files.
- **Test scaffolding:** the full role × action matrix and PGlite integration tests running on the real migrations, written in minutes.
- **Throwaway tooling:** the curl and Puppeteer scripts that exercised the app end to end.

## What I changed or rejected from AI output

These are real cases from this build where the first version was wrong or not good enough:

- **Redirect loop in auth.** The first `proxy.ts` redirected signed-in users away from `/login` using only the cookie signature. After a database re-seed, a validly signed cookie points at a user that no longer exists, so the app would bounce between `/` and `/login` forever. The fix: the proxy only gates, and the login page does a database-backed check.
- **Local database hang and corruption.**
  - Pre-creating PGlite's data directory made initialisation hang silently, which we diagnosed by probing in-memory vs on-disk startup.
  - Killing the server mid-session corrupted the local database. We now close PGlite on SIGINT/SIGTERM, the scripts close it before exiting, and there's a `db:reset` escape hatch.
  - Both were verified by reproducing the failure first.
- **Unreadable error-message code.** The first version of the "No account uses sam@… Try maya@, daniel@ or priya@folio.test" builder was a nested regex one-liner. It was replaced with a small, tested `suggestAccounts()` function.
- **React Compiler lint failures.**
  - The autosave hook's recursive `useCallback` couldn't be memoised. It was rewritten around a ref, keeping the "one request in flight, one follow-up" guarantee.
  - The title input copied props into state inside an effect. It was made fully controlled.
- **Malformed document IDs** first surfaced as a database error, handled by a regex on the error message. That was rejected in favour of validating the UUID in the service, so the API returns a clean 404 too.
- **UX details found in screenshots, not by the compiler:**
  - dialogs auto-focused the close button, showing a stray focus ring
  - the seeded accounts appeared in the wrong order
  - every dashboard link prefetched a dynamic page, which would mean a database round trip each on Neon
- ✏️ *Anything I personally pushed back on during the session:* `<fill in>`

## How I verified correctness, UX and reliability

- **Correctness:**
  - permission rules live in one table and are tested exhaustively
  - sharing and document flows are tested against real Postgres with the production migrations, not mocks
  - Zod validates every API input, and malformed JSON returns 400, not 500
- **Reliability:**
  - `next build`, `tsc`, ESLint (including the React Compiler rules) and 39 tests all pass
  - a smoke test checks the server log for unhandled errors (there were none)
- **UX:**
  - screenshots of every key screen compared against the design files
  - a mobile-width check of the dashboard
  - error states triggered on purpose: unknown invitee, PDF upload, view-only edits
- ✏️ *My own manual pass on the deployed build:* `<fill in>`
