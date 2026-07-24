/**
 * The four toe pads from the logo, as a standalone motif.
 *
 * They aren't decoration: each color is named for a facet of the socialization
 * program — calm, focus, excitement, feelings — so the row doubles as a
 * shorthand for what the program covers. Order matches the logo, left to right.
 */
export function PawDots({
  size = 11,
  gap = 9,
  className = "",
}: {
  size?: number;
  gap?: number;
  className?: string;
}) {
  const pads: { color: string; label: string }[] = [
    { color: "#5B8DBE", label: "Calm" },
    { color: "#6FAE7F", label: "Focus" },
    { color: "#F2C14E", label: "Excitement" },
    { color: "#E4634F", label: "Feelings" },
  ];

  return (
    <div
      className={`flex ${className}`}
      style={{ gap }}
      role="img"
      aria-label="Adams Farm — calm, focus, excitement, feelings"
    >
      {pads.map((p) => (
        <span
          key={p.label}
          title={p.label}
          style={{ width: size, height: size, background: p.color, borderRadius: "50%" }}
        />
      ))}
    </div>
  );
}
