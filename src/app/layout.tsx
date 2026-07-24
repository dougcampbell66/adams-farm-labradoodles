import type { Metadata } from "next";
import { EB_Garamond, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

// EB Garamond carries the prospectus formality; Nunito Sans keeps the warmth
// the brand already had in design-reference/mockup.html.
const garamond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-garamond",
  display: "swap",
});

const nunito = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Adams Farm Labradoodles — Puppies with a Purpose",
    template: "%s · Adams Farm Labradoodles",
  },
  description:
    "Australian Labradoodles raised by the Campbell family in Greensboro, North Carolina. " +
    "ALAA Gold Paw accredited, health-tested, and raised on a structured socialization program.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${garamond.variable} ${nunito.variable}`}>
      <body className="font-sans">
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
