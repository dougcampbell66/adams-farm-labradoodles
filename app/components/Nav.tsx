"use client";

import Link from "next/link";
import { useState } from "react";

const primaryLinks = [
  { label: "Home", href: "/" },
  { label: "Puppies", href: "/puppies" },
  { label: "Our Dogs", href: "/our-dogs" },
];

const aboutLinks = [
  { label: "Our Program", href: "/our-program" },
  { label: "Our Story", href: "/our-story" },
  { label: "Guardians", href: "/guardians" },
  { label: "Ambassadors", href: "/ambassadors" },
  { label: "Safety & Protocols", href: "/safety-and-protocols" },
];

const PhoneIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="-mb-[2px] mr-1.5 shrink-0"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.6 1.24h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.94-.94a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[100] bg-navy border-b border-white/12">
      <nav className="max-w-[1160px] mx-auto flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="shrink-0 font-heading text-[1.2rem] text-cream tracking-tight"
          onClick={() => setMobileOpen(false)}
        >
          Adams Farm <em className="not-italic font-semibold text-coral italic">Labradoodles</em>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1 text-[0.875rem]">
          {primaryLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-cream/75 hover:text-white hover:bg-white/10 px-3.5 py-[7px] rounded-md transition-colors"
            >
              {label}
            </Link>
          ))}

          {/* About dropdown */}
          <div className="relative group">
            <button
              type="button"
              className="flex items-center gap-1 text-cream/75 group-hover:text-white group-hover:bg-white/10 px-3.5 py-[7px] rounded-md transition-colors"
            >
              About
              <svg
                width="11"
                height="11"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:rotate-180"
              >
                <path
                  d="M2 4l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+8px)] min-w-[210px] rounded-xl border border-warm-border bg-white p-1.5 shadow-[0_10px_34px_rgba(20,32,51,0.18)] opacity-0 invisible translate-y-[-6px] group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 transition-all duration-150 z-[200]">
              {aboutLinks.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="block rounded-md px-3.5 py-2.5 text-[0.85rem] font-bold text-charcoal hover:bg-coral-tint hover:text-coral-dark transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <Link
            href="/#faq"
            className="text-cream/75 hover:text-white hover:bg-white/10 px-3.5 py-[7px] rounded-md transition-colors"
          >
            FAQ
          </Link>

          <a
            href="tel:+13363388660"
            className="ml-2.5 inline-flex items-center bg-coral text-navy font-extrabold py-2.5 px-5 rounded-lg text-[0.85rem] hover:bg-coral-dark transition-colors"
          >
            <PhoneIcon />
            336-338-8660
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((o) => !o)}
          className="md:hidden flex flex-col gap-[5px] p-1"
        >
          <span className="block w-[22px] h-[2px] bg-cream rounded" />
          <span className="block w-[22px] h-[2px] bg-cream rounded" />
          <span className="block w-[22px] h-[2px] bg-cream rounded" />
        </button>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 z-[200] bg-navy border-b border-white/12 shadow-lg flex flex-col px-6 py-4">
            {primaryLinks.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="py-3 text-[0.95rem] text-cream border-b border-white/12"
              >
                {label}
              </Link>
            ))}
            <p className="pt-4 pb-1 text-[0.68rem] font-extrabold uppercase tracking-[0.1em] text-coral">
              About
            </p>
            {aboutLinks.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="py-3 text-[0.95rem] text-cream border-b border-white/12"
              >
                {label}
              </Link>
            ))}
            <Link
              href="/#faq"
              onClick={() => setMobileOpen(false)}
              className="py-3 text-[0.95rem] text-cream border-b border-white/12"
            >
              FAQ
            </Link>
            <a
              href="tel:+13363388660"
              className="mt-4 inline-flex items-center justify-center bg-coral text-navy font-extrabold py-3 px-5 rounded-lg text-[0.9rem] hover:bg-coral-dark transition-colors"
            >
              <PhoneIcon />
              336-338-8660
            </a>
          </div>
        )}
      </nav>
    </header>
  );
}
