// /app — team picker / auto-redirect.
//
// 1) 일반 사용자 (DRIVER/DISPATCHER/ADMIN):
//    - teams 1개 → /app/{id}/dashboard 로 자동 redirect.
//    - 0개 → 빈 상태 (관리자에게 초대 요청 안내).
//    - 2개 이상 → 멤버십에서 picker.
// 2) SUPER_ADMIN:
//    - 멤버십 1개 → 자동 redirect.
//    - 멤버십이 비어있으면 listTeams() 로 전체 team 목록 picker.
//
// ste 의 app-home-page 와 동일한 카드 레이아웃 + "회사 만들기" inline form.
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GlobalLoader from "@/components/global-loader";
import { createTeam, listTeams } from "@/api/team";
import { QUERY_KEYS } from "@/lib/constants";
import { generateErrorMessage } from "@/lib/error";
import { useCurrentRole, useCurrentUser } from "@/store/auth";

export default function AppHomePage() {
  const user = useCurrentUser();
  const role = useCurrentRole();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");

  const isSuperAdmin = role === "SUPER_ADMIN";
  const memberships = user?.teams ?? [];

  const { data: allTeams, isPending: isAllTeamsPending } = useQuery({
    queryKey: QUERY_KEYS.team.list,
    queryFn: listTeams,
    enabled: isSuperAdmin && memberships.length === 0,
  });

  const { mutate: createTeamMutation, isPending: isCreateTeamPending } =
    useMutation({
      mutationFn: createTeam,
      onSuccess: (created) => {
        queryClient.clear();
        toast.success(t("appHome.createSuccess"), { position: "top-center" });
        setIsCreating(false);
        setName("");
        navigate(`/app/${created.id}`);
      },
      onError: (error) => {
        toast.error(generateErrorMessage(error), { position: "top-center" });
      },
    });

  if (!user) return <Navigate to="/sign-in" replace />;

  // 멤버십 1개면 무조건 그 team 로 진입.
  if (memberships.length === 1) {
    return <Navigate to={`/app/${memberships[0].teamId}`} replace />;
  }

  // SUPER_ADMIN 이고 멤버십 비었으면 전체 team 목록 fetch 중.
  const showAllTeams = isSuperAdmin && memberships.length === 0;
  if (showAllTeams && isAllTeamsPending) {
    return <GlobalLoader />;
  }

  const pickerItems = showAllTeams
    ? (allTeams ?? []).map((tn) => ({ id: tn.id, name: tn.name }))
    : memberships.map((m) => ({
        id: m.teamId,
        name: m.teamName ?? `#${m.teamId}`,
      }));

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === "") return;
    createTeamMutation({ name: name.trim() });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-6">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl font-semibold text-black">
            {t("appHome.title")}
          </h1>
          <p className="text-sm text-black/55">
            {pickerItems.length === 0
              ? t("appHome.noTeams")
              : t("appHome.pickTeam")}
          </p>
        </div>

        {pickerItems.length > 0 && (
          <div className="flex flex-col gap-2">
            {pickerItems.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => navigate(`/app/${p.id}`)}
                className="flex items-center justify-between rounded-2xl border border-black/10 px-4 py-3 text-left text-sm text-black transition-colors hover:bg-black/[0.02]"
              >
                <span className="font-medium">{p.name}</span>
                <span className="text-xs text-black/55">
                  {t("appHome.enterTeam")}
                </span>
              </button>
            ))}
          </div>
        )}

        {isCreating ? (
          <form onSubmit={handleCreateSubmit} className="flex flex-col gap-3">
            <Input
              type="text"
              placeholder={t("appHome.teamPlaceholder")}
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
                {t("appHome.createSubmit")}
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
            {t("appHome.createNewTeam")}
          </Button>
        )}
      </div>
    </div>
  );
}
