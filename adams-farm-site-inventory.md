# Adams Farm Labradoodles — Public Site Inventory

Documentation pass only. Nothing below is a rewrite or a recommendation; it records what
is in the codebase as it stands.

- **Source:** `dougcampbell66/adams-farm-labradoodles-next`, branch `claude/adams-farm-site-updates-dt2df1`, commit `2731f2c`
- **Framework:** Next.js 16.2.10, App Router, Tailwind v4
- **Compiled:** 2026-08-10
- **Method:** every route file under `app/` read directly, then the site was built (`next build`) and
  served locally against the live PuppyQ/Supabase record so the database-driven pages could be
  captured as actually rendered, not just as template strings.

## How routes were enumerated

Nav links were **not** used as the source of truth. The list came from three places, cross-checked:

1. Every `page.tsx` under `app/` (filesystem routing).
2. The `redirects()` block in `next.config.ts`.
3. The route table emitted by `next build`.

That surfaced three pages reachable by URL but absent from the nav — `/our-litters`, `/puppies2`,
and `/contact` — plus one gated route, `/forever-families`.

## Complete public route list

| # | Route | File | Type | In nav? | Live data? |
|---|-------|------|------|---------|------------|
| 1 | `/` | `app/page.tsx` | Static | Yes (logo + Home) | Partial — puppy cards from `src/data/litters.ts` |
| 2 | `/dams` | `app/dams/page.tsx` | ISR 5 min | Yes | Yes — PuppyQ |
| 3 | `/sires` | `app/sires/page.tsx` | ISR 5 min | Yes | Yes — PuppyQ |
| 4 | `/our-puppies` | `app/our-puppies/page.tsx` | ISR 5 min | Yes | Yes — PuppyQ |
| 5 | `/litters` | `app/litters/page.tsx` | ISR 5 min | Yes | Yes — PuppyQ |
| 6 | `/our-program` | `app/our-program/page.tsx` | Static | Yes (About) | No |
| 7 | `/our-story` | `app/our-story/page.tsx` | Static | Yes (About) | No |
| 8 | `/guardians` | `app/guardians/page.tsx` | Static | Yes (About) | No |
| 9 | `/ambassadors` | `app/ambassadors/page.tsx` | Static | Yes (About) | No |
| 10 | `/safety-and-protocols` | `app/safety-and-protocols/page.tsx` | Static | Yes (About) | No |
| 11 | `/contact` | `app/contact/page.tsx` | Static | **No** — footer + CTAs only | No |
| 12 | `/puppies2` | `app/puppies2/page.tsx` | Static | **No** — footer "Puppies" only | No — `src/data/litters.ts` |
| 13 | `/our-litters` | `app/our-litters/page.tsx` | ISR 5 min | **No** — unlinked entirely | Yes — PuppyQ |
| 14 | `/forever-families` | `app/forever-families/page.tsx` | Dynamic | No | Gated — sign-in required |

**Redirect:** `/our-dogs` → `/dams`, permanent 308 (`next.config.ts`). Verified returning 308.

**Not marketing pages** (documented for completeness, not inventoried below): `/api/contact`,
`/api/puppyq/health`, `/api/auth/request`, `/api/auth/verify`, `/api/auth/logout`, and the
generated `/icon.png` + `/apple-icon.png`.

**`/forever-families`** is publicly reachable but is an internal staff tool, not marketing. It is
`noindex, nofollow`, `no-store`, and shows a sign-in form to anyone not authenticated. Its
signed-out state is documented under Shared Components; its signed-in content is a heading plus
"Family roster coming soon."

---

# Flags / Pre-Launch Issues

Ordered by how visible the problem is to a visitor. Every item was verified against the rendered
page, not inferred from source.

## A. Content contradictions a visitor can see

**A1 — Home page stat counts disagree with the live registry.**
`app/page.tsx` hardcodes `6 Litters`, `56 Puppies Raised`, `15 Five-Star Reviews`. `/litters`,
`/our-litters`, `/dams`, and `/sires` all read the live record and render **5 litters** and
**36 puppies**. A visitor moving from the home page to the litter registry sees 6 → 5 and 56 → 36.
The "15 Five-Star Reviews" figure has no source in the codebase at all.

**A2 — The litter the home page is actively selling is missing from every live page.**
The home page and `/puppies2` feature the "Lilo & Stitch May Litter" (born 2026-05-18, sire
Tarheel's Knox, dam Legend Manor's Holly), which lives in the static file `src/data/litters.ts`.
It does **not** exist on the PuppyQ record, so `/litters`, `/our-litters`, and `/our-puppies` all
stop at February 24, 2026 and never mention it. `/our-puppies` — which is in the main nav — labels
the February litter "Most Recent Litter / Current Program".

**A3 — Two nav-reachable pages disagree about which litter is current.**
Main nav "Our Puppies" (`/our-puppies`) → current litter is Prancer × Silas, Feb 24 2026, all
6 puppies placed. Footer "Puppies" (`/puppies2`) → current litter is the Spring 2026 Lilo & Stitch
litter with 1 puppy still available.

**A4 — The foundation dam is called two different names.**
Marketing copy calls her **Winnie** (home page image alt "Douglas and Erika Campbell with Winnie";
Our Story: "their dog Prancer — Winnie"; `/puppies2` past litters: "Silas × Winnie"). The live
record renders her as **Prancer** on `/dams`, `/litters`, `/our-litters`, and `/our-puppies`.
A visitor sees "Silas × Winnie" and "Prancer × Silas" for the same litters on the same site.

**A5 — Pairing order is inverted between the two litter pages.**
`/litters` renders `dam × sire` ("Prancer × Silas"). `/our-litters` renders `sire × dam`
("Silas × Prancer"). `/our-puppies` renders `dam × sire`. `/puppies2` renders `sire × dam`.

**A6 — Static past-litter lists are missing puppies the live record has.**
`src/data/litters.ts` `pastLitters` vs. the live record:

| Litter | Static (`/puppies2`) | Live (`/litters`) |
|---|---|---|
| Aug 3, 2025 | 7 named | 8 — adds **Cinderella** |
| Jan 8, 2025 | 6 named | 8 — adds **Paisley Rose**, **Leia** |

**A7 — "In the program" lands on an older litter than one marked "Past litter".**
On `/litters`, Feb 24 2026 and Aug 3 2025 read "In the program", while Feb 4 2026 — newer than one
of them — reads "Past litter". This follows the `pqPuppyStanding` rule (a litter counts as current
while it still has `retained`/`reserved` puppies), but on the page it reads as a sorting error.

**A8 — `/our-litters` overstates how many puppies are placed.**
Its hero reads "36 puppies placed across 5 litters", but 36 is the total on the record; the cards
below it sum to **30 placed** (5 + 5 + 6 + 7 + 7). `/litters` phrases the same number correctly as
"all 36 puppies registered from them".

**A9 — The foundation dam is labelled "Partner program".**
`/dams` flags Prancer with the "Partner program" badge because the record carries her as Legend
Manor's Prancer. Our Story describes her as the dog the Campbells adopted and built the program
around.

## B. Missing images

**B1 — `/dams` renders no photographs at all.** Both dams fall back to the "Photo / coming soon"
placeholder: Adams Farm Macy and Prancer. `/sires` shows one photo (Silas); Chewy falls back.
So three of the five parent cards across the two breeding-line pages are placeholders.

**B2 — Photos exist on disk that these pages don't reach.** `public/images/dogs/` contains
`winnie-main.jpg`, `winnie-2.jpg`, `winnie-3.jpg`, `silas-main.jpg`, `silas-2.jpg`, `silas-3.jpg`,
`silas-4.jpg`. The breeding-line cards read photos from the PuppyQ record via `pqPhoto()`, not from
this directory, so the Winnie files are unused.

**B3 — One dead image reference.** `src/data/dogs.ts:82` points at `/images/dogs/macy.jpg`, which
does not exist. Not user-visible — see D1, the file is unused. Every other image reference in
`app/` and `src/` resolves to a real file (23 checked, 22 OK).

## C. Third-party and configuration dependencies

