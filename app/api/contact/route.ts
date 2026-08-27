import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { fullName } from "@/lib/name";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { first_name, last_name, email, phone, message } = body as {
      first_name?: string;
      last_name?: string;
      /** Legacy single field, from a page cached before the form split. */
      name?: string;
      email: string;
      phone?: string;
      message: string;
    };

    // Composed, never split — see lib/name.ts. A page cached from before
    // the form asked for two parts still posts one `name`, so that is
    // accepted as given rather than rejected.
    //
    // Validation deliberately does not require a last name, even though the
    // form marks it required: refusing a submission server-side over a
    // missing surname would throw away a real enquiry, and mononyms exist.
    const name =
      fullName(first_name ?? "", last_name ?? "") ||
      ((body as { name?: string }).name ?? "").trim();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Adams Farm Website" <${process.env.SMTP_EMAIL}>`,
      to: process.env.SMTP_EMAIL,
      replyTo: email,
      subject: `New puppy inquiry from ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2 style="color:#1B2A41;margin-bottom:4px">New inquiry — Adams Farm Labradoodles</h2>
          <p style="color:#666;font-size:13px;margin-bottom:24px">Submitted via adamsfarmlabradoodles.com</p>
          <table style="width:100%;border-collapse:collapse">
            <tr>
              <td style="padding:10px 12px;background:#FAF7F0;border:1px solid #E2DAC7;font-weight:700;width:120px;font-size:14px">Name</td>
              <td style="padding:10px 12px;border:1px solid #E2DAC7;font-size:14px">${name}</td>
            </tr>
            <tr>
              <td style="padding:10px 12px;background:#FAF7F0;border:1px solid #E2DAC7;font-weight:700;font-size:14px">Email</td>
              <td style="padding:10px 12px;border:1px solid #E2DAC7;font-size:14px"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr>
              <td style="padding:10px 12px;background:#FAF7F0;border:1px solid #E2DAC7;font-weight:700;font-size:14px">Phone</td>
              <td style="padding:10px 12px;border:1px solid #E2DAC7;font-size:14px">${phone ?? "Not provided"}</td>
            </tr>
            <tr>
              <td style="padding:10px 12px;background:#FAF7F0;border:1px solid #E2DAC7;font-weight:700;font-size:14px;vertical-align:top">Message</td>
              <td style="padding:10px 12px;border:1px solid #E2DAC7;font-size:14px;white-space:pre-wrap">${message}</td>
            </tr>
          </table>
          <p style="margin-top:20px;font-size:12px;color:#999">Reply to this email to respond directly to ${name}.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json(
      { error: "Failed to send message." },
      { status: 500 }
    );
  }
}
