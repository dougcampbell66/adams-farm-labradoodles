# STATUS

_Maintained by EngineerQ. Plain language. Douglas checks ~every 8h._
_Last updated: 2026-07-25._

---

## 🔴 ANYTHING DOUGLAS MUST DO (blocks the fix — ~5 minutes)

**The PuppyQ data pages (`/our-dogs`, `/our-litters`, `/our-puppies`) are empty
on the live site because Vercel is missing the database credentials.** The code
is correct — locally, with credentials, the pages show your real dogs. I can't
add secrets to your Vercel account for you, so please do this:

1. Open **https://vercel.com** → your **adams-farm** project → **Settings** →
   **Environment Variables**.
2. Add these variables (tick **Production** _and_ **Preview** for each):

   | Name | Where to get the value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Copy from `adams-farm-next/.env.local`, or Supabase → your project → Settings → API → "Project URL". |
   | `SUPABASE_SERVICE_ROLE_KEY` | Copy from `adams-farm-next/.env.local`, or Supabase → Settings → API → "service_role" secret. **This is a secret — paste it only into Vercel, never into the code or a chat.** |

   (Optional but nice: `NEXT_PUBLIC_SUPABASE_ANON_KEY` as a fallback. Not required.)
3. Click **Save**, then go to **Deployments** → the latest one → **⋯** →
   **Redeploy** (env-var changes only take effect on a new deploy).
4. Verify it worked: open **`https://<your-site>/api/puppyq/health`**. You want
   to see `"healthy": true` and a `dogCount` above 0. If it says
   `"configured": false`, a variable name is off or wasn't saved to Production.

Tell me once that's done (or just let the 8h check catch it) and I'll confirm
the live pages are populated and close this out.

**Also, when convenient (not blocking):** in GitHub → this repo → Settings →
Secrets and variables → Actions → **Variables**, add a variable
`PUPPYQ_SITE_URL` = your live site URL (e.g. `https://<your-site>.vercel.app`).
That switches on the automatic 6-hourly test that warns us if the data ever
goes empty again. Until it's set, that test just skips.

---

## ✅ Done

- **Diagnosed the "data not displaying" problem.** Root cause: the Vercel
  deployment is missing the Supabase env vars that exist in local `.env.local`.
  Proof: local build renders real dogs; the live `/our-dogs` returns a "coming
  soon" empty state with zero dog data. Full connection test passed locally
  (36 Adams Farm dogs, 5 litters, secret key valid).
- **Added a health check** at `/api/puppyq/health` — reports whether any
  environment can read PuppyQ data, without ever exposing the secret key.
- **Added an automated test** (`npm run smoke`, plus a scheduled GitHub Action)
  that fails loudly if the live data goes empty again.
- **Documented the Supabase settings** in `.env.example` (they were undocumented,
  which is likely why they were missed on Vercel).
- **Wrote `BRIEF.md`** (what the site is) and started `DECISIONS.md`.
- Confirmed secrets are safe: `.gitignore` excludes all `.env*`; nothing secret
  is committed.

## 🔧 In progress

- Waiting on the Vercel env-var change above to confirm the live fix end-to-end.

## ⏭ Next — what else looks unfinished (my recommendation)

1. **Orphaned live pages (recommend doing first).** The new live pages
   `/our-puppies` and `/our-litters` aren't linked anywhere in the site
   navigation, and the nav "Puppies" link still points at the **old hardcoded**
   `/puppies` page. So visitors can't reach the live data pages, and there are
   two competing "puppies" pages. → _I'm proceeding with this now: wiring the
   nav to the live pages. Consolidating/redirecting the old `/puppies` needs a
   product call — I'll propose options rather than delete content._
2. **Card colors.** Cards + several section backgrounds still use pure white
   (`bg-white`) instead of the warm `#EDE3D0` from the Astro palette, so they
   look a little stark. Low risk, ~30 min.
3. **Logic regression tests.** The smoke test covers the connection; adding a
   couple of unit tests for the dog/litter/puppy sorting logic would catch
   display bugs. Nice-to-have.
4. **README** is still the default Next.js boilerplate — replace with a short
   real one (points to BRIEF.md).
