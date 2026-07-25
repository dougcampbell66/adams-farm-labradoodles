"use client";

import { useMemo, useState } from "react";
import type { Family } from "@/lib/forever-families";

/**
 * The Forever Families list: one row per owner, with mailto / tel / sms actions
 * sized for a thumb. Client-side because the whole point is that someone can
 * type three letters of a name and tap — a server round-trip per keystroke would
 * be slower than the list is long.
 *
 * Rows are a responsive grid rather than a <table> so the actions can drop under
 * the name on a phone without the horizontal scroll a real table would need.
 */
export function FamilyRoster({ families }: { families: Family[] }) {
  const [q, setQ] = useState("");

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return families;
    return families.filter((f) =>
      [f.name, f.email, f.phone, f.notes, ...f.dogs.map((d) => d.name)]
        .filter(Boolean)
        .some((v) => (v as string).toLowerCase().includes(needle)),
    );
  }, [families, q]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="min-w-[240px] flex-1">
          <span className="sr-only">Search families</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by family, dog, email, or phone…"
            className="w-full border border-rule bg-white px-3 py-2.5 text-[14px] text-charcoal outline-none placeholder:text-slate-dim/70 focus:border-navy"
          />
        </label>
        <div className="smallcaps text-slate-dim">
          {shown.length === families.length
            ? `${families.length} ${families.length === 1 ? "family" : "families"}`
            : `${shown.length} of ${families.length}`}
        </div>
      </div>

      <div className="mt-5 border border-rule bg-white">
        {shown.length === 0 ? (
          <p className="px-4 py-8 text-center text-[14px] text-slate-dim">
            No families match “{q}”.
          </p>
        ) : (
          <ul>
            {shown.map((f) => (
              <li
                key={f.id}
                className="grid gap-3 border-b border-rule px-4 py-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6"
              >
                <div className="min-w-0">
                  <div className="font-serif text-[19px] leading-tight text-navy">{f.name}</div>

                  {f.dogs.length > 0 ? (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {f.dogs.map((d) => (
                        <span
                          key={d.id}
                          title={d.since ? `Adopted ${d.since}` : undefined}
                          className="border border-navy/25 bg-paper-2 px-2 py-0.5 text-[12px] text-slate"
                        >
                          {d.name}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-[12px] text-slate-dim">
                    {f.email ? <span className="break-all">{f.email}</span> : null}
                    {f.phone ? <span className="tabular-nums">{f.phone}</span> : null}
                    {!f.email && !f.phone ? <span>No contact details on file</span> : null}
                  </div>

                  {f.notes ? (
                    <p className="mt-1.5 text-[13px] leading-snug text-slate">{f.notes}</p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <Action href={f.email ? `mailto:${f.email}` : null} label="Email" />
                  <Action href={f.phoneHref ? `tel:${f.phoneHref}` : null} label="Call" />
                  <Action href={f.phoneHref ? `sms:${f.phoneHref}` : null} label="Text" />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/**
 * One tap target. Disabled actions stay in place rather than disappearing, so
 * every row keeps the same three columns and the missing detail is obvious.
 */
function Action({ href, label }: { href: string | null; label: string }) {
  const base = "smallcaps px-3 py-2 transition-colors";

  if (!href) {
    return (
      <span
        aria-disabled
        title={`No ${label.toLowerCase()} details on file`}
        className={`${base} border border-rule text-slate-dim/50`}
      >
        {label}
      </span>
    );
  }

  return (
    <a
      href={href}
      className={`${base} border border-navy text-navy hover:bg-navy hover:text-paper`}
    >
      {label}
    </a>
  );
}
