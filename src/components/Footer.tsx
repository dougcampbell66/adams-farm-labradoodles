import Link from "next/link";
import { PawDots } from "./PawDots";
import { navLinks } from "./nav-links";

export function Footer() {
  return (
    <footer className="bg-navy text-paper">
      <div className="mx-auto max-w-page px-[6vw] py-14">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div>
            <PawDots size={10} gap={8} />
            <p className="mt-5 font-serif text-[22px] leading-tight">
              Adams Farm <em>Labradoodles</em>
            </p>
            <p className="mt-3 max-w-xs text-[14px] leading-relaxed text-paper/70">
              Australian Labradoodles raised by the Campbell family in Greensboro, North
              Carolina.
            </p>
          </div>

          <nav className="flex flex-col gap-2.5">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="smallcaps text-paper/75 transition-colors hover:text-excite"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="text-[14px] leading-relaxed text-paper/70">
            <p className="smallcaps text-excite">Greensboro, North Carolina</p>
            <p className="mt-3">
              <a href="tel:+13363388660" className="hover:text-paper">
                (336) 338-8660
              </a>
            </p>
            <p className="mt-1.5">ALAA Gold Paw Accredited</p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-paper/15 pt-6 text-[12px] text-paper/55 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Adams Farm Labradoodles</p>
          {/* PuppyQ is an independent program, not an Adams Farm product — the
              attribution stays a plain credit, exactly as on Legend Manor. */}
          <p>Powered by PuppyQ</p>
        </div>
      </div>
    </footer>
  );
}
