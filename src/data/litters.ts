// Adams Farm's static litter ledger.
//
// The current litter and its puppies are NOT here any more: the home page and
// /puppies2 read them live from the record (lib/puppyq.ts, pqAvailablePuppies),
// and puppy photos come from the database's media table, uploaded through
// the Legend Manor dashboard. What stays static is the past-litter track
// record below, ported from the old site.

// Past litters — confirmed ALAA track record, newest first. Ported verbatim
// from the Astro source (puppies.astro). Puppies kept for the breeding program
// are counted only, never named; no registration numbers.
export type PastLitter = {
  sire: string;
  dam: string;
  date: string;
  puppies: string[];
  retained: number;
};

export const pastLitters: PastLitter[] = [
  { sire: "Silas", dam: "Winnie", date: "February 24, 2026", puppies: ["Chelsea", "Madison", "Tori", "Hudson", "Toffi", "Miklo"], retained: 0 },
  { sire: "Silas", dam: "Macy", date: "February 4, 2026", puppies: ["Coral", "Deb", "Marlin", "Dory", "Nemo"], retained: 0 },
  { sire: "Silas", dam: "Winnie", date: "August 3, 2025", puppies: ["Zola", "Mili", "Callie", "River", "Baby Peanut", "Hazel", "Snow White"], retained: 1 },
  { sire: "Silas", dam: "Winnie", date: "January 8, 2025", puppies: ["Maui", "James Dean", "Samson King", "Elizabeth Taylor", "Butters", "Douglas Carter"], retained: 2 },
  { sire: "Chewy", dam: "Winnie", date: "July 8, 2024", puppies: ["Hudson", "Jaxon", "Macy", "Grace", "Luca", "Finn", "Caeli", "Izzy", "Lia"], retained: 0 },
];
