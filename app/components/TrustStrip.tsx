import { stats } from "@/src/data/stats";

const items = [
  { num: String(stats.littersPlaced), label: "Litters" },
  { num: String(stats.happyFamilies), label: "Families" },
  { num: "3-Year", label: "Health Guarantee" },
];

export default function TrustStrip() {
  return (
    <div className="bg-navy py-7 px-6 flex justify-center gap-10 flex-wrap border-t border-b border-[#2d4460]">
      {items.map(({ num, label }) => (
        <div
          key={label}
          className="text-center font-extrabold text-[0.85rem] text-cream max-w-[160px]"
        >
          <span className="block font-heading font-bold text-[1.6rem] text-coral">{num}</span>
          {label}
        </div>
      ))}
    </div>
  );
}
