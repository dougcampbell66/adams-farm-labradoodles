import type { Metadata } from "next";
import Image from "next/image";
import PageHero from "@/app/components/PageHero";
import {
  getPuppyQ,
  pqDogTiers,
  pqSex,
  pqName,
  pqRole,
  pqPhoto,
  pqGallery,
  type PqDog,
  type PuppyQ,
} from "@/lib/puppyq";

export const metadata: Metadata = {
  title: "Our Dogs",
  description:
    "Meet the Adams Farm breeding dogs — health-tested, ALAA registered Australian Labradoodles raised in loving homes.",
};

export const revalidate = 300;

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function DogCard({
  dog,
  pq,
  compact = false,
}: {
  dog: PqDog;
  pq: PuppyQ;
  compact?: boolean;
}) {
  const photo = pqPhoto(dog);
  const gallery = pqGallery(dog);
  const role = pqRole(dog, pq.litters);

  if (compact) {
    return (
      <div className="bg-cream rounded-[18px] p-6 flex gap-6 flex-wrap md:flex-nowrap items-start">
        <div className="relative w-full md:w-[160px] h-[200px] shrink-0 rounded-[12px] overflow-hidden bg-sand-line">
          {photo ? (
            <Image
              src={photo}
              alt={pqName(dog)}
              fill
              className="object-cover object-top"
              sizes="160px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-placeholder-muted text-xs">
              No photo yet
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-heading font-semibold text-navy text-[1.2rem] mb-1">
            {pqName(dog)}
          </h3>
          <p className="text-[0.75rem] text-navy/60 mb-3 font-extrabold uppercase tracking-wider">
            {role}
          </p>
          <div className="grid grid-cols-2 gap-x-5 gap-y-1.5 text-[0.83rem]">
            {dog.birthdate && (
              <div>
                <span className="block font-extrabold text-[0.62rem] uppercase tracking-wider text-navy/50 mb-0.5">
                  Born
                </span>
                <span className="text-body-strong">{fmtDate(dog.birthdate)}</span>
              </div>
            )}
            {dog.color && (
              <div>
                <span className="block font-extrabold text-[0.62rem] uppercase tracking-wider text-navy/50 mb-0.5">
                  Color
                </span>
                <span className="text-body-strong capitalize">{dog.color}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-panel-alt rounded-[20px] p-8 flex gap-8 flex-wrap md:flex-nowrap">
      {/* Photo */}
      <div className="relative w-full md:w-[240px] h-[300px] shrink-0 rounded-[14px] overflow-hidden bg-sand-line">
        {photo ? (
          <Image
            src={photo}
            alt={pqName(dog)}
            fill
            className="object-cover object-top"
            sizes="240px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-placeholder-muted text-sm">
            No photo yet
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-[220px]">
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h2 className="font-heading font-semibold text-navy text-[1.7rem] leading-tight">
              {pqName(dog)}
            </h2>
            <span className="text-[0.68rem] font-extrabold uppercase tracking-wider px-2 py-[3px] rounded-full bg-navy/10 text-navy">
              {role}
            </span>
          </div>
          {dog.registered_name &&
            dog.registered_name.trim() !== dog.call_name?.trim() && (
              <p className="text-[0.83rem] text-navy/55 italic">
                {dog.registered_name}
              </p>
            )}
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[0.88rem] mb-5">
          {dog.birthdate && (
            <div>
              <span className="block font-extrabold text-[0.68rem] uppercase tracking-wider text-navy/50 mb-0.5">
                Born
              </span>
              <span className="text-body-strong">{fmtDate(dog.birthdate)}</span>
            </div>
          )}
          {dog.color && (
            <div>
              <span className="block font-extrabold text-[0.68rem] uppercase tracking-wider text-navy/50 mb-0.5">
                Color
              </span>
              <span className="text-body-strong capitalize">{dog.color}</span>
            </div>
          )}
          {dog.sex && (
            <div>
              <span className="block font-extrabold text-[0.68rem] uppercase tracking-wider text-navy/50 mb-0.5">
                Sex
              </span>
              <span className="text-body-strong capitalize">{dog.sex}</span>
            </div>
          )}
          {dog.breed && (
            <div className="col-span-2">
              <span className="block font-extrabold text-[0.68rem] uppercase tracking-wider text-navy/50 mb-0.5">
                Breed
              </span>
              <span className="text-body-strong">{dog.breed}</span>
            </div>
          )}
        </div>

        {gallery.length > 0 && (
          <div className="flex gap-3 flex-wrap">
            {gallery.map((src, i) => (
              <div
                key={i}
                className="relative w-14 h-14 rounded-[8px] overflow-hidden bg-sand-line"
              >
                <Image
                  src={src}
                  alt={`${pqName(dog)} photo ${i + 2}`}
                  fill
                  className="object-cover object-top"
                  sizes="56px"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default async function OurDogsPage() {
  const pq = await getPuppyQ();
  const tiers = pqDogTiers(pq);

  // Dogs with a litter_id are puppies born in a litter — they are placed dogs, not
  // retained breeding stock. Filter them out so they don't appear as "Retained."
  const retainedStock = tiers.retained.filter((d) => d.litter_id === null);

  const hasActive = tiers.active.length > 0;
  const hasRetired = tiers.retired.length > 0;
  const hasRetained = retainedStock.length > 0;

  return (
    <main>
      <PageHero
        eyebrow="Our Dogs"
        title="Meet the Dogs"
        intro="The hearts behind Adams Farm — health-tested, ALAA registered Australian Labradoodles raised in our home."
      />

      {/* Active breeding dogs */}
      {hasActive && (
        <section className="py-16 px-6 bg-cream">
          <div className="max-w-[1080px] mx-auto">
            <p className="text-[0.72rem] font-extrabold tracking-[0.14em] uppercase text-coral mb-2">
              Active Breeding Dogs · {tiers.active.length}
            </p>
            <h2 className="font-heading font-bold text-[clamp(1.6rem,3vw,1.9rem)] text-navy mb-10">
              Our Breeding Program
            </h2>
            <div className="flex flex-col gap-8">
              {tiers.active.map((dog) => (
                <DogCard key={dog.id} dog={dog} pq={pq} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Retained young stock (true retained — no birth litter in PuppyQ) */}
      {hasRetained && (
        <section className="py-14 px-6 bg-white border-t border-sand-line">
          <div className="max-w-[1080px] mx-auto">
            <p className="text-[0.72rem] font-extrabold tracking-[0.14em] uppercase text-coral mb-2">
              Retained · {retainedStock.length}
            </p>
            <h2 className="font-heading font-bold text-[clamp(1.4rem,3vw,1.7rem)] text-navy mb-8">
              Next Generation
            </h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {retainedStock.map((dog) => (
                <DogCard key={dog.id} dog={dog} pq={pq} compact />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Retired producers */}
      {hasRetired && (
        <section className="py-14 px-6 bg-panel-alt border-t border-sand-line">
          <div className="max-w-[1080px] mx-auto">
            <p className="text-[0.72rem] font-extrabold tracking-[0.14em] uppercase text-coral mb-2">
              Retired · {tiers.retired.length}
            </p>
            <h2 className="font-heading font-bold text-[clamp(1.4rem,3vw,1.7rem)] text-navy mb-8">
              Alumni
            </h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {tiers.retired.map((dog) => (
                <DogCard key={dog.id} dog={dog} pq={pq} compact />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty state */}
      {!hasActive && !hasRetained && !hasRetired && (
        <section className="py-24 px-6 bg-cream">
          <div className="max-w-[560px] mx-auto text-center">
            <p className="text-[1rem] text-navy/60">
              Dog profiles coming soon. Check back shortly.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
