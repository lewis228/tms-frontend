import FadeIn from "@/pages/landing/components/fade-in";
import { motion, useReducedMotion } from "framer-motion";

const EASE: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];

const HERO_WORDS = ["About", "OMNIQ"];

export default function AboutHeroSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative flex min-h-[400px] items-center justify-center overflow-hidden md:min-h-[480px]">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/33275774/pexels-photo-33275774.jpeg?auto=compress&cs=tinysrgb&w=1920&h=800&fit=crop"
          alt="Aerial view of winding highway" // TODO: replace asset
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-landing-navy/70" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 py-28 text-center md:py-36 lg:px-8">
        <h1 className="font-heading text-4xl font-bold italic text-white md:text-6xl lg:text-7xl">
          {HERO_WORDS.map((word, i) => (
            <motion.span
              key={word}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: prefersReducedMotion ? 0 : 0.04 * i,
                duration: 0.5,
                ease: EASE,
              }}
              className="mr-[0.25em] inline-block"
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <FadeIn delay={0.2}>
          <p className="mx-auto mt-5 max-w-lg text-sm text-white/70 md:text-base">
            Delivering excellence through tailored logistics solutions that
            drive efficiency, innovation, and customer satisfaction.
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="mt-6 inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-landing-red" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
              DRIVEN BY A TALENTED TEAM
            </span>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
