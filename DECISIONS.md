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

## Adopted working rules (EngineerQ)

- `STATUS.md` kept current in plain language (Done / In progress / Next / Douglas
  actions). `DECISIONS.md` logs significant choices.
- **Never commit secrets.** `.gitignore` already excludes `.env*`; verified.
- Keep everything private; no public exposure without Douglas's explicit
  instruction.
- Proceed autonomously on anything not blocked; only wait on true blockers
  (e.g. account/secret actions only Douglas can take).
