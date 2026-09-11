export type PuppyStatus = "available" | "reserved" | "adopted";
export type LitterStatus = "planned" | "available" | "reserved" | "past";

export type Puppy = {
  id: string;
  name: string;
  /** Collar colour, when the litter is being told apart by collar. Optional —
   *  the August 2026 litter is known by name, and an invented collar would be
   *  a value the record never held. */
  collar?: string;
  order: number;
  status: PuppyStatus;
  sex: "Male" | "Female";
  photo: string;
  litterId: string;
};

export type Litter = {
  id: string;
  title: string;
  displayTitle: string;
  sireDisplay: string;
  damDisplay: string;
  birthdate: string;
  readyDate: string;
  status: LitterStatus;
  puppyCount: number;
  availableCount: number;
  expectedSize: string;
  photos: string[];
};

// The active litter is the first one whose status is "available" or
// "reserved" (see app/puppies2/page.tsx and the home page) — keep the current
// litter at the top of this list.
//
// Summer 2026 — Adams Farm Macy × Barksdale's Fiery Agate ("Gate"), born
// August 19, 2026. Six puppies on the live record (Martha, Rocky, Sadie, Lucy,
// Molly, Max); the three with photos are listed below. Gate is co-owned with
// Legend Manor, but the record lists this as an Adams Farm litter, not a
// co-litter. Expected adult size is not recorded, so none is claimed here.
//
// Spring 2026 — co-breeding litter with Legend Manor.
// IMPORTANT: The Astro source (litters/spring-2026.md) incorrectly lists
// sire: "Silas" / dam: "Macy". This litter's actual parents are
// Tarheel's Knox (sire) and Legend Manor's Holly (dam).
export const litters: Litter[] = [
  {
    id: "summer-2026",
    title: "Summer 2026 Litter",
    displayTitle: "Macy & Gate August Litter",
    sireDisplay: "Barksdale's Fiery Agate (Gate)",
    damDisplay: "Adams Farm Macy",
    birthdate: "2026-08-19",
    readyDate: "2026-10-14",
    status: "available",
    puppyCount: 6,
    availableCount: 3,
    expectedSize: "",
    photos: [],
  },
  {
    id: "spring-2026",
    title: "Spring 2026 Litter",
    displayTitle: "Lilo & Stitch May Litter",
    sireDisplay: "Tarheel's Knox",
    damDisplay: "Legend Manor's Holly",
    birthdate: "2026-05-18",
    readyDate: "2026-07-13",
    status: "past",
    puppyCount: 6,
    availableCount: 0,
    expectedSize: "large mini, 20–25 lbs",
    photos: [],
  },
];

export const puppies: Puppy[] = [
  // Summer 2026 — Macy × Gate. Sex is not on the live record for these rows;
  // it is taken from the names the breeder gave them.
  {
    id: "max",
    name: "Max",
    order: 1,
    status: "available",
    sex: "Male",
    photo: "/images/puppies/max-8-19-26.jpg",
    litterId: "summer-2026",
  },
  {
    id: "martha",
    name: "Martha",
    order: 2,
    status: "available",
    sex: "Female",
    photo: "/images/puppies/martha-8-19-26.jpg",
    litterId: "summer-2026",
  },
  {
    id: "lucy",
    name: "Lucy",
    order: 3,
    status: "available",
    sex: "Female",
    photo: "/images/puppies/lucy-8-19-26.jpg",
    litterId: "summer-2026",
  },
  // Spring 2026 — Knox × Holly (Lilo & Stitch).
  {
    id: "stitch",
    name: "Stitch",
    collar: "Blue Collar",
    order: 1,
    status: "adopted",
    sex: "Male",
    photo: "/images/puppies/blue-collar-5-18-26.jpg",
    litterId: "spring-2026",
  },
  {
    id: "jumba",
    name: "Jumba",
    collar: "Red Collar",
    order: 2,
    status: "available",
    sex: "Male",
    photo: "/images/puppies/red-collar-5-18-26.jpg",
    litterId: "spring-2026",
  },
  {
    id: "tutu",
    name: "Tutu",
    collar: "Light Blue Collar",
    order: 3,
    status: "reserved",
    sex: "Female",
    photo: "/images/puppies/light-blue-collar-5-18-26.jpg",
    litterId: "spring-2026",
  },
  {
    id: "angel",
    name: "Angel",
    collar: "Pink Collar",
    order: 4,
    status: "reserved",
    sex: "Female",
    photo: "/images/puppies/pink-collar-5-18-26.jpg",
    litterId: "spring-2026",
  },
  {
    id: "david",
    name: "David",
    collar: "Yellow Collar",
    order: 5,
    status: "reserved",
    sex: "Male",
    photo: "/images/puppies/yellow-collar-5-18-26.jpg",
    litterId: "spring-2026",
  },
  {
    id: "lilo",
    name: "Lilo",
    collar: "Green Collar",
    order: 6,
    status: "reserved",
    sex: "Female",
    photo: "/images/puppies/green-collar-5-18-26.jpg",
    litterId: "spring-2026",
  },
];

export function getPuppiesForLitter(litterId: string): Puppy[] {
  return puppies
    .filter((p) => p.litterId === litterId)
    .sort((a, b) => a.order - b.order);
}

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
