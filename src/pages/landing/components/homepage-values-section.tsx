import { ShieldCheck, Users, Lightbulb, Leaf } from "lucide-react";
import FadeIn from "@/pages/landing/components/fade-in";

const VALUES = [
  {
    icon: ShieldCheck,
    label: "Reliability",
    text: "We ensure every delivery meets our high standards, from start to finish",
  },
  {
    icon: Users,
    label: "Customer Focus",
    text: "Your needs are our priority—every mile of the journey.",
  },
  {
    icon: Lightbulb,
    label: "Innovation",
    text: "Embracing the latest technology for a seamless logistics experience.",
  },
  {
    icon: Leaf,
    label: "Sustainability",
    text: "Committed to eco-friendly practices in every aspect of our service.",
  },
];

export default function HomepageValuesSection() {
  return (
    <section className="bg-landing-light py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
          {/* Left */}
          <div>
            <FadeIn>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-landing-red" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-landing-muted">
                  CORE VALUES
                </span>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h2 className="mt-5 font-heading text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
                Built on{" "}
                <span className="text-landing-red">Trust</span> and{" "}
                <span className="text-landing-red">Excellence</span>
              </h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="mt-4 text-sm leading-relaxed text-landing-muted md:text-base">
                We foster strong relationships by staying true to our values of
                integrity, quality, and accountability.
              </p>
            </FadeIn>
          </div>

          {/* Right — 2×2 grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {VALUES.map((item, i) => {
              const Icon = item.icon;
              return (
                <FadeIn key={item.label} delay={0.08 * i}>
                  <div className="group rounded-2xl border border-landing-border bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-landing-light text-landing-muted">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="rounded-full bg-landing-light px-3 py-1 text-xs font-medium text-landing-muted">
                        {item.label}
                      </span>
                    </div>
                    <p className="mt-6 text-sm font-medium leading-relaxed text-landing-navy">
                      {item.text}
                    </p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
