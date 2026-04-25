import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import FadeIn from "./components/fade-in";

const CUSTOMERS = [
  { name: "Insight Logistics", desc: "How OMNIQ replaced 18 carrier portal tabs with one API for LA/LB drayage dispatchers.", logo: "I", industry: "Drayage" },
  { name: "Freight SaaS Co.", desc: "Rebuilt their TMS container tab on top of OMNIQ webhooks — weeks of scraping work avoided.", logo: "F", industry: "Freight SaaS" },
  { name: "Korea-US Forwarder", desc: "HMM, SM Line, and Yang Ming coverage was the deciding factor over Terminal49.", logo: "K", industry: "Forwarding" },
  { name: "LA Drayage Op", desc: "LFD alerts pushed into Slack dropped demurrage charges by 72% in the first month.", logo: "L", industry: "Drayage" },
  { name: "Global 3PL", desc: "Normalized event schema meant their BI team stopped writing per-carrier SQL patches.", logo: "G", industry: "3PL" },
  { name: "Ocean NVOCC", desc: "Bulk CSV + API lets their ops team onboard 500+ MBLs in one drag-and-drop.", logo: "N", industry: "NVOCC" },
];

export default function CustomersPage() {
  return (
    <div className="pt-14">
      <section className="relative py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-resend-green/[0.04] blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-[1200px] px-6 text-center">
          <FadeIn>
            <h1 className="font-heading text-5xl font-normal tracking-tight text-white md:text-7xl">
              Trusted by the best teams
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="mx-auto mt-5 max-w-md text-lg text-resend-muted">
              Forwarders, drayage operators, and freight SaaS teams rely on
              OMNIQ to keep every container visible in real time.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="pb-32">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="grid gap-6 md:grid-cols-2">
            {CUSTOMERS.map((c, i) => (
              <FadeIn key={c.name} delay={0.05 * i}>
                <motion.a
                  href="#"
                  whileHover={{ y: -4 }}
                  className="group flex items-start gap-6 rounded-2xl border border-resend-border bg-resend-card p-8 transition-colors hover:border-resend-muted/30"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-resend-border bg-resend-bg text-xl font-bold text-white">
                    {c.logo}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-medium text-white group-hover:text-resend-green transition-colors">{c.name}</h3>
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-resend-dim">{c.industry}</span>
                    </div>
                    <p className="mt-2 text-sm text-resend-dim">{c.desc}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-xs text-resend-muted group-hover:text-white transition-colors">
                      Read case study <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </motion.a>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
