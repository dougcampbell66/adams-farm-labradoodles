import type { Metadata } from "next";
import OurDogs from "@/app/components/OurDogs";

// Our Dogs: the dams and sires on one page (pawsq DECISIONS-2026-11-06 R6).
export const metadata: Metadata = {
  title: "Our Dogs",
  description: "The dams and sires of Adams Farm Labradoodles — every parent of a litter on the Adams Farm record.",
  alternates: { canonical: "/dogs" },
};

// Live data, but not on every request — re-fetch at most every 5 minutes.
export const revalidate = 300;

export default function Page() {
  return <OurDogs first="dams" />;
}
