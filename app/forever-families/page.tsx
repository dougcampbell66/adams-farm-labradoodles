import type { Metadata } from "next";
import { cookies } from "next/headers";
import { SignInGate, type SignInGateProps } from "@/app/components/SignInGate";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Forever Families",
  description: "Internal owner contact list.",
  robots: { index: false, follow: false, nocache: true },
};

// An internal contact list should always be current — no ISR caching.
export const dynamic = "force-dynamic";

export default async function ForeverFamiliesPage({
  searchParams,
}: {
  searchParams: Promise<SignInGateProps>;
}) {
  // Primary gate — runs before any data fetch. An unauthenticated visitor
  // never triggers any downstream queries.
  const email = await verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
  if (!email) return <SignInGate {...(await searchParams)} />;

  return (
    <>
      <section className="bg-navy px-6 py-10 text-cream sm:py-12">
        <div className="mx-auto max-w-[1160px]">
          <div className="mb-3 flex items-baseline justify-between gap-4">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-coral">
              Internal · Forever Families
            </p>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-cream/60 underline underline-offset-4 transition-colors hover:text-cream"
              >
                Sign out
              </button>
            </form>
          </div>
          <h1 className="font-heading text-[28px] font-semibold leading-tight sm:text-[36px]">
            Every family, one tap away.
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-cream/70">
            Signed in as <span className="text-cream">{email}</span>.
          </p>
        </div>
      </section>

      <section className="px-6 py-10 sm:py-12">
        <div className="mx-auto max-w-[1160px]">
          <p className="text-[15px] leading-relaxed text-charcoal/70">
            Family roster coming soon.
          </p>
        </div>
      </section>
    </>
  );
}
