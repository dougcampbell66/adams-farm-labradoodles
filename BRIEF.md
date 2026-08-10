# BRIEF — Adams Farm Labradoodles website

_Plain-language orientation for Douglas. Written by EngineerQ, 2026-07-25._

## What this is

This is the **new Adams Farm Labradoodles website**, built with **Next.js**
(a modern web framework) and hosted on **Vercel**. It's the successor to the
older site that was built with Astro.

There are **two separate projects** in this workspace, each its own code repo:

- `adams-farm/` — the **old Astro site**. We keep it only as a read-only
  reference for content/copy; we don't deploy or track it.
- `adams-farm-next/` — the **new Next.js site** (this one). It deploys to
  Vercel and is where all current work happens.

## What the site contains

**Marketing pages** (hand-written content, always work, no database):
Home, Our Program, Our Story, Guardians, Ambassadors, Safety & Protocols,
Contact, and a "Puppies" overview. These use fixed content stored in the code
(`src/data/`), so they render the same everywhere.

**Live-data pages** (pull from the PuppyQ database — see below):
`/dams`, `/sires`, `/litters`, `/our-litters`, `/our-puppies`. These show your
actual dogs, litters, and puppies straight from PuppyQ, so they stay current
without editing code. Dams and Sires list a dog only once it has produced a
litter on the Adams Farm record — the line is defined by what a dog has
produced, not by who owns it.

**A private area:** `/forever-families` — gated behind a passwordless
"magic link" email login. Only email addresses you allowlist can get in.

**Contact form:** emails you via your Hostinger email account.

**Google reviews:** the testimonials section embeds an Elfsight Google Reviews
widget.

## How it connects to the PuppyQ database

- PuppyQ lives in a **Supabase** database (a hosted Postgres database). The site
  reads from it; it never writes.
- The connection code is `lib/supabase.ts` (opens the connection) and
  `lib/puppyq.ts` (fetches your dogs/litters/puppies and shapes them for the
  pages). It filters the whole PuppyQ dataset down to the "Adams Farm
  Labradoodles" organization.
- It needs two secrets to connect: a **Supabase URL** and a **service-role key**.
  These live in environment variables — never committed to the code.
- Schema quirk worth knowing: PuppyQ has **no separate "puppies" table**. A puppy
  is just a `dogs` row that has a `litter_id`. Breeding dogs are `dogs` rows that
  appear as a `dam`/`sire` on a litter.
- You can check the connection at any time by visiting **`/api/puppyq/health`**
  on any version of the site — it reports whether that environment can read the
  data (without ever exposing the secret key).

## What state it's in (2026-07-25)

- **Working:** all marketing pages, the design/palette (Pine & Brass, matching
  the Astro site), the contact form, the magic-link login, and the PuppyQ data
  layer **when it has credentials**. Locally the data pages show real dogs.
- **The one live problem (now diagnosed):** the PuppyQ data pages are **empty on
  the deployed Vercel site** because Vercel is missing the Supabase environment
  variables that exist locally. The code is fine. Fixing it is a one-time
  settings change in Vercel — exact steps are in **STATUS.md**.
- **Half-built / rough edges:** a few things still look unfinished (the old
  hardcoded "Puppies" page vs. the new live `/our-puppies`, some card colors,
  etc.). These are listed with recommendations in **STATUS.md**.

## Where to look

| File | What it is |
|---|---|
| `STATUS.md` | Current status + anything you (Douglas) must do. Check this first. |
| `DECISIONS.md` | Log of significant engineering choices and why. |
| `lib/puppyq.ts`, `lib/supabase.ts` | The PuppyQ data layer. |
| `app/api/puppyq/health/` | Health check for the database connection. |
| `scripts/puppyq-smoke.mjs` | Automated test that fails if data stops displaying. |
| `.env.example` | The full list of settings/secrets the site needs. |
| `CONTENT-MIGRATION-NOTES.md` | Content facts carried over from the Astro site. |
