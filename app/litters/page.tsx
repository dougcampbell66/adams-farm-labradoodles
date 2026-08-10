import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/app/components/PageHero";
import {
  getPuppyQ,
  pqCurrentLitters,
  pqLittersByYear,
  pqPuppyStanding,
  pqShortName,
  type PqLitter,
} from "@/lib/puppyq";

export const metadata: Metadata = {
  title: "Litters",
  description:
    "Every Adams Farm litter, newest first — each pairing with its dam, its sire, and every puppy on the record.",
};

// Live data, but not on every request — re-fetch at most every 5 minutes.
export const revalidate = 300;

function fmtDate(iso: string | null) {
  if (!iso) return "Date not recorded";
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function LitterCard({ litter, current }: { litter: PqLitter; current: boolean }) {
  const isCo = litter.type === "co-litter";
  const count = litter.puppies.length;
  const placed = litter.puppies.filter((p) => pqPuppyStanding(p) === "placed").length;

  return (
    <article className="flex flex-col overflow-hidden rounded-[18px] border border-warm-border bg-white shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
      {/* Provenance strip — who bred this litter, and when */}
      <div
        className={`flex items-center justify-between gap-3 px-6 py-3 ${
          isCo ? "bg-coral-dark" : "bg-navy"
        }`}
      >
        <span className="text-[0.65rem] font-extrabold uppercase tracking-[0.12em] text-cream">
          {isCo ? "Co-litter" : "Adams Farm"}
        </span>
        <span className="text-[0.72rem] font-extrabold text-cream/70">{litter.year ?? "—"}</span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-heading font-semibold text-[1.1rem] leading-snug text-navy">
          {/* The dam and sire each have their own page — link the pairing to both */}
          <Link href="/dams" className="hover:text-coral-dark transition-colors">
            {litter.damName ?? "Unknown dam"}
          </Link>
          <span className="text-navy/40"> × </span>
          <Link href="/sires" className="hover:text-coral-dark transition-colors">
            {litter.sireName ?? "Unknown sire"}
          </Link>
        </h3>
        <p className="mt-1.5 text-[0.85rem] text-muted">Born {fmtDate(litter.birthdate)}</p>

        {count > 0 && (
          <div className="mt-5">
            <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.1em] text-navy/50 mb-2.5">
              {count} {count === 1 ? "puppy" : "puppies"}
              {placed > 0 && ` · ${placed} placed`}
            </p>
            <div className="flex flex-wrap gap-2">
              {litter.puppies.map((p) => (
                <span
                  key={p.id}
                  className="rounded-lg bg-cream-panel px-3 py-1.5 text-[0.8rem] text-navy"
                >
                  <span className="font-semibold">{pqShortName(p)}</span>
                  {p.color && (
                    <span className="ml-1.5 text-[0.72rem] capitalize text-navy/50">
                      · {p.color}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        <p
          className={`mt-auto pt-5 text-[0.72rem] font-extrabold uppercase tracking-[0.08em] ${
            current ? "text-avail-text" : "text-muted"
          }`}
        >
          {current ? "In the program" : "Past litter"}
        </p>
      </div>
    </article>
  );
}

export default async function LittersPage() {
  const pq = await getPuppyQ();
  const groups = pqLittersByYear(pq.litters);
  const currentIds = new Set(pqCurrentLitters(pq).map((l) => l.id));

  const totalPuppies = pq.litters.reduce((n, l) => n + l.puppies.length, 0);
  const years = groups.map((g) => g.year).filter(Boolean);
  const firstYear = years.length ? Math.min(...years) : null;
  const latestYear = years.length ? Math.max(...years) : null;

  return (
    <main>
      <PageHero
        eyebrow="Litter Registry · Live"
        title={
          pq.litters.length > 0
            ? `${pq.litters.length} litter${pq.litters.length !== 1 ? "s" : ""}${
                firstYear ? `, ${firstYear}–${latestYear}` : ""
              }`
            : "Our Litters"
        }
        intro={
          pq.litters.length > 0
            ? `Every pairing on the record, newest first — litters Adams Farm bred outright and co-litters with partner programs. Each one names its dam, its sire, and all ${totalPuppies} puppies registered from them.`
            : "Every litter Adams Farm has bred — read live from the PuppyQ record."
        }
      />

      {groups.length === 0 ? (
        <section className="py-24 px-6 bg-cream">
          <div className="max-w-[560px] mx-auto text-center">
            <p className="text-[1rem] text-muted leading-[1.7]">
              Litter records are loading — check back shortly, or{" "}
              <Link href="/contact" className="text-navy underline">
                join our waitlist
              </Link>
              .
            </p>
          </div>
        </section>
      ) : (
        <section className="py-16 px-6 bg-cream">
          <div className="max-w-[1160px] mx-auto space-y-14">
            {groups.map((group) => (
              <div key={group.year}>
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="font-mono text-[0.9rem] font-extrabold tracking-[0.08em] text-navy">
                    {group.year || "Undated"}
                  </h2>
                  <span className="h-px flex-1 bg-warm-border" />
                  <span className="font-mono text-[0.7rem] uppercase tracking-wider text-muted">
                    {group.litters.length} {group.litters.length === 1 ? "litter" : "litters"}
                  </span>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {group.litters.map((litter) => (
                    <LitterCard
                      key={litter.id}
                      litter={litter}
                      current={currentIds.has(litter.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA band */}
      <section className="bg-navy py-14 px-6">
        <div className="max-w-[1160px] mx-auto flex items-center justify-between gap-8 flex-col md:flex-row">
          <div>
            <p className="text-[0.75rem] font-extrabold tracking-[0.14em] uppercase text-coral mb-1.5">
              Next litter
            </p>
            <h2 className="font-heading font-bold text-[clamp(1.5rem,3vw,1.9rem)] text-cream mb-2">
              Get on the waitlist
            </h2>
            <p className="text-[0.93rem] text-cream/70 max-w-[480px]">
              Our litters fill quickly. Reach out early for first access to upcoming picks.
            </p>
          </div>
          <Link
            href="/contact"
            className="shrink-0 border-[1.5px] border-white/45 text-cream font-extrabold py-[14px] px-7 rounded-lg text-[0.95rem] hover:border-cream transition-colors whitespace-nowrap"
          >
            Contact us
          </Link>
        </div>
      </section>
    </main>
  );
}
