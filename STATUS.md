# STATUS

_Maintained by EngineerQ. Plain language. Douglas checks ~every 8h._
_Last updated: 2026-08-30._

---

## 🟢 Headline: pawsq is now wired in on both the read side and the write side

Live data still renders straight from pawsq's database — `/dams`, `/sires`,
and `/litters` (`/our-dogs` was retired in their favor and now redirects to
`/dams`). The home page's litter/puppy counts read that same record, so they
can't drift out of sync with those pages the way they once did.

**New since the last update:** the contact form now writes real leads into
pawsq (`source_brand = 'adams_farm'`) instead of only reaching an inbox, and
it asks for first and last name separately rather than splitting one string
apart. `/app`, `/login`, and `/auth` are proxied to the pawsq-app tenant app,
and the footer carries a Sign In link — the site's one door into the app.

**Vercel's `NEXT_PUBLIC_SUPABASE_ANON_KEY`** — required for the contact form
to actually save a lead, as opposed to just emailing and logging — was
missing as of pawsq's Aug 27 handoff. Douglas confirmed on 2026-08-30 that
it's now set on both Adams Farm and Legend Manor in Vercel. This has not
been independently re-verified from a session — there's no live Vercel
access from here — so if a lead ever stops appearing in pawsq, check this
setting first.

## 🔵 Anything Douglas must do

- **Nothing blocking in this repo.**
- Two related decisions are open in **pawsq**, not here, if you want to
  unblock them:
  - Whether a `flag`-verdict submission (from spam-check) should auto-promote
    to a full contact record, or hold for a human. Design is settled,
    nothing is built yet.
  - `attribute-jill-gravo.mjs` — pushed, not merged, not run. Resolves the
    one unattributed contact pawsq's state report flags.
- Optional (2 min), to switch on automatic monitoring: in GitHub → this repo
  → Settings → Secrets and variables → Actions → **Variables**, add
  `PUPPYQ_SITE_URL` = your live site URL. That enables a check every 6 hours
  that emails you if the data ever goes empty again. Until it's set, that
  check just skips (nothing breaks).

## ✅ Done since the last update (Aug 10 – Aug 27)

- Added Dams, Sires, and Litters pages; retired Our Dogs in their favor, with
  a permanent redirect from `/our-dogs` to `/dams`.
- Home page litter/puppy counts now read from the same pawsq record as those
  pages.
- Proxied `/app`, `/login`, and `/auth` to the pawsq-app tenant app; added a
  footer Sign In link.
- Contact form now asks for first and last name as separate fields, and
  writes submissions into pawsq using the anon key only — the service-role
  key is never used here, since that key bypasses every access rule and must
  never sit behind a public form.

## ⏭ Next — what still looks unfinished (my recommendation)

1. **Home page "Available Puppies" preview** still reads from the static
   file `src/data/litters.ts`, not live pawsq — only the counts strip above
   it was switched over. Worth aligning once there's a live litter to show
   there; right now the cards can show stale or placeholder puppies even
   though the count next to them is real.
2. **Card colors.** Several sections — the Available Puppies cards, the
   Litters page cards — still use plain white rather than the warm
   `#EDE3D0` panel tone used elsewhere. Low risk, unblocked, no decision
   needed from you.

_Note: the old `/puppies` URL still 404s (content lives at `/puppies2`) — say
the word if you want it to redirect instead._
