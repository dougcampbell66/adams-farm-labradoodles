import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHero from "@/app/components/PageHero";
import { litters, getPuppiesForLitter } from "@/src/data/litters";

export const metadata: Metadata = {
  title: "Puppies",
  description:
    "Meet the available Labradoodle puppies from Adams Farm. Raised in loving homes with ENS programming and 30–40 hours of socialization.",
};

const statusStyles = {
  available: { bg: "bg-[#E8F5EC]", text: "text-[#1a5c2e]", label: "Available" },
  reserved: { bg: "bg-[#FDECEA]", text: "text-[#7a2018]", label: "Reserved" },
};

export default function PuppiesPage() {
  const currentLitters = litters.filter(
    (l) => l.status === "available" || l.status === "planned"
  );
  const pastLitters = litters.filter((l) => l.status === "past");

  return (
    <main>
      <PageHero
        eyebrow="Our Puppies"
        title="Meet the Litter"
        intro="Every Adams Farm puppy goes through ENS, 30–40 hours of structured socialization, and early crate training before going home at 8 weeks."
      />

      {currentLitters.length === 0 && (
        <section className="py-16 px-6 bg-cream text-center">
          <div className="max-w-[640px] mx-auto">
            <p className="text-[1.05rem] text-[#4A4A4A] mb-6">
              No litters are available right now. Join the waitlist and
              we&apos;ll reach out when the next litter is confirmed.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-coral text-white font-extrabold py-[14px] px-7 rounded-lg text-[0.95rem] hover:bg-coral-dark transition-colors"
            >
              Join the Waitlist
            </Link>
          </div>
        </section>
      )}

      {currentLitters.map((litter) => {
        const puppies = getPuppiesForLitter(litter.id);
        const availableCount = puppies.filter((p) => p.status === "available").length;
        const reservedCount = puppies.filter((p) => p.status === "reserved").length;

        return (
          <section key={litter.id} className="py-16 px-6 bg-cream">
            <div className="max-w-[1080px] mx-auto">
              {/* Litter header */}
              <div className="mb-10">
                <span className="block font-extrabold text-[0.75rem] tracking-[0.14em] uppercase text-navy mb-3">
                  {litter.status === "available" ? "Available Now" : "Coming Soon"}
                </span>
                <h2 className="font-heading font-semibold text-[2rem] text-navy mb-2">
                  {litter.displayTitle}
                </h2>
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-[0.9rem] text-[#4A4A4A] mb-4">
                  <span>Sire: <strong>{litter.sireDisplay}</strong></span>
                  <span>Dam: <strong>{litter.damDisplay}</strong></span>
                  <span>Born: <strong>{new Date(litter.birthdate + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</strong></span>
                  <span>Ready: <strong>{new Date(litter.readyDate + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</strong></span>
                  <span>Expected size: <strong>{litter.expectedSize}</strong></span>
                </div>
                <div className="flex gap-3">
                  {availableCount > 0 && (
                    <span className="text-[0.72rem] font-extrabold px-3 py-[5px] rounded-full bg-[#DCEAF6] text-navy">
                      {availableCount} Available
                    </span>
                  )}
                  {reservedCount > 0 && (
                    <span className="text-[0.72rem] font-extrabold px-3 py-[5px] rounded-full bg-[#E4EFE6] text-navy">
                      {reservedCount} Reserved
                    </span>
                  )}
                </div>
              </div>

              {/* Puppy grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-10">
                {puppies.map((puppy) => {
                  const s = statusStyles[puppy.status];
                  return (
                    <div
                      key={puppy.id}
                      className="bg-warm-sand rounded-[14px] overflow-hidden"
                    >
                      <div className="relative aspect-[3/4] w-full">
                        <Image
                          src={puppy.photo}
                          alt={`${puppy.name} — ${puppy.collar}`}
                          fill
                          className="object-cover object-top"
                          sizes="(max-width: 768px) 50vw, 33vw"
                        />
                      </div>
                      <div className="p-4">
                        <p className="font-heading font-semibold text-navy text-[1.1rem] mb-1">
                          {puppy.name}
                        </p>
                        <p className="text-[0.75rem] text-[#8a7c5c] mb-2">
                          {puppy.collar} · {puppy.sex}
                        </p>
                        <span
                          className={`inline-block text-[0.65rem] font-extrabold uppercase tracking-[0.07em] px-3 py-[4px] rounded-full ${s.bg} ${s.text}`}
                        >
                          {s.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-warm-sand rounded-[18px] p-8">
                <h3 className="font-heading font-semibold text-navy text-[1.3rem] mb-3">
                  Interested in one of these puppies?
                </h3>
                <p className="text-[0.95rem] text-[#4A4A4A] leading-relaxed mb-6 max-w-[560px]">
                  We match families to puppies at 6–7 weeks based on temperament, energy
                  level, and household fit. Fill out our short contact form to start the
                  conversation.
                </p>
                <Link
                  href="/contact"
                  className="inline-block bg-coral text-white font-extrabold py-[14px] px-7 rounded-lg text-[0.95rem] hover:bg-coral-dark transition-colors"
                >
                  Reserve a Puppy
                </Link>
              </div>
            </div>
          </section>
        );
      })}

      {pastLitters.length > 0 && (
        <section className="py-16 px-6 bg-warm-sand border-t border-warm-border">
          <div className="max-w-[1080px] mx-auto">
            <span className="block font-extrabold text-[0.75rem] tracking-[0.14em] uppercase text-navy mb-3">
              Past Litters
            </span>
            <h2 className="font-heading font-semibold text-[1.9rem] text-navy mb-8">
              Our Track Record
            </h2>
            <div className="flex flex-col gap-4">
              {pastLitters.map((litter) => (
                <div
                  key={litter.id}
                  className="bg-cream rounded-[14px] px-6 py-4 flex flex-wrap gap-x-8 gap-y-1 items-center text-[0.9rem]"
                >
                  <span className="font-heading font-semibold text-navy">
                    {litter.displayTitle}
                  </span>
                  <span className="text-[#4A4A4A]">
                    {new Date(litter.birthdate + "T12:00:00").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </span>
                  <span className="text-[#4A4A4A]">
                    {litter.sireDisplay} × {litter.damDisplay}
                  </span>
                  <span className="text-[#4A4A4A]">
                    {litter.puppyCount} puppies placed
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
