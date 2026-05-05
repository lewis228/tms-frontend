import FadeIn from "@/pages/landing/components/fade-in";

const MILESTONES = [
  {
    year: "1999",
    text: "OMNIQ was founded with a vision to provide efficient regional logistics solutions",
  },
  {
    year: "2005",
    text: "Expanded services to include international freight and cross-border solutions.",
  },
  {
    year: "2012",
    text: "Opened new offices across major global trade hubs, strengthening global reach.",
  },
  {
    year: "2018",
    text: "Launched our proprietary tracking technology for real-time shipment visibility.",
  },
  {
    year: "2023",
    text: "Achieved 99% on-time delivery rate, establishing as a trusted industry leader.",
  },
];

export default function AboutMilestoneSection() {
  return (
    <section className="bg-landing-navy py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <FadeIn>
          <div className="flex items-center justify-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-landing-red" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
              MILESTONE
            </span>
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h2 className="mt-5 text-center font-heading text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Our History Since Inception
          </h2>
        </FadeIn>

        {/* Desktop: horizontal timeline */}
        <div className="mt-16 hidden md:block">
          {/* Year labels */}
          <div className="flex items-start justify-between">
            {MILESTONES.map((m, i) => (
              <FadeIn
                key={m.year}
                delay={0.08 * i}
                className="flex-1 text-center"
              >
                <p className="text-lg font-bold text-white">{m.year}</p>
              </FadeIn>
            ))}
          </div>

          {/* Timeline line + dots */}
          <div className="relative mt-6 flex items-center">
            <div className="absolute inset-x-0 h-0.5 bg-white/20" />
            <div className="absolute left-0 h-0.5 w-1/5 bg-white" />
            {MILESTONES.map((m, i) => (
              <div
                key={m.year}
                className="relative flex flex-1 items-center justify-center"
              >
                <div
                  className={`relative z-10 h-4 w-4 rounded-full border-2 ${
                    i === 0
                      ? "border-white bg-white"
                      : "border-white/40 bg-landing-navy"
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Descriptions */}
          <div className="mt-6 flex items-start justify-between gap-4">
            {MILESTONES.map((m, i) => (
              <FadeIn
                key={m.year}
                delay={0.1 + 0.08 * i}
                className="flex-1 text-center"
              >
                <p className="text-xs leading-relaxed text-white/50">
                  {m.text}
                </p>
              </FadeIn>
            ))}
          </div>
        </div>

        {/* Mobile: vertical timeline */}
        <div className="mt-12 md:hidden">
          <div className="relative border-l-2 border-white/20 pl-8">
            {MILESTONES.map((m, i) => (
              <FadeIn key={m.year} delay={0.08 * i}>
                <div className="relative pb-10 last:pb-0">
                  <div className="absolute -left-[calc(2rem+5px)] top-1 h-3 w-3 rounded-full border-2 border-white/40 bg-landing-navy" />
                  <p className="text-lg font-bold text-white">{m.year}</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/50">
                    {m.text}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
