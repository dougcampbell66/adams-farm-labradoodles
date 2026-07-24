import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Story",
  description: "How a search for the right family dog became Adams Farm Labradoodles.",
};

export default function OurStoryPage() {
  return (
    <>
      <section className="bg-navy text-paper">
        <div className="mx-auto max-w-page px-[6vw] py-16 sm:py-20">
          <p className="smallcaps text-excite">Our Story</p>
          <h1 className="mt-4 max-w-[22ch] font-serif text-[34px] font-medium leading-[1.13] sm:text-[46px]">
            How a search for the right family dog became Adams Farm.
          </h1>
        </div>
      </section>

      <section className="section bg-paper">
        <div className="mx-auto max-w-[720px]">
          <div className="flex flex-col gap-6 text-[16.5px] leading-[1.78] text-charcoal">
            <p>
              It started with our kids, Julian and Marie Claire, begging for a puppy. Instead of
              one, we decided to give them puppies — and set out to find the right breed. Our only
              real requirement was temperament: friendly, with no aggression toward people, dogs,
              or other animals.
            </p>
            <p>
              That search led us to Australian Labradoodles, and eventually to Mike and Pam
              Kirkpatrick of Legend Manor Labradoodles, and their dog Prancer — Winnie. From the
              moment we met her, Erika knew. Winnie approached each of us gently, and it was clear
              how loving she was — the kind of dog that becomes a healing presence for a family.
            </p>
            <p>
              She joined ours, and after her third litter, gave us eight healthy puppies.
              That&apos;s how Adams Farm began.
            </p>
          </div>

          <blockquote className="mt-10 border-l-2 border-feelings py-1 pl-6 font-serif text-[22px] italic leading-snug text-navy">
            A great dog can be a healing presence for your whole family.
            <cite className="smallcaps mt-4 block not-italic text-slate-dim">Erika Campbell</cite>
          </blockquote>
        </div>
      </section>
    </>
  );
}
