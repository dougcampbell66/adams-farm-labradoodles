import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/app/components/PageHero";

export const metadata: Metadata = {
  title: "Safety & Protocols",
  description:
    "How Adams Farm socializes puppies safely during the critical early window — grounded in current veterinary behavior science.",
};

export default function SafetyAndProtocolsPage() {
  return (
    <main>
      <PageHero
        eyebrow="Our Approach"
        title="Safety & Protocols"
        intro="Early socialization, done responsibly — and why waiting carries a greater risk."
      />

      <section className="py-16 px-6 bg-cream">
        <div className="max-w-[680px] mx-auto flex flex-col gap-5">
          <p className="text-[1.05rem] text-charcoal leading-[1.78]">
            One of the most common questions we hear is about taking puppies out
            into the world before their full vaccine series is finished. It&rsquo;s
            a fair question, and it deserves a straight answer grounded in what the
            science actually says.
          </p>

          <h2 className="font-heading font-semibold text-[1.3rem] text-coral-dark mt-3">
            The window doesn&rsquo;t wait
          </h2>
          <p className="text-[1.05rem] text-charcoal leading-[1.78]">
            A puppy&rsquo;s socialization window opens early and closes at around
            12 to 14 weeks — well before the standard vaccine schedule is complete.
            That creates a real tension: the weeks that matter most for a
            dog&rsquo;s lifelong temperament overlap with the weeks before full
            immunity. Waiting for the vaccine series to finish doesn&rsquo;t
            sidestep the risk — it means missing the window entirely.
          </p>
        </div>
      </section>

      {/* AVSAB standout band */}
      <section className="bg-navy py-14 px-6 border-l-4 border-coral">
        <div className="max-w-[680px] mx-auto">
          <h2 className="font-heading font-semibold text-[1.3rem] text-excite-yellow mb-3.5">
            What the veterinary science says
          </h2>
          <p className="text-[1.05rem] text-cream/85 leading-[1.78]">
            The American Veterinary Society of Animal Behavior has taken a clear
            position: for most puppies, thoughtful early socialization should begin
            well before the vaccine series is complete. In their view, behavioral
            problems — not infectious disease — are the leading cause of death for
            dogs under three years old, and the fear and reactivity of
            under-socialization are what lead so many dogs to be given up or put
            down. Under-socialization, statistically, is the more dangerous path.
          </p>
        </div>
      </section>

      <section className="py-16 px-6 bg-cream">
        <div className="max-w-[680px] mx-auto flex flex-col gap-5">
          <h2 className="font-heading font-semibold text-[1.3rem] text-coral-dark">
            What &ldquo;responsible&rdquo; means in practice
          </h2>
          <p className="text-[1.05rem] text-charcoal leading-[1.78]">
            Responsible early exposure isn&rsquo;t the dog park. It means:
          </p>
          <ul className="flex flex-col gap-3 pl-5 list-disc marker:text-coral text-[1.02rem] text-charcoal leading-[1.7]">
            <li>
              Controlled, chosen settings — not places where dogs of unknown
              vaccination status may have been.
            </li>
            <li>
              Healthy, known dogs only — never unfamiliar dogs whose history we
              can&rsquo;t verify.
            </li>
            <li>Avoiding high-risk surfaces where disease tends to linger.</li>
            <li>
              Following our veterinarian&rsquo;s guidance on the partial protection
              a puppy already carries during this period.
            </li>
          </ul>
          <p className="text-[1.05rem] text-charcoal leading-[1.78]">
            Done this way, the world becomes a classroom without becoming a hazard.
          </p>

          <p className="font-heading font-semibold italic text-[1.15rem] text-coral-dark leading-[1.5] border-l-4 border-coral pl-6 py-1">
            This is the heart of how we raise calm puppies: not by keeping them
            sheltered until it&rsquo;s convenient, but by bringing them into the
            world carefully, at the age when it does the most good.
          </p>

          <Link
            href="/our-program"
            className="self-start mt-2 inline-block bg-coral text-navy font-extrabold py-[14px] px-7 rounded-lg text-[0.95rem] hover:bg-coral-dark transition-colors"
          >
            See the full PuppyQ approach →
          </Link>
        </div>
      </section>
    </main>
  );
}
