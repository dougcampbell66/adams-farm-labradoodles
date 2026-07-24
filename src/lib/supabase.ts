// Supabase connection for the live PuppyQ data.
//
// PuppyQ is an independent program with its own multi-tenant database — Adams
// Farm is one organization in it, Legend Manor is another. Everything this site
// reads is filtered to the Adams Farm org id; see src/lib/adams-farm.ts.
//
// Two classes of key can reach the REST API:
//   • a *secret* key (SUPABASE_SERVICE_ROLE_KEY / SUPABASE_SECRET_KEY) — bypasses
//     RLS, server-only, never exposed to the browser;
//   • a *publishable* key (NEXT_PUBLIC_*) — safe in the browser, but only sees
//     rows an anon RLS policy explicitly exposes.
//
// We prefer the secret key and fall back to the publishable one, so the site
// still builds and renders (with an empty state) when only the public key is
// configured. Everything that consumes this module is a server component, so
// the secret key never reaches the client bundle.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? null;

const secretKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || null;

const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  null;

/** Which key we ended up using — surfaced in the page's debug panel. */
export type KeyKind = "secret" | "publishable" | "none";

export const supabaseKeyKind: KeyKind = secretKey
  ? "secret"
  : publishableKey
    ? "publishable"
    : "none";

export const supabaseUrl = url;

/** Server-side client, or null when the environment isn't configured. */
export function getSupabase(): SupabaseClient | null {
  const key = secretKey ?? publishableKey;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
