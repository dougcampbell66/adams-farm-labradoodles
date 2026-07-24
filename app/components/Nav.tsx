"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const primaryLinks = [
  { label: "Puppies", href: "/puppies" },
  { label: "Our Dogs", href: "/our-dogs" },
];

const aboutLinks = [
  { label: "Our Program", href: "/our-program" },
  { label: "Our Story", href: "/our-story" },
  { label: "Guardians", href: "/guardians" },
  { label: "Ambassadors", href: "/ambassadors" },
  { label: "Safety & Protocols", href: "/safety-and-protocols" },
  { label: "Testimonials", href: "/testimonials" },
];

const tailLinks = [
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="relative flex items-center justify-between px-6 py-4 border-b border-warm-border bg-cream">
      <Link href="/" className="shrink-0" onClick={() => setMobileOpen(false)}>
        <Image
          src="/images/logo/adams-farm-logo-horizontal.png"
          alt="Adams Farm Labradoodles"
          width={440}
          height={110}
          className="w-[200px] h-auto"
          priority
        />
      </Link>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-7 font-extrabold text-[0.9rem]">
        {primaryLinks.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className="text-charcoal hover:text-coral transition-colors"
          >
            {label}
          </Link>
        ))}

        {/* About dropdown (CSS hover + keyboard focus) */}
        <div className="relative group">
          <button
            type="button"
            className="flex items-center gap-1 text-charcoal group-hover:text-coral transition-colors"
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
          <div className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+10px)] min-w-[210px] rounded-xl border border-warm-border bg-white p-1.5 shadow-[0_10px_34px_rgba(27,42,65,0.14)] opacity-0 invisible translate-y-[-6px] group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 transition-all duration-150 z-50">
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

        {tailLinks.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className="text-charcoal hover:text-coral transition-colors"
          >
            {label}
          </Link>
        ))}

        <a
          href="tel:+13363388660"
          className="inline-block bg-coral text-white font-extrabold py-2.5 px-5 rounded-lg text-[0.85rem] hover:bg-coral-dark transition-colors"
        >
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
        <span className="block w-6 h-[2px] bg-charcoal rounded" />
        <span className="block w-6 h-[2px] bg-charcoal rounded" />
        <span className="block w-6 h-[2px] bg-charcoal rounded" />
      </button>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 z-50 bg-cream border-b border-warm-border shadow-lg flex flex-col px-6 py-4">
          {[...primaryLinks].map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="py-3 font-extrabold text-[0.95rem] text-charcoal border-b border-warm-border"
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
              className="py-3 font-extrabold text-[0.95rem] text-charcoal border-b border-warm-border"
            >
              {label}
            </Link>
          ))}
          {tailLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="py-3 font-extrabold text-[0.95rem] text-charcoal border-b border-warm-border"
            >
              {label}
            </Link>
          ))}
          <a
            href="tel:+13363388660"
            className="mt-4 text-center bg-coral text-white font-extrabold py-3 px-5 rounded-lg text-[0.9rem] hover:bg-coral-dark transition-colors"
          >
            Call 336-338-8660
          </a>
        </div>
      )}
    </nav>
  );
}
