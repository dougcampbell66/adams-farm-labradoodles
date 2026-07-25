// Build-time photo manifests for PuppyQ-backed pages.
// Scans public/images/dogs and public/images/puppies; files named
// <slug>.jpg or <slug>-<suffix>.jpg are matched by slug.
// Server-only (uses node:fs).

import fs from "node:fs";
import path from "node:path";

const IMG = /\.(jpe?g|png|webp|avif)$/i;

function scan(dir: string): Record<string, { primary: string; gallery: string[] }> {
  let files: string[] = [];
  try {
    files = fs.readdirSync(path.join(process.cwd(), "public", dir));
  } catch {
    return {};
  }

  const bySlug: Record<string, string[]> = {};
  for (const file of files) {
    if (!IMG.test(file)) continue;
    const base = file.replace(IMG, "");
    // slug is everything before the first hyphen-digit or "-main" suffix
    const slug = base.replace(/-(?:main|\d.*)$/, "");
    (bySlug[slug] ??= []).push(file);
  }

  const result: Record<string, { primary: string; gallery: string[] }> = {};
  for (const [slug, entries] of Object.entries(bySlug)) {
    const sorted = [...entries].sort((a, b) => a.localeCompare(b));
    const main = sorted.find((f) => f.includes("-main")) ?? sorted[0];
    const gallery = sorted.filter((f) => f !== main).map((f) => `/${dir}/${f}`);
    result[slug] = { primary: `/${dir}/${main}`, gallery };
  }
  return result;
}

const dogManifest = scan("images/dogs");
const puppyManifest = scan("images/puppies");

export function pqDogPhoto(slug: string): string | null {
  return dogManifest[slug]?.primary ?? null;
}
export function pqDogGallery(slug: string): string[] {
  return dogManifest[slug]?.gallery ?? [];
}
export function pqPuppyPhoto(slug: string): string | null {
  return puppyManifest[slug]?.primary ?? null;
}
