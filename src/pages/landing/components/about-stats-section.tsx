import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useReducedMotion } from "framer-motion";
import FadeIn from "@/pages/landing/components/fade-in";

const STATS = [
  { value: 25, suffix: "", label: "Years of Industry Experience" },
  { value: 99, suffix: "%", label: "On-Time Delivery Rate" },
  { value: 500, suffix: "+", label: "Satisfied Clients Worldwide" },
  { value: 300, suffix: "+", label: "Employees for Your Success" },
];

function CountUp({ target, suffix }: { target: number; suffix: string }) {
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
    const step = target / (1200 / 16);
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

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

export default function AboutStatsSection() {
  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          {STATS.map((stat, i) => (
            <FadeIn key={stat.label} delay={0.08 * i}>
              <div className="rounded-2xl border border-landing-border p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <p className="font-heading text-4xl font-bold text-landing-navy md:text-5xl">
                  <CountUp target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-2 text-sm text-landing-muted">{stat.label}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
