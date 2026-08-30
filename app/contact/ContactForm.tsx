"use client";

import { useEffect, useRef, useState } from "react";
import HoneyPot from "@/app/components/HoneyPot";
import { HONEYPOT_FIELD } from "@/lib/decoy";
import {
  MARKETING_OPT_IN_FIELD,
  MARKETING_OPT_IN_WORDING,
} from "@/lib/consent";

type Status = "idle" | "submitting" | "success" | "error";

const inputClass =
  "w-full px-4 py-3 rounded-[10px] border border-warm-border bg-white text-charcoal text-[0.95rem] placeholder:text-placeholder-muted focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-colors";

const labelClass =
  "block font-extrabold text-[0.78rem] uppercase tracking-[0.08em] text-navy mb-1.5";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  // Set after mount rather than during render: a timestamp produced while
  // server-rendering would be the server's clock and would mismatch on
  // hydration. Without JS it stays null and simply carries no signal.
  const startedAt = useRef<number | null>(null);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    const fd = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: fd.get("first_name"),
          last_name: fd.get("last_name"),
          email: fd.get("email"),
          phone: fd.get("phone"),
          message: fd.get("message"),
          // The decoy is uncontrolled, so it is read from the form rather
          // than from React state, which never knows it was filled in.
          [HONEYPOT_FIELD]: fd.get(HONEYPOT_FIELD) ?? "",
          started_at: startedAt.current,
          // The opt-in. Uncontrolled like the decoy, so this reads what
          // the form actually holds rather than what React thinks.
          // Absent from the FormData means unticked, which is the whole
          // point of a box nothing pre-ticks.
          [MARKETING_OPT_IN_FIELD]: fd.get(MARKETING_OPT_IN_FIELD) === "yes",
          // The words this page really displayed, sent alongside rather
          // than assumed server-side: a page cached from before a wording
          // change showed the OLD text, and that is what its visitor
          // agreed to.
          marketing_opt_in_wording: MARKETING_OPT_IN_WORDING,
          form_url: window.location.href,
        }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-focus-green/10 border border-focus-green/30 rounded-[14px] p-8 text-center">
        <div className="text-focus-green text-3xl mb-3">✓</div>
        <h3 className="font-heading font-semibold text-navy text-[1.3rem] mb-2">
          Message received!
        </h3>
        <p className="text-[0.95rem] text-body-soft">
          Thank you for reaching out. We&apos;ll read your message personally and
          get back to you within 1–2 business days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex flex-col gap-5">
      <HoneyPot />
      {/* Two fields, never one split afterwards. pawsq's contacts holds a
          first and a last name as separate columns, and deriving them from
          a single string is a guess that fails on exactly the names whose
          owners notice — so the form asks. See lib/name.ts. */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="first_name" className={labelClass}>
            First name <span className="text-feelings-red">*</span>
          </label>
          <input
            id="first_name"
            name="first_name"
            type="text"
            required
            autoComplete="given-name"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="last_name" className={labelClass}>
            Last name <span className="text-feelings-red">*</span>
          </label>
          <input
            id="last_name"
            name="last_name"
            type="text"
            required
            autoComplete="family-name"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          Email address <span className="text-feelings-red">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="phone" className={labelClass}>
          Phone number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="(optional)"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          Message <span className="text-feelings-red">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          placeholder="Tell us about your household, what you're looking for, and your ideal timeline."
          className={`${inputClass} resize-y min-h-[120px]`}
        />
      </div>

      {status === "error" && (
        <p className="text-feelings-red text-[0.88rem] font-extrabold">
          Something went wrong — please try again or call us directly at{" "}
          <a href="tel:3363388660" className="underline">
            336-338-8660
          </a>
          .
        </p>
      )}

      {/* Unchecked by default, always — no defaultChecked, no checked.
          A pre-ticked box is not express consent, and this is the one
          control on the form whose default is a legal fact rather than
          a convenience. */}
      <label className="flex items-start gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          name={MARKETING_OPT_IN_FIELD}
          value="yes"
          className="mt-[3px] h-4 w-4 shrink-0 accent-navy cursor-pointer"
        />
        <span className="text-[0.86rem] text-body-soft leading-snug">
          {MARKETING_OPT_IN_WORDING}
        </span>
      </label>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="bg-coral text-navy font-extrabold py-[14px] px-7 rounded-lg text-[0.95rem] hover:bg-coral-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed self-start"
      >
        {status === "submitting" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
