// Supabase connection for the live PuppyQ data (project `lcxnthexywhoyjrsaynk`).
//
// Two classes of key:
//   • secret key (SUPABASE_SERVICE_ROLE_KEY) — bypasses RLS, server-only
//   • publishable key (NEXT_PUBLIC_*) — safe in the browser, sees only anon-policy rows
//
// We prefer the secret key and fall back to the publishable one. Everything that
// consumes this module is a server component.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? null;

const secretKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || null;

const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  null;

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
