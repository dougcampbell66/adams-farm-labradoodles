"use client";

import Link from "next/link";
import { useState } from "react";
import { navLinks } from "./nav-links";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center text-navy transition-colors hover:text-feelings"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
            <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        )}
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={close}
            className="fixed inset-0 top-[72px] z-40 cursor-default bg-charcoal/20"
          />
          <div className="absolute left-0 right-0 top-full z-50 border-b border-rule bg-paper shadow-[0_10px_24px_rgba(27,42,65,0.12)]">
            <nav className="flex flex-col px-[6vw] py-3">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={close}
                  className="border-b border-rule py-3 font-serif text-[17px] text-navy transition-colors hover:text-feelings"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/contact"
                onClick={close}
                className="smallcaps mt-4 bg-navy px-4 py-3 text-center text-paper"
              >
                Admissions
              </Link>
            </nav>
          </div>
        </>
      ) : null}
    </div>
  );
}
