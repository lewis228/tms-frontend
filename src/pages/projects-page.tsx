import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import OverlayScroll from "@/components/projects/overlay-scroll";
import ProjectCard from "@/components/projects/project-card";
import ProjectKpiCard from "@/components/projects/project-kpi-card";
import {
  PROJECT_ITEMS,
  PROJECT_KPIS,
} from "@/components/projects/mock-projects";

// Projects dashboard — inspired by the reference Snow UI layout but
// rewritten around shipping-domain metrics:
//   • KPI strip = time-pressure + arrivals summary
//   • Card columns = logical shipment batches (groups of MBLs per lane)
// Data is mock for now. When the backend API lands, swap the imports for
// useProjectsData/useProjectKpisData query hooks — the component shapes
// already match the wire contract we'll ship.
//
// Scroll model: ALWAYS three card columns, each owning its own vertical
// scroll (bounded by the remaining viewport height via `flex-1 min-h-0`).
// Header + KPI strip stay pinned at the top. This is kept non-responsive
// so the scroll UX is consistent — at narrower viewports cards just get
// narrower, but the user still sees the 3-column independent scroll.
export default function ProjectsPage() {
  const { t } = useTranslation();

  // Uneven split per column so the screen shows real-world-like variety
  // (some lanes carry more batches than others). Memoised so the three
  // arrays stay referentially stable across renders.
  const columns = useMemo(() => {
    return [
      PROJECT_ITEMS.slice(0, 12),
      PROJECT_ITEMS.slice(12, 22),
      PROJECT_ITEMS.slice(22),
    ];
  }, []);

  return (
    // `h-full` alone doesn't propagate reliably from main (which has its
    // own overflow-y-auto) down to this page. Locking the page to the
    // viewport minus the header (h-[68px] per TeamScopedLayout) +
    // `overflow-hidden` guarantees the bounded height that the inner
    // `flex-1 min-h-0` column container needs so each OverlayScroll can
    // activate its own scroll instead of pushing the whole page to
    // grow and trigger main's scroll.
    <div className="flex h-[calc(100svh-68px)] flex-col gap-6 overflow-hidden p-7">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-black">
          {t("pages.projects.title")}
        </h1>
        <p className="text-sm text-black/55">
          {t("pages.projects.description")}
        </p>
      </div>

      {/* KPI strip — 3 across. */}
      <div className="grid grid-cols-3 gap-4">
        {PROJECT_KPIS.map((kpi) => (
          <ProjectKpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      {/* 3 independently scrolling columns filling remaining height.
          Flex row (not grid) is used because grid items don't reliably
          inherit their cell's height via `h-full` when the grid
          container has a computed (flex-derived) height — flex children
          get stretched to the row height automatically, which is what
          the OverlayScroll outer needs for its internal overflow to
          bind. `min-h-0` on this row lets it shrink below content size
          inside the flex-col page. */}
      <div className="flex min-h-0 flex-1 gap-4">
        {columns.map((col, idx) => (
          // Each column gets its own OverlayScroll. `flex-1 min-w-0`
          // divides the row into three equal tracks and lets them
          // shrink below their natural card width.
          <div key={idx} className="flex min-w-0 flex-1 flex-col">
            <OverlayScroll className="flex flex-col gap-4">
              {col.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </OverlayScroll>
          </div>
        ))}
      </div>
    </div>
  );
}
