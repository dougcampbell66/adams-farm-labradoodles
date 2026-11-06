import type { Metadata } from "next";
import OurDogs from "@/app/components/OurDogs";

// Our Dogs with the Dams section first (R6). A page rather than a redirect, as on Legend Manor.
export const metadata: Metadata = {
  title: "Dams",
  description: "The dams of Adams Farm Labradoodles — every mother of a litter on the Adams Farm record.",
  alternates: { canonical: "/dogs" },
};

// Live data, but not on every request — re-fetch at most every 5 minutes.
export const revalidate = 300;

export default function Page() {
  return <OurDogs first="dams" />;
}
