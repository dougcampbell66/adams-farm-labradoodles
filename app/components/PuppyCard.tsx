import CardPhoto from "@/app/components/CardPhoto";
import {
  pqPuppyPhoto,
  pqPuppyStanding,
  pqShortName,
  type PqDog,
  type PqPuppyStanding,
  pqPhotoFrame,
} from "@/lib/puppyq";

const STANDING: Record<PqPuppyStanding, { label: string; cls: string }> = {
  available: { label: "Available", cls: "bg-avail-bg text-avail-text" },
  reserved: { label: "Reserved", cls: "bg-coral text-navy" },
  "in-program": { label: "Active", cls: "bg-avail-bg text-avail-text" },
  retained: { label: "Retained", cls: "bg-navy/80 text-cream" },
  placed: { label: "Adopted", cls: "bg-navy/80 text-cream" },
  unknown: { label: "On record", cls: "bg-navy/80 text-cream" },
};

/**
 * The puppy card — one layout on every site PawsQ builds (pawsq
 * DECISIONS-2026-10-24 P11–P12), Legend Manor's LivePuppyCard in Adams
 * Farm's colours: the photo at 3:4 (CardPhoto: filled, or shown whole when it
 * is a wide shot), with the status on its top-right corner; then call name,
 * then colour. Nothing else. This site has no page per dog, so the card is not a link.
 */
export default function PuppyCard({ puppy }: { puppy: PqDog }) {
  const name = pqShortName(puppy);
  const photo = pqPuppyPhoto(puppy);
  const s = STANDING[pqPuppyStanding(puppy)];
  return (
    <div className="bg-navy rounded-xl overflow-hidden">
      <div className={`relative aspect-[3/4] w-full ${photo ? "bg-cream" : "bg-photo-placeholder"}`}>
        {photo ? (
          <CardPhoto src={photo} alt={name} frame={pqPhotoFrame(puppy)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-tan text-[0.75rem] font-bold text-center px-4 leading-relaxed">
              Photo
              <br />
              coming soon
            </p>
          </div>
        )}
        <span
          className={`absolute right-0 top-0 px-2.5 py-1 text-[0.6rem] font-extrabold uppercase tracking-[0.07em] ${s.cls}`}
        >
          {s.label}
        </span>
      </div>
      <div className="p-4">
        <p className="font-heading text-[0.95rem] font-bold leading-snug text-cream">{name}</p>
        {puppy.color ? (
          <p className="mt-1 text-[0.75rem] text-cream/70 capitalize">{puppy.color}</p>
        ) : null}
      </div>
    </div>
  );
}
