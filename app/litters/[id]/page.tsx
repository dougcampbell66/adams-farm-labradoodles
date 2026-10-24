import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPuppyQ,
  pqCurrentLitters,
  pqLitterPairing,
  pqParentHref,
  pqPuppyAvailable,
  pqPuppyPhoto,
  pqPuppyStanding,
  pqSex,
  pqShortName,
  type PqDog,
  type PqPuppyStanding,
  type PuppyQ,
} from "@/lib/puppyq";

export const revalidate = 300;

const STANDING: Record<PqPuppyStanding, { label: string; cls: string }> = {
  available: { label: "Available", cls: "bg-avail-bg text-avail-text" },
  reserved: { label: "Reserved", cls: "bg-coral text-navy" },
  "in-program": { label: "Active", cls: "bg-avail-bg text-avail-text" },
  retained: { label: "Retained", cls: "bg-white/12 text-cream/70" },
  placed: { label: "Adopted", cls: "bg-white/12 text-cream/70" },
  unknown: { label: "On record", cls: "bg-white/12 text-cream/70" },
};

function fmtDate(iso: string | null) {
  if (!iso) return "Date not recorded";
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const pq = await getPuppyQ();
  const litter = pq.litters.find((l) => l.id === id);
  if (!litter) return { title: "Litter not found" };
  return {
    title: pqLitterPairing(litter),
    description: `Adams Farm litter, ${fmtDate(litter.birthdate)} — ${litter.puppies.length} puppies.`,
  };
}

function Parent({ role, dog, name, pq }: { role: string; dog: PqDog | null; name: string | null; pq: PuppyQ }) {
  const label = dog ? pqShortName(dog) : (name ?? "Not recorded");
  const href = pqParentHref(dog, pq);
  return (
    <div>
      <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.1em] text-cream/60">{role}</p>
      {href ? (
        <Link href={href} className="font-heading font-bold text-[1.15rem] text-cream hover:text-coral transition-colors">
          {label} →
        </Link>
      ) : (
        <p className="font-heading font-bold text-[1.15rem] text-cream">{label}</p>
      )}
    </div>
  );
}

/**
 * One litter: every puppy with its photo and status (Douglas, 2026-10-24),
 * under its dam × sire by call name, each parent linked to its card. The
 * Puppies page links here from each litter; this site has no page per dog,
 * so a puppy is a card, not a link.
 */
export default async function LitterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pq = await getPuppyQ();
  const litter = pq.litters.find((l) => l.id === id);
  if (!litter) notFound();

  const isCurrent = pqCurrentLitters(pq).some((l) => l.id === litter.id);
  const available = litter.puppies.filter(pqPuppyAvailable).length;
  // Available first, then by name — the order a family reads them in.
  const puppies = [...litter.puppies].sort(
    (a, b) =>
      Number(pqPuppyAvailable(b)) - Number(pqPuppyAvailable(a)) ||
      pqShortName(a).localeCompare(pqShortName(b)),
  );

  return (
    <main>
      <section className="bg-navy py-12 md:py-16 px-6">
        <div className="max-w-[1160px] mx-auto">
          <Link href="/puppies" className="text-[0.8rem] font-extrabold text-cream/70 hover:text-coral transition-colors">
            ← Puppies
          </Link>
          <p className="mt-6 text-[0.72rem] font-extrabold tracking-[0.14em] uppercase text-coral mb-2">
            {litter.type === "co-litter" ? `Co-litter · ${litter.coProgram ?? "Partner"}` : "Litter"} ·{" "}
            {isCurrent ? `${available} available` : "Past litter"}
          </p>
          <h1 className="font-heading font-bold text-[clamp(1.9rem,4vw,2.6rem)] text-cream">
            {pqLitterPairing(litter)}
          </h1>
          <p className="mt-2 text-[0.95rem] text-cream/70">
            Born {fmtDate(litter.birthdate)} · {litter.puppies.length}{" "}
            {litter.puppies.length === 1 ? "puppy" : "puppies"}
          </p>
          <div className="mt-6 flex flex-wrap gap-10">
            <Parent role="Dam" dog={litter.dam} name={litter.damName} pq={pq} />
            <Parent role="Sire" dog={litter.sire} name={litter.sireName} pq={pq} />
          </div>
        </div>
      </section>

      <section className="bg-white py-12 md:py-16 px-6">
        <div className="max-w-[1160px] mx-auto">
          {puppies.length === 0 ? (
            <p className="text-[1rem] text-muted">No puppies recorded against this litter yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {puppies.map((puppy) => {
                const name = pqShortName(puppy);
                const photo = pqPuppyPhoto(puppy);
                const sex = pqSex(puppy, pq.litters);
                const s = STANDING[pqPuppyStanding(puppy)];
                return (
                  <div key={puppy.id} className="bg-navy rounded-xl overflow-hidden">
                    <div className="relative aspect-[3/4] w-full bg-photo-placeholder">
                      {photo ? (
                        <Image
                          src={photo}
                          alt={name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover object-top"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <p className="text-tan text-[0.75rem] font-bold text-center px-4 leading-relaxed">
                            Photo
                            <br />
                            coming soon
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 p-3 sm:p-3.5">
                      <span className="text-[0.85rem] font-extrabold text-cream">{name}</span>
                      {puppy.color ? (
                        <span className="text-[0.7rem] text-cream/70 -mt-1.5 capitalize">{puppy.color}</span>
                      ) : null}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {sex && (
                          <span className="text-[0.6rem] sm:text-[0.65rem] uppercase tracking-[0.07em] px-2 sm:px-2.5 py-[3px] rounded-full font-extrabold bg-white/12 text-cream">
                            {sex}
                          </span>
                        )}
                        <span
                          className={`text-[0.6rem] sm:text-[0.65rem] uppercase tracking-[0.07em] px-2 sm:px-2.5 py-[3px] rounded-full font-extrabold ${s.cls}`}
                        >
                          {s.label}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-10">
            <Link
              href="/contact"
              className="inline-block bg-coral text-navy font-extrabold py-[14px] px-7 rounded-lg text-[0.95rem] hover:bg-coral-dark transition-colors"
            >
              Ask about a puppy
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
