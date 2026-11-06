import Link from "next/link";
import { pqDogHref, pqName, type PqDog, type PuppyQ } from "@/lib/puppyq";

// A dog's pedigree, four generations — Legend Manor's LivePedigreeTree in
// Adams Farm's colours (pawsq PEDIGREE.md G4: four generations up). The dog
// sits on the left; ancestors grow to the right, sire over dam. The tree
// walks sire_id / dam_id through every dog the record holds — Adams Farm's
// own, a partner program's, or an ancestor added for the pedigree — and
// falls back to the free-text sire_name / dam_name where there is no row to
// walk into. An ancestor links only when it has a page on this site.

const MAX_GEN = 4;

function LeafCard({ role, name }: { role: "sire" | "dam"; name: string }) {
  return (
    <div className="min-w-[180px] rounded-lg border border-dashed border-warm-border bg-cream/60 px-4 py-3">
      <div className="text-[0.62rem] font-extrabold uppercase tracking-[0.1em] text-muted">{role}</div>
      <div className="mt-0.5 font-heading text-[0.95rem] leading-tight text-navy/80">{name}</div>
    </div>
  );
}

function DogNodeCard({
  dog,
  pq,
  role,
  root = false,
}: {
  dog: PqDog;
  pq: PuppyQ;
  role?: "sire" | "dam";
  root?: boolean;
}) {
  const ours = pq.dogs.some((d) => d.id === dog.id);
  const eyebrow = root ? "This dog" : `${role ?? "parent"} · ${ours ? "Adams Farm" : "Outside line"}`;
  const href = root ? null : pqDogHref(dog, pq);

  const body = (
    <>
      <div className={`text-[0.62rem] font-extrabold uppercase tracking-[0.1em] ${root ? "text-coral" : "text-coral-dark"}`}>
        {eyebrow}
      </div>
      <div
        className={`mt-0.5 font-heading text-[1rem] font-bold leading-tight ${
          root ? "text-cream" : "text-navy group-hover:text-coral-dark"
        }`}
      >
        {pqName(dog)}
      </div>
      {dog.color ? (
        <div className={`text-[0.75rem] capitalize ${root ? "text-cream/70" : "text-muted"}`}>{dog.color}</div>
      ) : null}
    </>
  );

  const className = `group block min-w-[180px] rounded-lg border px-4 py-3 transition-colors ${
    root ? "border-transparent bg-navy" : "border-warm-border bg-white hover:border-coral"
  }`;

  return href ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

function PedigreeNode({
  dog,
  gen,
  pq,
  byId,
  role,
  root = false,
}: {
  dog: PqDog;
  gen: number;
  pq: PuppyQ;
  byId: Map<string, PqDog>;
  role?: "sire" | "dam";
  root?: boolean;
}) {
  const sire = dog.sire_id ? (byId.get(dog.sire_id) ?? null) : null;
  const dam = dog.dam_id ? (byId.get(dog.dam_id) ?? null) : null;
  const slot = (parent: PqDog | null, name: string | null, r: "sire" | "dam") =>
    parent ? (
      <PedigreeNode dog={parent} role={r} gen={gen + 1} pq={pq} byId={byId} />
    ) : (
      <LeafCard role={r} name={name ?? "Not recorded"} />
    );

  return (
    <div className="flex items-center gap-4">
      <DogNodeCard dog={dog} pq={pq} role={role} root={root} />
      {gen < MAX_GEN ? (
        <div className="flex flex-col gap-3 border-l-2 border-coral/40 pl-4">
          {slot(sire, dog.sire_name, "sire")}
          {slot(dam, dog.dam_name, "dam")}
        </div>
      ) : null}
    </div>
  );
}

export default function PedigreeTree({ dog, pq }: { dog: PqDog; pq: PuppyQ }) {
  const byId = new Map(pq.allDogs.map((d) => [d.id, d]));
  return (
    <div className="overflow-x-auto pb-2">
      <div className="inline-block min-w-full">
        <PedigreeNode dog={dog} gen={1} pq={pq} byId={byId} root />
      </div>
    </div>
  );
}
