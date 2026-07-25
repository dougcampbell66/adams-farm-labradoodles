import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHero from "@/app/components/PageHero";
import { getPuppyQ, pqDogTiers, pqSex, pqName, pqRole, pqPhoto, pqGallery, type PqDog, type PuppyQ } from "@/lib/puppyq";

export const metadata: Metadata = {
  title: "Our Dogs",
  description:
    "Meet the Adams Farm breeding dogs — health-tested, ALAA registered Australian Labradoodles raised in loving homes.",
};

export const revalidate = 300;

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

function DogCard({ dog, pq }: { dog: PqDog; pq: PuppyQ }) {
  const photo = pqPhoto(dog);
  const gallery = pqGallery(dog);
  const role = pqRole(dog, pq.litters);
  const sex = pqSex(dog, pq.litters);
  return (
    <div className="bg-warm-sand rounded-[18px] p-8 flex gap-8 flex-wrap md:flex-nowrap">
      <div className="relative w-full md:w-[240px] h-[300px] shrink-0 rounded-[14px] overflow-hidden bg-photo-placeholder">
        {photo ? (
          <Image src={photo} alt={pqName(dog)} fill className="object-cover object-top" sizes="240px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-tan text-sm">No photo</div>
        )}
      </div>
      <div className="flex-1 min-w-[220px]">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-heading font-semibold text-navy text-[1.6rem] leading-tight">
              {pqName(dog)}
            </h2>
            <span className="text-[0.7rem] font-extrabold uppercase tracking-wider px-2 py-[2px] rounded-full bg-navy/10 text-navy">
              {role}
            </span>
          </div>
          {dog.registered_name && dog.registered_name !== dog.call_name && (
            <p className="text-[0.85rem] text-body-soft">{dog.registered_name}</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[0.88rem] mb-5">
          {dog.birthdate && (
            <div>
              <span className="block font-extrabold text-[0.7rem] uppercase tracking-wider text-navy/60 mb-0.5">Born</span>
              <span className="text-charcoal">{fmtDate(dog.birthdate)}</span>
            </div>
          )}
          {dog.color && (
            <div>
              <span className="block font-extrabold text-[0.7rem] uppercase tracking-wider text-navy/60 mb-0.5">Color</span>
              <span className="text-charcoal capitalize">{dog.color}</span>
            </div>
          )}
          {sex && (
            <div>
              <span className="block font-extrabold text-[0.7rem] uppercase tracking-wider text-navy/60 mb-0.5">Sex</span>
              <span className="text-charcoal capitalize">{sex}</span>
            </div>
          )}
          {dog.breed && (
            <div className="col-span-2">
              <span className="block font-extrabold text-[0.7rem] uppercase tracking-wider text-navy/60 mb-0.5">Breed</span>
              <span className="text-charcoal">{dog.breed}</span>
            </div>
          )}
        </div>
        {gallery.length > 0 && (
          <div className="flex gap-3 flex-wrap">
            {gallery.map((src, i) => (
              <div key={i} className="relative w-14 h-14 rounded-[8px] overflow-hidden bg-sand-deep">
                <Image src={src} alt={`${pqName(dog)} photo ${i + 2}`} fill className="object-cover object-top" sizes="56px" />
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
  const { active, retired, retained } = pqDogTiers(pq);
  const hasData = active.length + retired.length + retained.length > 0;

  return (
    <main>
      <PageHero
        eyebrow="Health tested · ALAA accredited"
        title="Meet the Parents"
        intro="Every Adams Farm puppy is born to ALAA-registered parents with full health testing on file and verifiable results at ofa.org."
      />

      {!hasData && pq.diagnostics.errors.length > 0 && (
        <section className="py-10 px-6 bg-cream">
          <div className="max-w-[800px] mx-auto text-center">
            <p className="text-muted">Dog records are loading — check back shortly.</p>
          </div>
        </section>
      )}

      {/* Active breeding dogs */}
      {active.length > 0 && (
        <section className="py-16 px-6 bg-cream">
          <div className="max-w-[1080px] mx-auto">
            <span className="block font-extrabold text-[0.75rem] tracking-[0.14em] uppercase text-navy mb-8">
              Active Breeding Dogs · {active.length}
            </span>
            <div className="flex flex-col gap-10">
              {active.map((dog) => <DogCard key={dog.id} dog={dog} pq={pq} />)}
            </div>
          </div>
        </section>
      )}

      {/* Retained young stock */}
      {retained.length > 0 && (
        <section className="py-16 px-6 bg-cream-panel border-t border-warm-border">
          <div className="max-w-[1080px] mx-auto">
            <span className="block font-extrabold text-[0.75rem] tracking-[0.14em] uppercase text-navy mb-8">
              Retained · {retained.length}
            </span>
            <div className="flex flex-col gap-10">
              {retained.map((dog) => <DogCard key={dog.id} dog={dog} pq={pq} />)}
            </div>
          </div>
        </section>
      )}

      {/* Retired */}
      {retired.length > 0 && (
        <section className="py-16 px-6 bg-warm-sand border-t border-warm-border">
          <div className="max-w-[1080px] mx-auto">
            <span className="block font-extrabold text-[0.75rem] tracking-[0.14em] uppercase text-navy mb-8">
              Retired
            </span>
            <div className="flex flex-col gap-8">
              {retired.map((dog) => <DogCard key={dog.id} dog={dog} pq={pq} />)}
            </div>
          </div>
        </section>
      )}

      {/* Health transparency strip */}
      <section className="py-14 px-6 bg-navy border-t border-white/12">
        <div className="max-w-[640px] mx-auto">
          <p className="text-[0.75rem] font-extrabold tracking-[0.14em] uppercase text-cream/50 mb-2">
            Transparency
          </p>
          <h2 className="font-heading font-bold text-[clamp(1.5rem,3vw,1.9rem)] text-cream mb-2.5">
            Full health results on every profile
          </h2>
          <p className="text-[0.95rem] text-cream/75 leading-[1.65] mb-5">
            OFA hip &amp; elbow evaluations, CAER eye exams, and complete DNA panels —
            verifiable independently at ofa.org.
          </p>
          <Link
            href="/our-program"
            className="inline-block bg-coral text-navy font-extrabold py-[14px] px-7 rounded-lg text-[0.95rem] hover:bg-coral-dark transition-colors"
          >
            Our health program →
          </Link>
        </div>
      </section>
    </main>
  );
}
