import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["nodemailer"],

  async redirects() {
    return [
      // /our-dogs was retired: organising the dogs by who owns them misstated
      // the bloodline, which is defined by what a dog has produced. /dams is
      // the closest thing to what a visitor following an old link wanted, and
      // /sires is one click away in the nav. Permanent (308) — the page is not
      // coming back, so search engines should consolidate onto /dams.
      { source: "/our-dogs", destination: "/dams", permanent: true },
    ];
  },
};

export default nextConfig;
