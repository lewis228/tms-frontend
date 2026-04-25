import { motion } from "framer-motion";
import { FlaskConical, Webhook } from "lucide-react";
import FadeIn from "./fade-in";

export default function DxSection() {
  return (
    <section className="py-32">
      <div className="mx-auto max-w-[1200px] px-6">
        <FadeIn>
          <h2 className="font-heading text-4xl font-normal tracking-tight text-white md:text-5xl">
            Built for ops,
            <br />
            ready for engineering
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-resend-muted">
            Operators get a polished dashboard the moment they sign in. Platform
            tenants get a clean REST API, webhooks, and a sandbox — so carriers,
            terminals, and your own systems{" "}
            <em className="text-resend-text">just work together.</em>
          </p>
        </FadeIn>

        {/* Two cards */}
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {/* Sandbox */}
          <FadeIn delay={0.2}>
            <motion.div
              whileHover={{ y: -4 }}
              className="group relative overflow-hidden rounded-2xl border border-resend-border bg-resend-card p-6 transition-colors hover:border-resend-muted/30"
            >
              {/* Mock UI */}
              <div className="mb-16 rounded-xl border border-resend-border bg-resend-bg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="rounded-full bg-resend-green px-2 py-0.5 text-[10px] font-medium text-resend-bg">Tracking</span>
                  <span className="text-xs text-resend-dim">HDMUSELM79161701</span>
                  <span className="ml-auto rounded-lg border border-resend-border px-2 py-0.5 text-[10px] text-resend-dim">POST /shipments</span>
                </div>
                <div className="space-y-1.5">
                  <div className="text-xs font-mono text-resend-dim">HTTP 201: {"{"} "id": 10842, "status": "pending" {"}"}</div>
                  <div className="text-xs font-mono text-resend-dim">HTTP 200: {"{"} "status": "tracking", "eta": "2026-06-02" {"}"}</div>
                  <div className="text-xs font-mono text-resend-dim">HTTP 200: {"{"} "containers": 4, "vessel": "HYUNDAI SATURN" {"}"}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FlaskConical className="h-5 w-5 text-resend-muted" />
                <div>
                  <h3 className="text-lg font-medium text-white">Sandbox Mode</h3>
                  <p className="text-sm text-resend-dim">Register MBLs, simulate events, and iterate without touching prod.</p>
                </div>
              </div>
            </motion.div>
          </FadeIn>

          {/* Modular Webhooks */}
          <FadeIn delay={0.3}>
            <motion.div
              whileHover={{ y: -4 }}
              className="group relative overflow-hidden rounded-2xl border border-resend-border bg-resend-card p-6 transition-colors hover:border-resend-muted/30"
            >
              {/* Mock UI */}
              <div className="mb-16 rounded-xl border border-resend-border bg-resend-bg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-resend-green/20 flex items-center justify-center text-[10px] text-resend-green">▶</div>
                  <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] text-blue-400">Arrived</span>
                  <span className="text-xs text-resend-dim ml-2">Apr 18 06:19:14</span>
                </div>
                <div className="text-xs text-resend-dim">at <span className="rounded border border-resend-border px-1">Port of LA</span> for MBL <span className="rounded border border-resend-border px-1">MAEU266238589</span></div>

                <div className="border-t border-resend-border pt-3">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-yellow-500/20 flex items-center justify-center text-[10px] text-yellow-400">⚠</div>
                    <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] text-red-400">LFD Tomorrow</span>
                    <span className="text-xs text-resend-dim ml-2">Apr 18 06:18:45</span>
                  </div>
                  <div className="mt-1 text-xs text-resend-dim">container <span className="rounded border border-resend-border px-1">MRSU4971166</span> at <span className="rounded border border-resend-border px-1">APM LA</span></div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Webhook className="h-5 w-5 text-resend-muted" />
                <div>
                  <h3 className="text-lg font-medium text-white">Modular Webhooks</h3>
                  <p className="text-sm text-resend-dim">Push milestone, ETA, and LFD events straight into your stack.</p>
                </div>
              </div>
            </motion.div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
