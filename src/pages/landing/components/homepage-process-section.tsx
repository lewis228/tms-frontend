import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import FadeIn from "@/pages/landing/components/fade-in";

const STEPS = [
  {
    num: "01",
    title: "In-Depth Consultation",
    text: "Assessing your drayage operation to map routes, volumes, and integration needs.",
  },
  {
    num: "02",
    title: "Strategic Planning",
    text: "Configuring dispatch boards, rate cards, and driver assignments for your fleet.",
  },
  {
    num: "03",
    title: "Efficient Execution",
    text: "Coordinating every container move with real-time GPS, ETA, and geofence alerts.",
  },
  {
    num: "04",
    title: "On-Time Delivery",
    text: "Tracking pickup-to-delivery performance to reduce LFD violations and demurrage.",
  },
];

export default function HomepageProcessSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.offsetWidth * 0.8;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  return (
    <section className="bg-landing-navy py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {/* Header */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-end">
          <div>
            <FadeIn>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-landing-red" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                  WORK PROCESS
                </span>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h2 className="mt-4 font-heading text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                How We Work
              </h2>
            </FadeIn>
          </div>
          <FadeIn delay={0.2}>
            <p className="text-sm leading-relaxed text-white/60 md:text-base">
              Our process is simple yet effective. From the initial consultation
              to understand your logistics needs, to careful planning and
              execution, we ensure every detail is handled with precision.
            </p>
          </FadeIn>
        </div>

        {/* Horizontal scroll cards */}
        <div className="relative mt-12">
          <div
            ref={scrollRef}
            className="scrollbar-hidden -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 md:mx-0 md:px-0"
          >
            {STEPS.map((step, i) => (
              <FadeIn
                key={step.num}
                delay={0.08 * i}
                className="w-[280px] shrink-0 snap-start md:w-[320px]"
              >
                <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:bg-white/10">
                  <span className="text-sm font-semibold text-white/40">
                    {step.num}
                  </span>
                  <h3 className="mt-3 text-lg font-bold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">
                    {step.text}
                  </p>
                  {/* Abstract geometric placeholder */}
                  <div className="mt-auto pt-6">
                    <div className="flex items-center justify-center">
                      <div className="h-24 w-24 rounded-full border border-white/10" />
                      <div className="-ml-6 h-16 w-16 rounded-full border border-landing-red/30" />
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Scroll buttons — desktop */}
          <div className="mt-6 hidden items-center justify-center gap-3 md:flex">
            <button
              type="button"
              onClick={() => scroll("left")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/60 transition-colors hover:border-white/40 hover:text-white"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/60 transition-colors hover:border-white/40 hover:text-white"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
