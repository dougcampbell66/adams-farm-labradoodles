// PuppyQ smoke test — fails (exit 1) if the PuppyQ data is not displaying.
//
// It calls the /api/puppyq/health endpoint on a running/deployed site and
// asserts the data layer is actually returning dogs. This is the automated
// guard for the outage we hit: correct code, but the deployed environment was
// missing the Supabase env vars, so every PuppyQ page rendered empty.
//
// Usage:
//   node scripts/puppyq-smoke.mjs [baseUrl]
//   SMOKE_URL=https://your-site.vercel.app node scripts/puppyq-smoke.mjs
// Defaults to http://localhost:3000 when no URL is given.

const base = (process.argv[2] || process.env.SMOKE_URL || "http://localhost:3000").replace(/\/$/, "");
const url = `${base}/api/puppyq/health`;

try {
  const res = await fetch(url, { headers: { "cache-control": "no-cache" } });
  const body = await res.json().catch(() => ({}));

  console.log(`PuppyQ smoke → ${url}`);
  console.log(JSON.stringify(body, null, 2));

  const ok = res.ok && body.healthy === true && (body.dogCount ?? 0) > 0;
  if (!ok) {
    console.error("\n❌ FAIL: PuppyQ data is NOT displaying.");
    if (body.configured === false) {
      console.error(
        "   Cause: this environment is missing the Supabase env vars " +
          "(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY). See STATUS.md.",
      );
    } else if (Array.isArray(body.errors) && body.errors.length) {
      console.error("   Errors:", body.errors.join(" | "));
    }
    process.exit(1);
  }

  console.log(`\n✅ PASS: ${body.dogCount} dogs, ${body.litterCount} litters via "${body.keyKind}" key.`);
} catch (e) {
  console.error(`❌ FAIL: could not reach ${url}: ${e?.message ?? e}`);
  process.exit(1);
}
