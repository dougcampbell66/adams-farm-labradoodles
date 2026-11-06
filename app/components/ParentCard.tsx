import Link from "next/link";
import CardPhoto from "@/app/components/CardPhoto";
import {
  pqBreedingLabel,
  pqDogHref,
  pqStatusWord,
  pqLittersProduced,
  pqOffspring,
  pqPhoto,
  pqRegisteredName,
  pqRole,
  type PqDog,
  type PuppyQ,
  pqPhotoFrame,
} from "@/lib/puppyq";

/**
 * Portrait card for the /dams and /sires grids — the Legend Manor breeding-line
 * card in Adams Farm's palette. These pages show a whole side of the program at
 * a glance, so the card stays narrow enough for a four-across grid.
 */
export default function ParentCard({
  dog,
  pq,
  outside = false,
}: {
  dog: PqDog;
  pq: PuppyQ;
  outside?: boolean;
}) {
  const name = dog.call_name?.trim() || dog.registered_name?.trim() || "Unnamed dog";
  // Most live rows have no call name, so the heading already *is* the registered
  // name — don't print it twice underneath itself.
  const registered = pqRegisteredName(dog);
  const subtitle = registered && registered !== name ? registered : null;
  const role = pqRole(dog, pq.litters);
  const photo = pqPhoto(dog);
  const litters = pqLittersProduced(dog, pq.litters).length;
  const offspring = pqOffspring(dog, pq.litters).length;
  // The breeding dial, as in the app (Active, Retired …); else its own status.
  const badge = pqBreedingLabel(dog, pq) ?? pqStatusWord(dog.status);
  const active = badge === "Active";
  const meta = [dog.breed, dog.color].filter(Boolean).join(" · ");
  const href = pqDogHref(dog, pq);

  return (
    // id kept so an old /dams#dog-<id> link still lands on the card; the
    // card itself opens the dog's own page (R4).
    <div
      id={`dog-${dog.id}`}
      className="relative flex scroll-mt-24 flex-col overflow-hidden rounded-[18px] border border-warm-border bg-white"
    >
      <div className={`relative aspect-[3/4] w-full ${photo ? "bg-cream" : "bg-photo-placeholder"}`}>
        {photo ? (
          <CardPhoto src={photo} alt={name} frame={pqPhotoFrame(dog)} />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-4 text-center text-[0.75rem] font-bold leading-relaxed text-tan">
            Photo
            <br />
            coming soon
          </div>
        )}

        <span className="absolute left-0 top-0 px-2.5 py-[5px] text-[0.62rem] font-extrabold uppercase tracking-[0.08em] bg-navy/85 text-cream">
          {role}
        </span>

        {badge && (
          <span
            className={`absolute right-0 top-0 px-2.5 py-[5px] text-[0.62rem] font-extrabold uppercase tracking-[0.08em] ${
              active ? "bg-avail-bg text-avail-text" : "bg-charcoal/80 text-cream"
            }`}
          >
            {badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-heading font-semibold text-[1.05rem] leading-tight text-navy">
          {href ? (
            <Link href={href} className="after:absolute after:inset-0 hover:text-coral-dark">
              {name}
            </Link>
          ) : (
            name
          )}
        </h3>
        {subtitle && (
          <p className="mt-1 text-[0.75rem] italic leading-snug text-navy/55">{subtitle}</p>
        )}
        {meta && <p className="mt-1 text-[0.8rem] capitalize text-muted">{meta}</p>}
        {outside && (
          <p className="mt-2 text-[0.68rem] font-extrabold uppercase tracking-[0.1em] text-coral-dark">
            Partner program
          </p>
        )}
        {litters > 0 && (
          <p className="mt-auto pt-4 text-[0.75rem] text-muted">
            <span className="font-extrabold text-body-strong">{litters}</span>{" "}
            {litters === 1 ? "litter" : "litters"} ·{" "}
            <span className="font-extrabold text-body-strong">{offspring}</span> offspring
          </p>
        )}
      </div>
    </div>
  );
}
