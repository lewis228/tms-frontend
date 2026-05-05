import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import FadeIn from "@/pages/landing/components/fade-in";

const EASE: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];

const TESTIMONIALS = [
  {
    location: "Philadelphia, Pennsylvania",
    quote: "\u201cAllowing us to focus on growth Highly recommended!\u201d",
    body: "\u201cTheir seamless coordination and proactive communication have made a real difference in our operations. From customs clearance to last-mile delivery, they\u2019ve handled every detail with expertise and care. We couldn\u2019t ask for a better logistics partner.\u201d",
    name: "Carmen Lander",
    role: "Retailer",
    avatar: "https://images.pexels.com/photos/7841434/pexels-photo-7841434.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop",
  },
  {
    location: "Los Angeles, California",
    quote: "\u201cExceptional service and reliability across the board.\u201d",
    body: "\u201cFrom warehousing to cross-border solutions, every aspect of their service exceeded our expectations. The team is responsive, professional, and genuinely invested in our success.\u201d",
    name: "David Chen",
    role: "Supply Chain Manager",
    avatar: "https://i.pravatar.cc/400?u=david-chen",
  },
];

export default function HomepageTestimonialsSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const current = TESTIMONIALS[activeIdx];

  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-start">
          {/* Left header */}
          <div>
            <FadeIn>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-landing-red" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-landing-muted">
                  TESTIMONIALS
                </span>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h2 className="mt-5 font-heading text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
                <span className="text-landing-red">Trusted</span> by Worldwide
              </h2>
            </FadeIn>
          </div>
          <FadeIn delay={0.2}>
            <p className="text-sm leading-relaxed text-landing-muted md:text-base">
              Many companies already work with us. Praise pleases us, criticism
              helps us because we want to get better every day.
            </p>
          </FadeIn>
        </div>

        {/* Testimonial card */}
        <FadeIn delay={0.3}>
          <div className="mt-12 overflow-hidden rounded-2xl border border-landing-border">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIdx}
                initial={prefersReducedMotion ? {} : { opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={prefersReducedMotion ? {} : { opacity: 0, x: -40 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="grid grid-cols-1 md:grid-cols-[320px_1fr]"
              >
                {/* Avatar */}
                <div className="aspect-square overflow-hidden bg-landing-light md:aspect-auto md:min-h-[360px]">
                  <img
                    src={current.avatar}
                    alt={current.name} // TODO: replace asset
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Quote */}
                <div className="flex flex-col justify-center p-6 md:p-10">
                  <p className="text-sm text-landing-muted">{current.location}</p>
                  <h3 className="mt-3 font-heading text-xl font-bold leading-tight md:text-2xl">
                    {current.quote}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-landing-muted">
                    {current.body}
                  </p>
                  <div className="mt-6">
                    <p className="text-sm font-bold text-landing-navy">
                      {current.name}
                    </p>
                    <p className="text-sm text-landing-muted">{current.role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </FadeIn>

        {/* Dot indicators */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIdx(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === activeIdx
                  ? "w-8 bg-landing-navy"
                  : "w-4 bg-landing-border hover:bg-landing-muted"
              }`}
              aria-label={`View testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
