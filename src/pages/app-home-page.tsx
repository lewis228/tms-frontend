import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/store/session";
import { useCreateTeam } from "@/hooks/mutations/team/use-create-team";
import { generateErrorMessage } from "@/lib/error";

export default function AppHomePage() {
  const session = useSession();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");

  const { mutate: createTeam, isPending: isCreateTeamPending } = useCreateTeam({
    onSuccess: () => {
      toast.success(t("pages.appHome.createSuccess"), {
        position: "top-center",
      });
      setIsCreating(false);
      setName("");
    },
    onError: (error) => {
      toast.error(generateErrorMessage(error), { position: "top-center" });
    },
  });

  if (!session) return <Navigate to={"/sign-in"} replace={true} />;

  const teams = session.user.teams;

  if (teams.length === 1) {
    return <Navigate to={`/app/${teams[0].team_id}`} replace={true} />;
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === "") return;
    createTeam({ name: name.trim() });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-6">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl font-semibold text-black">
            {t("pages.appHome.title")}
          </h1>
          <p className="text-sm text-black/55">
            {teams.length === 0
              ? t("pages.appHome.noTeams")
              : t("pages.appHome.pickTeam")}
          </p>
        </div>

        {teams.length > 0 && (
          <div className="flex flex-col gap-2">
            {teams.map((team) => (
              <button
                key={team.id}
                type="button"
                onClick={() => navigate(`/app/${team.team_id}`)}
                className="flex items-center justify-between rounded-2xl border border-black/10 px-4 py-3 text-left text-sm text-black transition-colors hover:bg-black/[0.02]"
              >
                <span className="font-medium">
                  {team.team_name ??
                    t("pages.appHome.untitledTeam", { id: team.team_id })}
                </span>
                <span className="text-xs text-black/55">
                  {t("pages.appHome.enterTeam")}
                </span>
              </button>
            ))}
          </div>
        )}

        {isCreating ? (
          <form onSubmit={handleCreateSubmit} className="flex flex-col gap-3">
            <Input
              type="text"
              placeholder={t("pages.appHome.teamPlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isCreateTeamPending}
              maxLength={80}
              autoFocus
              className="rounded-2xl border-black/10 px-4 py-3 text-sm placeholder:text-black/20"
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setName("");
                }}
                disabled={isCreateTeamPending}
                className="flex-1 rounded-2xl border-black/10 py-3 text-sm"
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isCreateTeamPending || name.trim() === ""}
                className="flex-1 rounded-2xl bg-black py-3 text-sm font-medium text-white hover:bg-black/80"
              >
                {t("pages.appHome.createSubmit")}
              </Button>
            </div>
          </form>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsCreating(true)}
            className="flex items-center justify-center gap-2 rounded-2xl border-black/10 py-3 text-sm text-black hover:bg-black/[0.02]"
          >
            <Plus className="h-4 w-4" />
            {t("pages.appHome.createNewTeam")}
          </Button>
        )}
      </div>
    </div>
  );
}
