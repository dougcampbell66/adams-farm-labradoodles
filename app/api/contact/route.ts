import { NextResponse } from "next/server";
import { fullName } from "@/lib/name";
import { insertCorporateLead } from "@/lib/leads";
import { SOURCE, provenance } from "@/lib/brand";
import { HONEYPOT_FIELD, STARTED_FIELD } from "@/lib/decoy";
import { platformIntake } from "@/lib/platform";

/**
 * The contact form, from /contact.
 *
 * Since 2026-08-30 the pipeline behind this route lives on the pawsq
 * platform (pawsq-app's /api/platform/intake): one call screens the
 * submission, stores it in `leads` under `source_brand = 'adams_farm'`,
 * and sends the notification email from adamsfarmlabradoodles@pawsq.com.
 * This route keeps what is the site's own — parsing, composing the name
 * (never splitting one), validation, and answering the visitor.
 *
 * The old resilience contract survives the move, one level up:
 *
 *   - A `block` verdict means the platform kept nothing, and the bot is
 *     answered exactly as a person would be. Telling it it was caught is
 *     free tuning information.
 *   - stored || emailed → the enquiry is somewhere a human will find it;
 *     the visitor sees success.
 *   - The platform unreachable → the FALLBACK: this site still writes the
 *     lead directly (lib/leads.ts, anon key, unscreened but stored and
 *     logged loudly). A rare unscreened row beats a lost enquiry.
 *   - Only a total loss — no platform, no fallback row — shows an error,
 *     because asking someone to send their message twice over our outage
 *     would be our failure displayed as theirs.
 *
 * What it still deliberately does NOT do is promote. A submission arrives
 * `new` and becomes a contact only when a human says so.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Could not read the form." }, { status: 400 });
  }

  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

  // Composed, never split — see lib/name.ts. A page cached from before the
  // form asked for two parts still posts one `name`, which is accepted as
  // given rather than rejected.
  const firstName = str(body.first_name);
  const lastName = str(body.last_name);
  const name = fullName(firstName, lastName) || str(body.name);

  const email = str(body.email);
  const phone = str(body.phone);
  const message = str(body.message);

  // Deliberately does not require a last name even though the form marks it
  // required: refusing a submission server-side over a missing surname would
  // throw away a real enquiry, and mononyms exist.
  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, email, and message are required." },
      { status: 400 },
    );
  }

  const result = await platformIntake({
    form: SOURCE.contact,
    screen: {
      honeypot: body[HONEYPOT_FIELD],
      startedAt: body[STARTED_FIELD],
      text: message,
      identity: name,
    },
    store: "leads",
    row: {
      name,
      first_name: firstName || null,
      last_name: lastName || null,
      email,
      phone: phone || null,
      message,
    },
    notification: {
      subject: `New puppy inquiry from ${name}`,
      fields: [
        ["Name", name],
        ["Email", email],
        ["Phone", phone || "Not provided"],
        ["Message", message],
        ["Source", provenance(SOURCE.contact)],
      ],
      replyTo: email,
    },
  });

  if (result) {
    if (result.verdict === "block") {
      // Answered exactly as a real submission would be.
      return NextResponse.json({ success: true });
    }
    if (result.stored || result.emailed) {
      return NextResponse.json({ success: true });
    }
    console.error(
      "[contact] platform accepted the call but neither stored nor emailed — falling back to the direct write",
    );
  } else {
    console.error("[contact] platform unreachable — falling back to the direct write");
  }

  // The fallback: unscreened, but stored. The submission also goes to the
  // log whole, so it is recoverable even if this write fails too.
  const stored = await insertCorporateLead({
    name,
    first_name: firstName || null,
    last_name: lastName || null,
    email,
    phone: phone || null,
    message,
    source_form: SOURCE.contact,
  });

  if (!stored) {
    console.error(
      "[contact] LOST — neither the platform nor the direct write accepted the submission",
      { name, email, phone, message },
    );
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
