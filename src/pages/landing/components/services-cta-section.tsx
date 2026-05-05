import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import FadeIn from "@/pages/landing/components/fade-in";

export default function ServicesCtaSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="px-5 pb-20 md:pb-28 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-landing-navy px-6 py-16 text-center md:py-24">
        {/* World map dot pattern background */}
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <svg
            viewBox="0 0 800 400"
            fill="none"
            className="h-full w-full"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            {/* Simplified world map dot grid */}
            {Array.from({ length: 40 }).map((_, row) =>
              Array.from({ length: 80 }).map((_, col) => {
                const x = col * 10 + 5;
                const y = row * 10 + 5;
                // Create rough continent shapes with dot probability
                const isLand =
                  // North America
                  (x > 100 && x < 250 && y > 60 && y < 180) ||
                  // South America
                  (x > 180 && x < 280 && y > 200 && y < 350) ||
                  // Europe
                  (x > 340 && x < 460 && y > 50 && y < 150) ||
                  // Africa
                  (x > 350 && x < 470 && y > 150 && y < 320) ||
                  // Asia
                  (x > 450 && x < 700 && y > 40 && y < 200) ||
                  // Australia
                  (x > 600 && x < 720 && y > 250 && y < 330);
                if (!isLand || Math.random() > 0.4) return null;
                return (
                  <circle
                    key={`${row}-${col}`}
                    cx={x}
                    cy={y}
                    r="1.5"
                    fill="white"
                  />
                );
              }),
            )}
          </svg>
        </div>

        <div className="relative z-10">
          <FadeIn>
            <h2 className="mx-auto max-w-xl font-heading text-3xl font-bold italic text-white md:text-4xl lg:text-5xl">
              Streamline Your Logistics Today!
            </h2>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/70 md:text-base">
              Discover a world of effortless and seamless logistics, ready to
              transform the way you move forward.
            </p>
          </FadeIn>

          <FadeIn delay={0.2}>
            <motion.div
              className="mt-8 inline-block"
              whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
            >
              <Link
                to="/sign-up"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-landing-navy transition-shadow hover:shadow-lg hover:shadow-white/20"
              >
                Get a Quote
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-landing-navy text-white">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </motion.div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
