import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import FadeIn from "./components/fade-in";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    desc: "For trials and evaluation.",
    features: [
      "25 active delivery orders",
      "Standard dispatch updates",
      "Dashboard access",
      "Community support",
      "7-day activity log retention",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$99",
    period: "/month",
    desc: "For drayage carriers and dispatch teams.",
    features: [
      "500 active delivery orders",
      "Real-time leg status updates",
      "Driver mobile app access",
      "Webhooks (assigned, in-transit, delivered)",
      "REST API + X-API-Key",
      "Priority support",
      "30-day activity log retention",
      "Bulk CSV import + export",
    ],
    cta: "Get Started",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For large fleets and multi-team 3PLs.",
    features: [
      "Unlimited delivery orders",
      "Dedicated dispatch infrastructure",
      "SSO / SAML",
      "Dedicated account manager",
      "SLA guarantee (99.5%)",
      "90-day activity log retention",
      "Custom rate engine integrations",
      "Phone support",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="pt-14">
      <section className="relative py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-resend-green/[0.04] blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-[1200px] px-6 text-center">
          <FadeIn>
            <h1 className="font-heading text-5xl font-normal tracking-tight text-white md:text-7xl">
              Simple, transparent pricing
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="mx-auto mt-5 max-w-md text-lg text-resend-muted">
              Start for free. Scale as your fleet grows. No hidden fees.
            </p>
          </FadeIn>

          {/* Toggle */}
          <FadeIn delay={0.15}>
            <div className="mt-8 flex items-center justify-center gap-3">
              <span className={cn("text-sm", !annual ? "text-white" : "text-resend-dim")}>Monthly</span>
              <button
                type="button"
                onClick={() => setAnnual(!annual)}
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors",
                  annual ? "bg-resend-green" : "bg-resend-border",
                )}
              >
                <motion.div
                  animate={{ x: annual ? 22 : 2 }}
                  className="absolute top-1 h-4 w-4 rounded-full bg-white"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
              <span className={cn("text-sm", annual ? "text-white" : "text-resend-dim")}>
                Annual <span className="text-resend-green text-xs">Save 20%</span>
              </span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Plan cards */}
      <section className="pb-32">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="grid gap-6 md:grid-cols-3">
            {PLANS.map((plan, i) => (
              <FadeIn key={plan.name} delay={0.1 * i}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className={cn(
                    "relative flex flex-col rounded-2xl border p-8 transition-colors",
                    plan.highlighted
                      ? "border-resend-green/40 bg-resend-card shadow-xl shadow-resend-green/5"
                      : "border-resend-border bg-resend-card hover:border-resend-muted/30",
                  )}
                >
                  {plan.highlighted && (
                    <span className="absolute -top-3 left-6 rounded-full bg-resend-green px-3 py-0.5 text-xs font-medium text-resend-bg">
                      Most popular
                    </span>
                  )}
                  <h3 className="text-lg font-medium text-white">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="font-heading text-4xl text-white">{plan.price}</span>
                    <span className="text-sm text-resend-dim">{plan.period}</span>
                  </div>
                  <p className="mt-2 text-sm text-resend-dim">{plan.desc}</p>

                  <a
                    href="#"
                    className={cn(
                      "mt-6 flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors",
                      plan.highlighted
                        ? "bg-resend-btn text-resend-bg hover:bg-white"
                        : "border border-resend-border text-white hover:bg-white/5",
                    )}
                  >
                    {plan.cta}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>

                  <div className="mt-8 space-y-3">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-sm text-resend-muted">
                        <Check className="h-4 w-4 shrink-0 text-resend-green" />
                        {f}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
