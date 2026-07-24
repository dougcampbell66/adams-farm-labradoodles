import type { Metadata } from "next";
import PageHero from "@/app/components/PageHero";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach out to Adams Farm Labradoodles — Greensboro, NC. Start the conversation about our Australian Labradoodle puppies.",
};

export default function ContactPage() {
  return (
    <main>
      <PageHero
        eyebrow="Get in touch"
        title="Contact Adams Farm"
        intro="Questions about an available puppy, the waitlist, or our program? Send us a message — we respond within 1–2 business days."
      />

      <section className="py-16 px-6 bg-cream">
        <div className="max-w-[1080px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_300px] gap-12">
          {/* Form */}
          <div>
            <h2 className="font-heading font-semibold text-navy text-[1.4rem] mb-6">
              Send us a message
            </h2>
            <ContactForm />
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-6">
            <div className="bg-warm-sand rounded-[14px] p-6">
              <h3 className="font-heading font-semibold text-navy text-[1.1rem] mb-4">
                Contact info
              </h3>
              <div className="flex flex-col gap-3 text-[0.92rem]">
                <div>
                  <span className="block font-extrabold text-[0.7rem] uppercase tracking-wider text-navy/60 mb-0.5">
                    Phone
                  </span>
                  <a
                    href="tel:3363388660"
                    className="text-navy font-extrabold hover:text-navy-hover transition-colors"
                  >
                    336-338-8660
                  </a>
                </div>
                <div>
                  <span className="block font-extrabold text-[0.7rem] uppercase tracking-wider text-navy/60 mb-0.5">
                    Location
                  </span>
                  <span className="text-charcoal">Greensboro, NC</span>
                </div>
                <div>
                  <span className="block font-extrabold text-[0.7rem] uppercase tracking-wider text-navy/60 mb-0.5">
                    Accreditation
                  </span>
                  <span className="text-charcoal">ALAA Gold Paw Accredited</span>
                </div>
              </div>
            </div>

            <div className="bg-warm-sand rounded-[14px] p-6">
              <h3 className="font-heading font-semibold text-navy text-[1.1rem] mb-3">
                What happens next
              </h3>
              <ol className="flex flex-col gap-2 text-[0.88rem] text-body-soft">
                {[
                  "We read every message personally",
                  "We'll reach out within 1–2 business days",
                  "We'll learn about your home and lifestyle",
                  "If it's a good fit, we'll add you to the waitlist",
                ].map((step, i) => (
                  <li key={i} className="flex gap-2.5 items-start">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-navy text-cream text-[0.65rem] font-extrabold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
