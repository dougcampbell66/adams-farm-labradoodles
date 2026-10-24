import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/app/components/PageHero";
import AvailablePuppies from "@/app/components/AvailablePuppies";
import LitterRow from "@/app/components/LitterRow";
import { getPuppyQ, pqPastLitters } from "@/lib/puppyq";

export const metadata: Metadata = {
  title: "Puppies",
  description:
    "Adams Farm's available puppies, litter by litter, and every litter before them.",
};

export const revalidate = 300;

const steps = [
  { n: "01", t: "Read the record", d: "Start with our dams and sires — the line is the program." },
  { n: "02", t: "Reach out", d: "Tell us about your home and what you're looking for; we'll talk through what's coming." },
  { n: "03", t: "Reserve a place", d: "When a litter fits, reserve your place and follow it from pairing to homecoming." },
];

// The Puppies page, laid out as Legend Manor's is — the layout the ALAA
// breeder sites follow (Douglas, 2026-10-24): Available Puppies first,
// litter by litter with each litter's dam and sire, then every litter with
// no Available puppy left as a one-row card, then how placement works.
// /our-puppies redirects here (next.config.ts).
export default async function PuppiesPage() {
  const pq = await getPuppyQ();
  const past = pqPastLitters(pq);

  return (
    <main>
      <PageHero
        eyebrow="Puppies"
        title="Puppies, by the litter."
        intro="Adams Farm litters — raised underfoot, loved from day one."
      />

      <AvailablePuppies />

      {past.length > 0 && (
        <section className="py-12 md:py-16 px-6 bg-cream">
          <div className="max-w-[1160px] mx-auto">
            <p className="text-[0.72rem] font-extrabold tracking-[0.14em] uppercase text-coral mb-2">
              Past Litters · {past.length}
            </p>
            <h2 className="font-heading font-bold text-[clamp(1.6rem,3vw,1.9rem)] text-navy mb-8">
              Our Track Record
            </h2>
            <div className="space-y-2">
              {past.map((l) => (
                <LitterRow key={l.id} litter={l} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-12 md:py-16 px-6 bg-white border-t border-sand-line">
        <div className="max-w-[1160px] mx-auto">
          <p className="text-[0.72rem] font-extrabold tracking-[0.14em] uppercase text-coral mb-2">
            How placement works
          </p>
          <h2 className="font-heading font-bold text-[clamp(1.6rem,3vw,1.9rem)] text-navy max-w-[640px]">
            Three steps to an Adams Farm puppy.
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="border-t-2 border-navy pt-5">
                <div className="text-[0.8rem] font-extrabold text-coral-dark">{s.n}</div>
                <h3 className="mt-2 font-heading font-bold text-[1.15rem] text-navy">{s.t}</h3>
                <p className="mt-2 text-[0.95rem] leading-[1.65] text-muted">{s.d}</p>
              </div>
            ))}
          </div>
          <Link
            href="/contact"
            className="mt-10 inline-block bg-navy text-cream font-extrabold py-[14px] px-7 rounded-lg text-[0.95rem] hover:bg-navy-hover transition-colors"
          >
            Get on the list
          </Link>
        </div>
      </section>
    </main>
  );
}
