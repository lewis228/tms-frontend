import { useRef } from "react";
import { motion } from "framer-motion";
import FadeIn from "./fade-in";

const TESTIMONIALS = [
  {
    quote: "The per-carrier coverage in Asia is what closed it for us. HMM, SM Line, Yang Ming — no other tracking API had all three production-ready.",
    name: "Ops Director",
    role: "Korea-US Forwarder",
    avatar: "https://i.pravatar.cc/40?u=carrier-asia",
  },
  {
    quote: "LFD alerts pushed to Slack before our drivers dispatch. That one webhook saved us five-figure demurrage in the first month.",
    name: "Dispatch Lead",
    role: "LA/LB Drayage",
    avatar: "https://i.pravatar.cc/40?u=dispatch-lalb",
  },
  {
    quote: "Switched from Terminal49 for the Asian carrier support and stayed for the API ergonomics. The REST surface is clean.",
    name: "Head of Engineering",
    role: "Freight SaaS",
    avatar: "https://i.pravatar.cc/40?u=freight-eng",
  },
  {
    quote: "The sandbox lets us wire up our TMS without paying for prod calls. We had a working prototype in a weekend.",
    name: "Co-founder",
    role: "Logistics Startup",
    avatar: "https://i.pravatar.cc/40?u=logi-startup",
  },
  {
    quote: "The container-level event dedup is worth the subscription by itself. We'd been drowning in duplicate scrape rows for months.",
    name: "Platform Engineer",
    role: "Global 3PL",
    avatar: "https://i.pravatar.cc/40?u=3pl-platform",
  },
];

export default function TestimonialsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="py-32 overflow-hidden">
      <FadeIn>
        <h2 className="text-center font-heading text-5xl font-normal tracking-tight text-white md:text-6xl">
          Beyond expectations
        </h2>
      </FadeIn>
      <FadeIn delay={0.1}>
        <p className="mx-auto mt-5 max-w-xl text-center text-base leading-relaxed text-resend-muted">
          OMNIQ powers forwarders, 3PLs, drayage operators, and freight SaaS
          teams shipping real-time visibility without babysitting carrier
          scrapers.
        </p>
      </FadeIn>

      {/* Horizontal scrolling testimonials */}
      <div className="mt-16 relative">
        <motion.div
          ref={scrollRef}
          className="flex gap-5 px-6 cursor-grab active:cursor-grabbing"
          drag="x"
          dragConstraints={{ left: -800, right: 200 }}
          style={{ paddingLeft: "max(1.5rem, calc((100vw - 1200px)/2))" }}
        >
          {TESTIMONIALS.map((t) => (
            <motion.div
              key={t.name}
              whileHover={{ y: -4 }}
              className="w-[320px] shrink-0 rounded-2xl border border-resend-border bg-resend-card p-6 transition-colors hover:border-resend-muted/30"
            >
              <p className="text-sm leading-relaxed text-resend-muted">"{t.quote}"</p>
              <div className="mt-6 flex items-center gap-3">
                <img src={t.avatar} alt={t.name} className="h-10 w-10 rounded-full" />
                <div>
                  <p className="text-sm font-medium text-white">{t.name}</p>
                  <p className="text-xs text-resend-dim">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
