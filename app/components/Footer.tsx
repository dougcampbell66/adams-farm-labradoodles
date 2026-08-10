import Link from "next/link";
import Image from "next/image";

const siteLinks = [
  { label: "Home", href: "/" },
  { label: "Our dogs", href: "/our-dogs" },
  { label: "Dams", href: "/dams" },
  { label: "Sires", href: "/sires" },
  { label: "Litters", href: "/litters" },
  { label: "Our program", href: "/our-program" },
  { label: "Guardians", href: "/guardians" },
  { label: "Puppies", href: "/puppies2" },
  { label: "Testimonials", href: "/#testimonials" },
  { label: "FAQ", href: "/#faq" },
];

const getAPuppyLinks = [
  { label: "See available puppies", href: "/puppies2" },
  { label: "Join the waitlist", href: "/contact" },
  { label: "Meet the parents", href: "/our-dogs" },
  { label: "Our health guarantee", href: "/our-program" },
];

export default function Footer() {
  const year = 2026;
  return (
    <footer className="bg-navy border-t border-white/12">
      <div className="max-w-[1160px] mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[1.2fr_1fr_1fr] gap-10 md:gap-12 pt-12 pb-10">
        {/* Column 1 */}
        <div className="sm:col-span-2 md:col-span-1">
          <p className="font-heading font-bold text-[0.9rem] text-cream mb-3.5">
            Adams Farm Labradoodles
          </p>
          <nav className="flex flex-col gap-2">
            {siteLinks.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-[0.85rem] text-cream/75 hover:text-cream transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Column 2 */}
        <div>
          <p className="font-heading font-bold text-[0.9rem] text-cream mb-3.5">
            Get a puppy
          </p>
          <nav className="flex flex-col gap-2">
            {getAPuppyLinks.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-[0.85rem] text-cream/75 hover:text-cream transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Column 3 */}
        <div>
          <p className="font-heading font-bold text-[0.9rem] text-cream mb-3.5">
            Contact &amp; location
          </p>
          <p className="text-[0.85rem] text-cream/75 mb-1.5">Greensboro, NC</p>
          <p className="text-[0.85rem] text-cream/75 mb-1.5">
            <a
              href="tel:+13363388660"
              className="underline hover:text-cream transition-colors"
            >
              336-338-8660
            </a>
          </p>
          <p className="text-[0.85rem] text-cream/75">
            <Link href="/contact" className="underline hover:text-cream transition-colors">
              Send us a message
            </Link>
          </p>
          <div className="mt-5">
            <Image
              src="/images/credentials/Adams-Farm-ALAA-Logo-2026.png"
              alt="ALAA Member 2026"
              width={88}
              height={88}
              className="w-[88px] h-auto"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-white/12 py-4">
        <div className="max-w-[1160px] mx-auto px-6">
          <p className="text-[0.75rem] text-cream/60">
            © {year} Adams Farm Labradoodles · Greensboro, NC
          </p>
        </div>
      </div>
    </footer>
  );
}
