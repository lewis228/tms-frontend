import { useCallback, useEffect, useId, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import createGlobe from "cobe";
import type { COBEOptions } from "cobe";

import { cn } from "@/lib/utils";

export type GlobeLabel = {
  id: string;
  content: ReactNode;
  className?: string;
};

type GlobeConfig = Omit<
  COBEOptions,
  "width" | "height" | "devicePixelRatio" | "phi"
> & {
  width?: number;
  height?: number;
  devicePixelRatio?: number;
  phi?: number;
};

type GlobeProps = {
  className?: string;
  config: GlobeConfig;
  markerLabels?: GlobeLabel[];
  arcLabels?: GlobeLabel[];
  /** Centered overlay (e.g. brand mark). Fades in after the globe appears. */
  centerContent?: ReactNode;
  /** Uppercase text rendered along a 3D-rotating orbit ring. Repeated to fill. */
  orbitText?: string;
};

const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);

export function Globe({
  className,
  config,
  markerLabels = [],
  arcLabels = [],
  centerContent,
  orbitText,
}: GlobeProps) {
  const orbitPathId = `globe-orbit-${useId().replace(/:/g, "")}`;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const widthRef = useRef(0);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const lastPointerRef = useRef<{ x: number; y: number; t: number } | null>(
    null,
  );
  const dragOffsetRef = useRef({ phi: 0, theta: 0 });
  const phiOffsetRef = useRef(0);
  const thetaOffsetRef = useRef(0);
  const velocityRef = useRef({ phi: 0, theta: 0 });
  const isPausedRef = useRef(false);
  const speedRef = useRef(1);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerRef.current = { x: e.clientX, y: e.clientY };
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
    isPausedRef.current = true;
  }, []);

  const handlePointerEnter = useCallback(() => {
    speedRef.current = 0.8;
  }, []);

  const handlePointerLeave = useCallback(() => {
    speedRef.current = 1;
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const dpr =
      config.devicePixelRatio ?? Math.min(window.devicePixelRatio || 1, 2);

    const onResize = () => {
      if (canvasRef.current) widthRef.current = canvasRef.current.offsetWidth;
    };
    window.addEventListener("resize", onResize);
    onResize();

    const handlePointerMove = (e: PointerEvent) => {
      if (!pointerRef.current) return;
      const dx = e.clientX - pointerRef.current.x;
      const dy = e.clientY - pointerRef.current.y;
      dragOffsetRef.current = { phi: dx / 300, theta: dy / 1000 };

      const now = Date.now();
      if (lastPointerRef.current) {
        const dt = Math.max(now - lastPointerRef.current.t, 1);
        const max = 0.15;
        velocityRef.current = {
          phi: clamp(
            ((e.clientX - lastPointerRef.current.x) / dt) * 0.3,
            -max,
            max,
          ),
          theta: clamp(
            ((e.clientY - lastPointerRef.current.y) / dt) * 0.08,
            -max,
            max,
          ),
        };
      }
      lastPointerRef.current = { x: e.clientX, y: e.clientY, t: now };
    };

    const handlePointerUp = () => {
      if (pointerRef.current) {
        phiOffsetRef.current += dragOffsetRef.current.phi;
        thetaOffsetRef.current += dragOffsetRef.current.theta;
        dragOffsetRef.current = { phi: 0, theta: 0 };
        lastPointerRef.current = null;
      }
      pointerRef.current = null;
      if (canvasRef.current) canvasRef.current.style.cursor = "grab";
      isPausedRef.current = false;
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });

    const initialSize = Math.max(widthRef.current * dpr, 1);
    let phi = 0;
    const baseTheta = config.theta ?? 0.2;

    const globe = createGlobe(canvasRef.current, {
      ...(config as COBEOptions),
      width: initialSize,
      height: initialSize,
      devicePixelRatio: dpr,
      phi: 0,
      theta: baseTheta,
    });

    let raf = 0;
    const tick = () => {
      if (!isPausedRef.current) {
        phi += 0.003 * speedRef.current;
        const v = velocityRef.current;
        if (Math.abs(v.phi) > 0.0001 || Math.abs(v.theta) > 0.0001) {
          phiOffsetRef.current += v.phi;
          thetaOffsetRef.current += v.theta;
          velocityRef.current = { phi: v.phi * 0.95, theta: v.theta * 0.95 };
        }
        const thetaMin = -0.4;
        const thetaMax = 0.4;
        if (thetaOffsetRef.current < thetaMin) {
          thetaOffsetRef.current +=
            (thetaMin - thetaOffsetRef.current) * 0.1;
        } else if (thetaOffsetRef.current > thetaMax) {
          thetaOffsetRef.current +=
            (thetaMax - thetaOffsetRef.current) * 0.1;
        }
      }
      globe.update({
        phi: phi + phiOffsetRef.current + dragOffsetRef.current.phi,
        theta:
          baseTheta + thetaOffsetRef.current + dragOffsetRef.current.theta,
        width: widthRef.current * dpr,
        height: widthRef.current * dpr,
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    setTimeout(() => {
      if (canvasRef.current) canvasRef.current.style.opacity = "1";
    }, 0);

    return () => {
      cancelAnimationFrame(raf);
      globe.destroy();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("resize", onResize);
    };
  }, [config]);

  // --cobe-blur exposes a per-label blur amount (10px when hidden → invalid
  // "N" → 0 when visible). Opt-in classes read `blur(var(--cobe-blur, 0))`.
  const markerLabelStyle = (id: string): CSSProperties =>
    ({
      position: "absolute",
      top: "anchor(top)",
      left: "anchor(center)",
      translate: "-50% -100%",
      positionAnchor: `--cobe-${id}`,
      opacity: `var(--cobe-visible-${id}, 0)`,
      "--cobe-blur": `var(--cobe-visible-${id}, 10px)`,
      pointerEvents: "none",
      transition: "opacity 0.8s ease, filter 0.8s ease",
      zIndex: 2,
    }) as CSSProperties;

  const arcLabelStyle = (id: string): CSSProperties =>
    ({
      position: "absolute",
      bottom: "anchor(top)",
      left: "anchor(center)",
      translate: "-50% 0",
      positionAnchor: `--cobe-arc-${id}`,
      opacity: `var(--cobe-visible-arc-${id}, 0)`,
      "--cobe-blur": `var(--cobe-visible-arc-${id}, 10px)`,
      pointerEvents: "none",
      transition: "opacity 0.8s ease, filter 0.8s ease",
      zIndex: 2,
    }) as CSSProperties;

  return (
    <div
      className={cn(
        "absolute inset-0 mx-auto aspect-square w-full max-w-150",
        className,
      )}
    >
      {/* SVG filter defs — used by .globe-flight-plane to outline emoji */}
      <svg
        width="0"
        height="0"
        style={{ position: "absolute", pointerEvents: "none" }}
        aria-hidden="true"
      >
        <defs>
          <filter id="cobe-sticker-outline">
            <feMorphology
              in="SourceAlpha"
              result="Dilated"
              operator="dilate"
              radius="2"
            />
            <feFlood floodColor="#ffffff" result="OutlineColor" />
            <feComposite
              in="OutlineColor"
              in2="Dilated"
              operator="in"
              result="Outline"
            />
            <feMerge>
              <feMergeNode in="Outline" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
      <canvas
        className="size-full cursor-grab opacity-0 transition-opacity duration-500 contain-[layout_paint_size]"
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      />
      {orbitText && (
        <div className="globe-orbit-ring" aria-hidden="true">
          <svg className="globe-orbit-svg" viewBox="0 0 300 300">
            <defs>
              <path
                id={orbitPathId}
                d="M 150,150 m -130,0 a 130,130 0 1,0 260,0 a 130,130 0 1,0 -260,0"
              />
            </defs>
            <text className="globe-orbit-text">
              <textPath href={`#${orbitPathId}`}>
                {orbitText.repeat(10)}
              </textPath>
            </text>
          </svg>
        </div>
      )}
      {centerContent && (
        <div className="globe-center-overlay">{centerContent}</div>
      )}
      {markerLabels.map((m) => (
        <div key={m.id} className={m.className} style={markerLabelStyle(m.id)}>
          {m.content}
        </div>
      ))}
      {arcLabels.map((a) => (
        <div key={a.id} className={a.className} style={arcLabelStyle(a.id)}>
          {a.content}
        </div>
      ))}
    </div>
  );
}
