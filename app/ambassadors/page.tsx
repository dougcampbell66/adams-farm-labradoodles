import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/app/components/PageHero";

export const metadata: Metadata = {
  title: "Become an Ambassador",
  description:
    "Help Adams Farm socialize our puppies — introducing them to new people, places, and experiences during the weeks that matter most.",
};

export default function AmbassadorsPage() {
  return (
    <main>
      <PageHero
        eyebrow="Get Involved"
        title="Become an Ambassador"
        intro="Help us raise calm puppies — by helping them meet the world."
      />

      <section className="py-16 px-6 bg-cream">
        <div className="max-w-[680px] mx-auto flex flex-col gap-5">
          <p className="text-[1.05rem] text-charcoal leading-[1.78]">
            Ambassadors help us do one of the most important things in raising a
            calm puppy: getting each one out into the world while they&rsquo;re
            young. It&rsquo;s simple, hands-on, and genuinely fun.
          </p>

          <p className="text-[1.05rem] text-charcoal leading-[1.78]">
            That might mean coming by to spend time with a litter, helping a
            puppy meet new people, or introducing them to new places, sounds, and
            everyday experiences. Every friendly new face and every new setting is
            part of how a puppy learns to take the world in stride.
          </p>

          <p className="text-[1.05rem] text-charcoal leading-[1.78]">
            There&rsquo;s a window early in a puppy&rsquo;s life when these
            experiences shape them the most, and it closes sooner than most people
            expect. The more good, gentle exposure a puppy gets during that time,
            the better — and that&rsquo;s exactly where ambassadors come in.
          </p>

          <p className="font-heading font-semibold italic text-[1.15rem] text-coral-dark leading-[1.5] border-l-4 border-coral pl-6 py-1">
            A little puppy joy, shared early, goes a long way.
          </p>

          <p className="text-[1.05rem] text-charcoal leading-[1.78]">
            We&rsquo;re still shaping exactly what this looks like, so if you love
            puppies and would like to be part of it, we&rsquo;d love to hear from
            you. Reach out and we&rsquo;ll tell you more.
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
              className="text-[0.9rem] font-extrabold text-coral-dark border-b-2 border-coral pb-[2px] hover:text-coral-dark transition-colors"
            >
              Or send us a message →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
