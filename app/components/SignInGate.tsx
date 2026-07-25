import { LOGIN_TTL_MINUTES, SESSION_TTL_DAYS, configProblem } from "@/lib/auth";

/** "in 45 seconds" / "in 3 minutes" — a raw second count reads badly past a minute. */
function waitLabel(seconds: number): string {
  if (seconds <= 90) return `${Math.max(seconds, 1)} seconds`;
  return `${Math.ceil(seconds / 60)} minutes`;
}

export interface SignInGateProps {
  /** Set after a link request — shows the "check your email" panel instead. */
  sent?: string;
  /** "expired" (dead link) or "rate" (too many requests). */
  error?: string;
  /** Seconds to wait, when `error` is "rate". */
  retry?: string;
}

/**
 * The signed-out view of /forever-families: one email field, no password.
 * Rendered in place of the content rather than at a separate /login route,
 * so the URL someone bookmarks is the URL they land on.
 */
export function SignInGate({ sent, error, retry }: SignInGateProps) {
  const problem = configProblem();
  const retrySeconds = Number.parseInt(retry ?? "", 10);

  return (
    <section className="px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-[420px]">
        <p className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-coral">
          Internal · Forever Families
        </p>
        <h1 className="font-heading text-[28px] font-semibold leading-tight text-navy sm:text-[32px]">
          Enter your email to get access.
        </h1>

        {problem ? (
          <div className="mt-6 rounded-lg border border-coral/30 bg-coral/5 px-4 py-3">
            <p className="text-[14px] leading-relaxed text-charcoal">
              Sign-in isn&apos;t configured yet, so this page is closed to everyone.
            </p>
            <p className="mt-2 font-mono text-[12px] leading-relaxed text-charcoal/70">
              {problem}
            </p>
          </div>
        ) : sent ? (
          <div className="mt-6 rounded-lg border border-warm-border bg-white p-5 shadow-sm">
            <p className="text-[15px] leading-relaxed text-charcoal">
              If that address has access, a sign-in link is on its way. It expires in{" "}
              {LOGIN_TTL_MINUTES} minutes.
            </p>
            <p className="mt-3 text-[13px] leading-relaxed text-charcoal/60">
              Check spam if it doesn&apos;t arrive within a minute or two.
            </p>
            <a
              href="/forever-families"
              className="mt-4 inline-block font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-coral underline underline-offset-4"
            >
              Use a different address
            </a>
          </div>
        ) : (
          <>
            <p className="mt-3 text-[15px] leading-relaxed text-charcoal/80">
              No password. Enter your address and we&apos;ll email you a link that signs you in
              for {SESSION_TTL_DAYS} days.
            </p>

            {error === "expired" ? (
              <p className="mt-5 rounded-lg border border-coral/30 bg-coral/5 px-4 py-3 text-[14px] leading-relaxed text-charcoal">
                That link has expired. Request a fresh one below.
              </p>
            ) : null}

            {error === "rate" ? (
              <p className="mt-5 rounded-lg border border-coral/30 bg-coral/5 px-4 py-3 text-[14px] leading-relaxed text-charcoal">
                A link was requested for that address very recently. Check your inbox — and if
                nothing arrived, try again in{" "}
                {waitLabel(Number.isFinite(retrySeconds) ? retrySeconds : 60)}.
              </p>
            ) : null}

            <form action="/api/auth/request" method="POST" className="mt-6">
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoFocus
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full rounded-lg border border-warm-border bg-white px-3 py-3 text-[15px] text-navy outline-none placeholder:text-charcoal/40 focus:border-coral focus:ring-2 focus:ring-coral/20"
              />
              <button
                type="submit"
                className="mt-3 w-full rounded-lg bg-coral px-4 py-3 font-mono text-[12px] font-extrabold uppercase tracking-[0.14em] text-navy transition-colors hover:bg-coral-dark"
              >
                Email me a sign-in link
              </button>
            </form>
          </>
        )}

        <p className="mt-8 text-[12px] leading-relaxed text-charcoal/50">
          This page is for Adams Farm staff. Access is limited to a small list of addresses.
        </p>
      </div>
    </section>
  );
}
