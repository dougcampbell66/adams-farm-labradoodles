// Passwordless auth for the internal pages: HMAC-signed tokens, no database.
//
// Two token kinds, both `<base64url(payload)>.<base64url(HMAC-SHA256)>`:
//   • purpose "login"   — emailed as a magic link, short-lived (15 min)
//   • purpose "session" — the cookie set once a login token is redeemed (7 d)
//
// The `purpose` field is signed along with everything else, so a login token
// can't be pasted in as a session cookie or vice versa.
//
// Everything here uses Web Crypto only (no Node built-ins) so the identical
// module works in edge middleware and in Node route handlers. That matters:
// the middleware and the page gate MUST agree on what a valid session is, and
// the only way to guarantee that is for both to call this same code.

export const SESSION_COOKIE = "af_session";

const LOGIN_TTL_MS = 15 * 60 * 1000; // 15 minutes
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export type Purpose = "login" | "session";

interface Payload {
  /** Subject — the allowlisted email address, normalized. */
  e: string;
  /** Expiry, epoch ms. */
  x: number;
  /** Random nonce, so two tokens for the same address never collide. */
  n: string;
  p: Purpose;
}

// ------------------------------------------------------------ base64url

function b64urlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(value: string): Uint8Array<ArrayBuffer> {
  const pad = value.length % 4 === 0 ? "" : "=".repeat(4 - (value.length % 4));
  const binary = atob(value.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const out = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

// ---------------------------------------------------------------- config

/** Emails permitted to request a link, lowercased. Empty means "nobody". */
export function allowlist(): string[] {
  return (process.env.ADAMS_FARM_ALLOWED_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isAllowed(email: string): boolean {
  return allowlist().includes(normalizeEmail(email));
}

/**
 * True only when the gate is fully configured. Callers treat false as "this
 * page is switched off" rather than "let everyone through" — it fails closed.
 */
export function isConfigured(): boolean {
  return Boolean(process.env.MAGIC_LINK_SECRET) && allowlist().length > 0;
}

/** Which half of the config is missing — for the operator-facing notice only. */
export function configProblem(): string | null {
  if (!process.env.MAGIC_LINK_SECRET) return "MAGIC_LINK_SECRET is not set";
  if (allowlist().length === 0) return "ADAMS_FARM_ALLOWED_EMAILS is empty";
  return null;
}

// ----------------------------------------------------------------- crypto

async function key(): Promise<CryptoKey> {
  const secret = process.env.MAGIC_LINK_SECRET;
  if (!secret) throw new Error("MAGIC_LINK_SECRET is not set");
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function sign(purpose: Purpose, email: string, ttlMs: number): Promise<string> {
  const nonce = b64urlEncode(crypto.getRandomValues(new Uint8Array(12)));
  const payload: Payload = {
    e: normalizeEmail(email),
    x: Date.now() + ttlMs,
    n: nonce,
    p: purpose,
  };
  const body = b64urlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const mac = await crypto.subtle.sign("HMAC", await key(), new TextEncoder().encode(body));
  return `${body}.${b64urlEncode(new Uint8Array(mac))}`;
}

/**
 * Returns the email the token attests to, or null if the signature is bad, the
 * purpose is wrong, the token is expired, or it's simply malformed.
 * crypto.subtle.verify does the comparison, so it isn't timing-sensitive.
 */
async function verify(purpose: Purpose, token: string | undefined): Promise<string | null> {
  if (!token) return null;

  const dot = token.indexOf(".");
  if (dot < 1) return null;
  const body = token.slice(0, dot);
  const mac = token.slice(dot + 1);

  let ok: boolean;
  try {
    ok = await crypto.subtle.verify(
      "HMAC",
      await key(),
      b64urlDecode(mac),
      new TextEncoder().encode(body),
    );
  } catch {
    return null;
  }
  if (!ok) return null;

  let payload: Payload;
  try {
    payload = JSON.parse(new TextDecoder().decode(b64urlDecode(body)));
  } catch {
    return null;
  }

  if (payload.p !== purpose) return null;
  if (typeof payload.x !== "number" || Date.now() > payload.x) return null;
  if (!payload.e) return null;

  // Re-check the allowlist at verification time so removing someone from
  // ADAMS_FARM_ALLOWED_EMAILS locks them out immediately.
  if (!isAllowed(payload.e)) return null;

  return payload.e;
}

// ------------------------------------------------------------------ api

export const createLoginToken = (email: string) => sign("login", email, LOGIN_TTL_MS);
export const verifyLoginToken = (token: string | undefined) => verify("login", token);

export const createSessionToken = (email: string) => sign("session", email, SESSION_TTL_MS);
export const verifySessionToken = (token: string | undefined) => verify("session", token);

export const SESSION_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000;
export const SESSION_TTL_DAYS = SESSION_TTL_MS / (24 * 60 * 60 * 1000);
export const LOGIN_TTL_MINUTES = LOGIN_TTL_MS / 60000;
