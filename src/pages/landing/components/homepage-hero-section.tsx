import { Link } from "react-router-dom";
import { ArrowRight, Anchor, MapPin } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import FadeIn from "@/pages/landing/components/fade-in";

const EASE: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];

const HERO_WORDS = ["Delivering", "More", "Than", "Just", "Freight"];

export default function HomepageHeroSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative min-h-[600px] overflow-hidden md:min-h-[700px] lg:min-h-[780px]">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/3057963/pexels-photo-3057963.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop"
          alt="Aerial view of container shipping port" // TODO: replace asset
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-landing-navy/80 via-landing-navy/60 to-landing-navy/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[600px] max-w-7xl flex-col justify-end px-5 pb-14 pt-28 md:min-h-[700px] md:pb-20 lg:min-h-[780px] lg:px-8">
        {/* Word-stagger headline */}
        <h1 className="font-heading text-4xl font-bold italic leading-[1.05] text-white sm:text-5xl md:text-6xl lg:text-8xl">
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
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-white/80 md:text-base lg:text-lg">
            We prioritize reliability, precision, and strong partnerships in
            every shipment, ensuring a seamless and efficient logistics
            experience from start to finish.
          </p>
        </FadeIn>

        {/* CTAs */}
        <FadeIn delay={0.3}>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <motion.div
              whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
            >
              <Link
                to="/sign-up"
                className="inline-flex items-center gap-2 rounded-full border-2 border-white px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Get a Free Quote
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </motion.div>
            <motion.div
              whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
            >
              <Link
                to="/services"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white"
              >
                Learn more
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </FadeIn>
      </div>

      {/* Floating info cards */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5, ease: EASE }}
        className="absolute right-4 top-24 z-20 hidden md:block lg:right-12 lg:top-28"
      >
        <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-lg">
          <Anchor className="h-4 w-4 text-landing-muted" />
          <span className="text-xs font-semibold text-landing-navy">
            The Port of Singapore
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75, duration: 0.5, ease: EASE }}
        className="absolute right-12 top-44 z-20 hidden md:block lg:right-24 lg:top-52"
      >
        <div className="rounded-xl bg-landing-navy/80 px-4 py-2 shadow-lg backdrop-blur-sm">
          <p className="text-xs font-semibold text-white">Bound for China</p>
          <p className="text-[10px] text-white/60">ETA: 1 Week</p>
        </div>
      </motion.div>

      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5, ease: EASE }}
        className="absolute bottom-44 right-8 z-20 hidden md:block lg:right-16 lg:bottom-52"
      >
        <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-lg">
          <MapPin className="h-4 w-4 text-landing-muted" />
          <div>
            <p className="text-xs font-semibold text-landing-navy">
              Bound for Germany
            </p>
            <p className="text-[10px] text-landing-muted">ETA: 2 weeks</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.05, duration: 0.5, ease: EASE }}
        className="absolute bottom-28 right-4 z-20 hidden max-w-[220px] rounded-xl bg-white p-3 shadow-lg md:block lg:right-12"
      >
        <p className="text-xs font-semibold text-landing-navy">
          We <span className="text-landing-red">cover</span> shipment around
          the <span className="text-landing-red">globe</span>
        </p>
        <div className="mt-2 h-16 overflow-hidden rounded-lg">
          <img
            src="https://images.pexels.com/photos/3278012/pexels-photo-3278012.jpeg?auto=compress&cs=tinysrgb&w=200&h=120&fit=crop"
            alt="Container ship" // TODO: replace asset
            className="h-full w-full object-cover"
          />
        </div>
      </motion.div>
    </section>
  );
}
