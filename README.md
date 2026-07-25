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
| `SMTP_EMAIL` / `SMTP_PASSWORD` | Contact-form email (Hostinger). |
| `MAGIC_LINK_SECRET`, `ADAMS_FARM_ALLOWED_EMAILS`, `RESEND_API_KEY` | `/forever-families` login. |

**These must also be set in Vercel** (Settings → Environment Variables, for
Production *and* Preview). If the Supabase vars are missing in an environment,
the live-data pages (`/our-dogs`, `/our-puppies`, `/our-litters`) render empty.

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
