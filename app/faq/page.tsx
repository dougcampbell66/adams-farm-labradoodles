import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/app/components/PageHero";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Common questions about Adams Farm Labradoodles — breed, health testing, waitlist, and more.",
};

const faqs = [
  {
    q: "What is an Australian Labradoodle — and how is it different from a Labradoodle?",
    a: 'An Australian Labradoodle is a purposefully developed breed, not simply a Labrador/Poodle cross. Multiple generations of selective breeding have stabilized coat type, temperament, and health traits. Adams Farm dogs are multi-generational (F3+) and ALAA registered, meaning their lineage is traceable and verified — very different from a first-generation "designer dog."',
  },
  {
    q: "Is the non-shedding coat actually consistent?",
    a: "Our multi-generational dogs consistently produce fleece or wool coats that are low-to-non-shedding. Because our dogs are F3+ multi-generational, coat traits are highly stable — unlike early-generation crosses where coat type can vary significantly from puppy to puppy in the same litter.",
  },
  {
    q: "Are Australian Labradoodles good for people with allergies?",
    a: "Many families with mild-to-moderate pet allergies do very well with Australian Labradoodles, thanks to the low-dander, non-shedding coat. No dog is truly hypoallergenic. If allergies are a concern, we recommend spending time with an adult dog before committing — we're happy to arrange a visit.",
  },
  {
    q: "Are your breeding dogs health tested?",
    a: "Yes. Both Silas and Macy have completed OFA hip and elbow evaluations, OFA eye exams (CAER), and full DNA genetic panels through Orivet. Full test results are available on request and on each dog's profile page. Our protocols meet or exceed ALAA Gold Paw standards, and OFA results can be verified independently at ofa.org.",
  },
  {
    q: "What does your health guarantee cover?",
    a: "We provide a 3-year guarantee covering debilitating congenital conditions present from birth — including severe hip/elbow dysplasia, PRA, and severe cardiac defects. If a covered condition is confirmed by a licensed veterinarian, we provide a replacement puppy of equal or lesser value from the next available litter.",
  },
  {
    q: "Are you ALAA accredited?",
    a: "Yes. Adams Farm Labradoodles is an accredited breeder with the Australian Labradoodle Association of America. The ALAA is the only registering body that maintains a verified studbook for the Australian Labradoodle breed. Accreditation requires annual audits of health testing, facility standards, and breeding practices.",
  },
  {
    q: "How does your waitlist work?",
    a: "Start by filling out our contact form. We'll connect to learn about your home and lifestyle, then add you to the waitlist once a litter is confirmed. We match families to puppies at 6–7 weeks based on temperament, energy level, and household fit — not strictly by signup order.",
  },
  {
    q: "Can we visit and meet your breeding dogs before committing?",
    a: "Absolutely — and we encourage it. Families are welcome to visit in person to meet Silas and Macy before making any commitment. Just reach out through our contact form to schedule a time.",
  },
  {
    q: "Where are you located, and when can we visit the puppies?",
    a: "We're located in Greensboro, NC. Families visit puppies in person at 6 weeks, once they've had their initial vaccines and dewormings. From birth through pickup day, you'll receive weekly photo and video updates — and we offer live video calls so you can watch your puppy grow.",
  },
  {
    q: "When do puppies go home, and what's included?",
    a: "Puppies go home at 8 weeks. Each puppy comes with a full veterinary exam, initial vaccinations, deworming, microchip, health guarantee, and a puppy package that includes food, a familiar-scented item, and a care guide to help them settle in.",
  },
];

export default function FAQPage() {
  return (
    <main>
      <PageHero
        eyebrow="Common questions"
        title="Frequently Asked Questions"
        intro="Everything you want to know about the breed, our health program, and how to get a puppy."
      />

      <section className="py-16 px-6 bg-cream">
        <div className="max-w-[760px] mx-auto">
          <div className="flex flex-col divide-y divide-warm-border border-t border-warm-border">
            {faqs.map(({ q, a }) => (
              <details key={q} className="group py-1">
                <summary className="flex items-center justify-between gap-4 py-5 cursor-pointer list-none font-heading font-semibold text-[1.05rem] text-navy select-none">
                  {q}
                  <span className="shrink-0 text-[1.5rem] font-light text-coral leading-none group-open:rotate-45 transition-transform duration-200">
                    +
                  </span>
                </summary>
                <p className="pb-6 text-[0.97rem] text-charcoal leading-relaxed max-w-[640px]">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 px-6 bg-warm-sand border-t border-warm-border">
        <div className="max-w-[760px] mx-auto flex items-center gap-6 flex-wrap">
          <p className="font-heading font-semibold text-navy text-[1.15rem]">
            Still have questions?
          </p>
          <Link
            href="/contact"
            className="inline-block bg-coral text-white font-extrabold py-[12px] px-6 rounded-lg text-[0.9rem] hover:bg-coral-dark transition-colors"
          >
            Send us a message
          </Link>
        </div>
      </section>
    </main>
  );
}
