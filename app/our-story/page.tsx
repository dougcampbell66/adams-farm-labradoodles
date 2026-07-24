import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/app/components/PageHero";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "How Adams Farm Labradoodles began — from a search for the right family dog to Winnie and our first litter.",
};

export default function OurStoryPage() {
  return (
    <main>
      <PageHero
        eyebrow="Adams Farm Labradoodles"
        title="Our Story"
        intro="How a search for the right family dog became Adams Farm."
      />

      <section className="py-16 px-6 bg-cream">
        <div className="max-w-[720px] mx-auto flex flex-col gap-6">
          <p className="text-[1.05rem] text-charcoal leading-[1.78]">
            It started with our kids, Julian and Marie Claire, begging for a
            puppy. Instead of one, we decided to give them puppies — and set out
            to find the right breed. Our only real requirement was temperament:
            friendly, with no aggression toward people, dogs, or other animals.
            That search led us to Australian Labradoodles, and eventually to Mike
            and Pam Kirkpatrick of Legend Manor Labradoodles, and their dog
            Prancer — Winnie.
          </p>

          <p className="text-[1.05rem] text-charcoal leading-[1.78]">
            From the moment we met her, Erika knew. Winnie approached each of us
            gently, and it was clear how loving she was — the kind of dog that
            becomes a healing presence for a family. She joined ours, and after
            her third litter, gave us eight healthy puppies. That&rsquo;s how
            Adams Farm began.
          </p>

          <blockquote className="font-heading font-semibold italic text-[1.25rem] text-navy leading-[1.5] border-l-4 border-coral pl-6 py-2">
            &ldquo;A great dog can be a healing presence for your whole
            family.&rdquo;
            <cite className="block not-italic font-body text-[0.8rem] tracking-[0.06em] text-tan mt-2.5">
              — Erika Campbell
            </cite>
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
