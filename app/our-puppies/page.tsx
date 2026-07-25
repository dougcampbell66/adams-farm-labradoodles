import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/app/components/PageHero";
import {
  getPuppyQ,
  pqCurrentLitters,
  pqPastLitters,
  pqPuppyStanding,
  pqName,
  pqShortName,
  type PqLitter,
} from "@/lib/puppyq";

export const metadata: Metadata = {
  title: "Our Puppies",
  description:
    "Current and past Adams Farm Labradoodle litters — read live from the PuppyQ record.",
};

export const revalidate = 300;

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

function PuppyGrid({ litter }: { litter: PqLitter }) {
  const available = litter.puppies.filter((p) => pqPuppyStanding(p) === "in-program");
  const placed = litter.puppies.filter((p) => pqPuppyStanding(p) === "placed");

  return (
    <div>
      <div className="mb-5">
        <h2 className="font-heading font-bold text-[1.5rem] text-navy mb-1">
          {litter.sireName ?? "Unknown sire"} × {litter.damName ?? "Unknown dam"}
        </h2>
        <p className="text-[0.9rem] text-muted">
          Born {fmtDate(litter.birthdate)}
          {litter.type === "co-litter" && (
            <span className="ml-2 italic">· Co-litter</span>
          )}
        </p>
      </div>

      {available.length > 0 ? (
        <>
          <p className="text-[0.75rem] font-extrabold uppercase tracking-[0.1em] text-coral-dark mb-3">
            Available · {available.length}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {available.map((p) => (
              <div key={p.id} className="bg-navy rounded-xl p-4">
                <p className="text-[0.95rem] font-extrabold text-cream">{pqShortName(p)}</p>
                {p.color && (
                  <p className="text-[0.75rem] text-cream/60 mt-0.5 capitalize">{p.color}</p>
                )}
                <span className="mt-2 inline-block text-[0.65rem] uppercase tracking-[0.07em] px-2 py-[3px] rounded-full font-extrabold bg-avail-bg text-avail-text">
                  Available
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-[0.9rem] text-muted mb-4">
          All puppies from this litter are spoken for.
        </p>
      )}

      {placed.length > 0 && (
        <>
          <p className="text-[0.75rem] font-extrabold uppercase tracking-[0.1em] text-navy/50 mb-3">
            Placed · {placed.length}
          </p>
          <div className="flex flex-wrap gap-2">
            {placed.map((p) => (
              <span key={p.id} className="bg-cream-panel text-charcoal text-[0.8rem] px-3 py-1.5 rounded-lg">
                {pqShortName(p)}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}


export default async function OurPuppiesPage() {
  const pq = await getPuppyQ();
  const current = pqCurrentLitters(pq);
  const past = pqPastLitters(pq);

  return (
    <main>
      <PageHero
        eyebrow="Our Puppies"
        title="Puppies"
        intro="Current and past litters from Adams Farm — read live from the PuppyQ record."
      />

      {/* Current litters */}
      <section className="py-16 px-6 bg-cream">
        <div className="max-w-[1080px] mx-auto">
          <p className="text-[0.75rem] font-extrabold tracking-[0.14em] uppercase text-coral-dark mb-2">
            Current Litter{current.length !== 1 ? "s" : ""}
          </p>
          <h2 className="font-heading font-bold text-[clamp(1.6rem,3vw,1.9rem)] text-navy mb-10">
            {current.length > 0 ? "Available Now" : "No puppies currently available"}
          </h2>

          {current.length > 0 ? (
            <div className="flex flex-col gap-14">
              {current.map((l) => <PuppyGrid key={l.id} litter={l} />)}
            </div>
          ) : (
            <div className="border-[1.5px] border-dashed border-warm-border rounded-xl px-7 py-9 text-center max-w-[560px]">
              <p className="text-[1rem] text-muted leading-[1.7]">
                No puppies currently available. Check back soon, or{" "}
                <Link href="/contact" className="text-navy underline">
                  join our waitlist
                </Link>{" "}
                to be first for the next litter.
              </p>
            </div>
          )}

          <div className="mt-10">
            <Link
              href="/contact"
              className="inline-block bg-coral text-navy font-extrabold py-[14px] px-7 rounded-lg text-[0.95rem] hover:bg-coral-dark transition-colors"
            >
              Reserve a Puppy
            </Link>
          </div>
        </div>
      </section>

      {/* Past litters */}
      {past.length > 0 && (
        <section className="py-16 px-6 bg-warm-sand border-t border-warm-border">
          <div className="max-w-[1080px] mx-auto">
            <p className="text-[0.75rem] font-extrabold tracking-[0.14em] uppercase text-coral-dark mb-2">
              Past Litters
            </p>
            <h2 className="font-heading font-bold text-[clamp(1.6rem,3vw,1.9rem)] text-navy mb-10">
              Our Track Record
            </h2>
            <div className="flex flex-col gap-12">
              {past.map((l) => <PuppyGrid key={l.id} litter={l} />)}
            </div>
          </div>
        </section>
      )}

      {/* Waitlist band */}
      <section className="bg-navy py-16 px-6">
        <div className="max-w-[1080px] mx-auto flex items-center justify-between gap-8 flex-col md:flex-row">
          <div>
            <p className="text-[0.75rem] font-extrabold tracking-[0.14em] uppercase text-coral mb-1.5">
              Future litters
            </p>
            <h2 className="font-heading font-bold text-[clamp(1.6rem,3vw,1.9rem)] text-cream mb-2">
              Join the Waitlist
            </h2>
            <p className="text-[0.93rem] text-cream/70 max-w-[480px]">
              Our litters fill quickly. Getting on the list early means first access to puppy picks.
            </p>
          </div>
          <Link
            href="/contact"
            className="shrink-0 border-[1.5px] border-white/45 text-cream font-extrabold py-[14px] px-7 rounded-lg text-[0.95rem] hover:border-cream transition-colors whitespace-nowrap"
          >
            Get on the list
          </Link>
        </div>
      </section>
    </main>
  );
}
