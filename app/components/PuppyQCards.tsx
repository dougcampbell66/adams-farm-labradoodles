"use client";

import { useState } from "react";

type Phase = {
  n: number;
  title: string;
  timeframe: string;
  front: string;
  back: string;
  accent: string; // hex for badge / border / back face
  badgeText: string; // badge number text color
  phaseText: string; // phase label color
  backText: string; // back-face body text color
};

const phases: Phase[] = [
  {
    n: 1,
    title: "Neonatal Period",
    timeframe: "Day 0–14",
    front: "Puppies are born blind and deaf, their brains not yet ready to learn.",
    back: "Every puppy is weighed and gently handled, one on one, every single day.",
    accent: "#6FAE7F",
    badgeText: "#fff",
    phaseText: "#6FAE7F",
    backText: "#fff",
  },
  {
    n: 2,
    title: "Transition Period",
    timeframe: "Day 14–21",
    front: "Eyes and ears open and the puppy comes online for the first time.",
    back: "Handling stays calm and quiet while first impressions form.",
    accent: "#5B8DBE",
    badgeText: "#fff",
    phaseText: "#5B8DBE",
    backText: "#fff",
  },
  {
    n: 3,
    title: "Socialization Period",
    timeframe: "Week 3–12",
    front:
      "The critical window for meeting the world — and it stays open after your puppy comes home.",
    back: "Puppies meet people, places, and friendly dogs through steady, everyday exposure.",
    accent: "#F2C14E",
    badgeText: "#1B2A41",
    phaseText: "#B8921E",
    backText: "#1B2A41",
  },
  {
    n: 4,
    title: "Juvenile Period",
    timeframe: "Week 12 to sexual maturity",
    front:
      "The socialization window has closed and your growing puppy enters adolescence.",
    back: "Keep up the outings and routines that carry the foundation forward.",
    accent: "#D94F3D",
    badgeText: "#fff",
    phaseText: "#D94F3D",
    backText: "#fff",
  },
];

export default function PuppyQCards() {
  const [flipped, setFlipped] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {phases.map((p) => (
        <div
          key={p.n}
          className="flip-perspective h-[260px] cursor-pointer outline-none"
          tabIndex={0}
          onClick={() =>
            setFlipped((cur) => (cur === p.n ? null : p.n))
          }
        >
          <div className={`flip-inner ${flipped === p.n ? "is-flipped" : ""}`}>
            {/* Front */}
            <div
              className="flip-face flip-front bg-white border border-line shadow-[0_2px_16px_rgba(0,0,0,0.07)] p-7 flex flex-col justify-center gap-2.5"
              style={{ borderTop: `4px solid ${p.accent}` }}
            >
              <p
                className="flex items-center gap-2 text-[0.7rem] font-extrabold tracking-[0.08em] uppercase m-0"
                style={{ color: p.phaseText }}
              >
                <span
                  className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[0.68rem] font-extrabold shrink-0"
                  style={{ background: p.accent, color: p.badgeText }}
                >
                  {p.n}
                </span>
                {p.title}
              </p>
              <p className="text-[0.7rem] font-semibold tracking-[0.05em] text-muted m-0">
                {p.timeframe}
              </p>
              <p className="text-[0.78rem] text-muted leading-[1.6] m-0">
                {p.front}
              </p>
            </div>
            {/* Back */}
            <div
              className="flip-face flip-back flex items-center justify-center text-center p-7"
              style={{ background: p.accent }}
            >
              <p
                className="text-[0.875rem] leading-[1.65] m-0"
                style={{ color: p.backText }}
              >
                {p.back}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
