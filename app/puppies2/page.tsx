import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/app/components/PageHero";
import AvailablePuppies from "@/app/components/AvailablePuppies";
import { pastLitters } from "@/src/data/litters";

export const metadata: Metadata = {
  title: "Puppies",
  description:
    "Current, planned, and past Australian Labradoodle litters from Adams Farm Labradoodles in Greensboro, NC.",
};

function fmtDate(dateStr: string) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function PuppiesPage() {
  return (
    <main>
      <PageHero
        eyebrow="Our Litters"
        title="Puppies"
        intro="Our current litter, upcoming plans, and every litter we’ve raised — not just the puppies available today."
      />

      {/* ── CURRENT LITTER — live from the record ─────────── */}
      <AvailablePuppies eyebrow="Current Litter" />

      {/* ── PLANNED LITTERS ───────────────────────────────── */}
      <section id="planned" className="bg-cream-panel py-12 md:py-16 px-6">
        <div className="max-w-[1160px] mx-auto">
          <div className="mb-7 max-w-[640px]">
            <p className="text-[0.75rem] font-extrabold tracking-[0.14em] uppercase text-coral-dark mb-2">
              Planned Litters
            </p>
            <h2 className="font-heading font-bold text-[clamp(1.7rem,3vw,1.95rem)] text-navy">
              What’s Ahead
            </h2>
          </div>
          <div className="border-[1.5px] border-dashed border-warm-border rounded-xl px-7 py-9 text-center">
            <p className="text-[1rem] text-muted leading-[1.7]">
              No litters currently planned. Check back soon, or{" "}
              <Link href="/contact" className="text-navy underline">
                contact us
              </Link>{" "}
              to join our waitlist.
            </p>
          </div>
        </div>
      </section>

      {/* ── PAST LITTERS ──────────────────────────────────── */}
      <section id="past-litters" className="bg-white py-12 md:py-16 px-6">
        <div className="max-w-[1160px] mx-auto">
          <div className="mb-7 max-w-[640px]">
            <p className="text-[0.75rem] font-extrabold tracking-[0.14em] uppercase text-coral-dark mb-2">
              Past Litters
            </p>
            <h2 className="font-heading font-bold text-[clamp(1.7rem,3vw,1.95rem)] text-navy mb-2">
              Our Track Record
            </h2>
            <p className="text-[0.95rem] text-muted leading-[1.65]">
              A look back at every litter we’ve raised, newest first.
            </p>
          </div>
          <div className="flex flex-col gap-4 max-w-[760px]">
            {pastLitters.map((litter, i) => (
              <div
                key={i}
                className="bg-white border border-line rounded-xl px-6 py-5 shadow-[0_2px_16px_rgba(0,0,0,0.05)]"
              >
                <div className="flex justify-between items-baseline gap-4 flex-wrap mb-2">
                  <h3 className="font-heading font-semibold text-[1.1rem] text-navy">
                    {litter.sire} × {litter.dam}
                  </h3>
                  <span className="text-[0.72rem] font-extrabold tracking-[0.06em] uppercase text-coral-dark whitespace-nowrap">
                    {litter.date}
                  </span>
                </div>
                <p className="text-[0.95rem] text-charcoal leading-[1.7]">
                  {litter.puppies.join(", ")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WAITLIST BAND ─────────────────────────────────── */}
      <section className="bg-navy py-12 md:py-16 px-6">
        <div className="max-w-[1160px] mx-auto flex items-center justify-between gap-8 flex-col md:flex-row md:items-center">
          <div>
            <p className="text-[0.75rem] font-extrabold tracking-[0.14em] uppercase text-coral mb-1.5">
              Future litters
            </p>
            <h2 className="font-heading font-bold text-[clamp(1.7rem,3vw,1.95rem)] text-cream mb-2">
              Join the Waitlist
            </h2>
            <p className="text-[0.93rem] text-cream/70 max-w-[480px]">
              Our litters fill quickly. Getting on the list early means first access to
              puppy picks from upcoming litters.
            </p>
          </div>
          <Link
            href="/contact"
            className="shrink-0 inline-block border-[1.5px] border-white/45 text-cream font-extrabold py-[14px] px-7 rounded-lg text-[0.95rem] hover:border-cream transition-colors whitespace-nowrap"
          >
            Get on the list
          </Link>
        </div>
      </section>
    </main>
  );
}
