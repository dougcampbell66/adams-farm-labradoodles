@AGENTS.md

# adams-farm-labradoodles — working agreement for Claude

The public marketing site for **Adams Farm Labradoodles**, a breeding
operation. Next.js App Router, TypeScript, Tailwind, deployed on Vercel
at `adamsfarmlabradoodles.com`.

**New to this galaxy?** `docs/GALAXY.md` in the `dougcampbell66/pawsq`
repo is the map — the brands, the repositories, the one shared database
and how they fit. Attach that repo when a task touches the database.
The short version is below.

---

## This repo is one of six, and it owns the least

| Repo | What it is |
|---|---|
| `pawsq` | **The engine.** The database schema lives there and **only** there |
| `pawsq-app` | **The platform.** Serves `/app` on this domain; also sends all our email |
| `pawsq-hub` | The owner console (service key). Lead triage and promotion happen there |
| **this repo** | Adams Farm's public pages, its own `/forever-families` gate, and the contact form |
| `legend-manor-labradoodles` | The sibling breeding brand |
| `puppy-therapy`, `school-dogs` | The events brands |

**If a column or table is missing, the fix is a migration in `pawsq`** —
never a workaround here. This repo defines no schema and holds no
migrations.

---

## The signed-in breeder tools are NOT this repo

`/app`, `/login`, `/auth` and `/puppyq-static` on this domain are
**proxied to `pawsq-app`** by the rewrites in `next.config.ts`. None of
those paths exist here; nothing is shadowed.

Those tools — dashboard, contacts, litters, dogs, puppies, the nav, the
mobile menu — are **universal across every brand site**. One deployment,
no brand-specific UI code. Only color tokens and fonts are swapped per
domain, and that swap lives in `pawsq-app`'s `lib/brand.ts` and
`app/globals.css`.

**So a restyle or fix of the breeder tools is `pawsq-app` work,** and it
can be tested against any live brand door without touching this repo.

The proxy constant here is still named `PUPPYQ_APP` and its comment
still points at a `dougcampbell66/puppyq-app` repo. That repo is now
`pawsq-app`. History, not a bug — but do not go looking for the old name.

---

## Two sign-ins on this domain, deliberately separate

They are different doors for different people. Do not merge, rename, or
"unify" them without reading why they are apart.

| | Who | Where | How |
|---|---|---|---|
| **`/forever-families`** | Adams Farm's own adopting families | this repo | HMAC-signed magic link, **no database**, `lib/auth.ts` |
| **`/login` → `/app`** | breeders, signing into the platform | `pawsq-app` | Supabase magic link |

This site's gate lives under `/api/auth/*`, which **no rewrite touches**.
`/auth/*` belongs to the platform's magic-link callback.

`lib/auth.ts` is Web Crypto only — no Node built-ins — because the edge
middleware and the Node route handlers must agree on what a valid
session is, and the only way to guarantee that is for both to call the
same module. Keep it that way.

Access is an env allowlist (`ADAMS_FARM_ALLOWED_EMAILS`), not a database
table. `middleware.ts` documents its own division of labour: the bare
`/forever-families` path renders the sign-in form in place of content
and **must not redirect**; deeper paths are turned away in middleware.

---

## Two kinds of page, two data sources

**Marketing pages** — Home, Our Program, Our Story, Guardians,
Ambassadors, Safety & Protocols, Contact. Content is fixed in
`src/data/`. These always render.

**Live-data pages** — `/dams`, `/sires`, `/litters`, `/our-litters`,
`/our-puppies`. These read the shared database through `lib/puppyq.ts`,
server-side, with the **service-role key** (`lib/supabase.ts`). Without
the env set they render an honest empty state, not an error.

`lib/puppyq.ts` fetches the whole record once per render (deduped by
React `cache`) and derives the Adams Farm slice by `organization_id`.
Its header records the schema facts that bite:

- **There is no `puppies` table.** A puppy is a `dogs` row with a
  `litter_id`.
- **`status` is free-form.** Observed live: `active`, `placed`,
  `retired`, `reserved`, `retained`, `transferred`. Never assume the set
  is closed — branch on what you care about and let the rest fall
  through.
