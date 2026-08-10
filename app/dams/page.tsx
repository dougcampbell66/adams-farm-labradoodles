import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/app/components/PageHero";
import BreedingTier from "@/app/components/BreedingTier";
import { getPuppyQ, pqBreedingLines } from "@/lib/puppyq";

export const metadata: Metadata = {
  title: "Dams",
  description:
    "The dams of Adams Farm Labradoodles — every mother of a litter on the Adams Farm record.",
};

// Live data, but not on every request — re-fetch at most every 5 minutes.
export const revalidate = 300;

export default async function DamsPage() {
  const pq = await getPuppyQ();
  // Membership rule: a dam appears here only after whelping a litter on the
  // Adams Farm record. Prospects wait for their first litter.
  const { dams } = pqBreedingLines(pq);
  const total = dams.producing.length + dams.retired.length;
  const totalPuppies = pq.litters.reduce((n, l) => n + l.puppies.length, 0);

  return (
    <main>
      <PageHero
        eyebrow="Dams"
        title="Our Mothers"
        intro={
          total > 0
            ? `Every dam here has whelped a litter on the Adams Farm record — ${total} ${
                total === 1 ? "mother" : "mothers"
              } across ${pq.litters.length} ${
                pq.litters.length === 1 ? "litter" : "litters"
              } and ${totalPuppies} puppies.`
            : "The mothers behind Adams Farm — every dam who has whelped a litter on our record."
        }
      />

      <BreedingTier
        label={`Active · ${dams.producing.length} ${dams.producing.length === 1 ? "Dam" : "Dams"}`}
        heading="In the Program"
        entries={dams.producing}
        pq={pq}
      />

      <BreedingTier
        label={`Foundation & Retired · ${dams.retired.length}`}
        heading="The Dams Who Built the Line"
        blurb="Retired from breeding, but never from the record — including foundation mothers who came to us from partner programs."
        entries={dams.retired}
        pq={pq}
        tone="panel"
      />

      {total === 0 && (
        <section className="py-24 px-6 bg-cream">
          <div className="max-w-[560px] mx-auto text-center">
            <p className="text-[1rem] text-muted leading-[1.7]">
              Dam records are loading — check back shortly, or{" "}
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
