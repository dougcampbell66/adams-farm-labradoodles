import Link from "next/link";
import { PawDots } from "@/components/PawDots";
import { getCounts } from "@/lib/adams-farm";

// Counts come from the live record, so the trust strip can't drift out of date.
export const revalidate = 300;

/**
 * What every puppy leaves with — taken from the live Our Program page.
 *
 * PuppyQ is an independent, evidence-based framework; Adams Farm raises each
 * puppy to its protocols. Wording here keeps that relationship straight: we
 * *follow* PuppyQ and issue its documents, we don't own it.
 */
const TAKEAWAYS = [
  {
    title: "PuppyQ Certification",
    body: "Proof your puppy met the full standard: 10 events, 10 locations, 100 people.",
    stat: "By 8 weeks",
    accent: "border-t-calm",
  },
  {
    title: "PuppyQ Scorecard",
    body:
      "Your puppy's seven-week snapshot, plus the eight-month follow-up that shows real growth.",
    stat: "Scored twice",
    accent: "border-t-focus",
  },
  {
    title: "PuppyQ History",
    body: "A full record of your puppy's first weeks — every person, place, and milestone.",
    stat: "Complete record",
    accent: "border-t-excite",
  },
];

export default async function HomePage() {
  const { dogs, litters } = await getCounts();

  const credentials: { value: string; label: string }[] = [
    { value: "Gold Paw", label: "ALAA accredited" },
    { value: String(dogs), label: "Dogs on record" },
    { value: String(litters), label: "Litters raised" },
    { value: "3-year", label: "Health guarantee" },
  ];

  return (
    <>
      {/* ------------------------------------------------------------ hero */}
      <section className="bg-navy text-paper">
        <div className="mx-auto max-w-page px-[6vw] py-20 text-center sm:py-28">
          <PawDots className="justify-center" />
          <p className="smallcaps mt-6 text-excite">
            ALAA Gold Paw Accredited · Greensboro, NC
          </p>
          <h1 className="mx-auto mt-5 max-w-[17ch] font-serif text-[38px] font-medium leading-[1.1] text-balance sm:text-[54px]">
            Raised in loving homes. Ready for yours.
          </h1>
          <p className="mx-auto mt-7 max-w-[54ch] text-[16px] leading-relaxed text-paper/80">
            Thirty to forty hours of hands-on socialization, structured early neurological
            stimulation, and a program built the way good preschools are — intentional, from day
            three.
          </p>
          <Link
            href="/puppies"
            className="smallcaps mt-9 inline-block bg-feelings px-8 py-3.5 text-paper transition-colors hover:bg-feelings-deep"
          >
            Meet the puppies
          </Link>
        </div>
      </section>

      {/* ------------------------------------------------------ credentials */}
      <section className="border-b border-rule bg-paper-2">
        <div className="mx-auto grid max-w-page grid-cols-2 md:grid-cols-4">
          {credentials.map((c, i) => (
            <div
              key={c.label}
              className={`px-6 py-7 text-center ${
                i < credentials.length - 1 ? "md:border-r md:border-rule" : ""
              } ${i % 2 === 0 ? "border-r border-rule md:border-r" : ""} ${
                i < 2 ? "border-b border-rule md:border-b-0" : ""
              }`}
            >
              <div className="font-serif text-[27px] leading-none text-navy tabular-nums">
                {c.value}
              </div>
              <div className="smallcaps mt-2.5 text-slate-dim">{c.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------- statement */}
      <section className="section bg-paper">
        <div className="mx-auto max-w-page text-center">
          <blockquote className="mx-auto max-w-[34ch] font-serif text-[24px] italic leading-snug text-navy sm:text-[30px]">
            Dogs are not our whole life, but they make our lives whole.
          </blockquote>
          <cite className="smallcaps mt-6 block not-italic text-slate-dim">
            The Campbell Family · Greensboro, North Carolina
          </cite>
        </div>
      </section>

      {/* ---------------------------------------------------------- program */}
      <section className="bg-navy text-paper">
        <div className="mx-auto max-w-page px-[6vw] py-20 sm:py-24">
          <p className="smallcaps text-excite">Our Program</p>
          <h2 className="mt-4 max-w-[22ch] font-serif text-[32px] font-medium leading-tight sm:text-[42px]">
            A standard we hold ourselves to, for every single puppy.
          </h2>
          <p className="mt-5 max-w-[62ch] text-[16px] leading-relaxed text-paper/75">
            We raise every litter to PuppyQ protocols — an evidence-based framework built on the
            American Veterinary Society of Animal Behavior&apos;s socialization guidelines. It
            isn&apos;t vague &ldquo;well-socialized&rdquo; language. It&apos;s a floor, and
            it&apos;s measured.
          </p>

          {/* The benchmark, given its own weight — this is the credential. */}
          <div className="mt-10 grid gap-px border border-paper/20 bg-paper/20 sm:grid-cols-3">
            {[
              ["10", "Events"],
              ["10", "Locations"],
              ["100", "People"],
            ].map(([n, l]) => (
              <div key={l} className="bg-navy px-6 py-7 text-center">
                <div className="font-serif text-[40px] leading-none text-excite tabular-nums">
                  {n}
                </div>
                <div className="smallcaps mt-3 text-paper/70">{l}</div>
              </div>
            ))}
          </div>
          <p className="smallcaps mt-4 text-paper/60">
            The PuppyQ Certification standard, met by 8 weeks
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {TAKEAWAYS.map((p) => (
              <article
                key={p.title}
                className={`border-t-4 bg-paper/[0.06] p-7 ${p.accent}`}
              >
                <h3 className="font-serif text-[21px] font-medium leading-snug">{p.title}</h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-paper/75">{p.body}</p>
                <p className="smallcaps mt-5 text-excite">{p.stat}</p>
              </article>
            ))}
          </div>

          <Link
            href="/our-program"
            className="smallcaps mt-10 inline-block border-b-2 border-excite pb-1 text-paper transition-colors hover:text-excite"
          >
            How the program works
          </Link>
        </div>
      </section>

      {/* -------------------------------------------------------- admissions */}
      <section className="section bg-paper-2">
        <div className="mx-auto max-w-page text-center">
          <p className="smallcaps text-feelings-deep">Admissions</p>
          <h2 className="mx-auto mt-4 max-w-[20ch] font-serif text-[30px] font-medium leading-tight text-navy sm:text-[38px]">
            Families are matched, not queued.
          </h2>
          <p className="mx-auto mt-5 max-w-[52ch] text-[15.5px] leading-relaxed text-slate">
            Tell us about your household and we&apos;ll talk through whether an Adams Farm puppy
            is the right fit — before a litter is ever on the ground.
          </p>
          <Link
            href="/contact"
            className="smallcaps mt-8 inline-block bg-navy px-8 py-3.5 text-paper transition-colors hover:bg-navy-deep"
          >
            Begin an application
          </Link>
        </div>
      </section>
    </>
  );
}
