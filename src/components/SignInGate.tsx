import { PawDots } from "@/components/PawDots";
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
 * The signed-out view of /forever-families: one email field, no password and no
 * username. Rendered in place of the roster rather than at a separate /login
 * route, so the URL that gets bookmarked is the URL you land on.
 */
export function SignInGate({ sent, error, retry }: SignInGateProps) {
  const problem = configProblem();
  const retrySeconds = Number.parseInt(retry ?? "", 10);

  return (
    <section className="px-[6vw] py-16 sm:py-24">
      <div className="mx-auto max-w-[420px]">
        <PawDots />
        <p className="smallcaps mt-5 text-feelings-deep">Internal · Forever Families</p>
        <h1 className="mt-3 font-serif text-[30px] font-medium leading-tight text-navy">
          Enter your email to get access.
        </h1>

        {problem ? (
          // Operator-facing, and safe to show: it names an unset variable, never
          // a value, and the gate is closed regardless of what's on screen.
          <div className="mt-6 border border-feelings/40 bg-paper-2 px-4 py-3">
            <p className="text-[14px] leading-relaxed text-slate">
              Sign-in isn&apos;t configured yet, so this page is closed to everyone.
            </p>
            <p className="mt-2 font-mono text-[12px] leading-relaxed text-slate-dim">{problem}</p>
          </div>
        ) : sent ? (
          // Shown for any submitted address, allowlisted or not — the page must
          // not become a way to find out who has access.
          <div className="mt-6 border border-rule bg-white p-5">
            <p className="text-[15px] leading-relaxed text-slate">
              If that address has access, a sign-in link is on its way. It expires in{" "}
              {LOGIN_TTL_MINUTES} minutes.
            </p>
            <p className="mt-3 text-[13px] leading-relaxed text-slate-dim">
              Check spam if it doesn&apos;t arrive within a minute or two.
            </p>
            <a
              href="/forever-families"
              className="smallcaps mt-4 inline-block text-navy underline underline-offset-4"
            >
              Use a different address
            </a>
          </div>
        ) : (
          <>
            <p className="mt-3 text-[15px] leading-relaxed text-slate">
              No password. Enter your address and we&apos;ll email you a link that signs you in
              for {SESSION_TTL_DAYS} days.
            </p>

            {error === "expired" ? (
              <p className="mt-5 border border-feelings/40 bg-paper-2 px-4 py-3 text-[14px] leading-relaxed text-slate">
                That link has expired. Request a fresh one below.
              </p>
            ) : null}

            {error === "rate" ? (
              <p className="mt-5 border border-feelings/40 bg-paper-2 px-4 py-3 text-[14px] leading-relaxed text-slate">
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
                className="w-full border border-rule bg-white px-3 py-3 text-[15px] text-charcoal outline-none placeholder:text-slate-dim/70 focus:border-navy"
              />
              <button
                type="submit"
                className="smallcaps mt-3 w-full bg-navy px-4 py-3 text-paper transition-colors hover:bg-navy-deep"
              >
                Email me a sign-in link
              </button>
            </form>
          </>
        )}

        <p className="mt-8 text-[12px] leading-relaxed text-slate-dim">
          This page is for Adams Farm staff. Access is limited to a small list of addresses.
        </p>
      </div>
    </section>
  );
}
