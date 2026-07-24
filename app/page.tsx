import Image from "next/image";
import Link from "next/link";
import PuppyQCards from "./components/PuppyQCards";
import { getPuppiesForLitter } from "@/src/data/litters";
import { testimonials } from "@/src/data/testimonials";

const homeStats = [
  { num: "6", label: "Litters" },
  { num: "56", label: "Puppies Raised" },
  { num: "15", label: "Five-Star Reviews" },
];

const aboutPillars = [
  {
    title: "Health, Verified",
    body: "ALAA Gold Paw accredited, with full hip, elbow, eye, and genetic testing on every breeding pair.",
  },
  {
    title: "Raised on PuppyQ",
    body: "Every puppy is individually handled from birth, then introduced to the world starting at four weeks old.",
  },
  {
    title: "Built for Families",
    body: "Non-shedding, allergy-friendly coats, and a 3-year health guarantee behind every puppy we place.",
  },
];

const trustCards = [
  {
    heading: "Verified Pedigree",
    body: "ALAA Australian Labradoodles have a verified pedigree that is checked against ALAA’s official database to confirm lineage.",
  },
  {
    heading: "Multi-Generational",
    body: "ALAA Australian Labradoodles have two registered parents and a lineage going back multiple generations.",
  },
  {
    heading: "Allergy-Friendly Coat",
    body: "ALAA Australian Labradoodles have a low shedding, curly or wavy coat that makes them allergy friendly for most people.",
  },
  {
    heading: "Temperament Bred",
    body: "ALAA Australian Labradoodles are bred for wonderful temperaments, making them ideal for families and therapy work.",
  },
];

const partners = [
  { src: "/images/credentials/sq-gold-paw.png", alt: "ALAA Gold Paw Breeder 2026–2027" },
  { src: "/images/credentials/sq-akc-reunite.png", alt: "AKC Reunite" },
  { src: "/images/credentials/sq-trupanion.png", alt: "Trupanion" },
  { src: "/images/credentials/sq-purina.png", alt: "Purina Pro Club" },
  { src: "/images/credentials/sq-puppyq.png", alt: "PuppyQ" },
  { src: "/images/credentials/baxter-and-bella-logo.png", alt: "Baxter & Bella" },
];

const faqs = [
  {
    q: "What is ALAA Gold Paw accreditation, and why does it matter?",
    a: "Gold Paw is our highest health-testing standard under the Australian Labradoodle Association of America — the accrediting body that verifies pedigrees and sets the breed standard. It means every breeding dog in our program is health tested and verified, not just labeled “Australian Labradoodle.”",
  },
  {
    q: "What makes an Australian Labradoodle different from other “doodle” breeds?",
    a: "A true Australian Labradoodle is a multi-generational breed with both parents being Australian Labradoodles themselves — not a first-generation Lab and Poodle mix. Only dogs registered with ALAA, ALCA, or WALA are held to that standard.",
  },
  {
    q: "Are Adams Farm puppies allergy friendly?",
    a: "Yes. Every puppy we place is guaranteed 100% non-shedding and allergy friendly. As ALAA notes, no dog is truly hypoallergenic, but a carefully bred, low-to-no-shedding coat makes the breed a strong option for allergy-sensitive families.",
  },
  {
    q: "What does “raised in loving homes” mean — do all your dogs live with you?",
    a: "Puppies are whelped in the Campbell home. Some of our breeding dogs live with us, and others live with trusted guardian families — but every dog in our program is raised in a loving home, never a kennel.",
  },
  {
    q: "What health guarantee comes with my puppy?",
    a: "We test breeding dogs for known congenital defects and back what can’t be tested for with a 3-year written guarantee, so your family can adopt with real confidence.",
  },
];

