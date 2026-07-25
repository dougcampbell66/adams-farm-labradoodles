import type { Metadata } from "next";
import { cookies } from "next/headers";
import { FamilyRoster } from "@/components/FamilyRoster";
import { SignInGate, type SignInGateProps } from "@/components/SignInGate";
import { getForeverFamilies } from "@/lib/forever-families";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Forever Families",
  description: "Internal owner contact list, live from the PuppyQ record.",
  // This page prints real people's names, emails, and phone numbers. The route
  // itself is public, so at minimum keep it out of search results.
  robots: { index: false, follow: false, nocache: true },
};

// An internal contact list is only useful if it is current — no ISR caching.
export const dynamic = "force-dynamic";

export default async function ForeverFamiliesPage({
  searchParams,
}: {
  searchParams: Promise<SignInGateProps>;
}) {
  // The gate, and the only one that matters. The middleware checks the same
  // token, but this is what stands between an anonymous request and a query for
  // real people's phone numbers — so it runs BEFORE getForeverFamilies(), and
  // an unauthenticated visitor never causes that query to happen at all.
  const email = await verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
  if (!email) return <SignInGate {...(await searchParams)} />;

  const { families, diagnostics: d } = await getForeverFamilies();

  return (
    <>
      <section className="bg-navy px-[6vw] py-10 text-paper sm:py-12">
        <div className="mx-auto max-w-page">
          <div className="mb-3 flex items-baseline justify-between gap-4">
            <p className="smallcaps text-excite">Internal · Forever Families</p>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="smallcaps text-paper/70 underline underline-offset-4 transition-colors hover:text-paper"
              >
                Sign out
              </button>
            </form>
          </div>
          <h1 className="font-serif text-[32px] font-medium leading-tight sm:text-[40px]">
            Every family, one tap away.
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-paper/75">
            Everyone who owns an Adams Farm dog, live from PuppyQ. Tap Email, Call, or Text to
            reach a family straight from your phone.
            {d.unreachable > 0 ? (
              <>
                {" "}
                <span className="text-excite">
                  {d.unreachable} of {d.totalRows} {d.unreachable === 1 ? "has" : "have"} no email
                  or phone on file.
                </span>
              </>
            ) : null}
          </p>
        </div>
      </section>

      <section className="px-[6vw] py-10 sm:py-12">
        <div className="mx-auto max-w-page">
          {families.length > 0 ? (
            <FamilyRoster families={families} />
          ) : (
            <EmptyState diagnostics={d} />
          )}
        </div>
      </section>
    </>
  );
}

/**
 * Shown when the live query returns nothing. Prints exactly what was asked of
 * Supabase so an empty list can be told apart from a broken one.
 */
function EmptyState({
  diagnostics: d,
}: {
  diagnostics: Awaited<ReturnType<typeof getForeverFamilies>>["diagnostics"];
}) {
  const rows: [string, string][] = [
    ["Project", d.url ?? "(not configured)"],
    ["Key in use", d.keyKind === "none" ? "(none found)" : `${d.keyKind} key`],
    ["Organization", d.orgId],
    ["Rows returned", String(d.totalRows)],
  ];

  return (
    <div className="border border-rule bg-white p-6">
      <p className="smallcaps text-feelings-deep">No contacts returned</p>
      <h2 className="mt-2 font-serif text-[24px] font-medium text-navy">
        The contact list came back empty.
      </h2>
      <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-slate">
        This page lists contacts with an <code className="font-mono text-[13px]">owner</code>{" "}
        relationship to a dog belonging to Adams Farm. Either no adoptions are recorded in PuppyQ
        yet, or the query could not read them.
      </p>

      <dl className="mt-6 grid gap-x-6 gap-y-2 sm:grid-cols-[160px_1fr]">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="font-mono text-[11px] uppercase tracking-wider text-slate-dim">{k}</dt>
            <dd className="break-all font-mono text-[12px] text-slate">{v}</dd>
          </div>
        ))}
      </dl>

      <pre className="mt-5 overflow-x-auto border border-rule bg-paper-2 p-4 font-mono text-[11px] leading-relaxed text-slate">
        {d.query}
      </pre>

      {d.errors.length > 0 ? (
        <ul className="mt-5 space-y-2 border-t border-rule pt-4 text-[13px] leading-relaxed text-slate">
          {d.errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
