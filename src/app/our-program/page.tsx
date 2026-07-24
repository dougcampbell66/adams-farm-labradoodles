import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Our Program",
  description:
    "Adams Farm raises every puppy to PuppyQ protocols — an evidence-based socialization " +
    "framework built on AVSAB guidelines. 10 events, 10 locations, 100 people by 8 weeks.",
};

/**
 * The four developmental periods, from the live Our Program page.
 *
 * Numbering is legitimate here: these are consecutive windows of time, and the
 * order is the information.
 */
const PERIODS = [
  {
    n: "1",
    name: "Neonatal Period",
    when: "Day 0–14",
    body:
      "Puppies are born blind and deaf, their brains not yet ready to learn. Every puppy is " +
      "weighed and gently handled, one on one, every single day.",
    color: "border-l-calm",
  },
  {
    n: "2",
    name: "Transition Period",
    when: "Day 14–21",
    body:
      "Eyes and ears open and the puppy comes online for the first time. Handling stays calm " +
      "and quiet while first impressions form.",
    color: "border-l-focus",
  },
  {
    n: "3",
    name: "Socialization Period",
    when: "Week 3–12",
    body:
      "The critical window for meeting the world — and it stays open after your puppy comes " +
      "home. Puppies meet people, places, and friendly dogs through steady, everyday exposure.",
    color: "border-l-excite",
  },
  {
    n: "4",
    name: "Juvenile Period",
    when: "Week 12 to sexual maturity",
    body:
      "The socialization window has closed and your growing puppy enters adolescence. Keep up " +
      "the outings and routines that carry the foundation forward.",
    color: "border-l-feelings",
  },
];

const TAKEAWAYS = [
  {
    title: "PuppyQ Certification",
    body: "Proof your puppy met the full standard: 10 events, 10 locations, 100 people.",
  },
  {
    title: "PuppyQ Scorecard",
    body:
      "Your puppy's seven-week snapshot, plus the eight-month follow-up that shows real growth.",
  },
  {
    title: "PuppyQ History",
    body: "A full record of your puppy's first weeks — every person, place, and milestone.",
  },
];

