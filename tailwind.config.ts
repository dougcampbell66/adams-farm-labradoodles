import type { Config } from "tailwindcss";

// Palette comes from the Adams Farm logo: a navy wordmark and paw, with four
// toe pads in blue, green, yellow and red. Those four are named for what they
// mean in the socialization program rather than for their hue — calm, focus,
// excite, feelings — which is how the mockup in design-reference/ labelled them.
//
// Deliberately NOT here: any brass/tan, and any dark green field. Those are
// Legend Manor's two load-bearing colors, and reusing them is what made the two
// brands read as the same kennel.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#1B2A41",
        "navy-deep": "#152134",
        // Cooler and lighter than Legend Manor's #F4EEE1 cream, on purpose.
        paper: "#FBFAF7",
        "paper-2": "#F1EEE7",
        charcoal: "#22201C",
        slate: "#4A5462",
        "slate-dim": "#6E7787",
        rule: "#E2DED5",

        calm: "#5B8DBE",
        focus: "#6FAE7F",
        excite: "#F2C14E",
        feelings: "#E4634F",
        "feelings-deep": "#C94A36",
      },
      fontFamily: {
        // EB Garamond carries the prospectus formality; Nunito keeps the warmth
        // the brand already had.
        serif: ["var(--font-garamond)", "Georgia", "serif"],
        sans: ["var(--font-nunito)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        page: "1120px",
      },
    },
  },
  plugins: [],
};

export default config;
