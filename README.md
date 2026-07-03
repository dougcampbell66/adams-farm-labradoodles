# Adams Farm Labradoodles

Static site built with Astro. Content lives in `src/content/` as Markdown files —
this is what you'll edit (directly, or by asking Claude Code) to add litters, dogs,
and testimonials. No CMS login needed.

## Local development

```
npm install
npm run dev
```

Visit http://localhost:4321

## Updating content

- **New litter**: add a file to `src/content/litters/`, copy the format of
  `bella-duke-2026.md`, change the details.
- **New dog (sire/dam)**: add a file to `src/content/dogs/`.
- **New testimonial**: add a file to `src/content/testimonials/`.
- **Photos**: drop image files into `public/images/...` and reference the path
  (e.g. `/images/litters/my-photo.jpg`) in the relevant Markdown file's frontmatter.

With Claude Code, this is as simple as describing the change in plain English —
e.g. "Add a new litter, Bella x Duke, born June 2026, 3 puppies available, here
are the photos" — and letting it create/edit the file and commit.

## Deploying

1. Push this repo to GitHub.
2. In Netlify: "Add new site" → "Import an existing project" → connect the
   GitHub repo.
3. Build command: `npm run build`, publish directory: `dist` (already set in
   `netlify.toml`, so Netlify should detect this automatically).
4. Netlify will assign a temporary `*.netlify.app` subdomain immediately —
   use this to review the live site before pointing the real domain at it.
5. Every push to the main branch auto-deploys.

## Contact form

The contact form on `/contact` uses Netlify's built-in form handling
(`data-netlify="true"`) — no third-party service or API key needed.
Submissions show up in your Netlify dashboard under Forms, and can be
forwarded to your email from there (Site settings → Forms → Form
notifications).

## Moving the domain later

When you're ready to move off Hostinger, update the domain's DNS to point at
Netlify (Site settings → Domain management → Add a domain), then remove the
DNS records from Hostinger. The `*.netlify.app` URL keeps working throughout,
so there's no downtime.
