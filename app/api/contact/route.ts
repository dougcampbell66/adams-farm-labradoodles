import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { fullName } from "@/lib/name";
import { insertCorporateLead } from "@/lib/leads";
import { SOURCE, provenance } from "@/lib/brand";
import { assess, HONEYPOT_FIELD } from "@/lib/spam";

/**
 * The contact form, from /contact.
 *
 * Two destinations, attempted independently: pawsq's `corporate_leads`
 * table, and the notification email. Either one succeeding has kept the
 * enquiry, and only a total loss shows the visitor an error — asking
 * someone to send their message twice because our database was unreachable
 * would be our failure displayed as theirs.
 *
 * That ordering is the point. This route used to email only, so an
 * enquiry existed in one inbox and nowhere else: no lead row, no triage
 * queue entry, nothing the Hub could show. It now lands in the same table
 * the Puppy Therapy and School Dogs forms write to, under
 * `source_brand = 'adams_farm'`.
 *
 * What it deliberately does NOT do is promote. A submission arrives with
 * `status = 'new'` and becomes a contact only when a human says so —
 * pawsq migration 20's ruling, and the reason the anon role holds no
 * privilege on the triage columns.
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

  // Unchanged, and deliberately does not require a last name even though the
  // form marks it required: refusing a submission server-side over a missing
  // surname would throw away a real enquiry, and mononyms exist.
  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, email, and message are required." },
      { status: 400 },
    );
  }

  // Screened after validation, so a bot never learns which field it got
  // wrong, and before either destination, so a blocked submission costs
  // nothing.
  const screen = assess({
    honeypot: body[HONEYPOT_FIELD],
    startedAt: body.started_at,
    text: message,
    identity: name,
  });

  if (screen.verdict === "block") {
    console.warn("[contact] blocked as spam", { reasons: screen.reasons, email });
    // Answered exactly as a real submission would be. Telling a bot it was
    // caught is free tuning information, and a person who somehow trips this
    // still has the address on the contact page to fall back on.
    return NextResponse.json({ success: true });
  }

  // Both destinations, independently.
  const stored = await insertCorporateLead({
    name,
    first_name: firstName || null,
    last_name: lastName || null,
    email,
    phone: phone || null,
    message,
    source_form: SOURCE.contact,
  });

  const emailed = await sendNotification();

  if (!stored && !emailed) {
    console.error(
      "[contact] LOST — neither the database nor email accepted the submission",
    );
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }

  return NextResponse.json({ success: true });

  /** Never throws: returns whether the message went out. */
  async function sendNotification(): Promise<boolean> {
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.hostinger.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      const cell = "padding:10px 12px;border:1px solid #E2DAC7;font-size:14px";
      const head = `${cell};background:#FAF7F0;font-weight:700;width:120px`;
      const row = (label: string, value: string) =>
        `<tr><td style="${head}">${escapeHtml(label)}</td><td style="${cell}">${value}</td></tr>`;

      await transporter.sendMail({
        from: `"Adams Farm Website" <${process.env.SMTP_EMAIL}>`,
        to: process.env.SMTP_EMAIL,
        replyTo: email,
        subject:
          (screen.verdict === "flag" ? "[possible spam] " : "") +
          `New puppy inquiry from ${name}`,
        html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2 style="color:#1B2A41;margin-bottom:4px">New inquiry — Adams Farm Labradoodles</h2>
          <p style="color:#666;font-size:13px;margin-bottom:24px">${escapeHtml(
            provenance(SOURCE.contact),
          ).replace(/\n/g, "<br>")}</p>
          <table style="width:100%;border-collapse:collapse">
            ${row("Name", escapeHtml(name))}
            ${row("Email", `<a href="mailto:${encodeURI(email)}">${escapeHtml(email)}</a>`)}
            ${row("Phone", escapeHtml(phone || "Not provided"))}
            ${row(
              "Message",
              `<span style="white-space:pre-wrap">${escapeHtml(message)}</span>`,
            )}
          </table>
          ${
            stored
              ? ""
              : `<p style="margin-top:20px;font-size:13px;color:#B00">NOT SAVED TO DATABASE — see server logs.</p>`
          }
          ${
            // Flagged, not blocked: delivered as normal and a person decides.
            screen.verdict === "flag"
              ? `<p style="margin-top:20px;font-size:13px;color:#B00">POSSIBLE SPAM — ${escapeHtml(
                  screen.reasons.join("; "),
                )}</p>`
              : ""
          }
          <p style="margin-top:20px;font-size:12px;color:#999">Reply to this email to respond directly to ${escapeHtml(
            name,
          )}.</p>
        </div>
      `,
      });
      return true;
    } catch (err) {
      // A failed send must not be the reason the request fails: the database
      // may well have taken the row. The whole submission goes to the log so
      // an enquiry is recoverable either way.
      console.error("[contact] email failed:", err, { name, email, phone, message });
      return false;
    }
  }
}

/**
 * Visitor-supplied text goes into an HTML email. Escaped rather than
 * interpolated raw — the previous version dropped `name`, `phone` and
 * `message` straight into the markup, so an apostrophe rendered oddly and a
 * `<script>` or a stray `</td>` rewrote the message a human was reading.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
