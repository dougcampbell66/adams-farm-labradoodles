import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import CardPhoto from "@/app/components/CardPhoto";
import LitterRow from "@/app/components/LitterRow";
import PuppyCard from "@/app/components/PuppyCard";
import { resolveDogParam } from "@/lib/dog-url";
import {
  getPuppyQ,
  pqByBirthOrder,
  pqDogHref,
  pqLittersProduced,
  pqName,
  pqPhoto,
  pqPhotoFrame,
  pqPuppyPhoto,
  pqPuppyStanding,
  pqRegisteredName,
  pqRole,
  pqSex,
  pqShortName,
  type PqDog,
  type PuppyQ,
} from "@/lib/puppyq";

export const revalidate = 300;

// One page per dog and per puppy (pawsq DECISIONS-2026-11-05 R4), at
// /dogs/<registered-name>-MM-DD-YYYY (R5, lib/dog-url.ts). Any older address
// for the same dog — its id, its name without the date — forwards here. Only
// a dog on the Adams Farm record has a page: our own, every puppy and parent
// of a litter on the record, every dog we hold a breeding right on.

function lookup(pq: PuppyQ, param: string) {
  const r = resolveDogParam(pq.dogUrls, param);
  if (r.kind === "missing" || !pq.onRecordIds.has(r.id)) return null;
  const dog = pq.allDogs.find((d) => d.id === r.id) ?? null;
  return dog ? { dog, redirect: r.kind === "redirect" ? r.segment : null } : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const pq = await getPuppyQ();
  const hit = lookup(pq, id);
  if (!hit) return { title: "Dog not found" };
  const name = pqName(hit.dog);
  return {
    title: name,
    description: [name, hit.dog.breed, hit.dog.color].filter(Boolean).join(" — "),
  };
}

function fmtDate(iso: string | null) {
  if (!iso) return null;
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const STANDING_LABEL: Record<string, string> = {
  available: "Available",
  reserved: "Reserved",
  "in-program": "In the program",
  retained: "Retained",
  placed: "Adopted",
};

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-6 border-b border-white/12 py-2.5 last:border-0">
      <dt className="text-[0.8rem] text-cream/60">{label}</dt>
      <dd className="text-right text-[0.85rem] font-semibold capitalize text-cream">{value}</dd>
    </div>
  );
}

function ParentLink({ role, dog, name, pq }: { role: string; dog: PqDog | null; name: string | null; pq: PuppyQ }) {
  const label = dog ? pqShortName(dog) : name;
  if (!label) return null;
  const href = pqDogHref(dog, pq);
  return (
    <div>
      <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.1em] text-cream/60">{role}</p>
      {href ? (
        <Link href={href} className="font-heading text-[1.1rem] font-bold text-cream transition-colors hover:text-coral">
          {label} →
        </Link>
      ) : (
        <p className="font-heading text-[1.1rem] font-bold text-cream">{label}</p>
      )}
    </div>
  );
}

