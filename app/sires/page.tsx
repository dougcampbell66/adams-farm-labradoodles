import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/app/components/PageHero";
import BreedingTier from "@/app/components/BreedingTier";
import { getPuppyQ, pqBreedingLines, type PqParentEntry } from "@/lib/puppyq";

export const metadata: Metadata = {
  title: "Sires",
  description:
    "The sires of Adams Farm Labradoodles — every father of a litter on the Adams Farm record, hired studs included.",
};

// Live data, but not on every request — re-fetch at most every 5 minutes.
export const revalidate = 300;

/** Sires the record knows only by name — outside studs with no dog row of their own. */
function OutsideStuds({ entries }: { entries: PqParentEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <section className="bg-navy py-16 px-6">
      <div className="max-w-[1160px] mx-auto">
        <p className="text-[0.72rem] font-extrabold tracking-[0.14em] uppercase text-coral mb-2">
          Outside Studs · {entries.length}
        </p>
        <h2 className="font-heading font-bold text-[clamp(1.6rem,3vw,1.9rem)] text-cream">
          Hired for the Pairing, Part of the Line
        </h2>
        <p className="mt-3 max-w-[620px] text-[0.95rem] leading-[1.65] text-cream/70">
          Studs from other programs whose litters are on the Adams Farm record. Their genes are
          in the line; their programs deserve the credit.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((e) => (
            <div
              key={e.name}
              className="flex flex-col rounded-[18px] border border-white/20 p-6"
            >
              <p className="font-heading font-semibold text-[1.05rem] leading-tight text-cream">
                {e.name}
              </p>
              <p className="mt-2 text-[0.7rem] font-extrabold uppercase tracking-[0.08em] text-cream/60">
                {e.litterCount} {e.litterCount === 1 ? "litter" : "litters"} sired here
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function SiresPage() {
  const pq = await getPuppyQ();
  // Membership rule: a sire appears here only after fathering a litter on the
  // Adams Farm record — our own studs and hired ones alike.
  const { sires } = pqBreedingLines(pq);
  const total = sires.producing.length + sires.retired.length + sires.nameOnly.length;
  const totalPuppies = pq.litters.reduce((n, l) => n + l.puppies.length, 0);

  return (
    <main>
      <PageHero
        eyebrow="Sires"
        title="Our Fathers"
        intro={
          total > 0
            ? `Every sire here has fathered a litter on the Adams Farm record — ${total} ${
                total === 1 ? "father" : "fathers"
              } across ${pq.litters.length} ${
                pq.litters.length === 1 ? "litter" : "litters"
              } and ${totalPuppies} puppies.`
            : "The fathers behind Adams Farm — every sire of a litter on our record."
        }
      />

      <BreedingTier
        label={`Active · ${sires.producing.length} ${sires.producing.length === 1 ? "Sire" : "Sires"}`}
        heading="In the Program"
        entries={sires.producing}
        pq={pq}
      />

      <BreedingTier
        label={`Foundation & Retired · ${sires.retired.length}`}
        heading="The Sires Who Built the Line"
        blurb="Retired from breeding, but never from the record."
        entries={sires.retired}
        pq={pq}
        tone="panel"
      />

      <OutsideStuds entries={sires.nameOnly} />

      {total === 0 && (
        <section className="py-24 px-6 bg-cream">
          <div className="max-w-[560px] mx-auto text-center">
            <p className="text-[1rem] text-muted leading-[1.7]">
              Sire records are loading — check back shortly, or{" "}
              <Link href="/contact" className="text-navy underline">
                get in touch
              </Link>
              .
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
