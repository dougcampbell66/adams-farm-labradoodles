import Link from "next/link";
import PageHero from "@/app/components/PageHero";
import BreedingTier from "@/app/components/BreedingTier";
import { getPuppyQ, pqBreedingLines, pqOwnLitters, type PqParentEntry } from "@/lib/puppyq";

// Our Dogs — one page for the line's parents, a Dams section and a Sires
// section (pawsq DECISIONS-2026-11-06 R6, Legend Manor's layout). It was two
// pages, /dams and /sires; both still answer, showing this page with their
// own section first, as Legend Manor's do.
//
// Membership is unchanged: a dog appears only after producing a litter on the
// Adams Farm record (pqBreedingLines). Prospects wait for their first litter.

/** Sires the record knows only by name — outside studs with no dog row of their own. */
function OutsideStuds({ entries }: { entries: PqParentEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <section className="bg-navy py-12 md:py-16 px-6">
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


function SectionHead({ id, eyebrow, title, line }: { id: string; eyebrow: string; title: string; line: string }) {
  return (
    <div id={id} className="scroll-mt-24 border-t border-warm-border bg-white px-6 pt-12 md:pt-16">
      <div className="mx-auto max-w-[1160px]">
        <p className="mb-2 text-[0.72rem] font-extrabold uppercase tracking-[0.14em] text-coral-dark">{eyebrow}</p>
        <h2 className="font-heading text-[clamp(1.9rem,4vw,2.4rem)] font-bold leading-[1.15] text-navy">{title}</h2>
        <p className="mt-3 max-w-[620px] text-[0.98rem] leading-[1.65] text-muted">{line}</p>
      </div>
    </div>
  );
}

export default async function OurDogs({ first = "dams" }: { first?: "dams" | "sires" }) {
  const pq = await getPuppyQ();
  const { dams, sires } = pqBreedingLines(pq);
  const damCount = dams.producing.length + dams.retired.length;
  const sireCount = sires.producing.length + sires.retired.length + sires.nameOnly.length;
  // Only the litters registered to Adams Farm count (pqOwnLitters).
  const own = pqOwnLitters(pq);
  const totalPuppies = own.reduce((n, l) => n + l.puppies.length, 0);

  const damsBlock = (
    <div key="dams">
      <SectionHead
        id="dams"
        eyebrow={`Dams · ${damCount}`}
        title="Our Mothers"
        line="Every dam here has whelped a litter on the Adams Farm record."
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
    </div>
  );

  const siresBlock = (
    <div key="sires">
      <SectionHead
        id="sires"
        eyebrow={`Sires · ${sireCount}`}
        title="Our Fathers"
        line="Every sire here has fathered a litter on the Adams Farm record, hired studs included."
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
    </div>
  );

  return (
    <main>
      <PageHero
        eyebrow="Our Dogs"
        title="The Dams and Sires of the Line"
        intro={
          damCount + sireCount > 0
            ? `${damCount} ${damCount === 1 ? "mother" : "mothers"} and ${sireCount} ${
                sireCount === 1 ? "father" : "fathers"
              } behind ${own.length} ${own.length === 1 ? "litter" : "litters"} and ${totalPuppies} puppies on the Adams Farm record.`
            : "The mothers and fathers behind Adams Farm — every parent of a litter on our record."
        }
      >
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/dogs#dams"
            className="rounded-lg border border-white/25 px-5 py-3 text-[0.9rem] font-extrabold text-cream transition-colors hover:border-coral hover:text-coral"
          >
            Dams · {damCount}
          </Link>
          <Link
            href="/dogs#sires"
            className="rounded-lg border border-white/25 px-5 py-3 text-[0.9rem] font-extrabold text-cream transition-colors hover:border-coral hover:text-coral"
          >
            Sires · {sireCount}
          </Link>
        </div>
      </PageHero>

      {first === "sires" ? [siresBlock, damsBlock] : [damsBlock, siresBlock]}

      {damCount + sireCount === 0 && (
        <section className="py-24 px-6 bg-cream">
          <div className="max-w-[560px] mx-auto text-center">
            <p className="text-[1rem] text-muted leading-[1.7]">
              Dog records are loading — check back shortly, or{" "}
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
