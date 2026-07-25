# DECISIONS

_Significant engineering choices and the reasoning behind them. Newest first._
_Maintained by EngineerQ._

## 2026-07-25 — PuppyQ "data not displaying" diagnosis & guardrails

- **Diagnosis method.** Rather than guess, I ran a throwaway connection test
  against Supabase using the local `.env.local` and confirmed the data layer
  works (36 dogs / 5 litters, no errors), then rendered the pages locally (data
  present) and fetched the live deployment (empty state, no data). That isolates
  the cause to the deployed environment, not the code. The throwaway script was
  deleted immediately and never committed; it printed no secret values.
- **Root cause.** Supabase env vars present locally, absent on Vercel → data
  layer returns empty → pages render "coming soon". Documented the vars in
  `.env.example` since the gap was that they were undocumented.
- **Health endpoint (`/api/puppyq/health`) is public but non-sensitive.** It
  returns only status/counts/key-*kind*/public host — never the key. Chosen over
  a token-gated endpoint to keep the smoke test and Douglas's verification
  dead-simple (one fewer secret to manage). Marked `noindex`. Can be locked down
  later if desired. This does not conflict with "keep everything private": no
  secrets, PII, or unpublished content are exposed.
- **Test = external smoke test, not a unit test.** The failure mode was
  environmental (missing creds in a deployment), which no local unit test can
  see. A smoke test that hits the deployed `/api/puppyq/health` and asserts
  `dogCount > 0` catches exactly this. It's dependency-free (`node` + `fetch`)
  and wired to a scheduled GitHub Action. Unit tests for display logic are noted
  as a smaller follow-up.
- **The fix itself is left to Douglas.** Adding secrets to Vercel requires his
  account and handling the service-role key; per the security rules I don't
  enter credentials into third-party settings on his behalf. Exact steps are in
  `STATUS.md`.

## 2026-07-25 — Replace-don't-retire convention; ignore Netlify

- **Old pages that a new page replaces get a `2` suffix, not deletion** (Douglas's
  call). First application: the old hardcoded `/puppies` → `/puppies2`, kept and
  still reachable, with its internal links repointed. The live `/our-puppies`
  remains the primary page in the nav. The bare `/puppies` URL now 404s; a
  redirect to `/puppies2` is available on request but wasn't added (keeping the
  rename literal).
- **Ignore Netlify.** Per Douglas, we no longer treat the old Netlify deployment
  as a reference point. The Astro project stays only as a read-only content
  source. Docs de-emphasized accordingly.

## 2026-07-25 — Data issue resolved live; nav already wired

- After the health endpoint + guards shipped, the live `/api/puppyq/health` went
  **green** (configured, 36 dogs) and all three PuppyQ pages render data on the
  latest deployment. Conclusion: the Supabase env vars are now present in Vercel;
  the redeploy rebuilt the ISR pages with data. The earlier empty deployment was
  built before the creds existed. Root cause and fix both confirmed.
- The site nav already links `/our-dogs`, `/our-puppies`, `/our-litters` (done in
  the PuppyQ commit), so the "orphaned live pages" concern was already handled —
  the nav-wiring follow-up is unnecessary. Remaining loose end: an older static
  `/puppies` page still linked from one CTA; retiring it is a content call for
  Douglas, not something to do unilaterally.

## 2026-07-25 — Added Vitest logic tests; deferred nav wiring

- **Added Vitest** (dev dependency) + `npm test` with unit tests for the pure
  PuppyQ display logic (tier split, sex/role inference, name fallbacks, puppy
  standing). These run with no network/DB and complement the live smoke test.
  Chosen over Node's built-in runner because the data layer uses `@/` path
  aliases that Vitest resolves cleanly via one config line.
- **Deferred wiring the nav to the live PuppyQ pages.** It was the top "unfinished"
  item, but it's gated on the credentials fix: pointing the nav at `/our-puppies`
  / `/our-litters` while Vercel still lacks Supabase creds would send visitors to
  empty pages — a regression. Will do it the moment `/api/puppyq/health` is green.
  Picked the logic tests (unblocked, zero production risk) to proceed with instead.

## Adopted working rules (EngineerQ)

- `STATUS.md` kept current in plain language (Done / In progress / Next / Douglas
  actions). `DECISIONS.md` logs significant choices.
- **Never commit secrets.** `.gitignore` already excludes `.env*`; verified.
- Keep everything private; no public exposure without Douglas's explicit
  instruction.
- Proceed autonomously on anything not blocked; only wait on true blockers
  (e.g. account/secret actions only Douglas can take).
