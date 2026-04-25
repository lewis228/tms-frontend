import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, FileDown } from "lucide-react";
import FadeIn from "./fade-in";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const SDK_ICONS = [
  "Node.js", "Python", "Go", "Ruby", "PHP", "Java", "Rust", ".NET", "REST", "Webhooks",
];

const FRAMEWORK_TABS = ["Node.js", "Python", "cURL"];

const CODE_SNIPPETS: Record<string, string> = {
  "Node.js": `import { Omniq } from '@omniq/sdk';

const omniq = new Omniq('omniq_xxxxxxxxx');

(async function() {
  const { data, error } = await omniq.shipments.create({
    mbl: 'HDMUSELM79161701',
    carrier: 'HMM',
  });

  if (error) {
    return console.log(error);
  }

  console.log(data);
})();`,
  "Python": `from omniq import Omniq

omniq = Omniq(api_key="omniq_xxxxxxxxx")

shipment = omniq.shipments.create(
    mbl="HDMUSELM79161701",
    carrier="HMM",
)

print(shipment)`,
  "cURL": `curl -X POST https://api.omniq.com/v1/ocean/shipments \\
  -H "X-API-Key: omniq_xxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "mbl": "HDMUSELM79161701",
    "carrier": "HMM"
  }'`,
};

export default function IntegrateSection() {
  const [activeTab, setActiveTab] = useState("Node.js");

  const code = CODE_SNIPPETS[activeTab] || CODE_SNIPPETS["Node.js"];

  function handleCopy() {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  }

  return (
    <section className="relative py-32">
      {/* 3D container icon */}
      <FadeIn>
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-resend-card to-resend-border shadow-2xl">
          <div className="text-3xl">📦</div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <p className="text-center text-xs tracking-widest text-resend-dim uppercase">
          For your engineering tenant
        </p>
      </FadeIn>

      <FadeIn delay={0.15}>
        <h2 className="mt-3 text-center font-heading text-5xl font-normal tracking-tight text-white md:text-6xl">
          Pipe it into{" "}
          <span className="bg-gradient-to-r from-resend-green to-emerald-300 bg-clip-text italic text-transparent">
            your stack
          </span>
        </h2>
      </FadeIn>

      <FadeIn delay={0.2}>
        <p className="mx-auto mt-5 max-w-xl text-center text-base leading-relaxed text-resend-muted">
          Already have a TMS? Use the REST API and webhooks to push every
          milestone and LFD alert straight into your own workflow — SDKs for
          Node, Python, Go, and anything that speaks HTTP.
        </p>
      </FadeIn>

      {/* SDK Icons */}
      <FadeIn delay={0.3}>
        <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-4">
          {SDK_ICONS.map((sdk) => (
            <div key={sdk} className="flex flex-col items-center gap-1.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-resend-border bg-resend-card text-xs font-mono text-resend-muted transition-all hover:border-resend-muted hover:text-white">
                {sdk.slice(0, 2)}
              </div>
              <span className="text-[11px] text-resend-dim">{sdk}</span>
            </div>
          ))}
        </div>
      </FadeIn>

      {/* Code block */}
      <FadeIn delay={0.4}>
        <div className="mx-auto mt-12 max-w-3xl px-6">
          <div className="overflow-hidden rounded-2xl border border-resend-border bg-resend-card">
            {/* Framework tabs */}
            <div className="flex items-center gap-0 overflow-x-auto border-b border-resend-border px-4">
              {FRAMEWORK_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "relative whitespace-nowrap px-3 py-3 text-xs transition-colors",
                    activeTab === tab ? "text-white" : "text-resend-dim hover:text-resend-muted",
                  )}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="code-tab"
                      className="absolute inset-x-0 bottom-0 h-px bg-white"
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </button>
              ))}
              <div className="ml-auto">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-lg p-2 text-resend-dim transition-colors hover:text-white"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Code content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <pre className="overflow-x-auto px-6 py-5 text-sm leading-6">
                  <code>
                    {code.split("\n").map((line, i) => (
                      <div key={i} className="flex">
                        <span className="mr-6 inline-block w-6 text-right text-resend-dim/40 select-none">{i + 1}</span>
                        <span className="text-resend-muted">
                          {line.replace(/(import|from|const|await|async|function|return|if)/g, (m) => `\x1b[1m${m}\x1b[0m`)
                            .split("'").map((part, j) =>
                              j % 2 === 1 ? <span key={j} className="text-resend-green">'{part}'</span> : <span key={j} className="text-resend-text">{part}</span>
                            )}
                        </span>
                      </div>
                    ))}
                  </code>
                </pre>
              </motion.div>
            </AnimatePresence>

            {/* Bottom links */}
            <div className="flex items-center gap-5 border-t border-resend-border px-6 py-3">
              <a href="#" className="flex items-center gap-1.5 text-xs text-resend-dim transition-colors hover:text-white">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg> View on GitHub
              </a>
              <a href="#" className="flex items-center gap-1.5 text-xs text-resend-dim transition-colors hover:text-white">
                <FileDown className="h-3.5 w-3.5" /> Download ZIP
              </a>
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
