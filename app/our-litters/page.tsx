import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/app/components/PageHero";
import {
  getPuppyQ,
  pqLittersByYear,
  pqCurrentLitters,
  pqName,
  type PqLitter,
} from "@/lib/puppyq";

export const metadata: Metadata = {
  title: "Our Litters",
  description:
    "Every Adams Farm Labradoodles litter on record — read live from PuppyQ, newest first.",
};

export const revalidate = 300;

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

function LitterCard({ litter, current }: { litter: PqLitter; current: boolean }) {
  const total = litter.puppies.length;
  const placed = litter.puppies.filter((p) => (p.status ?? "").toLowerCase() === "placed").length;

  return (
    <div className="bg-white border border-warm-border rounded-xl px-6 py-5 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
      {current && (
        <span className="inline-block mb-3 text-[0.65rem] font-extrabold uppercase tracking-[0.08em] px-2.5 py-[3px] rounded-full bg-avail-bg text-avail-text">
          Current
        </span>
      )}
      <div className="flex justify-between items-baseline gap-4 flex-wrap mb-2">
        <h3 className="font-heading font-semibold text-[1.1rem] text-navy">
          {litter.sireName ?? "Unknown sire"} × {litter.damName ?? "Unknown dam"}
        </h3>
        <span className="text-[0.72rem] font-extrabold tracking-[0.06em] uppercase text-coral-dark whitespace-nowrap">
          {litter.year ?? "—"}
        </span>
      </div>
      <p className="text-[0.85rem] text-muted mb-3">{fmtDate(litter.birthdate)}</p>
      <div className="flex items-center gap-4 text-[0.82rem]">
        <span className="text-charcoal">
          <span className="font-extrabold">{total}</span> {total === 1 ? "puppy" : "puppies"}
        </span>
        {placed > 0 && (
          <span className="text-muted">{placed} placed</span>
        )}
        {litter.type === "co-litter" && (
          <span className="italic text-muted">Co-litter</span>
        )}
      </div>
    </div>
  );
}


export default async function OurLittersPage() {
  const pq = await getPuppyQ();
  const groups = pqLittersByYear(pq.litters);
  const currentIds = new Set(pqCurrentLitters(pq).map((l) => l.id));
  const { litters } = pq;

  const totalPuppies = litters.reduce((n, l) => n + l.puppies.length, 0);
  const years = groups.map((g) => g.year).filter(Boolean);
  const firstYear = years.length ? Math.min(...years) : null;
  const latestYear = years.length ? Math.max(...years) : null;

  return (
    <main>
      <PageHero
        eyebrow="Litter Registry · Live"
        title={
          litters.length > 0
            ? `${litters.length} litter${litters.length !== 1 ? "s" : ""}${firstYear ? `, ${firstYear}–${latestYear}` : ""}`
            : "Our Litters"
        }
        intro={
          litters.length > 0
            ? `${totalPuppies} puppies placed across ${litters.length} litter${litters.length !== 1 ? "s" : ""} — every pairing Adams Farm has bred, including co-litters with partner programs.`
            : "Every litter Adams Farm has bred — read live from the PuppyQ record."
        }
      />

      {litters.length === 0 ? (
        <section className="py-16 px-6 bg-cream">
          <div className="max-w-[640px] mx-auto text-center">
            <p className="text-muted">Litter records are loading — check back shortly.</p>
          </div>
        </section>
      ) : (
        <section className="py-16 px-6 bg-cream">
          <div className="max-w-[1080px] mx-auto space-y-14">
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
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        <div className="max-w-[1080px] mx-auto flex items-center justify-between gap-8 flex-col md:flex-row">
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
