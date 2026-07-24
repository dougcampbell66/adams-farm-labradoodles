import { dogName, registeredName, roleLabel, formatDate, type Dog } from "@/lib/adams-farm";

/** One dog, presented as a record entry rather than a gallery tile. */
export function DogCard({ dog }: { dog: Dog }) {
  const reg = registeredName(dog);
  const born = formatDate(dog.birthdate);

  const facts: [string, string][] = [];
  if (dog.breed) facts.push(["Breed", dog.breed]);
  if (dog.color) facts.push(["Color", dog.color]);
  if (born) facts.push(["Born", born]);
  if (dog.dam_name) facts.push(["Dam", dog.dam_name]);
  if (dog.sire_name) facts.push(["Sire", dog.sire_name]);

  return (
    <article className="border border-rule bg-paper p-6">
      <p className="smallcaps text-feelings-deep">{roleLabel(dog)}</p>
      <h3 className="mt-2 font-serif text-[24px] font-medium leading-tight text-navy">
        {dogName(dog)}
      </h3>
      {reg ? <p className="mt-1.5 text-[13px] italic text-slate-dim">{reg}</p> : null}

      {facts.length > 0 ? (
        <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-5 gap-y-1.5 border-t border-rule pt-4">
          {facts.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="smallcaps text-slate-dim">{k}</dt>
              <dd className="text-[14px] text-charcoal">{v}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </article>
  );
}
