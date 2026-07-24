import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/app/components/PageHero";

export const metadata: Metadata = {
  title: "Guardians",
  description:
    "Adams Farm's guardian model — breeding dogs raised in loving family homes, not a kennel.",
};

export default function GuardiansPage() {
  return (
    <main>
      <PageHero
        eyebrow="About our dogs"
        title="Guardians"
        intro="Raised in loving homes — not a kennel."
      />

      <section className="py-16 px-6 bg-cream">
        <div className="max-w-[680px] mx-auto flex flex-col gap-6">
          <p className="text-[1.05rem] text-charcoal leading-[1.75]">
            Adams Farm&apos;s breeding dogs don&apos;t live in a kennel. They live
            as members of a family — in loving homes, with people who care for them
            every day, while remaining part of our breeding program.
          </p>

          <p className="text-[1.05rem] text-charcoal leading-[1.75]">
            This is what makes the guardian model different: our dogs get to be
            dogs. They&apos;re loved, socialized, and part of daily life, not
            confined to a breeding facility. In return, guardian families give our
            program something a kennel never could — a dog raised the same way your
            puppy will be.
          </p>

          <p className="text-[1.05rem] text-charcoal leading-[1.75]">
            Puppies are whelped in the Campbell home, where Douglas and Erika
            oversee everything from birth through early development. But the sires
            and dams themselves — the dogs who make each litter possible — live
            their lives in the homes of families who love them.
          </p>

          <blockquote className="font-heading font-semibold italic text-[1.15rem] text-navy leading-relaxed border-l-4 border-coral pl-5 py-1">
            It&apos;s a simple idea: dogs raised in love make better companions.
            That&apos;s true for our breeding dogs, and it&apos;s true for the
            puppies they bring into the world.
          </blockquote>

          <Link
            href="/our-dogs"
            className="self-start text-[0.88rem] font-extrabold text-coral border-b-2 border-coral pb-[2px] hover:text-coral-dark transition-colors"
          >
            Meet our dogs →
          </Link>
        </div>
      </section>
    </main>
  );
}
