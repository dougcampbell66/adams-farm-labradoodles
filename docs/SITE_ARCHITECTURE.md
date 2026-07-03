# Adams Farm Labradoodles — Site Architecture

## Sitemap

- **Home** — hero, trust strip (Gold Paw + pedigree snapshot), featured
  testimonial, current litter status
- **Our dogs** — breeding dogs, split into current breeding / retired once
  there are retired dogs to list
- **Puppies**
  - Current litters
  - Planned litters
  - Past litters (builds a track record over time — leading ALAA sites use
    this to show consistency, not just current inventory)
- **Our program** — replaces a generic "About": health testing standard,
  Gold Paw explanation in plain language, early neurological
  stimulation/socialization approach, home-raised environment
- **Testimonials**
- **FAQ**
- **Contact / puppy application** — see form note below
- **Footer (site-wide)** — ALAA Gold Paw badge + Member Breeder Number +
  valid date, location (Greensboro, NC), basic contact info

## Content collections (already scaffolded, schema only — no fake data)

- `dogs` — name, role (sire/dam), registered name/number (optional until
  provided), health testing fields (hips, elbows, eyes, EIC, PRA — all
  optional, populated only with real results), photo, bio
- `litters` — parents, birthdate, ready date, status (planned / available /
  reserved / past), puppy count, available count, photos, description
- `testimonials` — family name, year, quote, featured flag

All fields you haven't provided yet are simply left blank in the schema
rather than filled with placeholder text — nothing publishes until real data
replaces it.

## Contact vs. application

Leading ALAA sites (e.g. Draycot Meadows) use a full puppy application
rather than a short contact form — name, location, household situation,
experience with dogs, timing. This slows down casual inquiries and
surfaces serious ones. Two options:

1. Keep the simple contact form for now, add a full application later
2. Build the full application now (still just an extended Netlify form, no
   new infrastructure)

## Compliance checklist (ALAA requirements, not style choices)

- [ ] Gold Paw badge with current Member Breeder Number + valid date, footer
      + accreditation page
- [ ] Registered names/numbers for all breeding dogs
- [ ] Breed description per ALAA Grading Scheme for each breeding dog
- [ ] Litter disclosure if an outside stud isn't tested to the same Paw
      level

## Open decision

Contact form vs. full puppy application — which do you want to start with?
