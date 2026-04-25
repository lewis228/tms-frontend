import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowRight, Check, ChevronsUpDown, Plus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSession } from "@/store/session";
import { useCreateTeam } from "@/hooks/mutations/team/use-create-team";
import { generateErrorMessage } from "@/lib/error";
import { cn } from "@/lib/utils";

export default function TeamSwitcher({ isCollapsed }: { isCollapsed: boolean }) {
  const session = useSession();
  const params = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const createTeamMutation = useCreateTeam({
    onError: (error) => {
      toast.error(generateErrorMessage(error), { position: "top-center" });
    },
  });
  const isCreatePending = createTeamMutation.isPending;

  const teams = session?.user.teams ?? [];
  const currentTeamId = params.teamId ? Number(params.teamId) : null;
  const current = teams.find((team) => team.team_id === currentTeamId);
  const currentLabel =
    current?.team_name ??
    t("team.untitledTeam", { id: currentTeamId ?? "" });

  // Close on outside click — plain popover substitute since project has no
  // shadcn popover component installed.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSelect = (teamId: number) => {
    setOpen(false);
    if (teamId !== currentTeamId) {
      // Drop every cached query on team switch. Our QUERY_KEYS are mostly
      // team-agnostic (e.g. ["ocean-shipment", "list"]), so without this the
      // previous team's shipments / tags / api-keys would flash for a beat
      // before the new `X-Team-Id`-scoped refetch completes. Session state
      // lives in Zustand, not React Query, so it isn't affected.
      queryClient.clear();
    }
    navigate(`/app/${teamId}`);
  };

  const handleCreateNew = async () => {
    const name = newTeamName.trim();
    if (name === "") return;
    try {
      const created = await createTeamMutation.mutateAsync({ name });
      // Drop prior team's caches before navigating so the new team's data
      // loads fresh (same reason we clear on explicit team switch above).
      queryClient.clear();
      toast.success(t("team.createTeamSuccess"), { position: "top-center" });
      setNewTeamName("");
      setOpen(false);
      navigate(`/app/${created.id}`);
    } catch {
      // onError above already surfaced the toast; keep popover open so the
      // user can retry without retyping.
    }
  };

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => navigate("/app")}
            className="flex items-center justify-center rounded-xl p-2 transition-colors hover:bg-black/[0.04]"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-[10px] font-semibold text-white">
              {currentLabel.charAt(0).toUpperCase()}
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {currentLabel}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-black transition-colors hover:bg-black/[0.02]"
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-[10px] font-semibold text-white">
          {currentLabel.charAt(0).toUpperCase()}
        </span>
        <span className="flex-1 truncate text-left">{currentLabel}</span>
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-black/55" />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-black/10 bg-white p-1 shadow-lg">
          <div className="flex flex-col">
            {teams.map((team) => {
              const isActive = team.team_id === currentTeamId;
              return (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => handleSelect(team.team_id)}
                  className={cn(
                    "flex items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-black/[0.04]",
                    isActive ? "font-medium text-black" : "text-black/80",
                  )}
                >
                  <span className="truncate">
                    {team.team_name ??
                      t("team.untitledTeam", { id: team.team_id })}
                  </span>
                  {isActive && <Check className="h-3.5 w-3.5 text-black/60" />}
                </button>
              );
            })}
            <div className="my-1 border-t border-black/10" />
            <div className="flex items-center gap-1.5 rounded-md px-2 py-1.5">
              <Plus className="h-3.5 w-3.5 shrink-0 text-black/60" />
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreateNew();
                  }
                }}
                placeholder={t("team.newTeamNamePlaceholder")}
                disabled={isCreatePending}
                autoFocus
                className="min-w-0 flex-1 bg-transparent text-sm text-black placeholder:text-black/45 focus:outline-none disabled:opacity-50"
                aria-label={t("team.newTeamNamePlaceholder")}
              />
              <button
                type="button"
                onClick={handleCreateNew}
                disabled={isCreatePending || newTeamName.trim() === ""}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-black text-white transition-colors hover:bg-black/80 disabled:opacity-30 disabled:hover:bg-black"
                aria-label={t("team.createTeam")}
              >
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