**C1 — Testimonials render nothing server-side.** The home page "Loved by Families" section is an
Elfsight widget (`elfsightcdn.com/platform.js`, app id `460e5003-87bc-4cbe-a8d7-8d93a30a0ad2`)
loaded `lazyOnload`. Server-rendered HTML contains the heading and an empty div. If the script is
blocked or the app id is wrong, the section is a heading over blank space. This is also the only
place the "15 Five-Star Reviews" claim would be substantiated.

**C2 — Preview deployments render the live pages empty.** `NEXT_PUBLIC_SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY` are set for Vercel Production but not Preview, so `/dams`, `/sires`,
`/litters`, `/our-litters`, and `/our-puppies` show their "records are loading" empty states on any
PR preview. Production is healthy (`/api/puppyq/health` → `configured: true`, `keyKind: "secret"`,
36 dogs, 5 litters).

**C3 — The contact form needs SMTP credentials.** `/api/contact` sends via `smtp.hostinger.com`
using `SMTP_EMAIL` and `SMTP_PASSWORD`. Unset, the form shows "Something went wrong — please try
again or call us directly at 336-338-8660." The form is the only path to the waitlist besides the
phone number.

**C4 — `/forever-families` needs its own env set.** `MAGIC_LINK_SECRET`,
`ADAMS_FARM_ALLOWED_EMAILS`, and `AUTH_EMAIL_FROM` (plus `RESEND_API_KEY`). Unconfigured, the gate
shows "Sign-in isn't configured yet, so this page is closed to everyone." plus a diagnostic string.

## D. Dead code and unreferenced files

**D1 — Three data modules are imported by nothing:** `src/data/dogs.ts`, `src/data/stats.ts`,
`src/data/testimonials.ts`. Confirmed zero references across `app/`, `lib/`, `src/`.

**D2 — One orphaned component:** `app/components/DogPhoto.tsx` has no importers. It was the photo
component for the retired `/our-dogs` page.

## E. SEO and crawl

**E1 — No `robots.txt`.** `/robots.txt` returns 404. No `app/robots.ts` exists.
**E2 — No `sitemap.xml`.** `/sitemap.xml` returns 404. No `app/sitemap.ts` exists. Relevant given
three pages are unlinked from the nav and would otherwise be undiscoverable.
**E3 — No custom 404 page.** No `app/not-found.tsx`; `/nonexistent-page` serves the unstyled Next.js
default, which carries neither the site nav nor the footer.
**E4 — The home page sets no page-level metadata.** It inherits the root default title "Adams Farm
Labradoodles" and the root description. Every other page defines its own `title` + `description`.

## F. Navigation gaps

**F1 — "Contact" appears nowhere in the nav**, neither in the primary row nor the About dropdown.
It is reachable only from the footer ("Send us a message", "Join the waitlist"), from in-page CTAs,
and from the phone button.
**F2 — `/our-litters` is linked from nowhere.** Not nav, not footer, not any in-page link. It
duplicates `/litters` against the same data with a different layout.
**F3 — `/puppies2` is a launch-facing URL.** Footer "Puppies" points at it. The `2` suffix is a
rename artifact.
**F4 — Nav "Our Puppies" and footer "Puppies" go to different pages** (`/our-puppies` vs
`/puppies2`) under near-identical labels. See A3.

## G. Smaller items

**G1 — Footer copyright year is hardcoded.** `const year = 2026;` in `Footer.tsx` — it will not roll
over.
**G2 — Raw database status vocabulary is shown to visitors.** `ParentCard` prints `dog.status`
verbatim as a badge, so `/dams` and `/sires` display **RETAINED**, **RETIRED**, and **ACTIVE**.
"Retained" in particular is internal breeder vocabulary.
**G3 — A registered name renders unabbreviated.** Chewy appears on `/sires` and `/litters` as
`Tarheel's May the Force B With U "Chewy"`, including the quotation marks.
**G4 — Phone number `href` is inconsistent.** `tel:+13363388660` in Nav, Footer, Guardians,
Ambassadors; `tel:3363388660` in the Contact sidebar and the contact form's error message. Both
dial correctly.
**G5 — `displayTitle` is defined but unused.** `src/data/litters.ts` carries
`displayTitle: "Lilo & Stitch May Litter"`; `/puppies2` renders `title` instead, so its heading
reads "Spring 2026 Litter" while the home page says "Meet Our Lilo & Stitch May Litter".
**G6 — The About dropdown has no mobile-keyboard equivalent.** It opens on `:hover`/`:focus-within`
on desktop; the `<button>` carries no `aria-expanded` and no click handler. On mobile the same links
are rendered flat in the hamburger panel, so no link is unreachable.
**G7 — No lorem ipsum or TODO comments anywhere.** The only "coming soon" strings are three
deliberate empty states (`DogPhoto`, `ParentCard`, and the Forever Families roster).

---

# Shared Components

Documented once here; each page section below notes which of these it uses.

## Root layout — `app/layout.tsx`

Wraps every page: `<Nav />`, then page content, then `<Footer />`. Fonts are Playfair Display
(headings) and Nunito Sans (body), both via `next/font/google`.

Default metadata:
- Title template: `%s | Adams Farm Labradoodles`, default `Adams Farm Labradoodles`
- Description: "ALAA Gold Paw accredited Australian Labradoodle breeder in Greensboro, NC. Every litter comes from fully health-tested parents and is raised in loving homes."

## Header / Nav — `app/components/Nav.tsx`

**Appears on:** all 14 pages.

**Layout:** sticky full-width bar, navy, thin white bottom border, sits above page content at
`z-100`. Inside a 1160px centred row: wordmark on the left, link row on the right. At `md` and below
the link row is replaced by a three-line hamburger button that opens a full-width navy panel beneath
the bar, with links stacked vertically and hairline dividers.

**Text, in order:**
- Wordmark: `Adams Farm Labradoodles` ("Labradoodles" in coral italic) — links to `/`
- Primary links: `Home` (`/`), `Dams` (`/dams`), `Sires` (`/sires`), `Our Puppies` (`/our-puppies`), `Litters` (`/litters`)
- Dropdown trigger: `About` with a chevron that rotates 180° on hover
- Dropdown items (white card, coral-tinted hover): `Our Program` (`/our-program`), `Our Story` (`/our-story`), `Guardians` (`/guardians`), `Ambassadors` (`/ambassadors`), `Safety & Protocols` (`/safety-and-protocols`)
- `FAQ` → `/#faq`
- Phone CTA button (coral, navy text, phone glyph): `336-338-8660` → `tel:+13363388660`
- Hamburger button `aria-label`: `Toggle menu`

Mobile panel repeats the same links, adds a coral uppercase `About` group label, and ends with the
full-width phone button.

## Footer — `app/components/Footer.tsx`

**Appears on:** all 14 pages.

**Layout:** navy band, three columns at `md` (1.2fr / 1fr / 1fr), collapsing to two then one. Below
it a full-width hairline rule and a single copyright line.

**Column 1 — `Adams Farm Labradoodles`:** `Home`, `Dams`, `Sires`, `Litters`, `Our program`,
`Guardians`, `Puppies` (→ `/puppies2`), `Testimonials` (→ `/#testimonials`), `FAQ` (→ `/#faq`)

**Column 2 — `Get a puppy`:** `See available puppies` (→ `/puppies2`), `Join the waitlist`
(→ `/contact`), `Meet the dams` (→ `/dams`), `Meet the sires` (→ `/sires`), `Our health guarantee`
(→ `/our-program`)

**Column 3 — `Contact & location`:** `Greensboro, NC` · `336-338-8660` (underlined, `tel:`) ·
`Send us a message` (underlined, → `/contact`) · ALAA badge image, 88px, alt `ALAA Member 2026`

**Bottom bar:** `© 2026 Adams Farm Labradoodles · Greensboro, NC`

## PageHero — `app/components/PageHero.tsx`

**Appears on:** `/dams`, `/sires`, `/litters`, `/our-litters`, `/our-puppies`, `/puppies2`,
`/our-story`, `/guardians`, `/ambassadors`, `/safety-and-protocols`, `/contact` (11 pages).