- **`sex` is null on most rows** and is inferred from litter parentage.

Dams and Sires list a dog only once it has **produced a litter on the
Adams Farm record** — the line is defined by what a dog produced, not by
who owns it.

`scripts/puppyq-smoke.mjs` and `/api/puppyq/health` check the connection
in any environment.

---

## The service key reads. It never writes a lead.

This repo holds `SUPABASE_SERVICE_ROLE_KEY` for the read path above, and
that makes one rule load-bearing:

> **`lib/leads.ts` never consults the service-role key, even as a
> fallback.** That key bypasses RLS and must never sit behind a form
> anyone on the internet can submit.

The lead path uses the anon key only, whose grant is INSERT-only on
named columns. Nobody holding it can read back a list of names and
emails.

---

## The contact form goes through the platform

Since 2026-08-30 this site does not screen, store, or email a submission
itself. `app/api/contact/route.ts` keeps what is genuinely its own —
parsing, validation, composing the name — and hands the rest to
`pawsq-app`:

```
/api/contact  →  lib/platform.ts  →  pawsq-app /api/platform/intake
                                      screen → store in `leads` → notify
```

The notification now sends from `adamsfarmlabradoodles@pawsq.com`. **This
site sends no email at all** — `lib/send-email.ts` is a platform client,
not a mailer.

The resilience contract, which survived the move and should survive the
next one:

- a `block` verdict means the platform kept nothing, and the bot is
  answered exactly as a person would be;
- `stored || emailed` → the visitor sees success;
- platform unreachable → **the fallback**: `lib/leads.ts` writes the lead
  directly with the anon key, unscreened but stored and logged loudly. A
  rare unscreened row beats a lost enquiry;
- only a total loss shows an error, because asking someone to send their
  message twice over our outage would be our failure displayed as theirs.

**Compose names, never split them.** `lib/name.ts` explains why. The
route deliberately does not require a last name even though the form
marks it required — mononyms exist, and refusing a real enquiry over a
missing surname is worse.

`lib/decoy.ts` is the honeypot and timing field; the actual screening
lives in `pawsq-app`. All four brand sites once carried their own
verbatim copy of that screener. They no longer do, and should not again.

---

## Nothing here promotes a lead

A submission arrives with status `new` and becomes a contact only when a
human says so, in the Hub's triage inbox. That is deliberate: the intake
table has held a bot row since before it was under version control.

---

## Conventions

- `app/components/` holds the site's components. `src/data/` holds fixed
  content and `src/styles/` the style entry points — note the split:
  routes in `app/`, data in `src/`.
- `lib/images-pq.ts` maps database dogs to photos; `lib/rate-limit.ts`
  guards the auth routes.
- Tests are Vitest (`tests/`, `vitest.config.ts`).
- `BRAND_KEY = "adams_farm"` in `lib/brand.ts` is **the contract** — it
  is what rows are stored under and must not change. `BRAND_LABEL` is
  copy and may. `SOURCE.contact = "contact_form"` names the form.

---

## Documents here, and their state

`BRIEF.md` (plain-language overview), `STATUS.md`, `DECISIONS.md`,
`CONTENT-MIGRATION-NOTES.md`, `adams-farm-site-inventory.md`.

**`BRIEF.md` predates two changes and is stale in two known places:** it
describes a sibling `adams-farm/` Astro repo and an `adams-farm-next/`
layout that no longer match this repository's name, and it says the
contact form "emails you via your Hostinger email account" — which was
true until the platform took over sending on 2026-08-30. Read it for
orientation, not for wiring.

---

## Before you build on any of this

Verify against the live database, not against a document — including
this one. Any schema note written down is a snapshot that goes stale.
`pawsq/docs/BUILT.md` is the one document that claims its contents exist
right now.

---

## Q Family Standing Orders

This repo inherits `Q-OPERATIONS.md` and `Q-PLAYBOOK.md` from
`dougcampbell66/q-hq` — the Q-wide operating rules and marketing/launch
playbook that govern every Q product.