export default function Home() {
  const springPuppies = getPuppiesForLitter("spring-2026").filter(
    (p) => p.status === "available"
  );
  const featured = testimonials.find((t) => t.featured);
  const rest = testimonials.filter((t) => !t.featured);

  return (
    <main>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="bg-navy">
        <div className="max-w-[1160px] mx-auto px-6 grid md:grid-cols-[3fr_2fr] gap-10 md:gap-14 items-stretch">
          <div className="py-16 md:py-20 flex flex-col justify-center">
            <p className="text-[0.75rem] font-extrabold tracking-[0.14em] uppercase text-coral mb-3">
              Australian Labradoodles
            </p>
            <h1 className="font-heading font-bold text-[clamp(2rem,4vw,2.9rem)] leading-[1.15] text-cream mb-5">
              Raised in Loving Homes. Ready for Yours.
            </h1>
            <p className="text-[1.05rem] text-cream/75 leading-[1.7] max-w-[440px] mb-7">
              Every litter comes from fully health-tested parents and grows up
              surrounded by family, before going to yours.
            </p>
            <Link
              href="#puppies"
              className="self-start inline-block bg-coral text-navy font-extrabold py-[14px] px-7 rounded-lg text-[0.95rem] hover:bg-coral-dark transition-colors"
            >
              See available puppies
            </Link>
          </div>
          <div className="relative min-h-[420px] md:min-h-[540px]">
            <Image
              src="/images/hero/founder-hero-portrait.jpg"
              alt="A girl holding an Adams Farm Labradoodle puppy"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover"
              style={{ objectPosition: "center 15%" }}
            />
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────── */}
      <section className="bg-cream-panel border-b border-warm-border">
        <div className="max-w-[1160px] mx-auto px-6 py-8 flex flex-col sm:flex-row justify-center gap-8 sm:gap-16">
          {homeStats.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1">
              <span className="font-heading font-bold text-[clamp(2rem,4vw,2.6rem)] leading-none text-navy">
                {s.num}
              </span>
              <span className="text-[0.72rem] font-extrabold tracking-[0.1em] uppercase text-muted">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── AVAILABLE PUPPIES ───────────────────────────────── */}
      <section id="puppies" className="bg-white border-b border-line py-16">
        <div className="max-w-[1160px] mx-auto px-6">
          <div className="mb-8 max-w-[620px]">
            <p className="text-[0.75rem] font-extrabold tracking-[0.14em] uppercase text-coral-dark mb-2">
              Available Puppies
            </p>
            <h2 className="font-heading font-bold text-[clamp(1.7rem,3vw,1.95rem)] text-navy mb-2.5">
              Meet Our Lilo &amp; Stitch May Litter
            </h2>
            <p className="text-[0.95rem] text-muted leading-[1.65] mb-2.5">
              These practically perfect puppies come from Legend Manor’s Holly and
              Tarheel’s Knox, and are expected to mature into large minis between 20
              and 25 lbs.
            </p>
            <p className="text-[0.85rem] italic text-muted mb-3.5">
              Bred in partnership with Legend Manor Labradoodles
            </p>
            <Link
              href="/our-dogs"
              className="text-[0.85rem] font-extrabold text-navy border-b-[1.5px] border-coral pb-[2px] hover:text-coral-dark transition-colors"
            >
              Meet the Parents →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {springPuppies.map((p) => (
              <div key={p.id} className="bg-navy rounded-xl overflow-hidden">
                <div className="relative aspect-[3/4] w-full bg-cream-panel">
                  <Image
                    src={p.photo}
                    alt={p.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col gap-2 p-3.5">
                  <span className="text-[0.85rem] font-extrabold text-cream">
                    {p.name}
                  </span>
                  <span className="text-[0.7rem] text-cream/70 -mt-1.5">
                    {p.collar}
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[0.65rem] uppercase tracking-[0.07em] px-2.5 py-[3px] rounded-full font-extrabold bg-white/12 text-cream">
                      {p.sex}
                    </span>
                    <span className="text-[0.65rem] uppercase tracking-[0.07em] px-2.5 py-[3px] rounded-full font-extrabold bg-avail-bg text-avail-text">
                      Available
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Link
              href="/contact"
              className="inline-block bg-coral text-navy font-extrabold py-[14px] px-7 rounded-lg text-[0.95rem] hover:bg-coral-dark transition-colors"
            >
              Reserve a Puppy
            </Link>
          </div>
        </div>
      </section>

      {/* ── PUPPYQ PROGRAM ──────────────────────────────────── */}
      <section className="bg-navy py-16 md:py-[72px] border-t border-white/12">
        <div className="max-w-[1160px] mx-auto px-6">
          <p className="text-[0.75rem] font-extrabold tracking-[0.14em] uppercase text-coral mb-3">
            Our Program
          </p>
          <h2 className="font-heading font-bold text-[clamp(1.7rem,3vw,1.95rem)] text-cream mb-4">
            PuppyQ Raised and Certified
          </h2>
          <p className="text-[1rem] text-cream/75 leading-[1.72] max-w-[680px] mb-10">
            PuppyQ is an evidence-based framework for raising calm puppies.
            <br />Q stands for Quotient, marking four developmental periods from birth
            to adulthood. Adams Farm raises each puppy with intention and tracks
            benchmarks in the PuppyQ framework. Every puppy goes home with its PuppyQ
            Certification, Scorecard, and History.
          </p>

          <PuppyQCards />

          {/* Timeline */}
          <div className="mt-10">
            <svg
              viewBox="0 0 1000 220"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full max-w-[900px] h-auto block mx-auto"
            >
              <line x1="125" y1="110" x2="875" y2="110" className="stroke-white/20" strokeWidth="3" />
              <circle cx="125" cy="110" r="34" className="fill-focus-green" />
              <circle cx="375" cy="110" r="34" className="fill-calm-blue" />
              <circle cx="625" cy="110" r="34" className="fill-excite-yellow" />
              <circle cx="875" cy="110" r="34" className="fill-feelings-red" />
              <text x="125" y="117" textAnchor="middle" className="fill-white" fontSize="22" fontWeight="700">1</text>
              <text x="375" y="117" textAnchor="middle" className="fill-white" fontSize="22" fontWeight="700">2</text>
              <text x="625" y="117" textAnchor="middle" className="fill-navy" fontSize="22" fontWeight="700">3</text>
              <text x="875" y="117" textAnchor="middle" className="fill-white" fontSize="22" fontWeight="700">4</text>
              <text x="125" y="170" textAnchor="middle" className="fill-cream-soft" fontSize="15" fontWeight="600">Day 0–14</text>
              <text x="375" y="170" textAnchor="middle" className="fill-cream-soft" fontSize="15" fontWeight="600">Day 14–21</text>
              <text x="625" y="170" textAnchor="middle" className="fill-cream-soft" fontSize="15" fontWeight="600">Week 3–12</text>
              <text x="875" y="170" textAnchor="middle" className="fill-cream-soft" fontSize="15" fontWeight="600">Week 12–maturity</text>
            </svg>
          </div>
        </div>
      </section>

      {/* ── ABOUT ADAMS FARM ────────────────────────────────── */}
      <section className="bg-white py-16 md:py-[72px]">
        <div className="max-w-[1160px] mx-auto px-6 grid md:grid-cols-[2.5fr_3fr] gap-12 items-start">
          <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden relative">
            <Image
              src="/images/story/douglas-erika-winnie.jpg"
              alt="Douglas and Erika Campbell with Winnie"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover object-top"
            />
          </div>
          <div>
            <p className="text-[0.75rem] font-extrabold tracking-[0.14em] uppercase text-coral-dark mb-3">
              ALAA Gold Paw Accredited
            </p>
            <h2 className="font-heading font-bold text-[clamp(1.7rem,3vw,1.95rem)] text-navy mb-4">
              Adams Farm Labradoodles
            </h2>
            <p className="text-[1rem] text-charcoal leading-[1.78] mb-6">
              We are the Campbell Family. We have been raising Australian Labradoodles
              since January 2022. It began with the adoption of Legend Manor’s Prancer
              who became our foundation dog. We are committed to breeding and raising
              puppies and dogs with love and intention. We strive to improve our
              program and do something really meaningful in the lives of people and
              dogs.
            </p>
            <div className="grid sm:grid-cols-3 gap-6">
              {aboutPillars.map((p) => (
                <div key={p.title}>
                  <h3 className="font-heading font-semibold text-[1rem] text-navy mb-2">
                    {p.title}
                  </h3>
                  <p className="text-[0.875rem] text-muted leading-[1.72]">
                    {p.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────── */}
      <section id="testimonials" className="bg-navy py-16 md:py-[72px]">
        <div className="max-w-[1160px] mx-auto px-6">
          <p className="text-[0.75rem] font-extrabold tracking-[0.14em] uppercase text-coral mb-3">
            Testimonials
          </p>
          <h2 className="font-heading font-bold text-[clamp(1.7rem,3vw,1.95rem)] text-cream mb-8">
            Loved by Families
          </h2>

          {featured && (
            <div className="bg-white/[0.06] border border-white/12 rounded-2xl p-8 md:p-10 mb-6">
              <blockquote className="font-heading italic font-medium text-[1.2rem] md:text-[1.35rem] text-cream leading-[1.55] mb-5">
                “{featured.quote}”
              </blockquote>
              <p className="font-extrabold text-[0.85rem] text-coral">
                — {featured.family}
                {featured.year ? `, ${featured.year}` : ""}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {rest.map((t) => (
              <div
                key={t.id}
                className="bg-white/[0.06] border border-white/12 rounded-xl p-7"
              >
                <blockquote className="text-[0.97rem] text-cream/85 leading-[1.7] italic mb-4">
                  “{t.quote}”
                </blockquote>
                <p className="font-extrabold text-[0.82rem] text-cream">
                  — {t.family}
                  {t.year ? `, ${t.year}` : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY AUSTRALIAN LABRADOODLE (ALAA) ───────────────── */}
      <section className="bg-white py-16 md:py-[72px]">
        <div className="max-w-[1160px] mx-auto px-6">
          <div className="grid md:grid-cols-[3fr_2.5fr] gap-12 items-center">
            <div>
              <p className="text-[0.75rem] font-extrabold tracking-[0.14em] uppercase text-coral-dark mb-3">
                Better Breed by Design
              </p>
              <h2 className="font-heading font-bold text-[clamp(1.7rem,3vw,1.95rem)] text-navy mb-4 leading-tight">
                Australian Labradoodle
                <br />
                Association of America
              </h2>
              <p className="text-[1rem] text-charcoal leading-[1.78]">
                The Australian Labradoodle Association of America (ALAA) has been
                protecting and improving the Australian Labradoodle breed since 2004.
                ALAA sets the health-testing and breeding standards every member
                breeder must meet, verifies pedigrees, and holds breeders accountable
                to a formal code of ethics — reviewed and renewed annually.
              </p>
            </div>
            <Image
              src="/images/credentials/better-breed-by-design-badge.png"
              alt="Better Breed by Design"
              width={240}
              height={240}
              className="w-full max-w-[200px] md:max-w-[240px] h-auto mx-auto"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
            {trustCards.map((c) => (
              <div
                key={c.heading}
                className="bg-white border border-line rounded-xl p-7 shadow-[0_2px_16px_rgba(0,0,0,0.07)]"
              >
                <h3 className="font-heading font-semibold text-[1rem] text-navy mb-2.5">
                  {c.heading}
                </h3>
                <p className="text-[0.875rem] text-muted leading-[1.72]">{c.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-7">
            <a
              href="https://alaa-labradoodles.com/for-breeders/breed-standard/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[0.85rem] font-extrabold text-navy border-b-[1.5px] border-coral pb-[2px] hover:text-coral-dark transition-colors"
            >
              Learn more from ALAA →
            </a>
          </div>
        </div>
      </section>

      {/* ── BREAK QUOTE ─────────────────────────────────────── */}
      <section className="bg-navy py-20">
        <div className="max-w-[680px] mx-auto px-6 text-center">
          <blockquote className="font-heading italic font-medium text-[clamp(1.5rem,3vw,2.1rem)] text-cream leading-[1.55]">
            “Dogs are not our whole life, but they make our lives whole.”
            <cite className="block not-italic font-body text-[0.8rem] tracking-[0.06em] text-cream/55 mt-5">
              — Roger Caras
            </cite>
          </blockquote>
        </div>
      </section>

      {/* ── TRUSTED PARTNERS ────────────────────────────────── */}
      <section className="bg-white py-16 md:py-[72px] border-t border-b border-line">
        <div className="max-w-[1160px] mx-auto px-6">
          <p className="text-[0.75rem] font-extrabold tracking-[0.14em] uppercase text-coral-dark mb-3">
            Trusted Partners
          </p>
          <h2 className="font-heading font-bold text-[clamp(1.7rem,3vw,1.95rem)] text-navy mb-3">
            Our Partners
          </h2>
          <p className="text-[0.95rem] text-muted leading-[1.72] max-w-[680px] mb-10">
            Every Adams Farm puppy is raised with help from our incredible partners.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {partners.map((p) => (
              <div
                key={p.alt}
                className="bg-navy border border-white/10 rounded-xl p-5 flex items-center justify-center shadow-[0_2px_16px_rgba(0,0,0,0.18)]"
              >
                <Image
                  src={p.src}
                  alt={p.alt}
                  width={160}
                  height={160}
                  className="w-full h-auto"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── JOIN US ─────────────────────────────────────────── */}
      <section className="bg-navy py-16">
        <div className="max-w-[1160px] mx-auto px-6">
          <p className="text-[0.75rem] font-extrabold tracking-[0.14em] uppercase text-coral mb-3">
            Get Involved
          </p>
          <h2 className="font-heading font-bold text-[clamp(1.7rem,3vw,1.95rem)] text-cream mb-3">
            Join Us
          </h2>
          <p className="text-[1rem] text-cream/80 leading-[1.6] max-w-[640px] mb-8">
            We breed to do something really meaningful in the lives of people, puppies,
            and dogs. In our brief time as a breeder, we’ve touched over 15,000 total
            lives. Would you like to help us in our mission?
          </p>
          <div className="grid md:grid-cols-2 gap-8 max-w-[720px]">
            {[
              {
                n: "1",
                title: "Become a Guardian",
                body: "Provide a loving home for one of our breeding dogs, while we handle the rest.",
                href: "/guardians",
                link: "Learn About Guardians →",
              },
              {
                n: "2",
                title: "Become an Ambassador",
                body: "Help us socialize our puppies and spread a little puppy joy.",
                href: "/ambassadors",
                link: "Learn About Ambassadors →",
              },
            ].map((c) => (
              <div
                key={c.n}
                className="bg-white/[0.06] border border-white/12 rounded-xl p-8 hover:bg-white/[0.1] hover:-translate-y-0.5 transition-all"
              >
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[0.68rem] font-extrabold bg-coral text-navy mb-3.5">
                  {c.n}
                </span>
                <h3 className="font-heading font-semibold text-[1.15rem] text-cream mb-2.5">
                  {c.title}
                </h3>
                <p className="text-[0.9rem] text-cream/80 leading-[1.72] mb-3.5">
                  {c.body}
                </p>
                <Link
                  href={c.href}
                  className="text-[0.85rem] font-extrabold text-coral hover:text-coral-dark transition-colors"
                >
                  {c.link}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <section id="faq" className="bg-white py-16 md:py-[72px]">
        <div className="max-w-[1160px] mx-auto px-6">
          <p className="text-[0.75rem] font-extrabold tracking-[0.14em] uppercase text-coral-dark mb-3">
            FAQ
          </p>
          <h2 className="font-heading font-bold text-[clamp(1.7rem,3vw,1.95rem)] text-navy mb-8">
            Frequently Asked Questions
          </h2>
          <div className="flex flex-col gap-2">
            {faqs.map(({ q, a }) => (
              <details
                key={q}
                className="group bg-white border border-line rounded-xl overflow-hidden"
              >
                <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none font-heading font-semibold text-[1rem] text-navy leading-snug">
                  {q}
                  <span className="shrink-0 text-[1.4rem] font-light text-coral-dark leading-none group-open:rotate-45 transition-transform duration-200">
                    +
                  </span>
                </summary>
                <div className="px-6 pb-5 border-t border-line">
                  <p className="mt-4 text-[0.95rem] text-charcoal leading-[1.78]">
                    {a}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── APPLY NOW (red band) ────────────────────────────── */}
      <section className="bg-coral py-20">
        <div className="max-w-[1160px] mx-auto px-6 flex flex-col items-center text-center">
          <p className="text-[0.75rem] font-extrabold tracking-[0.14em] uppercase text-navy/70 mb-3">
            Get Started
          </p>
          <h2 className="font-heading font-bold text-[clamp(1.7rem,3vw,2rem)] text-navy mb-4">
            Reserve Your Adams Farm Puppy
          </h2>
          <p className="text-[1rem] text-navy/90 leading-[1.6] max-w-[520px] mb-9">
            Our litters are small and spots fill quickly. Fill out a short application
            and we’ll reach out to discuss your perfect match.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-white text-navy font-extrabold py-[14px] px-9 rounded-lg text-[0.95rem] hover:bg-cream transition-colors"
          >
            Apply Now
          </Link>
        </div>
      </section>
    </main>
  );
}
