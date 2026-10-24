import Link from "next/link";
import { pqShortName, type PqLitter } from "@/lib/puppyq";

function fmtDate(iso: string | null) {
  if (!iso) return "Date not recorded";
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * A litter with no Available puppy left, as one row on the Puppies page
 * (Douglas, 2026-10-24, after Legend Manor's): the dam and sire by call name,
 * the date of birth and the number of puppies, the whole row linking to the
 * litter's page, where every puppy shows with its photo and status. A
 * co-litter names the partner program.
 */
export default function LitterRow({ litter }: { litter: PqLitter }) {
  const dam = litter.dam ? pqShortName(litter.dam) : (litter.damName ?? "Unknown dam");
  const sire = litter.sire ? pqShortName(litter.sire) : (litter.sireName ?? "Unknown sire");
  const count = litter.puppies.length;

  return (
    <Link
      href={`/litters/${litter.id}`}
      className="group flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 rounded-xl border border-warm-border bg-white px-5 py-4 transition-colors hover:border-coral sm:px-6"
    >
      <span className="min-w-0 text-navy">
        <span className="text-[0.68rem] font-extrabold uppercase tracking-[0.1em] text-navy/50">Dam </span>
        <span className="font-heading font-bold text-[1.05rem] group-hover:text-coral-dark">{dam}</span>
        <span className="mx-2 text-navy/40">×</span>
        <span className="text-[0.68rem] font-extrabold uppercase tracking-[0.1em] text-navy/50">Sire </span>
        <span className="font-heading font-bold text-[1.05rem] group-hover:text-coral-dark">{sire}</span>
        {litter.type === "co-litter" ? (
          <span className="ml-2 text-[0.68rem] font-extrabold uppercase tracking-[0.1em] text-coral-dark">
            Co-litter · {litter.coProgram ?? "Partner"}
          </span>
        ) : null}
      </span>
      <span className="text-[0.85rem] text-muted">
        {fmtDate(litter.birthdate)} · {count} {count === 1 ? "puppy" : "puppies"}{" "}
        <span className="text-coral-dark">→</span>
      </span>
    </Link>
  );
}
