import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/app/components/PageHero";
import { testimonials } from "@/src/data/testimonials";

export const metadata: Metadata = {
  title: "Testimonials",
  description:
    "What families say about Adams Farm Labradoodles — real reviews from real families.",
};

export default function TestimonialsPage() {
  const featured = testimonials.find((t) => t.featured);
  const rest = testimonials.filter((t) => !t.featured);

  return (
    <main>
      <PageHero
        eyebrow="From Our Families"
        title="Loved by Families"
        intro={`${testimonials.length} families have brought home an Adams Farm Labradoodle. Here's what some of them have to say.`}
      />

      <section className="py-16 px-6 bg-cream">
        <div className="max-w-[1080px] mx-auto flex flex-col gap-6">
          {/* Featured */}
          {featured && (
            <div className="bg-navy rounded-[18px] p-8 md:p-10">
              <blockquote className="font-heading font-semibold text-[1.15rem] text-cream leading-relaxed mb-5 italic">
                &ldquo;{featured.quote}&rdquo;
              </blockquote>
              <p className="font-extrabold text-[0.85rem] text-coral">
                — {featured.family}
                {featured.year && `, ${featured.year}`}
              </p>
            </div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {rest.map((t) => (
              <div
                key={t.id}
                className="bg-warm-sand rounded-[14px] p-7"
              >
                <blockquote className="text-[0.97rem] text-charcoal leading-relaxed mb-4 italic">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <p className="font-extrabold text-[0.82rem] text-navy">
                  — {t.family}
                  {t.year && `, ${t.year}`}
                </p>
              </div>
            ))}
          </div>

          {/* Google CTA */}
          <div className="text-center pt-4">
            <p className="text-[0.95rem] text-[#4A4A4A] mb-4">
              Read more reviews on Google
            </p>
            <a
              href="https://share.google/FmRRIkSGouEi3RIFT"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-coral text-white font-extrabold py-[14px] px-7 rounded-lg text-[0.95rem] hover:bg-coral-dark transition-colors"
            >
              View Google Reviews →
            </a>
          </div>
        </div>
      </section>

      <section className="py-12 px-6 bg-warm-sand border-t border-warm-border text-center">
        <div className="max-w-[560px] mx-auto">
          <h2 className="font-heading font-semibold text-navy text-[1.5rem] mb-3">
            Ready to join the family?
          </h2>
          <p className="text-[0.95rem] text-[#4A4A4A] mb-6">
            Our litters are small and spots fill quickly. Fill out our short
            contact form to start the conversation.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-coral text-white font-extrabold py-[14px] px-7 rounded-lg text-[0.95rem] hover:bg-coral-dark transition-colors"
          >
            Apply Now
          </Link>
        </div>
      </section>
    </main>
  );
}
