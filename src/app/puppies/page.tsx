import type { Metadata } from "next";
import { getLitters, formatDate } from "@/lib/adams-farm";

export const metadata: Metadata = {
  title: "Puppies",
  description: "Adams Farm litters, live from the PuppyQ record.",
};

export const revalidate = 300;

export default async function PuppiesPage() {
  const { litters, diagnostics } = await getLitters();

  return (
    <>
      <section className="bg-navy text-paper">
        <div className="mx-auto max-w-page px-[6vw] py-16 sm:py-20">
          <p className="smallcaps text-excite">Puppies</p>
          <h1 className="mt-4 max-w-[18ch] font-serif text-[36px] font-medium leading-[1.12] sm:text-[48px]">
            Every litter, on the record.
          </h1>
          <p className="mt-6 max-w-[58ch] text-[16px] leading-relaxed text-paper/75">
            Each litter completes the full socialization program before placement. Reach out early
            — families are matched before puppies are on the ground.
          </p>
        </div>
      </section>

      <section className="section bg-paper">
        <div className="mx-auto max-w-page">
          {litters.length === 0 ? (
            <div className="border border-rule bg-paper-2 p-7">
              <p className="smallcaps text-feelings-deep">No litters returned</p>
              <p className="mt-3 max-w-[58ch] text-[15px] leading-relaxed text-slate">
                No litters are currently recorded for Adams Farm in PuppyQ.
              </p>
              {diagnostics.errors.length > 0 ? (
                <ul className="mt-4 space-y-1.5 border-t border-rule pt-3 text-[13px] text-slate">
                  {diagnostics.errors.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : (
            <>
              <p className="smallcaps text-feelings-deep">
                Litters on record · {litters.length}
              </p>
              <div className="mt-7 divide-y divide-rule border border-rule bg-paper">
                {litters.map((l) => {
                  const whelped = formatDate(l.whelp_date);
                  return (
                    <article key={l.id} className="p-6 sm:p-7">
                      <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <h2 className="font-serif text-[24px] font-medium leading-tight text-navy">
                          {l.name?.trim() || "Unnamed litter"}
                        </h2>
                        {whelped ? (
                          <span className="smallcaps text-slate-dim">Whelped {whelped}</span>
                        ) : null}
                      </div>
                      {l.sire_name ? (
                        <p className="mt-2 text-[14.5px] text-slate">Sire · {l.sire_name}</p>
                      ) : null}
                      {l.notes ? (
                        <p className="mt-3 max-w-[68ch] text-[14.5px] leading-relaxed text-charcoal">
                          {l.notes}
                        </p>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
