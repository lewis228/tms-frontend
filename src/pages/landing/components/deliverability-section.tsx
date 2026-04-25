import { motion } from "framer-motion";
import {
  Ship, Clock, BadgeCheck, Server, RefreshCw, Monitor,
  FileCheck, Building, Lock,
} from "lucide-react";
import FadeIn from "./fade-in";

const FEATURES = [
  { icon: Ship, title: "18+ ocean carriers", desc: "One integration covers HMM, ONE, SM Line, Maersk, COSCO, ZIM, Yang Ming, Evergreen, MSC, Wan Hai and more — no per-carrier scripts." },
  { icon: Clock, title: "Dynamic scrape cadence", desc: "At-sea MBLs refresh every 12 hours; ETA within 3 days tightens to 6; arrived containers pulse every 3 so you never miss a gate-out." },
  { icon: BadgeCheck, title: "Normalized schema", desc: "Carrier-specific payloads are mapped to a common `TrackingResult` shape — containers, events, POL/POD, ETA. Same JSON everywhere." },
  { icon: Server, title: "Multi-region infra", desc: "AWS-hosted across us-west / ap-northeast, with RDS Multi-AZ MySQL and ElastiCache Valkey broker for Celery tasks." },
  { icon: RefreshCw, title: "Resilient retries", desc: "Failed scrapes back off and retry three times per cycle; stale data never overwrites good data thanks to field-level coalesce." },
  { icon: Monitor, title: "Carrier health monitoring", desc: "Per-carrier success rate dashboards + alerting when a site starts blocking — we swap fingerprints before you notice." },
  { icon: FileCheck, title: "Terminal visibility", desc: "LA/LB LFD, holds, and yard positions come from eModal, APM, Fenix, YTI, and LBCT integrations — a single status per container." },
  { icon: Building, title: "Battle-tested stack", desc: "Playwright / curl_cffi / Camoufox hybrid engine fights bot walls; Celery + Redis queue scales horizontally behind the API." },
  { icon: Lock, title: "SaaS-grade auth", desc: "JWT for web users, X-API-Key for servers, plan-based rate limits, and tenant-scoped multi-tenancy at the DB level." },
];

export default function DeliverabilitySection() {
  return (
    <section className="py-32">
      <div className="mx-auto max-w-[1200px] px-6">
        {/* Section card */}
        <div className="rounded-3xl border border-resend-border bg-resend-card/50 p-10 md:p-16">
          <FadeIn>
            <h2 className="font-heading text-4xl font-normal tracking-tight text-white md:text-5xl">
              Every container,
              <br />
              every carrier, visible.
            </h2>
          </FadeIn>

          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {FEATURES.map((feat, i) => (
              <FadeIn key={feat.title} delay={0.05 * i}>
                <motion.div
                  whileHover={{ y: -2 }}
                  className="group"
                >
                  <feat.icon className="mb-3 h-6 w-6 text-resend-dim transition-colors group-hover:text-resend-text" strokeWidth={1.5} />
                  <h3 className="text-base font-medium text-white">{feat.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-resend-dim">{feat.desc}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
