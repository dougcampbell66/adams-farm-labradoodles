import Link from "next/link";
import PuppyCard from "@/app/components/PuppyCard";
import {
  getPuppyQ,
  pqAvailablePuppies,
  pqCoBreeders,
  pqLitterTitle,
  pqParentHref,
  pqShortName,
  type PqDog,
  type PqLitter,
  type PuppyQ,
} from "@/lib/puppyq";

function fmtDate(iso: string | null) {
  if (!iso) return null;
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** A parent by call name, linked to its card on /dams or /sires when it has one. */
function Parent({ role, dog, name, pq }: { role: string; dog: PqDog | null; name: string | null; pq: PuppyQ }) {
  const label = dog ? pqShortName(dog) : (name ?? "Not recorded");
  const href = pqParentHref(dog, pq);
  return (
    <span className="text-[0.85rem] text-muted">
      <span className="text-[0.68rem] font-extrabold uppercase tracking-[0.1em] text-navy/50">{role} </span>
      {href ? (
        <Link href={href} className="font-extrabold text-navy underline-offset-4 hover:text-coral-dark hover:underline">
          {label} →
        </Link>
      ) : (
        <span className="font-extrabold text-navy">{label}</span>
      )}
    </span>
  );
}

/**
 * Available Puppies — the first section under the hero on the home page and
 * the Puppies page, laid out as Legend Manor's is (Douglas, 2026-10-24).
 *
 * The puppies listed Available (pqAvailablePuppies), litter by litter, oldest
 * litter first. Each litter is headed by its theme name (pqLitterTitle),
 * linked to the litter's page, with its dam and sire by call name, each
 * linked to its card; each puppy is a
 * card with its photo from the media table (a placeholder when it has none),
 * name, colour, sex when the record holds it — null on most rows and never
 * guessed from a name — and status.
 */
export default async function AvailablePuppies({
  heading,
}: {
  /** A heading under the section label; the Puppies page shows none. */
  heading?: string;
}) {
  const pq = await getPuppyQ();
  const entries = pqAvailablePuppies(pq);
  // pqAvailablePuppies is already oldest litter first; a Map keeps that order.
  const byLitter = new Map<string, { litter: PqLitter; puppies: PqDog[] }>();
  for (const { puppy, litter } of entries) {
    const group = byLitter.get(litter.id) ?? { litter, puppies: [] };
    group.puppies.push(puppy);
    byLitter.set(litter.id, group);
  }
  const groups = [...byLitter.values()];

  return (
    <section id="puppies" className="bg-white border-b border-line py-12 md:py-16">
      <div className="max-w-[1160px] mx-auto px-6">
        <div className="mb-8 max-w-[620px]">
          <p className="text-[0.75rem] font-extrabold tracking-[0.14em] uppercase text-coral-dark mb-2">
            Available Puppies{entries.length > 0 ? ` · ${entries.length}` : ""}
          </p>
          {heading ? (
            <h2 className="font-heading font-bold text-[clamp(1.7rem,3vw,1.95rem)] text-navy mb-2.5">
              {heading}
            </h2>
          ) : null}
          {groups.length === 0 ? (
            <p className="text-[0.95rem] text-muted leading-[1.65]">
              No puppies are available right now. Join the waitlist and we’ll reach out when the
              next litter arrives.
            </p>
          ) : null}
        </div>

        <div className="space-y-8">
          {groups.map(({ litter, puppies }) => (
            <div key={litter.id} className="rounded-[18px] border border-warm-border overflow-hidden">
              <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 border-b border-line bg-cream px-5 py-4 sm:px-6">
                <div>
                  <Link
                    href={`/litters/${litter.id}`}
                    className="font-heading font-bold text-[1.3rem] text-navy hover:text-coral-dark transition-colors"
                  >
                    {pqLitterTitle(litter)}
                  </Link>
                  {pqCoBreeders(litter, pq).length > 0 ? (
                    <p className="mt-0.5 text-[0.78rem] font-extrabold uppercase tracking-[0.08em] text-coral-dark">
                      Co-bred with {pqCoBreeders(litter, pq).join(" and ")}
                    </p>
                  ) : null}
                  <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1">
                    <Parent role="Dam" dog={litter.dam} name={litter.damName} pq={pq} />
                    <Parent role="Sire" dog={litter.sire} name={litter.sireName} pq={pq} />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[0.8rem] text-muted">
                    {litter.birthdate ? `Born ${fmtDate(litter.birthdate)} · ` : ""}
                    {puppies.length} available
                  </div>
                  <Link
                    href={`/litters/${litter.id}`}
                    className="mt-1 inline-block text-[0.85rem] font-extrabold text-navy border-b-[1.5px] border-coral pb-[2px] hover:text-coral-dark transition-colors"
                  >
                    View the litter →
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 p-5 sm:p-6">
                {puppies.map((puppy) => (
                <PuppyCard key={puppy.id} puppy={puppy} />
              ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Link
            href="/contact"
            className="inline-block bg-coral text-navy font-extrabold py-[14px] px-7 rounded-lg text-[0.95rem] hover:bg-coral-dark transition-colors"
          >
            {entries.length > 0 ? "Ask about a puppy" : "Join the Waitlist"}
          </Link>
        </div>
      </div>
    </section>
  );
}
