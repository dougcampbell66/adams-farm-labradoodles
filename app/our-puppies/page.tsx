import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/app/components/PageHero";
import {
  getPuppyQ,
  pqCurrentLitters,
  pqName,
  pqPastLitters,
  pqPuppyOffered,
  pqPuppyStanding,
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
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * One litter. A featured (current) card lists only the puppies the record
 * offers, each with its standing — the page is for puppies a family can ask
 * about, so a retained or placed puppy is not on it (Douglas, 2026-10-24). A
 * past card is the track record and lists the litter as it was.
 */
function LitterCard({
  litter,
  featured = false,
}: {
  litter: PqLitter;
  featured?: boolean;
}) {
  const puppies = featured ? litter.puppies.filter(pqPuppyOffered) : litter.puppies;
  const damLabel = litter.dam
    ? pqName(litter.dam)
    : litter.damName ?? "Unknown dam";
  const sireLabel = litter.sire
    ? pqName(litter.sire)
    : litter.sireName ?? "Unknown sire";

  return (
    <div
      className={`rounded-[20px] p-8 ${
        featured ? "bg-navy text-cream" : "bg-panel-alt"
      }`}
    >
      {/* Pairing */}
      <div className="mb-5">
        <p
          className={`text-[0.7rem] font-extrabold uppercase tracking-[0.12em] mb-1 ${
            featured ? "text-coral" : "text-coral"
          }`}
        >
          {litter.type === "co-litter" ? "Co-litter" : "Litter"}
        </p>
        <h2
          className={`font-heading font-bold text-[1.4rem] leading-snug ${
            featured ? "text-cream" : "text-navy"
          }`}
        >
          {damLabel} × {sireLabel}
        </h2>
        <p
          className={`text-[0.85rem] mt-1 ${
            featured ? "text-cream/70" : "text-navy/60"
          }`}
        >
          Born {fmtDate(litter.birthdate)}
        </p>
      </div>

      {/* Puppies */}
      {puppies.length > 0 && (
        <div>
          <p
            className={`text-[0.68rem] font-extrabold uppercase tracking-[0.1em] mb-3 ${
              featured ? "text-cream/60" : "text-navy/50"
            }`}
          >
            {puppies.length} {featured ? "available" : `pup${puppies.length !== 1 ? "s" : ""}`}
          </p>
          <div className="flex flex-wrap gap-2">
            {puppies.map((p) => (
              <div
                key={p.id}
                className={`rounded-lg px-3.5 py-2 text-[0.83rem] ${
                  featured
                    ? "bg-cream/10 text-cream"
                    : "bg-navy/8 text-navy"
                }`}
              >
                <span className="font-semibold">{pqShortName(p)}</span>
                {p.color && (
                  <span
                    className={`ml-1.5 text-[0.75rem] capitalize ${
                      featured ? "text-cream/55" : "text-navy/50"
                    }`}
                  >
                    · {p.color}
                  </span>
                )}
                {featured && pqPuppyStanding(p) === "reserved" && (
                  <span className="ml-1.5 text-[0.75rem] text-coral">· Reserved</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default async function OurPuppiesPage() {
  const pq = await getPuppyQ();

  // Current: every litter still offering a puppy, oldest first. The rest —
  // newest first, as getPuppyQ() sorts them — are the track record.
  const current = pqCurrentLitters(pq);
  const past = pqPastLitters(pq);

  return (
    <main>
      <PageHero
        eyebrow="Our Puppies"
        title="Puppies"
        intro="Adams Farm litters — raised underfoot, loved from day one."
      />

      {/* Current / featured litter */}
      <section className="py-12 md:py-16 px-6 bg-cream">
        <div className="max-w-[1080px] mx-auto">
          <p className="text-[0.72rem] font-extrabold tracking-[0.14em] uppercase text-coral mb-2">
            Available Puppies
          </p>
          <h2 className="font-heading font-bold text-[clamp(1.6rem,3vw,1.9rem)] text-navy mb-8">
            Current Program
          </h2>

          {current.length > 0 ? (
            <div className="space-y-6">
              {current.map((l) => (
                <LitterCard key={l.id} litter={l} featured />
              ))}
            </div>
          ) : (
            <div className="border-[1.5px] border-dashed border-warm-border rounded-xl px-7 py-9 text-center max-w-[540px]">
              <p className="text-[1rem] text-navy/60 leading-[1.7]">
                No puppies are available right now. Check back soon, or{" "}
                <Link href="/contact" className="text-navy underline">
                  join our waitlist
                </Link>
                .
              </p>
            </div>
          )}

          <div className="mt-8">
            <Link
              href="/contact"
              className="inline-block bg-navy text-cream font-extrabold py-[14px] px-7 rounded-lg text-[0.95rem] hover:bg-navy-hover transition-colors"
            >
              Inquire About Puppies
            </Link>
          </div>
        </div>
      </section>

      {/* Past litters */}
      {past.length > 0 && (
        <section className="py-12 md:py-16 px-6 bg-white border-t border-sand-line">
          <div className="max-w-[1080px] mx-auto">
            <p className="text-[0.72rem] font-extrabold tracking-[0.14em] uppercase text-coral mb-2">
              Past Litters
            </p>
            <h2 className="font-heading font-bold text-[clamp(1.6rem,3vw,1.9rem)] text-navy mb-10">
              Our Track Record
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {past.map((l) => (
                <LitterCard key={l.id} litter={l} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Waitlist band */}
      <section className="bg-navy py-12 md:py-16 px-6">
        <div className="max-w-[1080px] mx-auto flex items-center justify-between gap-8 flex-col md:flex-row">
          <div>
            <p className="text-[0.72rem] font-extrabold tracking-[0.14em] uppercase text-coral mb-1.5">
              Future litters
            </p>
            <h2 className="font-heading font-bold text-[clamp(1.6rem,3vw,1.9rem)] text-cream mb-2">
              Join the Waitlist
            </h2>
            <p className="text-[0.93rem] text-cream/65 max-w-[460px]">
              Our litters fill quickly. Getting on the list early means first
              access to puppy picks.
            </p>
          </div>
          <Link
            href="/contact"
            className="shrink-0 border-[1.5px] border-white/40 text-cream font-extrabold py-[14px] px-7 rounded-lg text-[0.95rem] hover:border-white/80 transition-colors whitespace-nowrap"
          >
            Get on the list
          </Link>
        </div>
      </section>
    </main>
  );
}
