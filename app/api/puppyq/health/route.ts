// PuppyQ data-layer health check.
//
// Returns a small JSON status so we (and CI) can tell, from the *outside*,
// whether a given environment can actually read PuppyQ data. This is the guard
// for the failure we hit once: the code was fine, but the deployed environment
// was missing the Supabase env vars, so every PuppyQ page rendered empty.
//
// PRIVACY: this endpoint never returns the Supabase key. It returns only
// non-sensitive status — a boolean, row counts, the key *kind* ("secret" /
// "publishable" / "none"), and the already-public Supabase host. It is marked
// noindex so search engines don't list it.

import { NextResponse } from "next/server";
import { getPuppyQ } from "@/lib/puppyq";

// Always evaluate live against the current environment, never cached at build.
export const dynamic = "force-dynamic";

export async function GET() {
  const { diagnostics: d } = await getPuppyQ();

  const configured = d.keyKind !== "none" && !!d.url;
  const healthy =
    configured && d.orgId != null && d.dogRows > 0 && d.errors.length === 0;

  let supabaseHost: string | null = null;
  try {
    supabaseHost = d.url ? new URL(d.url).host : null;
  } catch {
    supabaseHost = null;
  }

  return NextResponse.json(
    {
      healthy,
      configured, // false ⇒ this environment is missing the Supabase env vars
      keyKind: d.keyKind, // "secret" | "publishable" | "none" — never the key itself
      supabaseHost, // public host only, never the key
      orgResolved: d.orgId != null,
      orgName: d.orgName,
      dogCount: d.dogRows,
      litterCount: d.litterRows,
      errors: d.errors,
      checkedAt: new Date().toISOString(),
    },
    {
      status: healthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    },
  );
}
