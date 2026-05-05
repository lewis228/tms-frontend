import { Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";

const FOOTER_COLUMNS = [
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Services", to: "/services" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Docs", to: "/" }, // TODO: real link
      { label: "Knowledge Base", to: "/" }, // TODO: real link
      { label: "Support", to: "/" }, // TODO: real link
    ],
  },
  {
    title: "Service",
    links: [
      { label: "Dispatch Board", to: "/" }, // TODO: real link
      { label: "Container Tracking", to: "/" }, // TODO: real link
      { label: "Driver Mobile", to: "/" }, // TODO: real link
      { label: "Settlements", to: "/" }, // TODO: real link
    ],
  },
];

export default function LandingFooter() {
  const [email, setEmail] = useState("");

  return (
    <footer className="bg-landing-navy text-white">
      {/* Top: Logo + tagline */}
      <div className="mx-auto max-w-7xl px-5 pt-16 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <Link
            to="/"
            className="font-heading text-5xl font-bold tracking-tight md:text-6xl"
          >
            <span className="italic">O</span>MNIQ
          </Link>
          <div className="max-w-xs">
            <h3 className="font-heading text-2xl font-bold leading-tight md:text-3xl">
              The Future of Urban Delivery Starts Here
            </h3>
          </div>
        </div>
      </div>

      {/* Middle: newsletter + columns */}
      <div className="mx-auto max-w-7xl px-5 pb-12 pt-12 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Newsletter */}
          <div className="lg:col-span-2">
            <h4 className="text-lg font-semibold">Stay Connected</h4>
            <p className="mt-2 text-sm text-white/60">
              Join our community to unlock exclusive insights and innovative
              solutions for all your logistics needs
            </p>
            <div className="mt-4 flex items-center gap-0 overflow-hidden rounded-full border border-white/20 bg-white/5">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Type your email"
                className="flex-1 bg-transparent px-5 py-3 text-sm text-white placeholder:text-white/40 outline-none"
                aria-label="Email address"
              />
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="mr-1 rounded-full bg-white px-5 py-2 text-sm font-semibold text-landing-navy transition-colors hover:bg-white/90"
              >
                Get a Quote
              </motion.button>
            </div>

            {/* Address + status */}
            <div className="mt-6 space-y-1 text-xs text-white/40">
              <p>Insight Logistics, Inc. · Los Angeles · Seoul</p>
              <p>support@omniq.com · +1 (310) 555-0100</p>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="h-2 w-2 rounded-full bg-green-400"
              />
              <span className="text-xs text-white/50">
                All systems operational
              </span>
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-sm font-semibold">{col.title}</h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-6 text-xs text-white/40 md:flex-row lg:px-8">
          <div className="flex items-center gap-6">
            <Link to="/" className="transition-colors hover:text-white">
              Privacy policy
            </Link>
            <Link to="/" className="transition-colors hover:text-white">
              Sitemap
            </Link>
            <Link to="/" className="transition-colors hover:text-white">
              Terms of Use
            </Link>
          </div>
          <p>
            © 2025 OMNIQ. All rights reserved | by Insight Logistics, Inc.
          </p>
        </div>
      </div>
    </footer>
  );
}