**Layout:** navy band, 64px vertical padding, bottom hairline. Left-aligned in a 1160px container:
coral uppercase eyebrow, then an `h1` in Playfair (clamped 2rem–2.6rem), then an optional intro
paragraph capped at 620px.

Takes three props — `eyebrow`, `title`, `intro` — quoted per page below.

## PuppyQCards — `app/components/PuppyQCards.tsx`

**Appears on:** `/` (PuppyQ Program section) and `/our-program` (Four periods section).

**Layout:** four click-to-flip cards, 1 / 2 / 4 columns by breakpoint, 260px tall. Front face is
white with a 4px coloured top border; back face is a solid colour fill with centred text. Clicking a
card flips it; clicking again flips back.

| # | Title | Timeframe | Front | Back |
|---|---|---|---|---|
| 1 | Neonatal Period | Day 0–14 | "Puppies are born blind and deaf, their brains not yet ready to learn." | "Every puppy is weighed and gently handled, one on one, every single day." |
| 2 | Transition Period | Day 14–21 | "Eyes and ears open and the puppy comes online for the first time." | "Handling stays calm and quiet while first impressions form." |
| 3 | Socialization Period | Week 3–12 | "The critical window for meeting the world — and it stays open after your puppy comes home." | "Puppies meet people, places, and friendly dogs through steady, everyday exposure." |
| 4 | Juvenile Period | Week 12 to sexual maturity | "The socialization window has closed and your growing puppy enters adolescence." | "Keep up the outings and routines that carry the foundation forward." |

## BreedingTier — `app/components/BreedingTier.tsx`

**Appears on:** `/dams`, `/sires` (twice each).

Renders one tier of a breeding-line page: coral uppercase label, optional `h2`, optional blurb
capped at 620px, then a 2 / 3 / 4-column grid of `ParentCard`s. Returns nothing when the tier is
empty, so no heading ever sits over a blank grid. `tone="panel"` switches the background from cream
to the alternate panel colour with a top hairline.

## ParentCard — `app/components/ParentCard.tsx`

**Appears on:** `/dams`, `/sires`, via `BreedingTier`.

**Layout:** rounded white card, 18px radius, warm border. Top is a 4:5 portrait; over it, a navy
role badge pinned to the top-left and a status badge pinned to the top-right (green when `active`,
charcoal otherwise). Body below: name (`h3`), optional registered name in italic, optional
`breed · color` line, optional coral "Partner program" label, and a bottom-anchored
`N litters · N offspring` line.

When the record has no photo, the image area shows centred tan text: `Photo` / `coming soon`.

## SignInGate — `app/components/SignInGate.tsx`

**Appears on:** `/forever-families` when signed out.

Single 420px column: coral eyebrow `Internal · Forever Families`, heading `Enter your email to get
access.`, body "No password. Enter your address and we'll email you a link that signs you in for
{N} days.", one email field (placeholder `you@example.com`), a coral submit button
`Email me a sign-in link`, and the footnote "This page is for Adams Farm staff. Access is limited to
a small list of addresses."

Alternate states: unconfigured → "Sign-in isn't configured yet, so this page is closed to everyone."
· link sent → "If that address has access, a sign-in link is on its way. It expires in {N} minutes."
+ "Check spam if it doesn't arrive within a minute or two." + `Use a different address` · expired →
"That link has expired. Request a fresh one below." · rate-limited → "A link was requested for that
address very recently. Check your inbox — and if nothing arrived, try again in {N}."

## DogPhoto — `app/components/DogPhoto.tsx`

**Appears on:** nothing. Orphaned — see flag D2.

---

# Page 1 — Home

- **Route:** `/` · **File:** `app/page.tsx`
- **Title:** `Adams Farm Labradoodles` (root default — no page-level metadata)
- **Shared components:** Nav, Footer, PuppyQCards
- **Data:** puppy cards from `src/data/litters.ts` (static); everything else hardcoded

Eleven sections, alternating navy and white.

### 1. Hero
**Layout:** navy, two equal columns at `md`. Left column is text, vertically centred, min-height
500px. Right column holds a circular portrait — up to 520px, 6px coral ring, heavy drop shadow,
absolutely positioned so it bleeds above and below the band and tucks behind the sticky nav. On
mobile the circle drops below the text at 300px.

**Text:**
- Eyebrow: `Australian Labradoodles`
- H1: `Puppies with a Purpose`
- Body: "Every litter comes from fully health-tested parents and grows up surrounded by family, before going to yours."
- CTA (coral): `See available puppies` → `#puppies`
- Image alt: `A girl holding an Adams Farm Labradoodle puppy`

### 2. Stats bar
**Layout:** cream panel, bottom hairline, three centred stat blocks in a row (stacked on mobile).
Large Playfair numeral over a small uppercase label.

`6` / `Litters` — `56` / `Puppies Raised` — `15` / `Five-Star Reviews`

> Flags A1 (contradicts the live 5 / 36) and C1 (review count unsourced).

### 3. Available Puppies — `#puppies`
**Layout:** white, bottom hairline. Intro block capped at 620px, then a 1 / 2 / 3-column card grid,
then a CTA. Each card is a navy tile with a 3:4 photo on top and a text block beneath holding name,
collar, and two pill badges.

**Text:**
- Eyebrow: `Available Puppies`
- H2: `Meet Our Lilo & Stitch May Litter`
- Body: "These practically perfect puppies come from Legend Manor's Holly and Tarheel's Knox, and are expected to mature into large minis between 20 and 25 lbs."
- Italic note: `Bred in partnership with Legend Manor Labradoodles`
- Two links: `Meet Our Dams →` (`/dams`), `Meet Our Sires →` (`/sires`)
- Cards (available + adopted only; reserved held back): **Stitch** · Blue Collar · Male · `Adopted` — **Jumba** · Red Collar · Male · `Available`
- Card image alts: the puppy's name
- CTA (coral): `Reserve a Puppy` → `/contact`

### 4. PuppyQ Program
**Layout:** navy, top hairline. Left-aligned heading block capped at 680px, then the four flip
cards, then a full-width SVG timeline (four coloured nodes on a horizontal rule, numbered 1–4 with
captions beneath).

**Text:**
- Eyebrow: `Our Program`
- H2: `PuppyQ Raised and Certified`
- Body: "PuppyQ is an evidence-based framework for raising calm puppies. / Q stands for Quotient, marking four developmental periods from birth to adulthood. Adams Farm raises each puppy with intention and tracks benchmarks in the PuppyQ framework. Every puppy goes home with its PuppyQ Certification, Scorecard, and History." (line break after the first sentence)
- Timeline captions: `Day 0–14`, `Day 14–21`, `Week 3–12`, `Week 12–maturity`

> The timeline is inline SVG text, so it carries no alt attribute; the same four periods are stated
> in the cards above it.

### 5. About Adams Farm
**Layout:** white, two columns at `md` (2.5fr / 3fr), top-aligned. Left is a 3:4 rounded photo;
right is the copy plus a three-column pillar grid.

**Text:**
- Image alt: `Douglas and Erika Campbell with Winnie`
- Eyebrow: `ALAA Gold Paw Accredited`
- H2: `Adams Farm Labradoodles`
- Body: "We are the Campbell Family. We have been raising Australian Labradoodles since January 2022. It began with the adoption of Legend Manor's Prancer who became our foundation dog. We are committed to breeding and raising puppies and dogs with love and intention. We strive to improve our program and do something really meaningful in the lives of people and dogs."
- Pillars:
  - `Health, Verified` — "ALAA Gold Paw accredited, with full hip, elbow, eye, and genetic testing on every breeding pair."
  - `Raised on PuppyQ` — "Every puppy is individually handled from birth, then introduced to the world starting at four weeks old."
  - `Built for Families` — "Non-shedding, allergy-friendly coats, and a 3-year health guarantee behind every puppy we place."

### 6. Testimonials — `#testimonials`
**Layout:** navy. Eyebrow and heading, then an empty container the Elfsight script fills client-side.

- Eyebrow: `Testimonials`
- H2: `Loved by Families`
- No authored testimonial text exists in the codebase. See flag C1.

