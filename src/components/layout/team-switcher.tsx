import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowRight, Check, ChevronsUpDown, Plus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCurrentUser } from "@/store/auth";
import { createTeam } from "@/api/team";
import { generateErrorMessage } from "@/lib/error";
import { cn } from "@/lib/utils";

// Team switcher — top-of-sidebar dropdown for switching among the user's
// team memberships and creating a new team inline. Maps ste's
// TeamSwitcher onto TMS's auth store: `user.teams` (array of
// UserTeamMembership) is the source of truth.
export default function TeamSwitcher({
  isCollapsed,
}: {
  isCollapsed: boolean;
}) {
  const user = useCurrentUser();
  const params = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const createMutation = useMutation({
    mutationFn: createTeam,
    onError: (error) => {
      toast.error(generateErrorMessage(error), { position: "top-center" });
    },
  });
  const isCreatePending = createMutation.isPending;

  const teams = user?.teams ?? [];
  const currentTeamId = params.teamId ? Number(params.teamId) : null;
  const current = teams.find((m) => m.teamId === currentTeamId);
  const currentLabel =
    current?.teamName ??
    t("team.untitled", { id: currentTeamId ?? "" });

  // Close on outside click
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
      // Drop every cached query on team switch. Otherwise the previous
      // team's data flashes for a beat before X-Team-Id-scoped refetches
      // arrive. Auth state lives in Zustand, not Query, so it isn't cleared.
      queryClient.clear();
    }
    navigate(`/app/${teamId}`);
  };

  const handleCreateNew = async () => {
    const name = newTeamName.trim();
    if (name === "") return;
    try {
      const created = await createMutation.mutateAsync({ name });
      queryClient.clear();
      toast.success(t("team.createSuccess"), { position: "top-center" });
      setNewTeamName("");
      setOpen(false);
      navigate(`/app/${created.id}`);
    } catch {
      // toast already surfaced via onError; keep popover open for retry.
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
            {teams.map((m) => {
              const isActive = m.teamId === currentTeamId;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSelect(m.teamId)}
                  className={cn(
                    "flex items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-black/[0.04]",
                    isActive ? "font-medium text-black" : "text-black/80",
                  )}
                >
                  <span className="truncate">
                    {m.teamName ??
                      t("team.untitled", { id: m.teamId })}
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
                placeholder={t("team.newNamePlaceholder")}
                disabled={isCreatePending}
                autoFocus
                className="min-w-0 flex-1 bg-transparent text-sm text-black placeholder:text-black/45 focus:outline-none disabled:opacity-50"
                aria-label={t("team.newNamePlaceholder")}
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
