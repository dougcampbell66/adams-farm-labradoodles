# Adams Farm Labradoodles — website (Next.js)

The Adams Farm Labradoodles site. Marketing pages plus live dog/litter/puppy
pages that read from the **PuppyQ** database (Supabase). Deploys to Vercel.

New here? Read **[BRIEF.md](./BRIEF.md)** first (plain-language overview), then
**[STATUS.md](./STATUS.md)** (current state + anything the owner must do). Notable
engineering choices are in **[DECISIONS.md](./DECISIONS.md)**.

## Run it locally

```bash
npm install
# create .env.local from the template and fill in the values (see below)
cp .env.example .env.local
npm run dev            # http://localhost:3000
```

## Environment variables

Copy `.env.example` to `.env.local` and fill it in. The important ones:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | PuppyQ database URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | PuppyQ read key (**secret** — server only, never commit). |
| `SMTP_EMAIL` / `SMTP_PASSWORD` | Hostinger mailbox — sends both the contact-form notification and the magic-link sign-in email. |
| `MAGIC_LINK_SECRET`, `ADAMS_FARM_ALLOWED_EMAILS` | `/forever-families` login. |

**These must also be set in Vercel** (Settings → Environment Variables, for
Production *and* Preview). If the Supabase vars are missing in an environment,
the live-data pages (`/dams`, `/sires`, `/litters`, `/our-puppies`,
`/our-litters`) render empty.

## The contact form

`app/contact/ContactForm.tsx` → `POST /api/contact` → **two destinations,
attempted independently**: pawsq's `corporate_leads` table, and the
notification email (SMTP, Hostinger). Either one succeeding has kept the
enquiry; only a total loss shows the visitor an error.

Rows are told apart by `source_brand = 'adams_farm'` and
`source_form = 'contact_form'`, both set server-side in `lib/brand.ts` and
never from a client value.

### The anon key, and only the anon key

`lib/leads.ts` reads `NEXT_PUBLIC_SUPABASE_ANON_KEY` and **deliberately does
not fall back to `SUPABASE_SERVICE_ROLE_KEY`**, unlike `lib/supabase.ts`.
The service-role key carries `BYPASSRLS` — it can read and write every row of
every brand — which is right for the read-only server components that render
`/dams` and `/litters`, and must never sit behind a form any visitor can
submit. With no anon key configured the form still emails, logs loudly, and
writes no row. That is the correct degradation.

The anon role can only INSERT, on a named column list (pawsq migrations 19,
20, 45, 46). Sending a column outside that list fails the whole insert, so
`lib/leads.ts` builds the row explicitly — client input is never spread into
the payload.

### Spam screening

`lib/spam.ts` and `app/components/HoneyPot.tsx` are ported verbatim from
`puppy-therapy` and `school-dogs`. Two verdicts, not one: **block** only for
what a person physically cannot do (the hidden decoy field), everything
merely suspicious is **flagged** — stored and emailed exactly as normal, with
the reasons attached, for a person to judge. A single weak signal never
blocks.

This matters more here than on a marketing form: pawsq migration 20 records
that `corporate_leads` already holds a bot row, and nothing is deleted from a
screen in that system.

### Names, and what happens next

The form asks for a first and a last name separately and nothing splits one
into two — see `lib/name.ts`. `name` is still sent, composed from the parts.

A submission arrives with `status = 'new'` and **does not become a contact**.
Promotion is a deliberate human act in the Hub; the anon role holds no
privilege on the triage columns at all.

## Is the PuppyQ data working?

Visit **`/api/puppyq/health`** on any environment. `"healthy": true` with a
`dogCount` above 0 means that environment can read the database. `"configured":
false` means its Supabase env vars are missing. No secrets are exposed by this
endpoint.

## Tests

```bash
npm test                       # unit tests for the PuppyQ display logic
npm run smoke -- <site-url>    # checks a running/deployed site's /api/puppyq/health
```

A scheduled GitHub Action (`.github/workflows/puppyq-smoke.yml`) runs the smoke
test against the live site every 6 hours once the `PUPPYQ_SITE_URL` repo variable
is set — it fails if the data ever goes empty again.

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest) |
| `npm run smoke` | PuppyQ live health smoke test |