### 7. Why Australian Labradoodle (ALAA)
**Layout:** white. Top row is two columns (3fr / 2.5fr) — copy left, badge right. Below, a
1 / 2 / 4-column grid of bordered white cards. A text link closes the section.

**Text:**
- Eyebrow: `Better Breed by Design`
- H2: `Australian Labradoodle` / `Association of America` (explicit line break)
- Body: "The Australian Labradoodle Association of America (ALAA) has been protecting and improving the Australian Labradoodle breed since 2004. ALAA sets the health-testing and breeding standards every member breeder must meet, verifies pedigrees, and holds breeders accountable to a formal code of ethics — reviewed and renewed annually."
- Image alt: `Better Breed by Design`
- Cards:
  - `Verified Pedigree` — "ALAA Australian Labradoodles have a verified pedigree that is checked against ALAA's official database to confirm lineage."
  - `Multi-Generational` — "ALAA Australian Labradoodles have two registered parents and a lineage going back multiple generations."
  - `Allergy-Friendly Coat` — "ALAA Australian Labradoodles have a low shedding, curly or wavy coat that makes them allergy friendly for most people."
  - `Temperament Bred` — "ALAA Australian Labradoodles are bred for wonderful temperaments, making them ideal for families and therapy work."
- Link: `Learn more from ALAA →` → `https://alaa-labradoodles.com/for-breeders/breed-standard/` (external, `target="_blank"`, `rel="noopener noreferrer"`)

### 8. Break quote
**Layout:** navy, centred, 680px column, generous padding.

> "Dogs are not our whole life, but they make our lives whole." — `Roger Caras`

### 9. Trusted Partners
**Layout:** white, hairlines top and bottom. Heading block, then a 2 / 3 / 6-column grid of navy
logo tiles.

- Eyebrow: `Trusted Partners`
- H2: `Our Partners`
- Body: "Every Adams Farm puppy is raised with help from our incredible partners."
- Logo alts, in order: `ALAA Gold Paw Breeder 2026–2027`, `AKC Reunite`, `Trupanion`, `Purina Pro Club`, `PuppyQ`, `Baxter & Bella`

### 10. Join Us
**Layout:** navy. Heading block, then two translucent bordered cards side by side at `md`, each
lifting slightly on hover. Each card leads with a small coral numbered circle.

- Eyebrow: `Get Involved`
- H2: `Join Us`
- Body: "We breed to do something really meaningful in the lives of people, puppies, and dogs. In our brief time as a breeder, we've touched over 15,000 total lives. Would you like to help us in our mission?"
- Card 1 — `Become a Guardian` — "Provide a loving home for one of our breeding dogs, while we handle the rest." → `Learn About Guardians →` (`/guardians`)
- Card 2 — `Become an Ambassador` — "Help us socialize our puppies and spread a little puppy joy." → `Learn About Ambassadors →` (`/ambassadors`)

### 11. FAQ — `#faq`
**Layout:** white. Heading, then five stacked `<details>` accordions, each a bordered rounded card
whose `+` glyph rotates 45° when open. All start closed.

- Eyebrow: `FAQ` · H2: `Frequently Asked Questions`
1. **"What is ALAA Gold Paw accreditation, and why does it matter?"** — "Gold Paw is our highest health-testing standard under the Australian Labradoodle Association of America — the accrediting body that verifies pedigrees and sets the breed standard. It means every breeding dog in our program is health tested and verified, not just labeled "Australian Labradoodle.""
2. **"What makes an Australian Labradoodle different from other "doodle" breeds?"** — "A true Australian Labradoodle is a multi-generational breed with both parents being Australian Labradoodles themselves — not a first-generation Lab and Poodle mix. Only dogs registered with ALAA, ALCA, or WALA are held to that standard."
3. **"Are Adams Farm puppies allergy friendly?"** — "Yes. Every puppy we place is guaranteed 100% non-shedding and allergy friendly. As ALAA notes, no dog is truly hypoallergenic, but a carefully bred, low-to-no-shedding coat makes the breed a strong option for allergy-sensitive families."
4. **"What does "raised in loving homes" mean — do all your dogs live with you?"** — "Puppies are whelped in the Campbell home. Some of our breeding dogs live with us, and others live with trusted guardian families — but every dog in our program is raised in a loving home, never a kennel."
5. **"What health guarantee comes with my puppy?"** — "We test breeding dogs for known congenital defects and back what can't be tested for with a 3-year written guarantee, so your family can adopt with real confidence."

### 12. Apply Now band
**Layout:** solid coral band, everything centred, 680px effective width.

- Eyebrow: `Get Started`
- H2: `Reserve Your Adams Farm Puppy`
- Body: "Our litters are small and spots fill quickly. Fill out a short application and we'll reach out to discuss your perfect match."
- CTA (white button): `Apply Now` → `/contact`

---

# Page 2 — Dams

- **Route:** `/dams` · **File:** `app/dams/page.tsx`
- **Title:** `Dams | Adams Farm Labradoodles`
- **Description:** "The dams of Adams Farm Labradoodles — every mother of a litter on the Adams Farm record."
- **Shared components:** Nav, Footer, PageHero, BreedingTier, ParentCard
- **Data:** live PuppyQ, revalidated every 300s
- **Membership rule (in code):** a dam appears only after whelping a litter on the Adams Farm record.

### 1. Hero (PageHero)
- Eyebrow: `Dams`
- H1: `Our Mothers`
- Intro, as rendered: "Every dam here has whelped a litter on the Adams Farm record — 2 mothers across 5 litters and 36 puppies."
- Empty-state intro (unconfigured env): "The mothers behind Adams Farm — every dam who has whelped a litter on our record."

### 2. In the Program (BreedingTier, cream)
- Label: `Active · 1 Dam`
- H2: `In the Program`
- One card — **Adams Farm Macy**: role badge `Dam`, status badge `retained`, `Australian Labradoodle · caramel`, `1 litter · 5 offspring`, **no photo** (Photo / coming soon)

### 3. The Dams Who Built the Line (BreedingTier, panel tone)
- Label: `Foundation & Retired · 1`
- H2: `The Dams Who Built the Line`
- Blurb: "Retired from breeding, but never from the record — including foundation mothers who came to us from partner programs."
- One card — **Prancer**: registered name `Legend Manor's Prancer`, role badge `Dam`, status badge `retired`, `Australian Labradoodle · cream/apricot`, `Partner program`, `4 litters · 31 offspring`, **no photo**

### 4. Empty state (not currently rendered)
Shown only when the record returns nothing: "Dam records are loading — check back shortly, or
`get in touch`." (link → `/contact`). This is what a Preview deployment shows — flag C2.

> Page-specific flags: B1 (no photos at all), G2 (`retained` / `retired` badges), A4 (Prancer vs
> Winnie), A9 (foundation dam marked "Partner program").

---

# Page 3 — Sires

- **Route:** `/sires` · **File:** `app/sires/page.tsx`
- **Title:** `Sires | Adams Farm Labradoodles`
- **Description:** "The sires of Adams Farm Labradoodles — every father of a litter on the Adams Farm record, hired studs included."
- **Shared components:** Nav, Footer, PageHero, BreedingTier, ParentCard
- **Data:** live PuppyQ, revalidated every 300s

### 1. Hero (PageHero)
- Eyebrow: `Sires`
- H1: `Our Fathers`
- Intro, as rendered: "Every sire here has fathered a litter on the Adams Farm record — 2 fathers across 5 litters and 36 puppies."
- Empty-state intro: "The fathers behind Adams Farm — every sire of a litter on our record."

> The rendered count says "2 fathers" while the tier below lists 2 sires — `total` sums producing +
> retired + name-only, and the name-only tier is currently empty.

### 2. In the Program (BreedingTier, cream)
- Label: `Active · 2 Sires`
- H2: `In the Program`
- **Silas** — registered `Legend Manor's Silas`, role `Sire`, status `retained`, `Australian Labradoodle · caramel/white`, `Partner program`, `4 litters · 27 offspring`, photo present (alt `Silas`)
- **Tarheel's May the Force B With U "Chewy"** — role `Sire`, status `active`, `Australian Labradoodle`, `Partner program`, `1 litter · 9 offspring`, **no photo**