export default async function DogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pq = await getPuppyQ();
  const hit = lookup(pq, id);
  if (!hit) notFound();
  if (hit.redirect) permanentRedirect(`/dogs/${hit.redirect}`);
  const dog = hit.dog;

  const name = pqName(dog);
  const registered = pqRegisteredName(dog);
  const produced = pqLittersProduced(dog, pq.litters);
  const birthLitter = dog.litter_id ? (pq.litters.find((l) => l.id === dog.litter_id) ?? null) : null;
  const isPuppy = !!birthLitter && produced.length === 0;
  const role = isPuppy ? "Puppy" : pqRole(dog, pq.litters);
  const photo = (isPuppy ? pqPuppyPhoto(dog) : null) ?? pqPhoto(dog);
  const standing = STANDING_LABEL[pqPuppyStanding(dog)] ?? (dog.status ? dog.status : null);
  const sex = pqSex(dog, pq.litters);
  const littermates = birthLitter
    ? [...birthLitter.puppies].filter((p) => p.id !== dog.id).sort(pqByBirthOrder)
    : [];
  const back = isPuppy
    ? { href: `/litters/${birthLitter!.id}`, label: "← The litter" }
    : sex === "male"
      ? { href: "/sires", label: "← Sires" }
      : { href: "/dams", label: "← Dams" };

  return (
    <main>
      <section className="bg-navy px-6 py-12 md:py-16">
        <div className="mx-auto max-w-[1160px]">
          <Link href={back.href} className="text-[0.8rem] font-extrabold text-cream/70 transition-colors hover:text-coral">
            {back.label}
          </Link>

          <div className="mt-6 grid gap-8 md:grid-cols-[minmax(260px,340px)_1fr] md:items-start">
            <div className={`relative aspect-[3/4] w-full overflow-hidden rounded-[18px] ${photo ? "bg-cream" : "bg-photo-placeholder"}`}>
              {photo ? (
                <CardPhoto src={photo} alt={name} frame={pqPhotoFrame(dog)} />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[0.8rem] font-bold text-tan">
                  Photo coming soon
                </div>
              )}
            </div>

            <div>
              <p className="mb-2 text-[0.72rem] font-extrabold uppercase tracking-[0.14em] text-coral">
                {role}
                {standing ? ` · ${standing}` : ""}
              </p>
              <h1 className="font-heading text-[clamp(1.9rem,4vw,2.6rem)] font-bold leading-[1.15] text-cream">{name}</h1>
              {registered ? <p className="mt-1 text-[0.95rem] italic text-cream/70">{registered}</p> : null}

              <dl className="mt-6 max-w-[480px]">
                <Row label="Registered name" value={dog.registered_name} />
                <Row label="Born" value={fmtDate(dog.birthdate)} />
                <Row label="Sex" value={sex} />
                <Row label="Breed" value={dog.breed} />
                <Row label="Color" value={dog.color} />
              </dl>

              <div className="mt-6 flex flex-wrap gap-10">
                <ParentLink role="Dam" dog={birthLitter?.dam ?? null} name={birthLitter?.damName ?? dog.dam_name} pq={pq} />
                <ParentLink role="Sire" dog={birthLitter?.sire ?? null} name={birthLitter?.sireName ?? dog.sire_name} pq={pq} />
              </div>

              {birthLitter && !isPuppy ? (
                <p className="mt-6 text-[0.9rem] text-cream/70">
                  Born into{" "}
                  <Link href={`/litters/${birthLitter.id}`} className="text-cream underline underline-offset-2 hover:text-coral">
                    the {fmtDate(birthLitter.birthdate) ?? ""} litter
                  </Link>
                  .
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {produced.length > 0 ? (
        <section className="bg-cream px-6 py-12 md:py-16">
          <div className="mx-auto max-w-[1160px]">
            <h2 className="mb-6 font-heading text-[1.6rem] font-bold text-navy">
              {produced.length} {produced.length === 1 ? "litter" : "litters"} on the record
            </h2>
            <div className="flex flex-col gap-3">
              {produced.map((l) => (
                <LitterRow key={l.id} litter={l} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {littermates.length > 0 ? (
        <section className="bg-white px-6 py-12 md:py-16">
          <div className="mx-auto max-w-[1160px]">
            <h2 className="mb-6 font-heading text-[1.6rem] font-bold text-navy">Littermates</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {littermates.map((p) => (
                <PuppyCard key={p.id} puppy={p} href={pqDogHref(p, pq)} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-white px-6 pb-16">
        <div className="mx-auto max-w-[1160px]">
          <Link
            href="/contact"
            className="inline-block rounded-lg bg-coral px-7 py-[14px] text-[0.95rem] font-extrabold text-navy transition-colors hover:bg-coral-dark"
          >
            {isPuppy ? "Ask about this puppy" : "Get in touch"}
          </Link>
        </div>
      </section>
    </main>
  );
}
