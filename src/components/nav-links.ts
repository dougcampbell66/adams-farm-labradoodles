// Single source of truth for navigation, shared by the desktop nav and the
// mobile menu. Mirrors the section structure of the live Astro site.

export interface NavLink {
  href: string;
  label: string;
}

export const navLinks: NavLink[] = [
  { href: "/puppies", label: "Puppies" },
  { href: "/our-dogs", label: "Our Dogs" },
  { href: "/our-program", label: "Our Program" },
  { href: "/guardians", label: "Guardians" },
  { href: "/our-story", label: "Our Story" },
];
