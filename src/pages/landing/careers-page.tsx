import { motion } from "framer-motion";
import { MapPin, ArrowRight, Briefcase } from "lucide-react";
import FadeIn from "./components/fade-in";

type Job = {
  title: string;
  department: string;
  location: string;
  type: string;
};

const JOBS: Job[] = [
  { title: "Senior Backend Engineer (Python)", department: "Engineering", location: "Los Angeles / Seoul", type: "Full-time" },
  { title: "Dispatch Platform Engineer", department: "Engineering", location: "Remote", type: "Full-time" },
  { title: "Frontend Engineer (React)", department: "Engineering", location: "Remote", type: "Full-time" },
  { title: "DevRel Engineer", department: "Developer Experience", location: "Remote", type: "Full-time" },
  { title: "Technical Writer", department: "Documentation", location: "Remote", type: "Full-time" },
  { title: "Solutions Engineer (Drayage)", department: "Sales", location: "Los Angeles, CA", type: "Full-time" },
  { title: "Account Executive", department: "Sales", location: "Los Angeles, CA", type: "Full-time" },
  { title: "Marketing Manager", department: "Marketing", location: "Remote", type: "Full-time" },
];

const PERKS = [
  { title: "Competitive Salary", desc: "Top-of-market compensation with meaningful equity." },
  { title: "Health Benefits", desc: "Comprehensive medical, dental, and vision coverage." },
  { title: "Flexible PTO", desc: "Unlimited paid time off to recharge and reset." },
  { title: "Hybrid-first", desc: "Work remote or from the Los Angeles / Seoul offices." },
  { title: "Learning Budget", desc: "$2,500/year for conferences, courses, and books." },
  { title: "Equipment", desc: "Latest MacBook Pro and peripherals of your choice." },
];

export default function CareersPage() {
  return (
    <div className="pt-14">
      {/* Hero */}
      <section className="relative py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-resend-green/[0.04] blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-[1200px] px-6 text-center">
          <FadeIn>
            <span className="mb-4 inline-block rounded-full border border-resend-border bg-resend-card px-4 py-1 text-sm text-resend-muted">
              <Briefcase className="mr-1.5 inline h-3.5 w-3.5" />
              We're hiring
            </span>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="font-heading text-5xl font-normal tracking-tight text-white md:text-7xl">
              Build the future
              <br />
              of drayage
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="mx-auto mt-6 max-w-lg text-lg text-resend-muted">
              Join a small, focused team reimagining how drayage carriers
              dispatch trucks, schedule drivers, and settle loads. We value
              craftsmanship, speed, and deep care for the operator experience.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Perks */}
      <section className="py-20">
        <div className="mx-auto max-w-[1200px] px-6">
          <FadeIn>
            <h2 className="mb-12 font-heading text-3xl font-normal text-white">Why TMS Pro</h2>
          </FadeIn>
          <div className="grid gap-6 md:grid-cols-3">
            {PERKS.map((perk, i) => (
              <FadeIn key={perk.title} delay={0.05 * i}>
                <div className="rounded-2xl border border-resend-border bg-resend-card p-6 transition-colors hover:border-resend-muted/30">
                  <h3 className="text-base font-medium text-white">{perk.title}</h3>
                  <p className="mt-2 text-sm text-resend-dim">{perk.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-20">
        <div className="mx-auto max-w-[1200px] px-6">
          <FadeIn>
            <h2 className="mb-2 font-heading text-3xl font-normal text-white">Open Positions</h2>
            <p className="mb-10 text-resend-muted">{JOBS.length} roles available</p>
          </FadeIn>

          <div className="space-y-3">
            {JOBS.map((job, i) => (
              <FadeIn key={job.title} delay={0.04 * i}>
                <motion.a
                  href="#"
                  whileHover={{ x: 4 }}
                  className="group flex items-center justify-between rounded-xl border border-resend-border bg-resend-card p-5 transition-colors hover:border-resend-muted/30"
                >
                  <div>
                    <h3 className="text-base font-medium text-white group-hover:text-resend-green transition-colors">{job.title}</h3>
                    <div className="mt-1 flex items-center gap-4 text-xs text-resend-dim">
                      <span>{job.department}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
                      <span>{job.type}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-resend-dim transition-all group-hover:text-white group-hover:translate-x-1" />
                </motion.a>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center">
        <FadeIn>
          <h2 className="font-heading text-4xl font-normal text-white">Don't see your role?</h2>
          <p className="mt-3 text-resend-muted">Send us an email at careers@tmspro.com</p>
          <a
            href="mailto:careers@tmspro.com"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-resend-btn px-5 py-2.5 text-sm font-medium text-resend-bg transition-colors hover:bg-white"
          >
            Get in touch
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </FadeIn>
      </section>
    </div>
  );
}
