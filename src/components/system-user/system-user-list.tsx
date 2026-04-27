import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Loader from "@/components/loader";
import Fallback from "@/components/fallback";
import { formatDate } from "@/lib/format";
import { useDeleteUser } from "@/hooks/mutations/user/use-delete-user";
import { useUsersData } from "@/hooks/queries/use-users-data";
import { useTeamsData } from "@/hooks/queries/use-teams-data";
import { generateErrorMessage } from "@/lib/error";
import { useOpenAlertModal } from "@/store/alert-modal";
import {
  useOpenCreateSystemUserModal,
  useOpenEditSystemUserModal,
} from "@/store/system-user-editor-modal";
import type { UserEntity } from "@/types";

export default function SystemUserList() {
  const { t } = useTranslation();
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const { data: teams, isPending: teamsPending, error: teamsError } =
    useTeamsData();

  // 사용자가 select 로 명시 변경하기 전까지는 첫 team 를 default 로 사용 (derived).
  const teamId = selectedTeamId ?? teams?.[0]?.id ?? null;

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isPending, error } = useUsersData(teamId, page);
  const openCreate = useOpenCreateSystemUserModal();
  const openEdit = useOpenEditSystemUserModal();
  const openAlert = useOpenAlertModal();

  const { mutate: deleteU } = useDeleteUser({
    onSuccess: () =>
      toast.success(t("toast.deleted"), { position: "top-center" }),
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const filtered = useMemo<UserEntity[]>(() => {
    if (!data) return [];
    if (!search) return data.items;
    return data.items.filter(
      (u) =>
        (u.email ?? "").toLowerCase().includes(search) ||
        (u.name ?? "").toLowerCase().includes(search) ||
        u.role.toLowerCase().includes(search),
    );
  }, [data, search]);

  if (teamsError) return <Fallback />;
  if (teamsPending) return <Loader />;

  if (!teams || teams.length === 0) {
    return (
      <p className="rounded-md border bg-background p-6 text-center text-sm text-muted-foreground">
        {t("systemUser.noTeams")}
      </p>
    );
  }

  const handleDelete = (u: UserEntity) => {
    if (!teamId) return;
    openAlert({
      title: t("systemUser.deletePromptTitle", { name: u.name ?? "" }),
      description: t("systemUser.deletePromptDesc"),
      onPositive: () => deleteU({ id: u.id, teamId }),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={teamId ?? ""}
          onChange={(e) => {
            setSelectedTeamId(e.target.value ? Number(e.target.value) : null);
            setPage(1);
          }}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          {teams.map((tt) => (
            <option key={tt.id} value={tt.id}>
              {tt.name}
              {tt.companyName ? ` · ${tt.companyName}` : ""}
            </option>
          ))}
        </select>
        <Input
          placeholder={t("systemUser.searchPlaceholder")}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-72"
        />
        <Button
          onClick={() => teamId && openCreate(teamId)}
          disabled={!teamId}
        >
          {t("systemUser.newButton")}
        </Button>
      </div>

      {error ? (
        <Fallback />
      ) : isPending ? (
        <Loader />
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("field.email")}</TableHead>
                  <TableHead>{t("field.name")}</TableHead>
                  <TableHead>{t("field.role")}</TableHead>
                  <TableHead>{t("field.phone")}</TableHead>
                  <TableHead>{t("common.active")}</TableHead>
                  <TableHead>{t("field.joinedAt")}</TableHead>
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground"
                    >
                      {t("common.noData")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.email}</TableCell>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {u.role}
                      </TableCell>
                      <TableCell>{u.phone ?? "—"}</TableCell>
                      <TableCell>
                        {u.isActive ? (
                          <span className="text-green-700">✓</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatDate(u.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => teamId && openEdit(teamId, u)}
                          disabled={u.role === "SUPER_ADMIN"}
                        >
                          {t("common.edit")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 text-destructive"
                          onClick={() => handleDelete(u)}
                          disabled={u.role === "SUPER_ADMIN"}
                        >
                          {t("common.delete")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {t("common.totalCount", { count: data.total })} · {data.page}/{Math.max(1, data.pages)}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                {t("common.previous")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.pages}
                onClick={() => setPage((p) => p + 1)}
              >
                {t("common.next")}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
