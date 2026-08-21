import type { NextConfig } from "next";

// The PuppyQ app — the signed-in area served under our own domain. Visitors
// never see this URL; the rewrites below proxy it, so the address bar stays
// on adamsfarmlabradoodles.com the whole way through sign-in and the app
// itself. Same wiring as puppytherapy.com, one brand later.
// Deployment runbook: docs/DEPLOY.md in the dougcampbell66/puppyq-app repo.
const PUPPYQ_APP = "https://pawsq-app.vercel.app";

const nextConfig: NextConfig = {
  serverExternalPackages: ["nodemailer"],

  async rewrites() {
    // None of these paths exist on this site, so nothing is shadowed. Our own
    // sign-in (the /forever-families gate) lives under /api/auth/*, which no
    // rewrite touches — /auth/* here belongs to the PuppyQ app's magic-link
    // callback, a different door for different people.
    return [
      { source: "/app", destination: `${PUPPYQ_APP}/app` },
      { source: "/app/:path*", destination: `${PUPPYQ_APP}/app/:path*` },
      { source: "/auth/:path*", destination: `${PUPPYQ_APP}/auth/:path*` },
      { source: "/login", destination: `${PUPPYQ_APP}/login` },
      { source: "/puppyq-static/:path*", destination: `${PUPPYQ_APP}/puppyq-static/:path*` },
    ];
  },

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
