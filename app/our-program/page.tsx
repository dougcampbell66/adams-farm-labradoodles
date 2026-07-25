import type { Metadata } from "next";
import Link from "next/link";
import PuppyQCards from "@/app/components/PuppyQCards";

export const metadata: Metadata = {
  title: "Our Program",
  description:
    "The PuppyQ Framework — an evidence-based approach to raising calm, well-socialized Australian Labradoodle puppies.",
};

const included = [
  {
    title: "PuppyQ Certification",
    body: "Proof your puppy met the full standard: 10 events, 10 locations, 100 people.",
  },
  {
    title: "PuppyQ Scorecard",
    body: "Your puppy’s seven-week snapshot, plus the eight-month follow-up that shows real growth.",
  },
  {
    title: "PuppyQ History",
    body: "A full record of your puppy’s first weeks — every person, place, and milestone.",
  },
];

export default function OurProgramPage() {
  return (
    <main>
      {/* ── HERO — AVSAB LEAD ─────────────────────────────── */}
      <div className="bg-navy py-16 md:py-20 px-6 border-b border-white/12">
        <div className="max-w-[1160px] mx-auto">
          <h1 className="font-heading font-bold text-[clamp(1.5rem,2.6vw,1.9rem)] leading-[1.3] text-cream max-w-[760px]">
            A puppy’s most important weeks for meeting the world are its first three
            months. That’s what we build around.
          </h1>
          <blockquote className="mt-7 font-heading italic font-medium text-[clamp(1.4rem,3.2vw,2.1rem)] leading-[1.4] text-cream max-w-[820px]">
            “The primary and most important time for puppy socialization is the first
            three months of life. During this time puppies should be exposed to as many
            new people, animals, stimuli and environments as can be achieved safely and
            without causing overstimulation.”
          </blockquote>
          <p className="mt-4 text-[0.85rem] font-extrabold tracking-[0.04em] text-cream/60">
            — American Veterinary Society of Animal Behavior (AVSAB)
          </p>
          <a
            href="https://avsab.org/wp-content/uploads/2018/03/Puppy_Socialization_Position_Statement_Download_-_10-3-14.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-5 text-[0.9rem] font-extrabold text-coral border-b-[1.5px] border-coral pb-[2px] hover:text-coral-dark transition-colors"
          >
            Read the full AVSAB position statement →
          </a>
        </div>
      </div>

      {/* ── THE PUPPYQ FRAMEWORK ──────────────────────────── */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-[720px] mx-auto">
          <h2 className="font-heading font-bold text-[clamp(1.7rem,3vw,1.95rem)] text-navy mb-4">
            The PuppyQ Framework
          </h2>
          <p className="text-[1rem] text-charcoal leading-[1.78]">
            PuppyQ is an evidence-based framework for raising calm, well-socialized
            puppies. Adams Farm raises each puppy following PuppyQ protocols and provides
            a PuppyQ Scorecard and History.
          </p>
        </div>
      </section>

      {/* ── FOUR PERIODS ──────────────────────────────────── */}
      <section className="bg-navy py-16 px-6 border-t border-white/12">
        <div className="max-w-[1160px] mx-auto">
          <h2 className="font-heading font-bold text-[clamp(1.7rem,3vw,1.95rem)] text-cream mb-3">
            Four periods, birth to adulthood
          </h2>
          <p className="text-[1rem] text-cream/75 leading-[1.72] max-w-[620px] mb-10">
            PuppyQ organizes development into four periods. Each is a window of time when
            specific work happens.
          </p>
          <PuppyQCards />
        </div>
      </section>

      {/* ── EVIDENCE-BASED EARLY SOCIALIZATION ────────────── */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-[720px] mx-auto">
          <h2 className="font-heading font-bold text-[clamp(1.7rem,3vw,1.95rem)] text-navy mb-4">
            Evidence-based early socialization
          </h2>
          <p className="text-[1rem] text-charcoal leading-[1.78]">
            PuppyQ Protocols follows the guidelines of the American Veterinary Society of
            Animal Behavior (AVSAB), which is supported and endorsed by the American
            Veterinary Medical Association (AVMA).
          </p>
        </div>
      </section>

      {/* ── SOCIALIZATION BENCHMARKS ──────────────────────── */}
      <section className="bg-cream-panel py-16 px-6">
        <div className="max-w-[720px] mx-auto flex flex-col gap-4">
          <h2 className="font-heading font-bold text-[clamp(1.7rem,3vw,1.95rem)] text-navy mb-1">
            PuppyQ Socialization Benchmarks
          </h2>
          <p className="text-[1rem] text-charcoal leading-[1.78]">
            Dr. Ian Dunbar is a veterinarian and animal behaviorist who holds a veterinary
            degree from the Royal Veterinary College in London and a doctorate in animal
            behavior from UC Berkeley. In 1982, he founded SIRIUS® Puppy Training, the
            world’s first off-leash puppy socialization program, and went on to found the
            Association of Professional Dog Trainers, now the largest dog trainer
            organization in the world. His socialization benchmark is one of the most
            widely cited in the field — not because it’s official policy from any single
            body, but because decades of trainers, behaviorists, and veterinarians have
            converged on it independently.
          </p>
          <p className="text-[1rem] text-charcoal leading-[1.78]">
            Our socialization goal follows his two-part benchmark: 100 people by 8 weeks
            with us, and 100 more in the first month home with you. It’s a shared effort —
            we lay the foundation during your puppy’s first weeks, and you carry it forward
            through the most formative days of their life.
          </p>
          <p className="text-[1rem] text-charcoal leading-[1.78]">
            To earn PuppyQ Certification, each puppy meets a clear standard by 8 weeks: 10
            events, 10 locations, and 100 people. It’s a floor we hold ourselves to for
            every single puppy.
          </p>
        </div>
      </section>

      {/* ── PULL-QUOTE BREAK ──────────────────────────────── */}
      <section className="bg-navy py-20 px-6">
        <div className="max-w-[680px] mx-auto text-center">
          <blockquote className="font-heading italic font-medium text-[clamp(1.5rem,3vw,2.1rem)] text-cream leading-[1.55]">
            “Prevention is better than intervention.”
            <cite className="block not-italic font-body text-[0.8rem] tracking-[0.06em] text-cream/55 mt-5">
              — Dr. Ian Dunbar
            </cite>
          </blockquote>
        </div>
      </section>

      {/* ── Q IS FOR QUOTIENT ─────────────────────────────── */}
      <section className="bg-navy-deep py-16 px-6 border-t border-white/12">
        <div className="max-w-[720px] mx-auto flex flex-col gap-4">
          <h2 className="font-heading font-bold text-[clamp(1.7rem,3vw,1.95rem)] text-cream mb-1">
            PuppyQ – Q is for Quotient
          </h2>
          <p className="text-[1rem] text-cream/80 leading-[1.78]">
            Q stands for Quotient. We track thirteen of them, using C-BARQ — a validated
            behavior assessment from the University of Pennsylvania. It measures things like
            trainability, energy, and how your puppy responds to new people, dogs, and
            situations.
          </p>
          <p className="text-[1rem] text-cream/80 leading-[1.78]">
            C-BARQ — the Canine Behavioral Assessment and Research Questionnaire — was
            developed at the University of Pennsylvania by Dr. James Serpell and Dr. Yuying
            Hsu in 2003, to give owners and researchers a standardized way to measure real
            canine behavior. It’s since been used in tens of thousands of evaluations
            worldwide. PuppyQ provides this evaluation to all forever families to help
            measure and improve its protocols.
          </p>
          <p className="text-[1rem] text-cream/80 leading-[1.78]">
            In conjunction with C-BARQ, PuppyQ has also developed its own Q Assessment,
            given to puppies at seven weeks by our certified ambassadors, before the puppy
            goes to its forever home. The Q Assessment is not used as a predictor of
            behavior, but as a look at the puppy’s early traits and temperament.
          </p>
        </div>
      </section>

      {/* ── WHAT EVERY PUPPY GOES HOME WITH ───────────────── */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-[1160px] mx-auto">
          <h2 className="font-heading font-bold text-[clamp(1.7rem,3vw,1.95rem)] text-navy mb-3.5">
            What every puppy goes home with
          </h2>
          <p className="text-[1rem] text-charcoal leading-[1.78] max-w-[640px] mb-7">
            Every Adams Farm puppy comes home with three things:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {included.map((item) => (
              <div
                key={item.title}
                className="bg-white border border-line rounded-xl p-7 shadow-[0_2px_16px_rgba(0,0,0,0.07)]"
              >
                <h3 className="font-heading font-semibold text-[1.1rem] text-navy mb-2.5">
                  {item.title}
                </h3>
                <p className="text-[0.9rem] text-muted leading-[1.72]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLOSING CTA ───────────────────────────────────── */}
      <section className="bg-navy py-[72px] px-6 border-t border-white/12">
        <div className="max-w-[1160px] mx-auto flex flex-col items-center text-center gap-6">
          <h2 className="font-heading font-bold text-[clamp(1.7rem,3vw,1.95rem)] text-cream">
            See our current puppies
          </h2>
          <Link
            href="/puppies2"
            className="inline-block bg-coral text-navy font-extrabold py-[14px] px-7 rounded-lg text-[0.95rem] hover:bg-coral-dark transition-colors"
          >
            See available puppies
          </Link>
        </div>
      </section>
    </main>
  );
}
