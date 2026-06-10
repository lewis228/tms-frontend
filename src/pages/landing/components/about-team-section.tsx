import { Link } from "react-router-dom";
import { ArrowRight, User } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import FadeIn from "@/pages/landing/components/fade-in";

const TEAM = [
  {
    name: "Andy Kim",
    role: "CEO",
    avatar: "",
  },
  {
    name: "Kay Sung",
    role: "CEO",
    avatar: "",
  },
  {
    name: "Jin Hong",
    role: "CEO",
    avatar: "",
  },
  {
    name: "Terry Kim",
    role: "Developer",
    avatar: "/images/team-terry.png",
  },
  {
    name: "Lewis Jo",
    role: "Developer",
    avatar: "/images/team-ceo.png",
  },
];

export default function AboutTeamSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_2fr]">
          {/* Left header */}
          <div>
            <FadeIn>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-landing-red" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-landing-muted">
                  OUR TEAMS
                </span>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h2 className="mt-5 font-heading text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
                Logistics Experts{" "}
                <span className="text-landing-red">
                  Committed to Delivering
                </span>{" "}
                Your Success
              </h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <motion.div
                className="mt-6"
                whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
              >
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-full border border-landing-border px-5 py-2.5 text-sm font-medium text-landing-navy transition-colors hover:border-landing-navy"
                >
                  Join With Us
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-landing-light">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </motion.div>
            </FadeIn>
          </div>

          {/* Right — team cards */}
          <div className="space-y-6">
            {TEAM.map((member, i) => (
              <FadeIn key={member.name} delay={0.08 * i}>
                <div className="group flex items-center gap-6 border-b border-landing-border pb-6 last:border-b-0 last:pb-0">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-landing-light md:h-32 md:w-32">
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-landing-light text-landing-muted">
                        <User className="h-10 w-10 md:h-14 md:w-14" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-bold text-landing-navy md:text-2xl">
                      {member.name}
                    </h3>
                    <p className="mt-1 text-sm text-landing-muted">
                      {member.role}
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
