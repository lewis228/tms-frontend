import { useState } from "react";
import {
  BarChart3, Box, Eye, Globe, Ship, Anchor, Key,
  Webhook, Settings, ChevronDown,
} from "lucide-react";
import FadeIn from "./fade-in";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Live Fleet Map", icon: Globe },
  { label: "Shipment List", icon: Box },
  { label: "Terminal Holds", icon: Anchor },
];

const SIDEBAR_ITEMS = [
  { label: "Shipments", icon: Box },
  { label: "Containers", icon: Box },
  { label: "Vessels", icon: Ship },
  { label: "Metrics", icon: BarChart3, active: true },
  { label: "Terminals", icon: Anchor },
  { label: "Logs", icon: Eye },
  { label: "API Keys", icon: Key },
  { label: "Webhooks", icon: Webhook },
  { label: "Settings", icon: Settings },
];

export default function DashboardSection() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="py-32">
      <div className="mx-auto max-w-[1200px] px-6">
        {/* 3D globe icon */}
        <FadeIn>
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-resend-card to-resend-border shadow-2xl">
            <Globe className="h-8 w-8 text-resend-green/60" />
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h2 className="text-center font-heading text-5xl font-normal tracking-tight text-white md:text-6xl">
            Everything in your control
          </h2>
        </FadeIn>

        <FadeIn delay={0.15}>
          <p className="mx-auto mt-5 max-w-xl text-center text-base leading-relaxed text-resend-muted">
            Every MBL, container, and vessel in one console. Live fleet map,
            detailed scrape logs, and per-tenant API keys — without the friction.
          </p>
        </FadeIn>

        {/* Tab buttons */}
        <FadeIn delay={0.2}>
          <div className="mt-10 flex items-center justify-center gap-3">
            {TABS.map((tab, i) => (
              <button
                key={tab.label}
                type="button"
                onClick={() => setActiveTab(i)}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-5 py-3 text-sm transition-all",
                  activeTab === i
                    ? "border-resend-muted/30 bg-resend-card text-white"
                    : "border-resend-border text-resend-dim hover:border-resend-muted/20 hover:text-resend-muted",
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* Dashboard mockup */}
        <FadeIn delay={0.3}>
          <div className="mt-10 overflow-hidden rounded-2xl border border-resend-border bg-resend-card shadow-2xl">
            <div className="flex">
              {/* Sidebar */}
              <div className="w-[200px] shrink-0 border-r border-resend-border bg-resend-bg p-3">
                <div className="mb-4 flex items-center gap-2 px-2">
                  <span className="font-heading text-sm italic text-white">O</span>
                  <span className="text-sm text-white">OMNIQ</span>
                  <span className="rounded bg-resend-green/20 px-1.5 text-[10px] text-resend-green">Pro</span>
                  <ChevronDown className="ml-auto h-3 w-3 text-resend-dim" />
                </div>
                {SIDEBAR_ITEMS.map((item) => (
                  <div
                    key={item.label}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors",
                      item.active ? "bg-resend-card text-white" : "text-resend-dim hover:text-resend-muted",
                    )}
                  >
                    <item.icon className="h-3.5 w-3.5" />
                    {item.label}
                  </div>
                ))}
                <div className="mt-auto border-t border-resend-border pt-3 mt-6">
                  <div className="flex items-center gap-2 px-2 text-xs text-resend-dim">
                    <span className="font-mono">Y</span>
                    <span>you@domain....</span>
                  </div>
                </div>
              </div>

              {/* Main content */}
              <div className="flex-1 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-white">Metrics</h3>
                  <div className="flex items-center gap-3 text-xs text-resend-dim">
                    <span>Help</span>
                    <span>Docs</span>
                    <span className="rounded-lg border border-resend-border px-2 py-1">Feedback</span>
                  </div>
                </div>

                {/* Metric cards */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { title: "SCRAPE HEALTH", status: "Good", items: [{ label: "Succeeded", val: "29,486", pct: "100%", color: "bg-blue-400" }, { label: "Up to date", val: "29,486", pct: "100%", color: "bg-resend-green" }] },
                    { title: "EXCEPTIONS", status: "Good", items: [{ label: "Stuck", val: "546", pct: "1.85%", color: "bg-red-400" }, { label: "Missing ETA", val: "2", pct: "0.01%", color: "bg-yellow-400" }] },
                    { title: "LFD RISK", status: "Poor", items: [{ label: "Overdue", val: "0", pct: "0%", color: "bg-purple-400" }, { label: "≤ 2 days", val: "137", pct: "0.46%", color: "bg-resend-dim" }] },
                  ].map((card) => (
                    <div key={card.title} className="rounded-xl border border-resend-border bg-resend-bg p-4">
                      <p className="text-[10px] tracking-wider text-resend-dim">{card.title}</p>
                      <p className="text-xl font-medium text-white">{card.status}</p>
                      <div className="mt-3 space-y-2">
                        {card.items.map((item) => (
                          <div key={item.label} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className={cn("h-2 w-2 rounded-full", item.color)} />
                              <span className="text-resend-dim">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-resend-muted">{item.val}</span>
                              <span className="text-resend-dim">{item.pct}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chart area */}
                <div className="rounded-xl border border-resend-border bg-resend-bg p-4">
                  <p className="text-[10px] tracking-wider text-resend-dim">MBLs TRACKED</p>
                  <p className="text-2xl font-medium text-white">29,486</p>
                  <div className="mt-4 h-24 relative">
                    <svg className="w-full h-full" viewBox="0 0 600 100" preserveAspectRatio="none">
                      <polyline
                        points="0,80 60,75 120,70 180,65 240,50 300,55 360,40 420,35 480,25 540,20 600,15"
                        fill="none"
                        stroke="#00DC82"
                        strokeWidth="2"
                      />
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00DC82" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#00DC82" stopOpacity="0" />
                      </linearGradient>
                      <polygon
                        points="0,80 60,75 120,70 180,65 240,50 300,55 360,40 420,35 480,25 540,20 600,15 600,100 0,100"
                        fill="url(#chartGrad)"
                      />
                    </svg>
                    {/* Y axis labels */}
                    <div className="absolute right-0 top-0 flex h-full flex-col justify-between text-right text-[10px] text-resend-dim">
                      <span>6k</span>
                      <span>4.5k</span>
                      <span>3k</span>
                      <span>2k</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
