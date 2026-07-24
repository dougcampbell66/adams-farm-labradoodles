import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Become a Guardian",
  description:
    "Give one of our breeding dogs a loving, permanent home — and we handle the rest.",
};

export default function GuardiansPage() {
  return (
    <>
      <section className="bg-navy text-paper">
        <div className="mx-auto max-w-page px-[6vw] py-16 sm:py-20">
          <p className="smallcaps text-excite">Get Involved</p>
          <h1 className="mt-4 max-w-[20ch] font-serif text-[34px] font-medium leading-[1.13] sm:text-[46px]">
            Become a Guardian.
          </h1>
          <p className="mt-6 max-w-[56ch] text-[16px] leading-relaxed text-paper/75">
            Give one of our breeding dogs a loving, permanent home — and we handle the rest.
          </p>
        </div>
      </section>

      <section className="section bg-paper">
        <div className="mx-auto max-w-[720px]">
          <div className="flex flex-col gap-5 text-[16.5px] leading-[1.78] text-charcoal">
            <p>
              Adams Farm&apos;s breeding dogs don&apos;t live in a kennel. They live as members of
              a family — in loving homes, with people who care for them every day, while remaining
              part of our breeding program.
            </p>
            <p>
              This is what makes the guardian model different: our dogs get to be dogs.
              They&apos;re loved, socialized, and part of daily life, not confined to a breeding
              facility. In return, guardian families give our program something a kennel never
              could — a dog raised the same way your puppy will be.
            </p>
            <p>
              Here&apos;s the idea in plain terms: a guardian family provides the everyday home —
              the walks, the couch, the belly rubs — and the dog lives with them full-time as a
              family pet. Adams Farm handles what&apos;s needed for the dog&apos;s role in the
              breeding program, and the dog only comes back to us briefly, for breeding or
              whelping, before returning home to its family.
            </p>
            <p>
              Puppies are whelped in the Campbell home, where Douglas and Erika oversee everything
              from birth through early development. But the sires and dams themselves — the dogs
              who make each litter possible — live their lives in the homes of families who love
              them.
            </p>
            <p className="font-serif text-[19px] italic text-navy">
              It&apos;s a simple idea: dogs raised in love make better companions. That&apos;s true
              for our breeding dogs, and it&apos;s true for the puppies they bring into the world.
            </p>
            <p>
              Every guardianship is a little different, and the specifics — what&apos;s involved,
              how it works, and what to expect — are things we walk through personally with each
              family. If the idea appeals to you, the best next step is simply to reach out and
              talk with us directly.
            </p>
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-5">
            <a
              href="tel:+13363388660"
              className="smallcaps bg-navy px-7 py-3.5 text-paper transition-colors hover:bg-navy-deep"
            >
              Call (336) 338-8660
            </a>
            <Link
              href="/contact"
              className="smallcaps border-b-2 border-feelings pb-1 text-navy transition-colors hover:text-feelings-deep"
            >
              Or send us a message
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
