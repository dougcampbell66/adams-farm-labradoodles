import Link from "next/link";

const links = [
  { label: "Puppies", href: "/puppies" },
  { label: "Our Program", href: "/our-program" },
  { label: "Our Dogs", href: "/our-dogs" },
  { label: "Our Story", href: "/our-story" },
  { label: "Guardians", href: "/guardians" },
  { label: "Ambassadors", href: "/ambassadors" },
  { label: "Safety & Protocols", href: "/safety-and-protocols" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-charcoal text-cream py-10 px-6 text-[0.85rem]">
      <div className="max-w-[1080px] mx-auto">
        <div className="flex justify-center gap-2 mb-6">
          <div className="w-[9px] h-[9px] rounded-full bg-calm-blue" />
          <div className="w-[9px] h-[9px] rounded-full bg-focus-green" />
          <div className="w-[9px] h-[9px] rounded-full bg-excite-yellow" />
          <div className="w-[9px] h-[9px] rounded-full bg-feelings-red" />
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-6 font-extrabold text-[0.8rem]">
          {links.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-cream/70 hover:text-cream transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
        <p className="text-center text-cream/60">
          Adams Farm Labradoodles · Greensboro, NC · ALAA Gold Paw Accredited
        </p>
      </div>
    </footer>
  );
}
