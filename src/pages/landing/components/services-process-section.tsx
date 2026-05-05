import FadeIn from "@/pages/landing/components/fade-in";

const STEPS = [
  {
    num: "01",
    title: "In-Depth Consultation",
    description:
      "Carefully assessing your logistics needs to ensure tailored and effective solutions.",
  },
  {
    num: "02",
    title: "Strategic Planning",
    description:
      "Designing a best plan to ensure efficient and optimal delivery of your goods.",
  },
  {
    num: "03",
    title: "Efficient Execution",
    description:
      "Carefully coordinating every detail of the shipment process to ensure smooth and timely execution.",
  },
  {
    num: "04",
    title: "On-Time Delivery",
    description:
      "Gaining a deep understanding of your logistics needs to offer the best possible solutions.",
  },
];

export default function ServicesProcessSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {/* Header */}
        <FadeIn>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-landing-red" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-landing-muted">
              Work Process
            </span>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h2 className="mt-4 font-heading text-3xl font-bold leading-tight text-landing-navy md:text-4xl lg:text-5xl">
            Our{" "}
            <span className="italic text-landing-red">Proven Process</span>{" "}
            <span className="italic">for Excellence</span>
          </h2>
        </FadeIn>

        {/* Two-column layout */}
        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left — description + decorative illustration */}
          <div>
            <FadeIn delay={0.15}>
              <p className="text-sm leading-relaxed text-landing-muted md:text-base">
                Our process is simple yet effective. Every project is different,
                but we've seen thousands of them since we first launched. Our
                experience is your asset.
              </p>
            </FadeIn>

            {/* Decorative concentric circles */}
            <FadeIn delay={0.2}>
              <div className="mt-10 flex items-center justify-center">
                <svg
                  viewBox="0 0 320 200"
                  fill="none"
                  className="h-auto w-full max-w-md"
                  aria-hidden="true"
                >
                  {/* Left circles */}
                  <circle
                    cx="120"
                    cy="100"
                    r="80"
                    stroke="#E63946"
                    strokeWidth="1"
                    opacity="0.3"
                  />
                  <circle
                    cx="120"
                    cy="100"
                    r="55"
                    stroke="#0B1340"
                    strokeWidth="1"
                    opacity="0.2"
                  />
                  <circle
                    cx="120"
                    cy="100"
                    r="30"
                    stroke="#0B1340"
                    strokeWidth="1"
                    opacity="0.15"
                  />
                  {/* Right circles */}
                  <circle
                    cx="200"
                    cy="100"
                    r="80"
                    stroke="#E63946"
                    strokeWidth="1"
                    opacity="0.3"
                  />
                  <circle
                    cx="200"
                    cy="100"
                    r="55"
                    stroke="#0B1340"
                    strokeWidth="1"
                    opacity="0.2"
                  />
                  <circle
                    cx="200"
                    cy="100"
                    r="30"
                    stroke="#0B1340"
                    strokeWidth="1"
                    opacity="0.15"
                  />
                </svg>
              </div>
            </FadeIn>
          </div>

          {/* Right — numbered steps */}
          <div className="flex flex-col">
            {STEPS.map((step, i) => (
              <FadeIn key={step.num} delay={0.1 * i}>
                <div
                  className={`flex gap-5 py-8 ${
                    i < STEPS.length - 1
                      ? "border-b border-landing-border"
                      : ""
                  } ${i === 0 ? "border-t border-landing-border" : ""}`}
                >
                  {/* Large number */}
                  <span className="font-heading text-5xl font-bold text-landing-navy/10 md:text-6xl">
                    {step.num}
                  </span>

                  {/* Text */}
                  <div className="pt-1">
                    <h3 className="font-heading text-xl font-bold text-landing-navy md:text-2xl">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-landing-muted">
                      {step.description}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