### 3. The Sires Who Built the Line (BreedingTier, panel tone)
- Label: `Foundation & Retired · 0`
- Not rendered — `BreedingTier` returns nothing for an empty tier. Copy that would appear: H2 `The
  Sires Who Built the Line`, blurb "Retired from breeding, but never from the record."

### 4. Outside Studs (navy section)
Not rendered — no name-only sires on the record. Copy that would appear: eyebrow
`Outside Studs · N`, H2 `Hired for the Pairing, Part of the Line`, blurb "Studs from other programs
whose litters are on the Adams Farm record. Their genes are in the line; their programs deserve the
credit.", then a 1 / 2 / 3-column grid of bordered cards each showing a name and
`N litters sired here`.

### 5. Empty state (not currently rendered)
"Sire records are loading — check back shortly, or `get in touch`." → `/contact`

> Page-specific flags: both sires carry the "Partner program" label, so no Adams-Farm-owned sire
> appears; G3 (Chewy's full registered name with quotation marks); G2 (`retained` badge on a sire
> listed under "In the Program").

---

# Page 4 — Our Puppies

- **Route:** `/our-puppies` · **File:** `app/our-puppies/page.tsx` · **In main nav**
- **Title:** `Our Puppies | Adams Farm Labradoodles`
- **Description:** "Current and past Adams Farm Labradoodle litters — read live from the PuppyQ record."
- **Shared components:** Nav, Footer, PageHero
- **Data:** live PuppyQ, revalidated every 300s. Treats the single most recent litter as current.

### 1. Hero (PageHero)
- Eyebrow: `Our Puppies` · H1: `Puppies`
- Intro: "Adams Farm litters — raised underfoot, loved from day one."

### 2. Current Program
**Layout:** cream. Eyebrow, H2, then one large featured card — navy fill, 20px radius, 32px padding.
Inside: a coral "Litter" label, the pairing as an H2, the birth date, then a pup count and a wrapped
row of name pills. A navy CTA button sits below the card.

- Eyebrow: `Most Recent Litter` · H2: `Current Program`
- Featured card: `Litter` · **Prancer × Silas** · `Born February 24, 2026` · `6 pups`
- Pills: Madison · caramel / Hudson · caramel / Toffi · cream/gold / Miklo · caramel / Tori · caramel / Chelsea · cream
- CTA: `Inquire About Puppies` → `/contact`
- Empty state (not rendered): dashed-border panel, "No litters on record yet. Check back soon, or `join our waitlist`."

### 3. Past Litters
**Layout:** white, top hairline. Eyebrow, H2, then a two-column grid of the same card in its
unfeatured form (alternate panel background, navy text).

- Eyebrow: `Past Litters` · H2: `Our Track Record`
- **Adams Farm Macy × Silas** · Born February 4, 2026 · 5 pups — Dory · caramel / Deb · caramel / Nemo · caramel / Marlin · caramel / Coral · caramel cream
- **Prancer × Silas** · Born August 3, 2025 · 8 pups — Baby Peanut · cream / Callie · apricot / Cinderella · cream/gold / Mili · cream/apricot / River · apricot / Hazel · cream/gold / Snow White · cream / Zola · cream/gold
- **Prancer × Silas** · Born January 8, 2025 · 8 pups — Butters · caramel / James Dean · caramel / Paisley Rose · cream / Maui · gold / Elizabeth Taylor · cream / Leia · caramel / Samson King · caramel / Douglas Carter · cream/gold
- **Prancer × Tarheel's May the Force B With U "Chewy"** · Born July 8, 2024 · 9 pups — Caeli · cream/gold / Luca · cream / Macy · caramel / Hudson · caramel / Izzy · silver / Lia · gold / Finn · caramel / Grace · caramel / Jaxon · gold

### 4. Waitlist band
**Layout:** navy, text left and button right at `md`, stacked on mobile.

- Eyebrow: `Future litters` · H2: `Join the Waitlist`
- Body: "Our litters fill quickly. Getting on the list early means first access to puppy picks."
- CTA (outlined): `Get on the list` → `/contact`

> Page-specific flags: A2 and A3 — this is the nav's puppy page, and its "Current Program" is a
> February litter with every puppy placed, while the home page and `/puppies2` sell a May litter
> with one available. No photographs anywhere on this page.

---

# Page 5 — Litters

- **Route:** `/litters` · **File:** `app/litters/page.tsx` · **In main nav**
- **Title:** `Litters | Adams Farm Labradoodles`
- **Description:** "Every Adams Farm litter, newest first — each pairing with its dam, its sire, and every puppy on the record."
- **Shared components:** Nav, Footer, PageHero
- **Data:** live PuppyQ, revalidated every 300s

### 1. Hero (PageHero)
- Eyebrow: `Litter Registry · Live`
- H1, as rendered: `5 litters, 2024–2026`
- Intro: "Every pairing on the record, newest first — litters Adams Farm bred outright and co-litters with partner programs. Each one names its dam, its sire, and all 36 puppies registered from them."
- Empty-state title/intro: `Our Litters` / "Every litter Adams Farm has bred — read live from the PuppyQ record."

### 2. Registry
**Layout:** cream. Litters grouped by year, newest first. Each year gets a header row — a monospace
year, a hairline rule filling the space, and a right-aligned monospace count — then a 1 / 2 /
3-column card grid.

Each card: an 18px-radius white tile with a coloured provenance strip across the top (navy for
"Adams Farm", coral-dark for "Co-litter") carrying the source on the left and the year on the right.
Body holds the pairing as a linked H3 (dam → `/dams`, sire → `/sires`, separated by a grey `×`),
the birth date, a puppy count line, a wrapped grid of name chips with colours, and a
bottom-anchored status line.

**2026 · 2 litters**
- `Adams Farm` · 2026 — **Prancer × Silas** · Born February 24, 2026 · `6 puppies · 5 placed` · Madison · caramel, Hudson · caramel, Toffi · cream/gold, Miklo · caramel, Tori · caramel, Chelsea · cream · **In the program**
- `Adams Farm` · 2026 — **Adams Farm Macy × Silas** · Born February 4, 2026 · `5 puppies · 5 placed` · Dory · caramel, Deb · caramel, Nemo · caramel, Marlin · caramel, Coral · caramel cream · **Past litter**

**2025 · 2 litters**
- `Adams Farm` · 2025 — **Prancer × Silas** · Born August 3, 2025 · `8 puppies · 6 placed` · Baby Peanut · cream, Callie · apricot, Cinderella · cream/gold, Mili · cream/apricot, River · apricot, Hazel · cream/gold, Snow White · cream, Zola · cream/gold · **In the program**
- `Adams Farm` · 2025 — **Prancer × Silas** · Born January 8, 2025 · `8 puppies · 7 placed` · Butters · caramel, James Dean · caramel, Paisley Rose · cream, Maui · gold, Elizabeth Taylor · cream, Leia · caramel, Samson King · caramel, Douglas Carter · cream/gold · **Past litter**

**2024 · 1 litter**
- `Adams Farm` · 2024 — **Prancer × Tarheel's May the Force B With U "Chewy"** · Born July 8, 2024 · `9 puppies · 7 placed` · Caeli · cream/gold, Luca · cream, Macy · caramel, Hudson · caramel, Izzy · silver, Lia · gold, Finn · caramel, Grace · caramel, Jaxon · gold · **Past litter**

Fallback strings in code, not currently rendered: `Unknown dam`, `Unknown sire`,
`Date not recorded`, `Undated`, `—`.

### 3. Empty state (not currently rendered)
"Litter records are loading — check back shortly, or `join our waitlist`." → `/contact`

### 4. CTA band
**Layout:** navy, text left and outlined button right at `md`.
- Eyebrow: `Next litter` · H2: `Get on the waitlist`
- Body: "Our litters fill quickly. Reach out early for first access to upcoming picks."
- CTA: `Contact us` → `/contact`

