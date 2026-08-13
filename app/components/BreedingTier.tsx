import ParentCard from "@/app/components/ParentCard";
import type { PqParentEntry, PuppyQ } from "@/lib/puppyq";

/**
 * One tier of a breeding-lines page — active, retired, and so on. Renders
 * nothing when the tier is empty, so /dams and /sires never show a heading
 * over a blank grid.
 */
export default function BreedingTier({
  label,
  heading,
  blurb,
  entries,
  pq,
  tone = "cream",
}: {
  label: string;
  heading?: string;
  blurb?: string;
  entries: PqParentEntry[];
  pq: PuppyQ;
  tone?: "cream" | "panel";
}) {
  if (entries.length === 0) return null;

  return (
    <section
      className={`py-16 px-6 ${
        tone === "panel" ? "bg-panel-alt border-t border-sand-line" : "bg-cream"
      }`}
    >
      <div className="max-w-[1160px] mx-auto">
        <p className="text-[0.72rem] font-extrabold tracking-[0.14em] uppercase text-coral-dark mb-2">
          {label}
        </p>
        {heading && (
          <h2 className="font-heading font-bold text-[clamp(1.6rem,3vw,1.9rem)] text-navy">
            {heading}
          </h2>
        )}
        {blurb && (
          <p className="mt-3 max-w-[620px] text-[0.95rem] leading-[1.65] text-muted">{blurb}</p>
        )}
        <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {entries.map((e) =>
            e.dog ? (
              <ParentCard key={e.dog.id} dog={e.dog} pq={pq} outside={e.outside} />
            ) : null,
          )}
        </div>
      </div>
    </section>
  );
}
