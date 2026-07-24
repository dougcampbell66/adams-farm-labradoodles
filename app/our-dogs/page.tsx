import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHero from "@/app/components/PageHero";
import DogPhoto from "@/app/components/DogPhoto";
import { dogs } from "@/src/data/dogs";

export const metadata: Metadata = {
  title: "Our Dogs",
  description:
    "Meet the Adams Farm breeding pair — health-tested, ALAA registered Australian Labradoodles raised in loving homes.",
};

function formatDate(dateStr: string) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function OurDogsPage() {
  const activeDogs = dogs.filter((d) => d.status === "active");
  const retiredDogs = dogs.filter((d) => d.status === "retired");

  return (
    <main>
      <PageHero
        eyebrow="Health tested · ALAA accredited"
        title="Meet the Parents"
        intro="Every Adams Farm puppy is born to ALAA-registered parents with full health testing on file and verifiable results at ofa.org."
      />

      {/* Active breeding dogs */}
      <section className="py-16 px-6 bg-cream">
        <div className="max-w-[1080px] mx-auto">
          <span className="block font-extrabold text-[0.75rem] tracking-[0.14em] uppercase text-navy mb-8">
            Active Breeding Pair
          </span>
          <div className="flex flex-col gap-12">
            {activeDogs.map((dog) => (
              <div
                key={dog.id}
                className="bg-warm-sand rounded-[18px] p-8 flex gap-8 flex-wrap md:flex-nowrap"
              >
                {/* Photo */}
                <div className="relative w-full md:w-[260px] h-[320px] shrink-0 rounded-[14px] overflow-hidden bg-photo-placeholder">
                  <DogPhoto
                    src={dog.photo}
                    alt={`${dog.name} — ${dog.registeredName}`}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-[240px]">
                  <div className="mb-4">
                    <h2 className="font-heading font-semibold text-navy text-[1.7rem] leading-tight">
                      {dog.name}
                    </h2>
                    <p className="text-[0.85rem] text-body-soft mt-1">
                      {dog.registeredName} · {dog.regNumber}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[0.88rem] mb-6">
                    <div>
                      <span className="block font-extrabold text-[0.7rem] uppercase tracking-wider text-navy/60 mb-0.5">
                        Born
                      </span>
                      <span className="text-charcoal">{formatDate(dog.birthdate)}</span>
                    </div>
                    <div>
                      <span className="block font-extrabold text-[0.7rem] uppercase tracking-wider text-navy/60 mb-0.5">
                        Color
                      </span>
                      <span className="text-charcoal capitalize">{dog.color}</span>
                    </div>
                    {dog.coi && (
                      <div>
                        <span className="block font-extrabold text-[0.7rem] uppercase tracking-wider text-navy/60 mb-0.5">
                          COI
                        </span>
                        <span className="text-charcoal">{dog.coi}</span>
                      </div>
                    )}
                    <div>
                      <span className="block font-extrabold text-[0.7rem] uppercase tracking-wider text-navy/60 mb-0.5">
                        Microchip
                      </span>
                      <span className="text-charcoal font-mono text-[0.82rem]">
                        {dog.microchip}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="block font-extrabold text-[0.7rem] uppercase tracking-wider text-navy/60 mb-0.5">
                        Parents
                      </span>
                      <span className="text-charcoal">{dog.parents}</span>
                    </div>
                  </div>

                  {/* Health tests */}
                  {dog.healthTests && dog.healthTests.length > 0 && (
                    <div>
                      <h3 className="font-extrabold text-[0.75rem] uppercase tracking-[0.1em] text-navy mb-3">
                        Health Testing
                      </h3>
                      <div className="flex flex-col gap-2">
                        {dog.healthTests.map((ht) => (
                          <div
                            key={ht.test}
                            className="bg-cream rounded-[10px] px-4 py-3 text-[0.85rem]"
                          >
                            <div className="flex items-start gap-2">
                              <span className="text-focus-green font-extrabold shrink-0 mt-0.5">
                                ✓
                              </span>
                              <div>
                                <span className="font-extrabold text-navy">
                                  {ht.test}
                                </span>
                                <span className="text-tan mx-2">·</span>
                                <span className="text-body-soft">
                                  {formatDate(ht.date)}
                                </span>
                                <p className="text-body-soft mt-0.5 leading-snug">
                                  {ht.result}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-[0.78rem] text-tan mt-3">
                        OFA results can be independently verified at{" "}
                        <a
                          href="https://ofa.org"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-navy"
                        >
                          ofa.org
                        </a>
                        .
                      </p>
                    </div>
                  )}

                  {/* Gallery thumbnails */}
                  {dog.gallery && dog.gallery.length > 0 && (
                    <div className="flex gap-3 mt-5 flex-wrap">
                      {dog.gallery.map((src, i) => (
                        <div
                          key={i}
                          className="relative w-16 h-16 rounded-[8px] overflow-hidden bg-sand-deep"
                        >
                          <Image
                            src={src}
                            alt={`${dog.name} photo ${i + 2}`}
                            fill
                            className="object-cover object-top"
                            sizes="64px"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Retired */}
      {retiredDogs.length > 0 && (
        <section className="py-16 px-6 bg-warm-sand border-t border-warm-border">
          <div className="max-w-[1080px] mx-auto">
            <span className="block font-extrabold text-[0.75rem] tracking-[0.14em] uppercase text-navy mb-8">
              Retired
            </span>
            <div className="flex flex-col gap-8">
              {retiredDogs.map((dog) => (
                <div
                  key={dog.id}
                  className="bg-cream rounded-[18px] p-8 flex gap-8 flex-wrap md:flex-nowrap items-start"
                >
                  <div className="relative w-full md:w-[200px] h-[240px] shrink-0 rounded-[14px] overflow-hidden bg-photo-placeholder">
                    <Image
                      src={dog.photo}
                      alt={`${dog.name} — ${dog.registeredName}`}
                      fill
                      className="object-cover object-top"
                      sizes="200px"
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-heading font-semibold text-navy text-[1.5rem] mb-1">
                      {dog.name}
                    </h2>
                    <p className="text-[0.85rem] text-body-soft mb-4">
                      {dog.registeredName} · {dog.regNumber} ·{" "}
                      <span className="font-extrabold text-tan">Retired</span>
                    </p>
                    <p className="text-[0.95rem] text-charcoal leading-relaxed mb-4">
                      {dog.description}
                    </p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[0.88rem]">
                      <div>
                        <span className="block font-extrabold text-[0.7rem] uppercase tracking-wider text-navy/60 mb-0.5">
                          Color
                        </span>
                        <span className="text-charcoal capitalize">{dog.color}</span>
                      </div>
                      {dog.coi && (
                        <div>
                          <span className="block font-extrabold text-[0.7rem] uppercase tracking-wider text-navy/60 mb-0.5">
                            COI
                          </span>
                          <span className="text-charcoal">{dog.coi}</span>
                        </div>
                      )}
                      <div className="col-span-2">
                        <span className="block font-extrabold text-[0.7rem] uppercase tracking-wider text-navy/60 mb-0.5">
                          Parents
                        </span>
                        <span className="text-charcoal">{dog.parents}</span>
                      </div>
                    </div>
                    {dog.gallery && dog.gallery.length > 0 && (
                      <div className="flex gap-3 mt-4 flex-wrap">
                        {dog.gallery.map((src, i) => (
                          <div
                            key={i}
                            className="relative w-14 h-14 rounded-[8px] overflow-hidden bg-sand-deep"
                          >
                            <Image
                              src={src}
                              alt={`${dog.name} photo ${i + 2}`}
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
              ))}
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