> Page-specific flags: A2 (May 2026 litter absent), A7 (an older litter marked "In the program"
> above a newer "Past litter"), A1 (5 litters / 36 puppies vs the home page's 6 / 56). No
> photographs. No card carries the "Co-litter" strip — every litter on the record is "Adams Farm".

---

# Page 6 — Our Litters *(unlinked)*

- **Route:** `/our-litters` · **File:** `app/our-litters/page.tsx`
- **Title:** `Our Litters | Adams Farm Labradoodles`
- **Description:** "Every Adams Farm Labradoodles litter on record — read live from PuppyQ, newest first."
- **Shared components:** Nav, Footer, PageHero
- **Data:** live PuppyQ, revalidated every 300s
- **Linked from:** nothing — see flag F2. Same data as `/litters`, different layout and pairing order.

### 1. Hero (PageHero)
- Eyebrow: `Litter Registry · Live`
- H1: `5 litters, 2024–2026`
- Intro: "36 puppies placed across 5 litters — every pairing Adams Farm has bred, including co-litters with partner programs."

### 2. Registry
**Layout:** cream. Same year-header treatment as `/litters` (monospace year, rule, count), then a
1 / 2 / 3-column grid. Cards are flatter than the `/litters` version: white, 12px radius, no
provenance strip. An optional green `Current` pill sits at the top. Below it the pairing as an H3
with the year right-aligned in coral, then the date, then a metadata row.

**2026 · 2 litters**
- `Current` · **Silas × Prancer** · 2026 · February 24, 2026 · `6 puppies` `5 placed`
- **Silas × Adams Farm Macy** · 2026 · February 4, 2026 · `5 puppies` `5 placed`

**2025 · 2 litters**
- `Current` · **Silas × Prancer** · 2025 · August 3, 2025 · `8 puppies` `6 placed`
- **Silas × Prancer** · 2025 · January 8, 2025 · `8 puppies` `7 placed`

**2024 · 1 litter**
- **Tarheel's May the Force B With U "Chewy" × Prancer** · 2024 · July 8, 2024 · `9 puppies` `7 placed`

A `Co-litter` italic label renders when a litter is typed as one; none currently are.

### 3. Empty state (not currently rendered)
"Litter records are loading — check back shortly."

### 4. CTA band
Identical text to `/litters`: eyebrow `Next litter`, H2 `Get on the waitlist`, body "Our litters
fill quickly. Reach out early for first access to upcoming picks.", CTA `Contact us` → `/contact`.

> Page-specific flags: F2 (unlinked), A5 (sire × dam here, dam × sire on `/litters`), A8 (the
> intro says "36 puppies placed" while the cards total 30 placed of 36). `pqName` is imported and
> never used (the pre-existing lint warning).

---

# Page 7 — Our Program

- **Route:** `/our-program` · **File:** `app/our-program/page.tsx` · **In nav (About)**
- **Title:** `Our Program | Adams Farm Labradoodles`
- **Description:** "The PuppyQ Framework — an evidence-based approach to raising calm, well-socialized Australian Labradoodle puppies."
- **Shared components:** Nav, Footer, PuppyQCards. **Does not use PageHero** — it has a custom hero.

### 1. Hero (custom, AVSAB lead)
**Layout:** navy, 1160px container, left-aligned. A statement heading capped at 760px, then a large
italic pull-quote capped at 820px, then an attribution line, then an external link.

- H1: "A puppy's most important weeks for meeting the world are its first three months. That's what we build around."
- Pull-quote: "The primary and most important time for puppy socialization is the first three months of life. During this time puppies should be exposed to as many new people, animals, stimuli and environments as can be achieved safely and without causing overstimulation."
- Attribution: `— American Veterinary Society of Animal Behavior (AVSAB)`
- Link: `Read the full AVSAB position statement →` → `https://avsab.org/wp-content/uploads/2018/03/Puppy_Socialization_Position_Statement_Download_-_10-3-14.pdf` (external, new tab)

### 2. The PuppyQ Framework
**Layout:** white, single 720px centred column.
- H2: `The PuppyQ Framework`
- Body: "PuppyQ is an evidence-based framework for raising calm, well-socialized puppies. Adams Farm raises each puppy following PuppyQ protocols and provides a PuppyQ Scorecard and History."

### 3. Four periods, birth to adulthood
**Layout:** navy, top hairline, 1160px. Heading and intro, then the four flip cards.
- H2: `Four periods, birth to adulthood`
- Body: "PuppyQ organizes development into four periods. Each is a window of time when specific work happens."

### 4. Evidence-based early socialization
**Layout:** white, 720px column.
- H2: `Evidence-based early socialization`
- Body: "PuppyQ Protocols follows the guidelines of the American Veterinary Society of Animal Behavior (AVSAB), which is supported and endorsed by the American Veterinary Medical Association (AVMA)."

### 5. PuppyQ Socialization Benchmarks
**Layout:** cream panel, 720px column, three stacked paragraphs.
- H2: `PuppyQ Socialization Benchmarks`
- "Dr. Ian Dunbar is a veterinarian and animal behaviorist who holds a veterinary degree from the Royal Veterinary College in London and a doctorate in animal behavior from UC Berkeley. In 1982, he founded SIRIUS® Puppy Training, the world's first off-leash puppy socialization program, and went on to found the Association of Professional Dog Trainers, now the largest dog trainer organization in the world. His socialization benchmark is one of the most widely cited in the field — not because it's official policy from any single body, but because decades of trainers, behaviorists, and veterinarians have converged on it independently."
- "Our socialization goal follows his two-part benchmark: 100 people by 8 weeks with us, and 100 more in the first month home with you. It's a shared effort — we lay the foundation during your puppy's first weeks, and you carry it forward through the most formative days of their life."
- "To earn PuppyQ Certification, each puppy meets a clear standard by 8 weeks: 10 events, 10 locations, and 100 people. It's a floor we hold ourselves to for every single puppy."

### 6. Pull-quote break
**Layout:** navy, centred, 680px.
> "Prevention is better than intervention." — `Dr. Ian Dunbar`

### 7. PuppyQ – Q is for Quotient
**Layout:** deep-navy panel, top hairline, 720px column, three paragraphs.
- H2: `PuppyQ – Q is for Quotient`
- "Q stands for Quotient. We track thirteen of them, using C-BARQ — a validated behavior assessment from the University of Pennsylvania. It measures things like trainability, energy, and how your puppy responds to new people, dogs, and situations."
- "C-BARQ — the Canine Behavioral Assessment and Research Questionnaire — was developed at the University of Pennsylvania by Dr. James Serpell and Dr. Yuying Hsu in 2003, to give owners and researchers a standardized way to measure real canine behavior. It's since been used in tens of thousands of evaluations worldwide. PuppyQ provides this evaluation to all forever families to help measure and improve its protocols."
- "In conjunction with C-BARQ, PuppyQ has also developed its own Q Assessment, given to puppies at seven weeks by our certified ambassadors, before the puppy goes to its forever home. The Q Assessment is not used as a predictor of behavior, but as a look at the puppy's early traits and temperament."

### 8. What every puppy goes home with
**Layout:** white, 1160px. Heading and lead, then a three-column grid of bordered white cards.
- H2: `What every puppy goes home with`
- Lead: "Every Adams Farm puppy comes home with three things:"
- `PuppyQ Certification` — "Proof your puppy met the full standard: 10 events, 10 locations, 100 people."
- `PuppyQ Scorecard` — "Your puppy's seven-week snapshot, plus the eight-month follow-up that shows real growth."
- `PuppyQ History` — "A full record of your puppy's first weeks — every person, place, and milestone."

### 9. Closing CTA
**Layout:** navy, top hairline, centred column.
- H2: `See our current puppies`
- CTA (coral): `See available puppies` → `/puppies2`

> Note: the footer links "Our health guarantee" here, but the page does not mention the 3-year
> guarantee — that copy lives on the home page (pillar 3 and FAQ 5).

---

# Page 8 — Our Story

- **Route:** `/our-story` · **File:** `app/our-story/page.tsx` · **In nav (About)**
- **Title:** `Our Story | Adams Farm Labradoodles`
- **Description:** "How Adams Farm Labradoodles began — from a search for the right family dog to Winnie and our first litter."
- **Shared components:** Nav, Footer, PageHero

### 1. Hero (PageHero)
- Eyebrow: `Adams Farm Labradoodles` · H1: `Our Story`
- Intro: "How a search for the right family dog became Adams Farm."

### 2. Body
**Layout:** cream, one narrow 720px column, elements stacked with even spacing. Two paragraphs, a
left-bordered pull-quote, then a text link. No images.

- "It started with our kids, Julian and Marie Claire, begging for a puppy. Instead of one, we decided to give them puppies — and set out to find the right breed. Our only real requirement was temperament: friendly, with no aggression toward people, dogs, or other animals. That search led us to Australian Labradoodles, and eventually to Mike and Pam Kirkpatrick of Legend Manor Labradoodles, and their dog Prancer — Winnie."
- "From the moment we met her, Erika knew. Winnie approached each of us gently, and it was clear how loving she was — the kind of dog that becomes a healing presence for a family. She joined ours, and after her third litter, gave us eight healthy puppies. That's how Adams Farm began."
- Pull-quote (coral left border): "A great dog can be a healing presence for your whole family." — `Erika Campbell`
- Link: `Meet our dams →` → `/dams`

> This page is the site's only explanation of the Prancer/Winnie naming — see flag A4. It is also
> the shortest marketing page and carries no photograph.

---

# Page 9 — Guardians

- **Route:** `/guardians` · **File:** `app/guardians/page.tsx` · **In nav (About)**
- **Title:** `Become a Guardian | Adams Farm Labradoodles`
- **Description:** "Adams Farm's guardian model — our breeding dogs live in loving family homes, not a kennel."
- **Shared components:** Nav, Footer, PageHero

### 1. Hero (PageHero)
- Eyebrow: `Get Involved` · H1: `Become a Guardian`
- Intro: "Give one of our breeding dogs a loving, permanent home — and we handle the rest."

### 2. Body
**Layout:** cream, single 680px column. Five paragraphs with a coral-bordered pull-quote fourth from
the end, then a CTA row (solid coral button plus a text link) that wraps on narrow screens. No images.

- "Adams Farm's breeding dogs don't live in a kennel. They live as members of a family — in loving homes, with people who care for them every day, while remaining part of our breeding program."
- "This is what makes the guardian model different: our dogs get to be dogs. They're loved, socialized, and part of daily life, not confined to a breeding facility. In return, guardian families give our program something a kennel never could — a dog raised the same way your puppy will be."
- "Here's the idea in plain terms: a guardian family provides the everyday home — the walks, the couch, the belly rubs — and the dog lives with them full-time as a family pet. Adams Farm handles what's needed for the dog's role in the breeding program, and the dog only comes back to us briefly, for breeding or whelping, before returning home to its family."
- "Puppies are whelped in the Campbell home, where Douglas and Erika oversee everything from birth through early development. But the sires and dams themselves — the dogs who make each litter possible — live their lives in the homes of families who love them."
- Pull-quote: "It's a simple idea: dogs raised in love make better companions. That's true for our breeding dogs, and it's true for the puppies they bring into the world."
- "Every guardianship is a little different, and the specifics — what's involved, how it works, and what to expect — are things we walk through personally with each family. If the idea appeals to you, the best next step is simply to reach out and talk with us directly."
- CTA (coral button): `Call 336-338-8660` → `tel:+13363388660`
- Text link: `Or send us a message →` → `/contact`

---

# Page 10 — Ambassadors

- **Route:** `/ambassadors` · **File:** `app/ambassadors/page.tsx` · **In nav (About)**
- **Title:** `Become an Ambassador | Adams Farm Labradoodles`
- **Description:** "Help Adams Farm socialize our puppies — introducing them to new people, places, and experiences during the weeks that matter most."
- **Shared components:** Nav, Footer, PageHero

### 1. Hero (PageHero)
- Eyebrow: `Get Involved` · H1: `Become an Ambassador`
- Intro: "Help us raise calm puppies — by helping them meet the world."

### 2. Body
**Layout:** identical to Guardians — cream, 680px column, paragraphs with one pull-quote, CTA row of
a coral button plus a text link. No images.

- "Ambassadors help us do one of the most important things in raising a calm puppy: getting each one out into the world while they're young. It's simple, hands-on, and genuinely fun."
- "That might mean coming by to spend time with a litter, helping a puppy meet new people, or introducing them to new places, sounds, and everyday experiences. Every friendly new face and every new setting is part of how a puppy learns to take the world in stride."
- "There's a window early in a puppy's life when these experiences shape them the most, and it closes sooner than most people expect. The more good, gentle exposure a puppy gets during that time, the better — and that's exactly where ambassadors come in."
- Pull-quote (coral text): "A little puppy joy, shared early, goes a long way."
- "We're still shaping exactly what this looks like, so if you love puppies and would like to be part of it, we'd love to hear from you. Reach out and we'll tell you more."
- CTA (coral button): `Call 336-338-8660` → `tel:+13363388660`
- Text link: `Or send us a message →` → `/contact`

> "We're still shaping exactly what this looks like" is authored copy, not placeholder text, but it
> is the one line on the site that tells a visitor a program is unfinished.

---

# Page 11 — Safety & Protocols

- **Route:** `/safety-and-protocols` · **File:** `app/safety-and-protocols/page.tsx` · **In nav (About)**
- **Title:** `Safety & Protocols | Adams Farm Labradoodles`
- **Description:** "How Adams Farm socializes puppies safely during the critical early window — grounded in current veterinary behavior science."
- **Shared components:** Nav, Footer, PageHero

### 1. Hero (PageHero)
- Eyebrow: `Our Approach` · H1: `Safety & Protocols`
- Intro: "Early socialization, done responsibly — and why waiting carries a greater risk."

### 2. Opening
**Layout:** cream, 680px column.
- "One of the most common questions we hear is about taking puppies out into the world before their full vaccine series is finished. It's a fair question, and it deserves a straight answer grounded in what the science actually says."
- H2 (coral): `The window doesn't wait`
- "A puppy's socialization window opens early and closes at around 12 to 14 weeks — well before the standard vaccine schedule is complete. That creates a real tension: the weeks that matter most for a dog's lifelong temperament overlap with the weeks before full immunity. Waiting for the vaccine series to finish doesn't sidestep the risk — it means missing the window entirely."

### 3. AVSAB standout band
**Layout:** navy band with a 4px coral left border running the full height; 680px column inside.
- H2 (yellow): `What the veterinary science says`
- "The American Veterinary Society of Animal Behavior has taken a clear position: for most puppies, thoughtful early socialization should begin well before the vaccine series is complete. In their view, behavioral problems — not infectious disease — are the leading cause of death for dogs under three years old, and the fear and reactivity of under-socialization are what lead so many dogs to be given up or put down. Under-socialization, statistically, is the more dangerous path."

### 4. What "responsible" means in practice
**Layout:** back to cream, 680px column. Heading, lead line, a coral-marker bulleted list, a closing
line, a pull-quote, then a CTA button.
- H2 (coral): `What "responsible" means in practice`
- Lead: "Responsible early exposure isn't the dog park. It means:"
- Bullets:
  - "Controlled, chosen settings — not places where dogs of unknown vaccination status may have been."
  - "Healthy, known dogs only — never unfamiliar dogs whose history we can't verify."
  - "Avoiding high-risk surfaces where disease tends to linger."
  - "Following our veterinarian's guidance on the partial protection a puppy already carries during this period."
- "Done this way, the world becomes a classroom without becoming a hazard."
- Pull-quote: "This is the heart of how we raise calm puppies: not by keeping them sheltered until it's convenient, but by bringing them into the world carefully, at the age when it does the most good."
- CTA (coral button): `See the full PuppyQ approach →` → `/our-program`

> The AVSAB claims here are paraphrased with no citation link, while `/our-program` links the
> position statement PDF directly.

---

# Page 12 — Contact *(not in nav)*

- **Route:** `/contact` · **Files:** `app/contact/page.tsx`, `app/contact/ContactForm.tsx`
- **Title:** `Contact | Adams Farm Labradoodles`
- **Description:** "Reach out to Adams Farm Labradoodles — Greensboro, NC. Start the conversation about our Australian Labradoodle puppies."
- **Shared components:** Nav, Footer, PageHero
- **Linked from:** footer ×2, and CTAs on nearly every page. Not in the nav — flag F1.

### 1. Hero (PageHero)
- Eyebrow: `Get in touch` · H1: `Contact Adams Farm`
- Intro: "Questions about an available puppy, the waitlist, or our program? Send us a message — we respond within 1–2 business days."

### 2. Form + sidebar
**Layout:** cream, 1080px container, two columns at `md` — a flexible form column and a fixed 300px
sidebar. Collapses to one column on mobile with the form first.

**Form column** — H2 `Send us a message`, then four stacked fields, each with a small uppercase
navy label above a rounded white input. Required fields carry a red asterisk. Submit button is
coral, left-aligned.

| Label | Name | Type | Required | Placeholder |
|---|---|---|---|---|
| `Your name *` | name | text | Yes | `Full name` |
| `Email address *` | email | email | Yes | `you@example.com` |
| `Phone number` | phone | tel | No | `(optional)` |
| `Message *` | message | textarea, 6 rows | Yes | `Tell us about your household, what you're looking for, and your ideal timeline.` |

- Button: `Send Message`; while submitting: `Sending…` (disabled, dimmed)
- Error state: "Something went wrong — please try again or call us directly at `336-338-8660`."
- Success state replaces the whole form with a green-tinted panel: `✓`, H3 `Message received!`, body "Thank you for reaching out. We'll read your message personally and get back to you within 1–2 business days."

**Sidebar** — two sand-coloured rounded cards.

Card 1, `Contact info`: `Phone` → `336-338-8660` (`tel:3363388660`) · `Location` → `Greensboro, NC` ·
`Accreditation` → `ALAA Gold Paw Accredited`

Card 2, `What happens next` — numbered list with small navy circles:
1. "We read every message personally"
2. "We'll reach out within 1–2 business days"
3. "We'll learn about your home and lifestyle"
4. "If it's a good fit, we'll add you to the waitlist"

> Page-specific flags: C3 (needs SMTP credentials or every submission errors), F1 (absent from nav),
> G4 (`tel:` format differs from the rest of the site). The form posts to `/api/contact` and has no
> spam protection field.

---

# Page 13 — Puppies *(not in nav; footer only)*

- **Route:** `/puppies2` · **File:** `app/puppies2/page.tsx`
- **Title:** `Puppies | Adams Farm Labradoodles`
- **Description:** "Current, planned, and past Australian Labradoodle litters from Adams Farm Labradoodles in Greensboro, NC."
- **Shared components:** Nav, Footer, PageHero
- **Data:** static, from `src/data/litters.ts`
- **Linked from:** footer "Puppies" and "See available puppies"; `/our-program` closing CTA.

### 1. Hero (PageHero)
- Eyebrow: `Our Litters` · H1: `Puppies`
- Intro: "Our current litter, upcoming plans, and every litter we've raised — not just the puppies available today."

### 2. Current Litter — `#current-litter`
**Layout:** white, 1160px. Intro block capped at 640px, then a 1 / 2 / 3-column grid of navy puppy
cards (3:4 photo above a text block with name, collar, and two pills), then a coral CTA.

- Eyebrow: `Current Litter`
- H2: `Spring 2026 Litter`
- Meta: `Sire: Tarheel's Knox · Dam: Legend Manor's Holly · Born May 18, 2026`
- Italic note: `Bred in partnership with Legend Manor Labradoodles`
- Cards: **Stitch** · Blue Collar · `Male` · `Adopted` — **Jumba** · Red Collar · `Male` · `Available`
- Card image alts: the puppy's name
- CTA: `Reserve a Puppy` → `/contact`
- Conditional line when nothing is available (not currently shown, one puppy remains): "All puppies from our current litter are spoken for. `Join our waitlist` for the next one."

> Tutu, Angel, David, and Lilo are `reserved` and deliberately held back from the grid, so the page
> shows 2 of the litter's 6 puppies. See also flag G5 — the H2 uses `title`, not the
> `displayTitle` "Lilo & Stitch May Litter" the home page uses.

### 3. Planned Litters — `#planned`
**Layout:** cream panel. Heading block, then a single dashed-border panel with centred text.
- Eyebrow: `Planned Litters` · H2: `What's Ahead`
- Panel: "No litters currently planned. Check back soon, or `contact us` to join our waitlist."

> This is an authored empty state, but it reads as unfinished next to the home page's "Our litters
> are small and spots fill quickly."

### 4. Past Litters — `#past-litters`
**Layout:** white. Heading block, then a single stacked column of bordered cards capped at 760px.
Each card: pairing as an H3 on the left with the date right-aligned in coral, then a comma-separated
list of puppy names.

- Eyebrow: `Past Litters` · H2: `Our Track Record`
- Body: "A look back at every litter we've raised, newest first."
- **Silas × Winnie** · February 24, 2026 — Chelsea, Madison, Tori, Hudson, Toffi, Miklo
- **Silas × Macy** · February 4, 2026 — Coral, Deb, Marlin, Dory, Nemo
- **Silas × Winnie** · August 3, 2025 — Zola, Mili, Callie, River, Baby Peanut, Hazel, Snow White
- **Silas × Winnie** · January 8, 2025 — Maui, James Dean, Samson King, Elizabeth Taylor, Butters, Douglas Carter
- **Chewy × Winnie** · July 8, 2024 — Hudson, Jaxon, Macy, Grace, Luca, Finn, Caeli, Izzy, Lia

### 5. Waitlist band
**Layout:** navy, text left / outlined button right at `md`.
- Eyebrow: `Future litters` · H2: `Join the Waitlist`
- Body: "Our litters fill quickly. Getting on the list early means first access to puppy picks from upcoming litters."
- CTA: `Get on the list` → `/contact`

> Page-specific flags: A4 and A5 (Winnie, and sire × dam order), A6 (Cinderella, Paisley Rose, and
> Leia missing from the 2025 lists), F3 (the `2` in the URL).

---

# Page 14 — Forever Families *(gated, internal)*

- **Route:** `/forever-families` · **File:** `app/forever-families/page.tsx`
- **Title:** `Forever Families | Adams Farm Labradoodles`
- **Description:** "Internal owner contact list." · **Robots:** `index: false, follow: false, nocache: true`
- **Shared components:** Nav, Footer, SignInGate. **No PageHero.**
- **Rendering:** `force-dynamic`, never cached. Middleware adds `Cache-Control: no-store` and
  `X-Robots-Tag: noindex, nofollow`.

**Access:** the bare route always renders — signed out it shows `SignInGate` (documented under
Shared Components); any deeper `/forever-families/*` path redirects to the root when unauthenticated.
Sign-in is passwordless: an allowlisted address receives a magic link by email.

**Signed-in view:**
- Navy band: monospace eyebrow `Internal · Forever Families`, a `Sign out` button on the right, H1
  `Every family, one tap away.`, then "Signed in as {email}."
- Body section: "Family roster coming soon."

> Not a marketing page and not indexed, but it is publicly reachable and shares the site's nav and
> footer, so a visitor who lands on it sees a branded Adams Farm page. Its only content today is the
> "coming soon" line — flag C4 covers the env it needs.

---

# Appendix — Content sources

| Source | Feeds | Status |
|---|---|---|
| PuppyQ / Supabase (`lib/puppyq.ts`) | `/dams`, `/sires`, `/litters`, `/our-litters`, `/our-puppies` | Live; Production configured, Preview not (C2) |
| `src/data/litters.ts` | Home puppy cards, `/puppies2` | Static, hand-maintained |
| `src/data/dogs.ts` | — | **Unused** (D1) |
| `src/data/stats.ts` | — | **Unused** (D1) |
| `src/data/testimonials.ts` | — | **Unused** (D1) |
| Elfsight (external) | Home testimonials | Client-side only (C1) |
| Hardcoded in `app/page.tsx` | Home stats, pillars, trust cards, FAQ, partners | Static |
