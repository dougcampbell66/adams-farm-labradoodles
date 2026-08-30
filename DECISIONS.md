# DECISIONS

_Significant engineering choices and the reasoning behind them. Newest first._
_Maintained by EngineerQ._

## 2026-08-30 — Outbound email leaves this site for the pawsq platform

- **This site no longer sends email at all.** Douglas's platform ruling
  (pawsq `docs/EMAIL.md`, same day, superseding the morning's
  Resend-to-Hostinger move below): outbound email is a pawsq capability,
  one sender identity per brand under pawsq.com. The contact-form
  pipeline — spam screening, the lead write, the notification email —
  runs on pawsq-app's `/api/platform/intake`, and the magic-link send on
  `/api/platform/magic-link`, both called server-to-server with
  `PAWSQ_PLATFORM_URL` / `PAWSQ_PLATFORM_KEY`. Mail arrives from
  `adamsfarmlabradoodles@pawsq.com`.
- **`lib/mailer.ts` and `lib/spam.ts` deleted.** The screening's one copy
  now lives in pawsq-app (`lib/mail/spam.ts`), ending the
  four-repo-verbatim-copy arrangement its own header apologized for. The
  decoy field names stay here (`lib/decoy.ts`) — they are the contract
  between this site's form markup and its route.
- **The fallback keeps the old resilience.** If the platform is
  unreachable, `lib/leads.ts` still writes the lead directly (anon key,
  now to `leads` — pawsq migration 53 renamed the table). Unscreened but
  stored beats lost; only a total loss shows the visitor an error.
- **Vercel cleanup owed once verified live:** remove `SMTP_EMAIL` /
  `SMTP_PASSWORD` from this project; add `PAWSQ_PLATFORM_URL` /
  `PAWSQ_PLATFORM_KEY`. The morning entry's "not yet verified live"
  caveat transfers to the platform path.

## 2026-08-30 — Magic-link email moves from Resend to the existing Hostinger mailbox

- **Dropped Resend.** The `/forever-families` sign-in link was sent through
  Resend's HTTP API (`lib/send-email.ts`), a second paid email service that
  existed only for this one message — the contact form already sends through
  a Hostinger mailbox Douglas already pays for and owns. No decision record
  justified Resend originally; it was simply what got built first. Douglas
  confirmed the $20/mo Resend subscription is not otherwise needed and is
  cancelable once this is verified live.
- **`lib/mailer.ts` added** — the one shared Hostinger SMTP transport, used
  by both the contact form notification and the magic-link email. Removes a
  second env-var set (`RESEND_API_KEY`, `AUTH_EMAIL_FROM`) and the domain-
  verification requirement Resend's free tier imposed (unverified, it could
  only deliver to the Resend account's own address).
- **`sendMagicLink()`'s interface is unchanged** — still returns `{ ok,
  cause, error }` — so `app/api/auth/request/route.ts` needed only its dev-
  mode fallback condition updated, not its call site. `FailureCause` lost
  the Resend-specific `"test-sender-recipient-blocked"` value; only
  `"unconfigured" | "auth" | "other"` remain.
- **Not yet verified live** — this session confirmed the anon-key write path
  for `corporate_leads` with a real test submission, but the SMTP switch
  itself hasn't been tested end-to-end against a live `/forever-families`
  sign-in attempt. Do that before relying on it.

## 2026-08-10 — Breeding lines replace the ownership-based dogs page

- **`/dams`, `/sires`, `/litters` added; `/our-dogs` deleted.** Douglas's call:
  a page built on which dogs the farm *owns* misleads, because ownership is not
  what defines the bloodline. The new pages use Legend Manor's membership rule
  instead — a dog appears only after producing a litter on the Adams Farm
  record — so the line is defined by what a dog has produced. Parents owned by
  another kennel (Legend Manor's Prancer and Silas, Tarheel's Chewy) are shown
  and flagged "Partner program" rather than hidden or silently claimed.
- **Deleted rather than suffixed.** The `/puppies` → `/puppies2` precedent keeps
  a superseded page live. That was right for a page whose content was still
  true; it is wrong here, where the objection is that the framing itself
  misleads. Leaving it reachable would leave the misleading page indexed.
  `pqDogTiers` and `pqGallery` went with it — dead once the page was gone, and
  both encode the retired ownership framing. `/our-dogs` then got a **permanent
  (308) redirect to `/dams`** in `next.config.ts`, at Douglas's request: old
  links off Facebook and ALAA listings should land somewhere useful, and 308
  tells search engines to consolidate onto `/dams` since the page is not coming
  back. Query strings pass through.
- **Two derivations corrected against the record, not copied from Legend
  Manor.** LM tiers on `status === 'active'`, which is safe against its own
  slice but wrong against ours: it emptied the active tier, filed the sire of
  four of five litters under "retired", and promoted a once-hired outside stud
  in his place. Likewise `pqPuppyStanding` read `retained`/`reserved` as
  unknown, so a litter looked finished as soon as its first puppies were placed.
  The live `status` vocabulary is `active`, `placed`, `retired`, `reserved`,
  `retained`, `transferred` — not the two the file's header comment claimed.
  Both fixes are pinned by unit tests.

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
