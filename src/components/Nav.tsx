import Link from "next/link";
import { MobileMenu } from "./MobileMenu";
import { navLinks } from "./nav-links";

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-rule bg-paper/95 backdrop-blur">
      {/* The navy hairline reads as the top edge of a printed prospectus. */}
      <div className="h-[3px] bg-navy" />
      <div className="mx-auto flex max-w-page items-center justify-between gap-6 px-[6vw] py-4">
        <Link href="/" aria-label="Adams Farm Labradoodles — home" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo/adams-farm-logo-horizontal.png"
            alt="Adams Farm Labradoodles"
            className="h-10 w-auto sm:h-11"
          />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="smallcaps whitespace-nowrap text-slate transition-colors hover:text-navy"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="smallcaps whitespace-nowrap bg-navy px-5 py-2.5 text-paper transition-colors hover:bg-navy-deep"
          >
            Admissions
          </Link>
        </nav>

        <MobileMenu />
      </div>
    </header>
  );
}
