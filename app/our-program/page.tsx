import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/app/components/PageHero";
import { stats, program } from "@/src/data/stats";

export const metadata: Metadata = {
  title: "Our Program",
  description:
    "How Adams Farm raises every litter — health integrity, purposeful socialization, transparency, and lifetime support.",
};

const pillars = [
  {
    num: "01",
    title: "Health & Integrity",
    body: `Every breeding dog is health tested to ALAA Gold Paw standards before being bred. We stand behind every puppy with a ${program.healthGuarantee.length} health guarantee covering debilitating congenital defects.`,
  },
  {
    num: "02",
    title: "Purposeful Raising",
    body: `Every puppy goes through a structured early socialization program from birth, refined over ${stats.littersPlaced} litters. The result is confident, well-adjusted dogs ready for family life.`,
  },
  {
    num: "03",
    title: "Transparency",
    body: `Families are welcome to visit in person at ${program.visitAge}. Every family receives ${program.updates} from birth until go-home day — you'll watch your puppy grow before they're home.`,
  },
  {
    num: "04",
    title: "Lifetime Support",
    body: "Our relationship with your family doesn't end at pickup. We're here for questions, guidance, and support for the life of your dog.",
  },
];

const steps = [
  {
    label: "Apply",
    desc: "Fill out our contact form. We'll read it personally and reach out within 1–2 business days.",
  },
  {
    label: "Conversation",
    desc: "We'll learn about your home, lifestyle, and what you're looking for — and make sure it's a great fit.",
  },
  {
    label: "Waitlist & deposit",
    desc: "Once a litter is confirmed, we collect a deposit to hold your spot on the list.",
  },
  {
    label: "Weekly updates",
    desc: `From birth through go-home day: ${program.updates}.`,
  },
  {
    label: "Visit at 6 weeks",
    desc: "Families visit in person once puppies have had their initial vaccines. This is when we help match each puppy to the right family.",
  },
  {
    label: "Go home at 8 weeks",
    desc: "Your puppy comes home with a full vet exam, vaccinations, microchip, health guarantee, and a care package.",
  },
];

const programCards = [
  {
    title: "ENS / Super Dog Program",
    body: "A structured neurological stimulation protocol applied from day three, based on the U.S. military's original Bio Sensor research.",
    stat: "Starts Day 3",
    borderColor: "border-calm-blue",
  },
  {
    title: "Advanced Socialization",
    body: "Real-world exposure to a wide range of people, sounds, surfaces, and environments — not just time in the whelping room.",
    stat: "30–40 Hours",
    borderColor: "border-focus-green",
  },
  {
    title: "Early Crate Training",
    body: "Puppies begin crate training before they leave, so your first nights home start from a foundation, not square one.",
    stat: "Begins Before Placement",
    borderColor: "border-excite-yellow",
  },
];

export default function OurProgramPage() {
  return (
    <main>
      <PageHero
        eyebrow={`ALAA Gold Paw · ${stats.yearsBreeding} years breeding · ${stats.littersPlaced} litters placed`}
        title="Our Program"
        intro="Four commitments guide every litter we raise — and every family we work with."
      />

      {/* Four pillars */}
      <section className="py-16 px-6 bg-cream">
        <div className="max-w-[1080px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-warm-border rounded-[14px] overflow-hidden border border-warm-border">
            {pillars.map((p) => (
              <div key={p.num} className="bg-cream p-8">
                <span className="block font-extrabold text-[0.7rem] tracking-[0.12em] uppercase text-coral mb-2">
                  {p.num}
                </span>
                <h2 className="font-heading font-semibold text-navy text-[1.15rem] mb-3">
                  {p.title}
                </h2>
                <p className="text-[0.93rem] text-[#4A4A4A] leading-relaxed">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Early development cards */}
      <div className="bg-navy text-cream py-[72px] px-6">
        <div className="max-w-[1080px] mx-auto">
          <span className="block font-extrabold text-[0.75rem] tracking-[0.14em] uppercase text-excite-yellow mb-[14px]">
            Early Development
          </span>
          <h2 className="font-heading font-semibold text-[2.1rem] text-cream mb-4 max-w-[640px]">
            Two programs most breeders skip.
          </h2>
          <p className="text-[1.02rem] opacity-90 max-w-[620px] mb-11 leading-relaxed">
            Every Adams Farm puppy goes through a structured developmental program
            before they ever meet you — not vague &ldquo;well-socialized&rdquo; marketing
            language, but a specific, repeatable process.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {programCards.map(({ title, body, stat, borderColor }) => (
              <div
                key={title}
                className={`bg-[rgba(255,255,255,0.06)] rounded-[14px] p-[26px] border-t-4 ${borderColor}`}
              >
                <h3 className="font-heading font-semibold text-[1.15rem] text-cream mb-[10px]">
                  {title}
                </h3>
                <p className="text-[0.9rem] leading-relaxed opacity-85">{body}</p>
                <span className="block font-extrabold text-excite-yellow text-[0.85rem] mt-3">
                  {stat}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Health guarantee */}
      <section className="bg-navy py-16 px-6 border-t border-white/10">
        <div className="max-w-[1080px] mx-auto max-w-[640px]">
          <span className="block font-extrabold text-[0.75rem] tracking-[0.14em] uppercase text-cream/50 mb-3">
            Health guarantee
          </span>
          <h2 className="font-heading font-semibold text-[1.9rem] text-cream mb-4">
            We stand behind every puppy
          </h2>
          <p className="text-[0.95rem] text-cream/80 leading-relaxed mb-6 max-w-[580px]">
            {program.healthGuarantee.length} coverage on debilitating congenital
            defects present from birth — including severe hip/elbow dysplasia, PRA,
            and severe cardiac defects. If a covered condition is confirmed by a
            licensed veterinarian, we provide {program.healthGuarantee.remedy}.
          </p>
          <Link
            href="/our-dogs"
            className="inline-block bg-coral text-white font-extrabold py-[14px] px-7 rounded-lg text-[0.95rem] hover:bg-coral-dark transition-colors"
          >
            View health testing results
          </Link>
        </div>
      </section>

      {/* 6-step process */}
      <section className="py-16 px-6 bg-cream">
        <div className="max-w-[1080px] mx-auto">
          <span className="block font-extrabold text-[0.75rem] tracking-[0.14em] uppercase text-coral mb-3">
            The process
          </span>
          <h2 className="font-heading font-semibold text-[1.9rem] text-navy mb-10">
            What to Expect
          </h2>
          <div className="flex flex-col max-w-[580px]">
            {steps.map((step, i) => (
              <div key={step.label} className="grid grid-cols-[44px_1fr] gap-4 pb-7">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-cream text-[0.78rem] font-extrabold shrink-0">
                    {i + 1}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-[2px] flex-1 bg-warm-border mt-1.5" />
                  )}
                </div>
                <div className="pt-1">
                  <p className="font-heading font-semibold text-navy text-[1rem] mb-1">
                    {step.label}
                  </p>
                  <p className="text-[0.9rem] text-[#4A4A4A] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 flex-wrap mt-4">
            <Link
              href="/contact"
              className="inline-block bg-coral text-white font-extrabold py-[14px] px-7 rounded-lg text-[0.95rem] hover:bg-coral-dark transition-colors"
            >
              Start your application
            </Link>
            <Link
              href="/faq"
              className="inline-block border-2 border-coral text-coral font-extrabold py-[14px] px-7 rounded-lg text-[0.95rem] hover:bg-coral hover:text-white transition-colors"
            >
              Read the FAQ
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
