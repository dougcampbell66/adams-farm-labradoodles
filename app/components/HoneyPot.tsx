import { HONEYPOT_FIELD } from "@/lib/decoy";

/**
 * The decoy field, and the clock.
 *
 * Hidden four ways on purpose, because each one alone is beatable:
 *
 *   - moved off-screen rather than display:none, since the better bots skip
 *     anything with display:none precisely because it is the usual trick
 *   - tabIndex -1, so it cannot be reached by keyboard
 *   - autoComplete off, so a password manager never fills it
 *   - aria-hidden on the wrapper, so a screen reader never announces it
 *
 * The last point is the one that matters most. A honeypot that assistive
 * technology reads out is a trap for blind visitors specifically — they fill
 * in the field they were told about, and get silently discarded.
 *
 * Inline styles rather than classes: this has to stay hidden even if the
 * stylesheet fails to load, and a visible field labelled "Website" would
 * collect real answers.
 */
export default function HoneyPot({ startedAt }: { startedAt?: number }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: "-9999px",
        width: 1,
        height: 1,
        overflow: "hidden",
      }}
    >
      <label htmlFor={`hp-${HONEYPOT_FIELD}`}>
        Website (leave this empty)
      </label>
      <input
        id={`hp-${HONEYPOT_FIELD}`}
        name={HONEYPOT_FIELD}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        defaultValue=""
      />
      {startedAt !== undefined && (
        <input type="hidden" name="started_at" value={startedAt} readOnly />
      )}
    </div>
  );
}
