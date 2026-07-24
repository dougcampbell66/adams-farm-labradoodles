import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/app/components/PageHero";

export const metadata: Metadata = {
  title: "Become a Guardian",
  description:
    "Adams Farm's guardian model — our breeding dogs live in loving family homes, not a kennel.",
};

export default function GuardiansPage() {
  return (
    <main>
      <PageHero
        eyebrow="Get Involved"
        title="Become a Guardian"
        intro="Give one of our breeding dogs a loving, permanent home — and we handle the rest."
      />

      <section className="py-16 px-6 bg-cream">
        <div className="max-w-[680px] mx-auto flex flex-col gap-5">
          <p className="text-[1.05rem] text-charcoal leading-[1.78]">
            Adams Farm&rsquo;s breeding dogs don&rsquo;t live in a kennel. They live as
            members of a family — in loving homes, with people who care for them every
            day, while remaining part of our breeding program.
          </p>

          <p className="text-[1.05rem] text-charcoal leading-[1.78]">
            This is what makes the guardian model different: our dogs get to be dogs.
            They&rsquo;re loved, socialized, and part of daily life, not confined to a
            breeding facility. In return, guardian families give our program something a
            kennel never could — a dog raised the same way your puppy will be.
          </p>

          <p className="text-[1.05rem] text-charcoal leading-[1.78]">
            Here&rsquo;s the idea in plain terms: a guardian family provides the everyday
            home — the walks, the couch, the belly rubs — and the dog lives with them
            full-time as a family pet. Adams Farm handles what&rsquo;s needed for the
            dog&rsquo;s role in the breeding program, and the dog only comes back to us
            briefly, for breeding or whelping, before returning home to its family.
          </p>

          <p className="text-[1.05rem] text-charcoal leading-[1.78]">
            Puppies are whelped in the Campbell home, where Douglas and Erika oversee
            everything from birth through early development. But the sires and dams
            themselves — the dogs who make each litter possible — live their lives in the
            homes of families who love them.
          </p>

          <p className="font-heading font-semibold italic text-[1.15rem] text-navy leading-[1.5] border-l-4 border-coral pl-6 py-1">
            It&rsquo;s a simple idea: dogs raised in love make better companions.
            That&rsquo;s true for our breeding dogs, and it&rsquo;s true for the puppies
            they bring into the world.
          </p>

          <p className="text-[1.05rem] text-charcoal leading-[1.78]">
            Every guardianship is a little different, and the specifics — what&rsquo;s
            involved, how it works, and what to expect — are things we walk through
            personally with each family. If the idea appeals to you, the best next step is
            simply to reach out and talk with us directly.
          </p>

          <div className="mt-3 flex items-center gap-5 flex-wrap">
            <a
              href="tel:+13363388660"
              className="inline-block bg-coral text-navy font-extrabold py-[14px] px-7 rounded-lg text-[0.95rem] hover:bg-coral-dark transition-colors"
            >
              Call 336-338-8660
            </a>
            <Link
              href="/contact"
              className="text-[0.9rem] font-extrabold text-navy border-b-[1.5px] border-coral pb-[2px] hover:text-coral-dark transition-colors"
            >
              Or send us a message →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
