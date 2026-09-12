import DogPhoto from "@/app/components/DogPhoto";
import {
  type PqDog,
  type PqLitter,
  pqAvailability,
  pqPuppyPhoto,
  pqSex,
  pqShortName,
} from "@/lib/puppyq";

// One puppy, as a family sees it: the photo, the name, the collar or
// colour, and what can honestly be said about availability. Used by the
// home page's Available Puppies section and the featured litter on Our
// Puppies, so the two can never drift apart.
//
// The photo is the record's (lib/puppyq.ts, "Photos"); a puppy with none
// yet shows the same "coming soon" panel the parents' pages use, rather
// than a broken image or a borrowed one.
const BADGE: Record<NonNullable<ReturnType<typeof pqAvailability>>, { label: string; className: string }> = {
  available: { label: "Available", className: "bg-avail-bg text-avail-text" },
  reserved: { label: "Reserved", className: "bg-white/12 text-cream" },
  adopted: { label: "Adopted", className: "bg-white/12 text-cream/70" },
};

export default function PuppyCard({ puppy, litter }: { puppy: PqDog; litter: PqLitter }) {
  const photo = pqPuppyPhoto(puppy);
  const name = pqShortName(puppy);
  const sex = pqSex(puppy, [litter]);
  const availability = pqAvailability(puppy);
  const detail = [puppy.color].filter(Boolean).join(" · ");

  return (
    <div className="bg-navy rounded-xl overflow-hidden">
      <div className="relative aspect-[3/4] w-full bg-cream-panel">
        {photo ? (
          <DogPhoto src={photo} alt={name} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-photo-placeholder">
            <p className="text-tan text-[0.75rem] font-bold text-center px-4 leading-relaxed">
              Photo
              <br />
              coming soon
            </p>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 p-3.5">
        <span className="text-[0.85rem] font-extrabold text-cream">{name}</span>
        {detail ? (
          <span className="text-[0.7rem] text-cream/70 -mt-1.5 capitalize">{detail}</span>
        ) : null}
        <div className="flex items-center gap-1.5 flex-wrap">
          {sex ? (
            <span className="text-[0.65rem] uppercase tracking-[0.07em] px-2.5 py-[3px] rounded-full font-extrabold bg-white/12 text-cream">
              {sex}
            </span>
          ) : null}
          {availability ? (
            <span
              className={`text-[0.65rem] uppercase tracking-[0.07em] px-2.5 py-[3px] rounded-full font-extrabold ${BADGE[availability].className}`}
            >
              {BADGE[availability].label}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
