import type { Metadata } from "next";
import { PawDots } from "@/components/PawDots";

export const metadata: Metadata = {
  title: "Admissions",
  description:
    "Talk with the Campbell family about whether an Adams Farm puppy is right for your household.",
};

export default function ContactPage() {
  return (
    <>
      <section className="bg-navy text-paper">
        <div className="mx-auto max-w-page px-[6vw] py-16 text-center sm:py-20">
          <PawDots className="justify-center" />
          <p className="smallcaps mt-6 text-excite">Admissions</p>
          <h1 className="mx-auto mt-4 max-w-[20ch] font-serif text-[34px] font-medium leading-[1.13] sm:text-[46px]">
            Families are matched, not queued.
          </h1>
          <p className="mx-auto mt-6 max-w-[54ch] text-[16px] leading-relaxed text-paper/75">
            Tell us about your household and we&apos;ll talk through whether an Adams Farm puppy
            is the right fit — before a litter is ever on the ground.
          </p>
        </div>
      </section>

      <section className="section bg-paper">
        <div className="mx-auto grid max-w-page gap-10 md:grid-cols-2">
          <div className="border border-rule bg-paper-2 p-7">
            <p className="smallcaps text-feelings-deep">By phone</p>
            <p className="mt-3 font-serif text-[30px] leading-none text-navy">
              <a href="tel:+13363388660" className="hover:text-feelings-deep">
                (336) 338-8660
              </a>
            </p>
            <p className="mt-4 text-[14.5px] leading-relaxed text-slate">
              The fastest way to reach us. We answer most days, and we&apos;d rather talk than
              trade forms.
            </p>
          </div>

          <div className="border border-rule bg-paper-2 p-7">
            <p className="smallcaps text-feelings-deep">Where we are</p>
            <p className="mt-3 font-serif text-[26px] leading-tight text-navy">
              Greensboro, North Carolina
            </p>
            <p className="mt-4 text-[14.5px] leading-relaxed text-slate">
              Puppies are whelped and raised in the Campbell home. Visits are part of how families
              are matched — we&apos;ll arrange one when the time is right.
            </p>
            <p className="smallcaps mt-5 text-slate-dim">ALAA Gold Paw Accredited</p>
          </div>
        </div>
      </section>
    </>
  );
}
