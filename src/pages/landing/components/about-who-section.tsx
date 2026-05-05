import { ShieldCheck, Lightbulb, Users, Leaf } from "lucide-react";
import FadeIn from "@/pages/landing/components/fade-in";

const VALUES = [
  { icon: ShieldCheck, label: "Reliability" },
  { icon: Lightbulb, label: "Innovation" },
  { icon: Users, label: "Costumer Focus" },
  { icon: Leaf, label: "Sustainability" },
];

export default function AboutWhoSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
          {/* Left */}
          <div>
            <FadeIn>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-landing-red" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-landing-muted">
                  WHO ARE WE
                </span>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h2 className="mt-5 font-heading text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
                We Specialize in{" "}
                <span className="text-landing-red">
                  End-to-end Logistics Services
                </span>{" "}
                That Ensure Timely and Secure Delivery
              </h2>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="mt-5 text-sm leading-relaxed text-landing-muted md:text-base">
                Our dedicated team works around the clock to provide tailored
                solutions for good businesses of all sizes, helping you meet
                your goals with ease and reliability. Start from customs
                brokerage to last-mile delivery, we&rsquo;re committed to
                quality and precision in every service we offer.
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="mt-6 border-l-4 border-landing-red bg-landing-navy px-5 py-4 text-sm font-semibold leading-relaxed text-white md:text-base">
                We simplify logistics with advanced technology, so you can focus
                on business growth
              </div>
            </FadeIn>
          </div>

          {/* Right — container port image with values overlay */}
          <FadeIn delay={0.2} direction="right">
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src="https://images.pexels.com/photos/13025947/pexels-photo-13025947.jpeg?auto=compress&cs=tinysrgb&w=800&h=700&fit=crop"
                alt="Container shipping port with cranes" // TODO: replace asset
                className="h-full w-full object-cover"
              />
              {/* Values overlay card */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-xl bg-white/90 px-5 py-4 shadow-lg backdrop-blur-sm md:bottom-8 md:left-auto md:right-8 md:translate-x-0">
                <ul className="space-y-2.5">
                  {VALUES.map((v) => {
                    const Icon = v.icon;
                    return (
                      <li
                        key={v.label}
                        className="flex items-center gap-2 text-sm font-medium text-landing-navy"
                      >
                        <Icon className="h-4 w-4 text-landing-muted" />
                        {v.label}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
