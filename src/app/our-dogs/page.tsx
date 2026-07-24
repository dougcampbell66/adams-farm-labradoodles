import type { Metadata } from "next";
import { DogCard } from "@/components/DogCard";
import { getDogs, type Dog, type Diagnostics } from "@/lib/adams-farm";

export const metadata: Metadata = {
  title: "Our Dogs",
  description:
    "The Adams Farm dams and sires, live from the PuppyQ record.",
};

export const revalidate = 300;

function Tier({
  label,
  heading,
  blurb,
  dogs,
  tone = "paper",
}: {
  label: string;
  heading: string;
  blurb: string;
  dogs: Dog[];
  tone?: "paper" | "paper-2";
}) {
  if (dogs.length === 0) return null;

  return (
    <section className={`section ${tone === "paper-2" ? "bg-paper-2" : "bg-paper"}`}>
      <div className="mx-auto max-w-page">
        <p className="smallcaps text-feelings-deep">
          {label} · {dogs.length}
        </p>
        <h2 className="mt-3 font-serif text-[30px] font-medium leading-tight text-navy sm:text-[38px]">
          {heading}
        </h2>
        <p className="mt-4 max-w-[62ch] text-[15.5px] leading-relaxed text-slate">{blurb}</p>

        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {dogs.map((dog) => (
            <DogCard key={dog.id} dog={dog} />
          ))}
        </div>
      </div>
    </section>
  );
}

function EmptyState({ diagnostics: d }: { diagnostics: Diagnostics }) {
  return (
    <section className="section bg-paper">
      <div className="mx-auto max-w-page">
        <p className="smallcaps text-feelings-deep">No records returned</p>
        <h2 className="mt-3 font-serif text-[28px] font-medium text-navy">
          The live record came back empty.
        </h2>
        <div className="mt-7 border border-rule bg-paper-2 p-6 text-[13px] leading-relaxed text-slate">
          <p>
            Organization <code className="text-charcoal">{d.orgId}</code> · key in use:{" "}
            <code className="text-charcoal">{d.keyKind}</code>
          </p>
          {d.errors.length > 0 ? (
            <ul className="mt-3 space-y-1.5 border-t border-rule pt-3">
              {d.errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default async function OurDogsPage() {
  const { active, guardian, retired, diagnostics } = await getDogs();
  const total = active.length + guardian.length + retired.length;

  return (
    <>
      <section className="bg-navy text-paper">
        <div className="mx-auto max-w-page px-[6vw] py-16 sm:py-20">
          <p className="smallcaps text-excite">Our Dogs</p>
          <h1 className="mt-4 max-w-[18ch] font-serif text-[36px] font-medium leading-[1.12] sm:text-[48px]">
            The dogs behind every litter.
          </h1>
          <p className="mt-6 max-w-[58ch] text-[16px] leading-relaxed text-paper/75">
            Health-tested, individually known, and recorded in full. This page reads directly from
            our PuppyQ record, so it stays current as the program does.
          </p>
        </div>
      </section>

      {total === 0 ? <EmptyState diagnostics={diagnostics} /> : null}

      <Tier
        label="In the program"
        heading="Our dams and sires."
        blurb="The dogs producing current and upcoming litters."
        dogs={active}
      />
      <Tier
        label="Guardian homes"
        heading="Living with their families."
        blurb="Program dogs raised by local guardian families — pets first, breeding dogs second."
        dogs={guardian}
        tone="paper-2"
      />
      <Tier
        label="Retired"
        heading="The dogs who built the program."
        blurb="Retired from breeding, still on the record."
        dogs={retired}
        tone={guardian.length > 0 ? "paper" : "paper-2"}
      />
    </>
  );
}
