import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type {
  ProjectItem,
  ProjectStatus,
} from "@/components/projects/mock-projects";

// Status → label key + Tailwind classes for the badge pill. Colour policy
// mirrors the existing OceanShipmentsPage status mapping so the two views
// feel like the same product. Labels live in i18n so switching locale
// reflows cards without reshipping strings.
const STATUS_STYLES: Record<
  ProjectStatus,
  { labelKey: string; badge: string; progress: string }
> = {
  "in-transit": {
    labelKey: "pages.projects.status.inTransit",
    badge: "text-emerald-700",
    progress: "bg-emerald-500",
  },
  "at-port": {
    labelKey: "pages.projects.status.atPort",
    badge: "text-sky-700",
    progress: "bg-sky-500",
  },
  delivered: {
    labelKey: "pages.projects.status.delivered",
    badge: "text-emerald-700",
    progress: "bg-emerald-500",
  },
  delayed: {
    labelKey: "pages.projects.status.delayed",
    badge: "text-rose-700",
    progress: "bg-rose-500",
  },
  pending: {
    labelKey: "pages.projects.status.pending",
    badge: "text-amber-700",
    progress: "bg-amber-500",
  },
};

export default function ProjectCard({ project }: { project: ProjectItem }) {
  const { t } = useTranslation();
  const status = STATUS_STYLES[project.status];

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-5 transition-colors hover:border-black/20">
      {/* Header row — project title + carrier badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3 className="truncate text-sm font-semibold text-black">
            {project.name}
          </h3>
          <p className="text-xs text-black/55">
            {t("pages.projects.card.eta")}: {project.etaLabel}
          </p>
        </div>
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-black/70"
          style={{ backgroundColor: project.carrierBadge }}
          title={project.carrierName}
          aria-label={project.carrierName}
        >
          {project.carrierInitial}
        </span>
      </div>

      {/* Middle row — assignee avatar + status pill */}
      <div className="flex items-center justify-between gap-3">
        <img
          src={project.assigneeAvatar}
          alt=""
          className="h-7 w-7 rounded-full object-cover"
        />
        <span
          className={cn(
            "inline-flex items-center gap-1 text-xs font-medium",
            status.badge,
          )}
        >
          <span
            className={cn("h-1.5 w-1.5 rounded-full", status.progress)}
          />
          {t(status.labelKey)}
        </span>
      </div>

      {/* Progress row — total containers + percent + bar */}
      <div className="flex flex-col gap-2 border-t border-black/[0.06] pt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-black/70">
            <span className="font-semibold text-black">
              {project.containersDone}
            </span>
            <span className="text-black/40"> / {project.containersTotal} </span>
            {t("pages.projects.card.totalContainers")}
          </span>
          <span className="font-medium text-black">{project.progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
          <div
            className={cn("h-full rounded-full", status.progress)}
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
