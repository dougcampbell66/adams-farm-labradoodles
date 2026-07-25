import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/app/components/PageHero";
import {
  getPuppyQ,
  pqName,
  pqShortName,
  type PqLitter,
} from "@/lib/puppyq";

export const metadata: Metadata = {
  title: "Our Puppies",
  description:
    "Current and past Adams Farm Labradoodle litters — read live from the PuppyQ record.",
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

function LitterCard({
  litter,
  featured = false,
}: {
  litter: PqLitter;
  featured?: boolean;
}) {
  const damLabel = litter.dam
    ? pqName(litter.dam)
    : litter.damName ?? "Unknown dam";
  const sireLabel = litter.sire
    ? pqName(litter.sire)
    : litter.sireName ?? "Unknown sire";

  return (
    <div
      className={`rounded-[20px] p-8 ${
        featured ? "bg-[#22344A] text-cream" : "bg-[#f0e9db]"
      }`}
    >
      {/* Pairing */}
      <div className="mb-5">
        <p
          className={`text-[0.7rem] font-extrabold uppercase tracking-[0.12em] mb-1 ${
            featured ? "text-[#B08D57]" : "text-[#B08D57]"
          }`}
        >
          {litter.type === "co-litter" ? "Co-litter" : "Litter"}
        </p>
        <h2
          className={`font-heading font-bold text-[1.4rem] leading-snug ${
            featured ? "text-[#F7F2E7]" : "text-[#22344A]"
          }`}
        >
          {damLabel} × {sireLabel}
        </h2>
        <p
          className={`text-[0.85rem] mt-1 ${
            featured ? "text-[#F7F2E7]/70" : "text-[#22344A]/60"
          }`}
        >
          Born {fmtDate(litter.birthdate)}
        </p>
      </div>

      {/* Puppies */}
      {litter.puppies.length > 0 && (
        <div>
          <p
            className={`text-[0.68rem] font-extrabold uppercase tracking-[0.1em] mb-3 ${
              featured ? "text-[#F7F2E7]/60" : "text-[#22344A]/50"
            }`}
          >
            {litter.puppies.length} pup
            {litter.puppies.length !== 1 ? "s" : ""}
          </p>
          <div className="flex flex-wrap gap-2">
            {litter.puppies.map((p) => (
              <div
                key={p.id}
                className={`rounded-lg px-3.5 py-2 text-[0.83rem] ${
                  featured
                    ? "bg-[#F7F2E7]/10 text-[#F7F2E7]"
                    : "bg-[#22344A]/8 text-[#22344A]"
                }`}
              >
                <span className="font-semibold">{pqShortName(p)}</span>
                {p.color && (
                  <span
                    className={`ml-1.5 text-[0.75rem] capitalize ${
                      featured ? "text-[#F7F2E7]/55" : "text-[#22344A]/50"
                    }`}
                  >
                    · {p.color}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default async function OurPuppiesPage() {
  const pq = await getPuppyQ();

  // Litters are already sorted most-recent first by getPuppyQ().
  // Treat the single most recent litter as "current program"; the rest are history.
  const [current, ...past] = pq.litters;

  return (
    <main>
      <PageHero
        eyebrow="Our Puppies"
        title="Puppies"
        intro="Adams Farm litters — raised underfoot, loved from day one."
      />

      {/* Current / featured litter */}
      <section className="py-16 px-6 bg-[#F7F2E7]">
        <div className="max-w-[1080px] mx-auto">
          <p className="text-[0.72rem] font-extrabold tracking-[0.14em] uppercase text-[#B08D57] mb-2">
            Most Recent Litter
          </p>
          <h2 className="font-heading font-bold text-[clamp(1.6rem,3vw,1.9rem)] text-[#22344A] mb-8">
            Current Program
          </h2>

          {current ? (
            <LitterCard litter={current} featured />
          ) : (
            <div className="border-[1.5px] border-dashed border-[#d8cebc] rounded-xl px-7 py-9 text-center max-w-[540px]">
              <p className="text-[1rem] text-[#22344A]/60 leading-[1.7]">
                No litters on record yet. Check back soon, or{" "}
                <Link href="/contact" className="text-[#22344A] underline">
                  join our waitlist
                </Link>
                .
              </p>
            </div>
          )}

          <div className="mt-8">
            <Link
              href="/contact"
              className="inline-block bg-[#22344A] text-[#F7F2E7] font-extrabold py-[14px] px-7 rounded-lg text-[0.95rem] hover:bg-[#1a2838] transition-colors"
            >
              Inquire About Puppies
            </Link>
          </div>
        </div>
      </section>

      {/* Past litters */}
      {past.length > 0 && (
        <section className="py-16 px-6 bg-white border-t border-[#e8e0d0]">
          <div className="max-w-[1080px] mx-auto">
            <p className="text-[0.72rem] font-extrabold tracking-[0.14em] uppercase text-[#B08D57] mb-2">
              Past Litters
            </p>
            <h2 className="font-heading font-bold text-[clamp(1.6rem,3vw,1.9rem)] text-[#22344A] mb-10">
              Our Track Record
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {past.map((l) => (
                <LitterCard key={l.id} litter={l} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Waitlist band */}
      <section className="bg-[#22344A] py-16 px-6">
        <div className="max-w-[1080px] mx-auto flex items-center justify-between gap-8 flex-col md:flex-row">
          <div>
            <p className="text-[0.72rem] font-extrabold tracking-[0.14em] uppercase text-[#B08D57] mb-1.5">
              Future litters
            </p>
            <h2 className="font-heading font-bold text-[clamp(1.6rem,3vw,1.9rem)] text-[#F7F2E7] mb-2">
              Join the Waitlist
            </h2>
            <p className="text-[0.93rem] text-[#F7F2E7]/65 max-w-[460px]">
              Our litters fill quickly. Getting on the list early means first
              access to puppy picks.
            </p>
          </div>
          <Link
            href="/contact"
            className="shrink-0 border-[1.5px] border-white/40 text-[#F7F2E7] font-extrabold py-[14px] px-7 rounded-lg text-[0.95rem] hover:border-white/80 transition-colors whitespace-nowrap"
          >
            Get on the list
          </Link>
        </div>
      </section>
    </main>
  );
}
