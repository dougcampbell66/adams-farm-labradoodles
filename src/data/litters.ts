export type PuppyStatus = "available" | "reserved";
export type LitterStatus = "planned" | "available" | "reserved" | "past";

export type Puppy = {
  id: string;
  name: string;
  collar: string;
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

// Spring 2026 — co-breeding litter with Legend Manor.
// IMPORTANT: The Astro source (litters/spring-2026.md) incorrectly lists
// sire: "Silas" / dam: "Macy". This litter's actual parents are
// Tarheel's Knox (sire) and Legend Manor's Holly (dam).
// Adams Farm's own Silas × Macy pairing is a separate future litter.
export const litters: Litter[] = [
  {
    id: "spring-2026",
    title: "Spring 2026 Litter",
    displayTitle: "Lilo & Stitch May Litter",
    sireDisplay: "Tarheel's Knox",
    damDisplay: "Legend Manor's Holly",
    birthdate: "2026-05-18",
    readyDate: "2026-07-13",
    status: "available",
    puppyCount: 6,
    availableCount: 2,
    expectedSize: "large mini, 20–25 lbs",
    photos: [],
  },
];

export const puppies: Puppy[] = [
  {
    id: "stitch",
    name: "Stitch",
    collar: "Blue Collar",
    order: 1,
    status: "available",
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
