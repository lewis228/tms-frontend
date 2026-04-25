import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import FadeIn from "./fade-in";
import { Globe } from "@/components/ui/globe";
import type { GlobeLabel } from "@/components/ui/globe";

// Mirrors cobe v2's default ("COBE") showcase — bright white globe with
// uppercase city pills + pointer. Source: shuding/cobe website/app/showcases-data.ts.
const CITIES = [
  { id: "city-sf", label: "San Francisco", location: [37.7595, -122.4367] as [number, number] },
  { id: "city-nyc", label: "New York", location: [40.7128, -74.006] as [number, number] },
  { id: "city-tokyo", label: "Tokyo", location: [35.6762, 139.6503] as [number, number] },
  { id: "city-london", label: "London", location: [51.5074, -0.1278] as [number, number] },
  { id: "city-sydney", label: "Sydney", location: [-33.8688, 151.2093] as [number, number] },
  { id: "city-capetown", label: "Cape Town", location: [-33.9249, 18.4241] as [number, number] },
  { id: "city-dubai", label: "Dubai", location: [25.2048, 55.2708] as [number, number] },
  { id: "city-paris", label: "Paris", location: [48.8566, 2.3522] as [number, number] },
  { id: "city-saopaulo", label: "São Paulo", location: [-23.5505, -46.6333] as [number, number] },
];

const ARCS = [
  {
    id: "arc-sf-tokyo",
    label: "SF → Tokyo",
    from: [37.7595, -122.4367] as [number, number],
    to: [35.6762, 139.6503] as [number, number],
  },
  {
    id: "arc-nyc-london",
    label: "NYC → London",
    from: [40.7128, -74.006] as [number, number],
    to: [51.5074, -0.1278] as [number, number],
  },
];

const HERO_GLOBE_CONFIG = {
  devicePixelRatio: 2,
  theta: 0.2,
  dark: 0,
  diffuse: 1.5,
  mapSamples: 16000,
  mapBrightness: 10,
  baseColor: [1, 1, 1] as [number, number, number],
  // Monochrome: keep marker dots light (pill labels mark the city anyway)
  // but arcs need darker gray so they read against the white globe surface.
  markerColor: [0.85, 0.85, 0.9] as [number, number, number],
  glowColor: [0.94, 0.93, 0.91] as [number, number, number],
  arcColor: [0.25, 0.25, 0.3] as [number, number, number],
  arcWidth: 0.5,
  arcHeight: 0.25,
  markerElevation: 0.01,
  markers: CITIES.map((c) => ({
    id: c.id,
    location: c.location,
    size: 0.025,
  })),
  arcs: ARCS.map((a) => ({ id: a.id, from: a.from, to: a.to })),
};

const MARKER_LABELS: GlobeLabel[] = CITIES.map((c) => ({
  id: c.id,
  content: c.label,
  className: "globe-default-label",
}));

const ARC_LABELS: GlobeLabel[] = ARCS.map((a) => ({
  id: a.id,
  content: a.label,
  className: "globe-default-arc",
}));

export default function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-black pt-14 text-white">
      {/* Ambient gradient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-resend-green/[0.04] blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[600px] rounded-full bg-resend-orange/[0.06] blur-[100px]" />
      </div>

      <div className="relative mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-10 px-6 pt-32 pb-20 md:grid-cols-2 md:pt-40">
        {/* Left content */}
        <div>
          <FadeIn delay={0.1}>
            <Link
              to="/"
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-resend-border bg-resend-card px-4 py-1.5 text-sm text-resend-muted transition-colors hover:border-resend-muted hover:text-white"
            >
              Ocean tracking v2 is here
              <ArrowRight className="h-3 w-3" />
            </Link>
          </FadeIn>

          <FadeIn delay={0.2}>
            <h1 className="font-heading text-6xl leading-[1.05] font-normal tracking-tight text-white md:text-[5.5rem]">
              <span className="italic">E</span>very container,{" "}
              <br />
              visible.
            </h1>
          </FadeIn>

          <FadeIn delay={0.35}>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-resend-muted">
              One dashboard for every ocean MBL — 18 carriers, LA/LB terminals,
              and real-time LFD alerts. Stop tabbing through carrier portals.
              Start shipping on time.
            </p>
          </FadeIn>

          <FadeIn delay={0.45}>
            <div className="mt-8 flex items-center gap-4">
              <Link
                to="/sign-up"
                className="rounded-lg bg-resend-btn px-5 py-2.5 text-sm font-medium text-resend-bg transition-all hover:bg-white hover:shadow-lg hover:shadow-white/10"
              >
                Start Free
              </Link>
              <Link
                to="/pricing"
                className="text-sm text-resend-muted transition-colors hover:text-white"
              >
                See Pricing
              </Link>
            </div>
          </FadeIn>
        </div>

        {/* Right: interactive globe (drag to rotate, auto-orbits otherwise) */}
        <FadeIn delay={0.4} direction="left">
          <div
            className="relative mx-auto h-[400px] w-[400px] md:h-[520px] md:w-[520px]"
            style={
              {
                // Monochrome palette. --globe-ink drives pill chips (they sit
                // on the black page background so need to be light); the -dim
                // variant drives text/orbit that sit on the white globe, so
                // needs to be dark enough to read.
                "--globe-ink": "#fafafa",
                "--globe-ink-dim": "#666666",
                "--globe-bg": "#141414",
              } as CSSProperties
            }
          >
            <Globe
              config={HERO_GLOBE_CONFIG}
              markerLabels={MARKER_LABELS}
              arcLabels={ARC_LABELS}
              centerContent={
                <span className="font-heading text-[min(16vw,5rem)] leading-none tracking-[0.15em]">
                  OMNIQ
                </span>
              }
              orbitText="Real-time Container Tracking · "
            />
            {/* Radial gradient overlay matching Magic UI demo */}
            <div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_200%,rgba(0,0,0,0.2),rgba(255,255,255,0))]" />
          </div>
        </FadeIn>
      </div>

      {/* Bottom gradient fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
}