export default function OurProgramPage() {
  return (
    <>
      <section className="bg-navy text-paper">
        <div className="mx-auto max-w-page px-[6vw] py-16 sm:py-20">
          <p className="smallcaps text-excite">Our Program</p>
          <h1 className="mt-4 max-w-[24ch] font-serif text-[34px] font-medium leading-[1.13] sm:text-[46px]">
            A puppy&apos;s most important weeks are its first three months.
          </h1>
          <p className="mt-6 max-w-[60ch] text-[16px] leading-relaxed text-paper/75">
            That&apos;s what we build around.
          </p>
        </div>
      </section>

      {/* AVSAB quote — the evidence base, stated up front like a prospectus would */}
      <section className="section bg-paper-2">
        <div className="mx-auto max-w-page">
          <blockquote className="mx-auto max-w-[60ch] border-l-2 border-feelings pl-6 font-serif text-[20px] italic leading-relaxed text-navy sm:text-[23px]">
            The primary and most important time for puppy socialization is the first three months
            of life. During this time puppies should be exposed to as many new people, animals,
            stimuli and environments as can be achieved safely and without causing
            overstimulation.
            <cite className="smallcaps mt-5 block not-italic text-slate-dim">
              American Veterinary Society of Animal Behavior
            </cite>
          </blockquote>
        </div>
      </section>

      {/* the framework */}
      <section className="section bg-paper">
        <div className="mx-auto max-w-page">
          <p className="smallcaps text-feelings-deep">The PuppyQ Framework</p>
          <h2 className="mt-3 max-w-[24ch] font-serif text-[30px] font-medium leading-tight text-navy sm:text-[38px]">
            Four periods, birth to adulthood.
          </h2>
          <p className="mt-4 max-w-[64ch] text-[15.5px] leading-relaxed text-slate">
            PuppyQ is an evidence-based framework for raising calm, well-socialized puppies. Adams
            Farm raises each puppy following PuppyQ protocols and provides a PuppyQ Scorecard and
            History. The framework organizes development into four periods — each a window of time
            when specific work happens.
          </p>

          <ol className="mt-10 grid gap-5 md:grid-cols-2">
            {PERIODS.map((p) => (
              <li key={p.n} className={`border border-rule border-l-4 bg-paper-2 p-6 ${p.color}`}>
                <div className="flex items-baseline gap-3">
                  <span className="font-serif text-[28px] leading-none text-navy tabular-nums">
                    {p.n}
                  </span>
                  <div>
                    <h3 className="font-serif text-[21px] font-medium leading-tight text-navy">
                      {p.name}
                    </h3>
                    <p className="smallcaps mt-1 text-slate-dim">{p.when}</p>
                  </div>
                </div>
                <p className="mt-4 text-[14.5px] leading-relaxed text-charcoal">{p.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* the benchmark */}
      <section className="bg-navy text-paper">
        <div className="mx-auto max-w-page px-[6vw] py-20 sm:py-24">
          <p className="smallcaps text-excite">PuppyQ Socialization Benchmarks</p>
          <h2 className="mt-4 max-w-[22ch] font-serif text-[30px] font-medium leading-tight sm:text-[40px]">
            One hundred people by eight weeks. Then a hundred more.
          </h2>
          <p className="mt-5 max-w-[64ch] text-[15.5px] leading-relaxed text-paper/75">
            Our goal follows Dr. Ian Dunbar&apos;s two-part benchmark: 100 people by 8 weeks with
            us, and 100 more in the first month home with you. It&apos;s a shared effort — we lay
            the foundation during your puppy&apos;s first weeks, and you carry it forward through
            the most formative days of their life.
          </p>

          <div className="mt-10 grid gap-px border border-paper/20 bg-paper/20 sm:grid-cols-3">
            {[
              ["10", "Events"],
              ["10", "Locations"],
              ["100", "People"],
            ].map(([n, l]) => (
              <div key={l} className="bg-navy px-6 py-8 text-center">
                <div className="font-serif text-[44px] leading-none text-excite tabular-nums">
                  {n}
                </div>
                <div className="smallcaps mt-3 text-paper/70">{l}</div>
              </div>
            ))}
          </div>
          <p className="smallcaps mt-4 text-paper/60">
            To earn PuppyQ Certification, every puppy meets this standard by 8 weeks
          </p>

          <blockquote className="mt-12 max-w-[40ch] font-serif text-[22px] italic leading-snug text-paper sm:text-[26px]">
            Prevention is better than intervention.
            <cite className="smallcaps mt-4 block not-italic text-excite">Dr. Ian Dunbar</cite>
          </blockquote>
        </div>
      </section>

      {/* C-BARQ */}
      <section className="section bg-paper">
        <div className="mx-auto max-w-page">
          <p className="smallcaps text-feelings-deep">PuppyQ — Q is for Quotient</p>
          <h2 className="mt-3 max-w-[24ch] font-serif text-[30px] font-medium leading-tight text-navy sm:text-[38px]">
            Thirteen quotients, measured with a validated instrument.
          </h2>
          <div className="mt-6 grid gap-8 lg:grid-cols-2">
            <p className="text-[15.5px] leading-relaxed text-slate">
              PuppyQ tracks thirteen quotients using C-BARQ — the Canine Behavioral Assessment and
              Research Questionnaire, developed at the University of Pennsylvania by Dr. James
              Serpell and Dr. Yuying Hsu in 2003. It measures trainability, energy, and how your
              puppy responds to new people, dogs, and situations, and has since been used in tens
              of thousands of evaluations worldwide.
            </p>
            <p className="text-[15.5px] leading-relaxed text-slate">
              Alongside C-BARQ, PuppyQ has developed its own Q Assessment, given to puppies at
              seven weeks by certified ambassadors before the puppy goes to its forever home. The Q
              Assessment isn&apos;t used as a predictor of behavior, but as a look at the
              puppy&apos;s early traits and temperament.
            </p>
          </div>
        </div>
      </section>

      {/* what every puppy goes home with */}
      <section className="section bg-paper-2">
        <div className="mx-auto max-w-page">
          <p className="smallcaps text-feelings-deep">What every puppy goes home with</p>
          <h2 className="mt-3 font-serif text-[30px] font-medium leading-tight text-navy sm:text-[38px]">
            Three documents, not a promise.
          </h2>

          <div className="mt-9 grid gap-5 md:grid-cols-3">
            {TAKEAWAYS.map((t) => (
              <article key={t.title} className="border border-rule bg-paper p-6">
                <h3 className="font-serif text-[20px] font-medium leading-snug text-navy">
                  {t.title}
                </h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-charcoal">{t.body}</p>
              </article>
            ))}
          </div>

          <Link
            href="/puppies"
            className="smallcaps mt-10 inline-block bg-navy px-7 py-3.5 text-paper transition-colors hover:bg-navy-deep"
          >
            See our current puppies
          </Link>
        </div>
      </section>
    </>
  );
}
