import Image from "next/image";
import Link from "next/link";
import {
  getPuppyQ,
  pqAvailablePuppies,
  pqPuppyPhoto,
  pqPuppyStanding,
  pqSex,
  pqShortName,
  type PqLitter,
  type PqPuppyStanding,
} from "@/lib/puppyq";

const STANDING: Record<PqPuppyStanding, { label: string; cls: string }> = {
  available: { label: "Available", cls: "bg-avail-bg text-avail-text" },
  reserved: { label: "Reserved", cls: "bg-coral text-navy" },
  "in-program": { label: "In program", cls: "bg-avail-bg text-avail-text" },
  retained: { label: "Retained", cls: "bg-white/12 text-cream/70" },
  placed: { label: "Placed", cls: "bg-white/12 text-cream/70" },
  unknown: { label: "On record", cls: "bg-white/12 text-cream/70" },
};

function fmtDate(iso: string | null) {
  if (!iso) return null;
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** "Macy & Gate August Litter" — short names and the whelp month. */
function litterTitle(litter: PqLitter): string {
  const dam = litter.dam ? pqShortName(litter.dam) : (litter.damName ?? "Unknown dam");
  const sire = litter.sire ? pqShortName(litter.sire) : (litter.sireName ?? "Unknown sire");
  const month = litter.birthdate
    ? new Date(`${litter.birthdate}T12:00:00`).toLocaleDateString("en-US", { month: "long" })
    : null;
  return `${dam} & ${sire}${month ? ` ${month}` : ""} Litter`;
}

/**
 * Available Puppies — live from the record, shared by the home page and
 * /puppies2. Every puppy the record offers (pqPuppyOffered) from a current
 * litter, with its photo from the media table. A puppy with no upload yet
 * shows a placeholder rather than a stand-in from this repo. Sex is shown only
 * when the record holds it; it is null on most puppy rows and is never
 * guessed from a name.
 */
export default async function AvailablePuppies({
  eyebrow = "Available Puppies",
}: {
  eyebrow?: string;
}) {
  const pq = await getPuppyQ();
  const entries = pqAvailablePuppies(pq);
  const litters = [...new Map(entries.map((e) => [e.litter.id, e.litter])).values()];
  const lead = litters[0] ?? null;

  return (
    <section id="puppies" className="bg-white border-b border-line py-12 md:py-16">
      <div className="max-w-[1160px] mx-auto px-6">
        <div className="mb-8 max-w-[620px]">
          <p className="text-[0.75rem] font-extrabold tracking-[0.14em] uppercase text-coral-dark mb-2">
            {eyebrow}
          </p>
          <h2 className="font-heading font-bold text-[clamp(1.7rem,3vw,1.95rem)] text-navy mb-2.5">
            {lead ? `Meet Our ${litterTitle(lead)}` : "Our Next Litter"}
          </h2>
          {lead ? (
            <p className="text-[0.95rem] text-muted leading-[1.65] mb-3.5">
              {lead.birthdate ? `Born ${fmtDate(lead.birthdate)} to ` : "Out of "}
              {lead.damName ?? "an unrecorded dam"} and {lead.sireName ?? "an unrecorded sire"}
              {litters.length > 1 ? `, with ${litters.length - 1} more current litter${litters.length > 2 ? "s" : ""} below` : ""}
              , and raised underfoot in the Campbell home from day one.
            </p>
          ) : (
            <p className="text-[0.95rem] text-muted leading-[1.65] mb-3.5">
              No puppies are available right now. Join the waitlist and we’ll reach out when the
              next litter arrives.
            </p>
          )}
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link
              href="/dams"
              className="text-[0.85rem] font-extrabold text-navy border-b-[1.5px] border-coral pb-[2px] hover:text-coral-dark transition-colors"
            >
              Meet Our Dams →
            </Link>
            <Link
              href="/sires"
              className="text-[0.85rem] font-extrabold text-navy border-b-[1.5px] border-coral pb-[2px] hover:text-coral-dark transition-colors"
            >
              Meet Our Sires →
            </Link>
          </div>
        </div>

        {entries.length > 0 && (
          <div className="grid grid-cols-1 min-[360px]:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {entries.map(({ puppy, litter }) => {
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
                        sizes="(max-width: 768px) 50vw, 33vw"
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
                    <span className="text-[0.7rem] text-cream/70 -mt-1.5 capitalize">
                      {[puppy.color, litters.length > 1 ? litterTitle(litter) : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
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

        <div className="mt-8">
          <Link
            href="/contact"
            className="inline-block bg-coral text-navy font-extrabold py-[14px] px-7 rounded-lg text-[0.95rem] hover:bg-coral-dark transition-colors"
          >
            {entries.length > 0 ? "Reserve a Puppy" : "Join the Waitlist"}
          </Link>
        </div>
      </div>
    </section>
  );
}
