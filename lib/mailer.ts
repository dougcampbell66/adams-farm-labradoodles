/**
 * The one outbound mailbox for this site: the Hostinger account already
 * used for the contact form notification, now also used for the magic-link
 * sign-in email (lib/send-email.ts). Adams Farm pays for this mailbox
 * either way, so there is no reason a second email service (Resend) should
 * exist just to send one more kind of message.
 */
import nodemailer from "nodemailer";

export function isMailerConfigured(): boolean {
  return Boolean(process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD);
}

export function mailerTransport() {
  return nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}
