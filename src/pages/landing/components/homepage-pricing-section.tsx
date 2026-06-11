import { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import FadeIn from "@/pages/landing/components/fade-in";

const PLANS = [
  {
    name: "Starter",
    price: 1500,
    desc: "Ideal for small businesses starting out.",
    features: ["Basic tracking", "Flexible Routes", "Competitive Rates"],
    highlighted: false,
  },
  {
    name: "Business",
    price: 2250,
    desc: "For growing businesses with good moderate shipment needs.",
    features: [
      "Full Tracking",
      "Priority Support",
      "Multiple Shipment Options",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: 30000,
    desc: "Comprehensive logistics for high-volume needs.",
    features: [
      "End-to-end Management",
      "24/7 Support",
      "Dedicated Account Manager",
    ],
    highlighted: false,
  },
];

function CountUp({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!inView) return;
    if (prefersReducedMotion) {
      const raf = requestAnimationFrame(() => setCount(target));
      return () => cancelAnimationFrame(raf);
    }
    let start = 0;
    const duration = 1500;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, prefersReducedMotion]);

  return <span ref={ref}>${count.toLocaleString()}</span>;
}

export default function HomepagePricingSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="bg-landing-navy py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <FadeIn>
          <div className="flex items-center justify-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-landing-red" />
            <span className="text-xs font-semibold tracking-[0.2em] text-white/50 uppercase">
              PRICING PLAN
            </span>
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h2 className="mt-5 text-center font-heading text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Solutions to Suit Every Business
          </h2>
        </FadeIn>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {PLANS.map((plan, i) => (
            <FadeIn key={plan.name} delay={0.08 * i}>
              <div
                className={`flex h-full flex-col rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 md:p-8 ${
                  plan.highlighted
                    ? "border-2 border-white/20 bg-white/10 shadow-xl shadow-white/5"
                    : "border border-white/10 bg-white/5"
                }`}
              >
                <h3 className="text-lg font-semibold text-white/80">
                  {plan.name}
                </h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white md:text-5xl">
                    <CountUp target={plan.price} />
                  </span>
                  <span className="text-sm text-white/50">/month</span>
                </div>
                <p className="mt-3 text-sm text-white/50">{plan.desc}</p>

                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-white/70"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-white/40" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <motion.button
                  type="button"
                  whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                  className="mt-8 w-full rounded-full bg-white py-3 text-sm font-semibold text-landing-navy transition-colors hover:bg-white/90"
                >
                  Subscribe Package
                </motion.button>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
