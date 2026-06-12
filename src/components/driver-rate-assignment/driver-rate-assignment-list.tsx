import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import { useDriverRateAssignmentsData } from "@/hooks/queries/use-driver-rate-assignments-data";
import { useDriversData } from "@/hooks/queries/use-drivers-data";
import { useRateGroupsData } from "@/hooks/queries/use-rate-groups-data";
import { useDeleteDriverRateAssignment } from "@/hooks/mutations/driver-rate-assignment/use-delete-driver-rate-assignment";
import { PAGE_SIZE } from "@/lib/constants";
import { generateErrorMessage } from "@/lib/error";
import { formatDate } from "@/lib/format";
import { useOpenAlertModal } from "@/store/alert-modal";
import {
  useOpenCreateDriverRateAssignmentModal,
  useOpenEditDriverRateAssignmentModal,
} from "@/store/driver-rate-assignment-editor-modal";
import type {
  DriverRateAssignment,
  DriverRateAssignmentEntity,
  RateMethod,
} from "@/types";

// 백엔드 cursor pagination 은 page 이동을 지원하지 않으므로 크게 가져와
// 클라이언트에서 PAGE_SIZE 단위로 슬라이스한다. 드라이버/그룹 이름·방식 enrich
// 맵도 같은 size 로 가져와 첫 20건 밖 참조가 '#id'/'—' 로 깨지지 않게 한다.
const LIST_TAKE = 200;

export default function DriverRateAssignmentList() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  // 그룹 필터 — Rates 칩의 "배정 관리" 링크(?groupId=)로 진입하면 자동 적용.
  const [searchParams, setSearchParams] = useSearchParams();
  const groupIdParam = searchParams.get("groupId");
  const filterGroupId = groupIdParam ? Number(groupIdParam) : undefined;

  const { data, isPending, error } = useDriverRateAssignmentsData({
    size: LIST_TAKE,
    rateGroupId: filterGroupId,
  });
  const { data: driversData } = useDriversData(1, LIST_TAKE);
  const { data: groupsData } = useRateGroupsData(1, LIST_TAKE);

  const handleFilterChange = (value: string) => {
    setPage(1);
    setSearchParams(value ? { groupId: value } : {}, { replace: true });
  };
  const openCreate = useOpenCreateDriverRateAssignmentModal();
  const openEdit = useOpenEditDriverRateAssignmentModal();
  const openAlert = useOpenAlertModal();

  const { mutate: deleteAssignment } = useDeleteDriverRateAssignment({
    onSuccess: () =>
      toast.success(t("toast.deleted"), { position: "top-center" }),
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const driverNameById = useMemo(() => {
    const map = new Map<number, string>();
    driversData?.items.forEach((d) => map.set(d.id, d.name));
    return map;
  }, [driversData]);

  const groupNameById = useMemo(() => {
    const map = new Map<number, string>();
    groupsData?.items.forEach((g) => map.set(g.id, g.name));
    return map;
  }, [groupsData]);

  // 배정된 그룹의 정산 방식 — 목록에서 방식이 바로 보이게.
  const groupMethodById = useMemo(() => {
    const map = new Map<number, RateMethod>();
    groupsData?.items.forEach((g) => map.set(g.id, g.method));
    return map;
  }, [groupsData]);

  const rows = useMemo<DriverRateAssignment[]>(() => {
    if (!data) return [];
    return data.items.map((a) => ({
      ...a,
      driverName: driverNameById.get(a.driverId),
      groupName: groupNameById.get(a.rateGroupId),
    }));
  }, [data, driverNameById, groupNameById]);

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  // 클라이언트 페이지 슬라이스 — 가져온 범위(LIST_TAKE) 안에서만 페이지 이동.
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pagedRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = (v: DriverRateAssignmentEntity) => {
    openAlert({
      title: t("driverRateAssignment.deletePromptTitle"),
      description: t("driverRateAssignment.deletePromptDesc"),
      onPositive: () => deleteAssignment(v.id),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          {t("driverRateAssignment.field.rateGroup")}
          <select
            className="h-9 rounded-md border bg-background px-2 text-sm text-foreground"
            value={filterGroupId ?? ""}
            onChange={(e) => handleFilterChange(e.target.value)}
          >
            <option value="">{t("common.all")}</option>
            {(groupsData?.items ?? []).map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
                {g.isDefault ? " ★" : ""} · {t(`rateGroup.method.${g.method}`)}
              </option>
            ))}
          </select>
        </label>
        <Button onClick={() => openCreate()}>
          {t("driverRateAssignment.newButton")}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("driverRateAssignment.field.driver")}</TableHead>
              <TableHead>{t("rateGroup.field.method")}</TableHead>
              <TableHead>{t("driverRateAssignment.field.rateGroup")}</TableHead>
              <TableHead>
                {t("driverRateAssignment.field.effectiveFrom")}
              </TableHead>
              <TableHead>
                {t("driverRateAssignment.field.effectiveTo")}
              </TableHead>
              <TableHead>{t("field.note")}</TableHead>
              <TableHead>{t("common.active")}</TableHead>
              <TableHead className="text-right">
                {t("common.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground"
                >
                  {t("common.noData")}
                </TableCell>
              </TableRow>
            ) : (
              pagedRows.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">
                    {v.driverName ?? `#${v.driverId}`}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const m = groupMethodById.get(v.rateGroupId);
                      return m ? (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium uppercase">
                          {t(`rateGroup.method.${m}`)}
                        </span>
                      ) : (
                        "—"
                      );
                    })()}
                  </TableCell>
                  <TableCell>{v.groupName ?? `#${v.rateGroupId}`}</TableCell>
                  <TableCell>{formatDate(v.effectiveFrom)}</TableCell>
                  <TableCell>
                    {v.effectiveTo ? formatDate(v.effectiveTo) : "—"}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {v.note ?? "—"}
                  </TableCell>
                  <TableCell>{v.isActive ? "✓" : "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(v)}
                    >
                      {t("common.edit")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 text-destructive"
                      onClick={() => handleDelete(v)}
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
          {t("common.totalCount", { count: data.total })} ·{" "}
          {t("common.pageOf", { page, pages })}
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
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
          >
            {t("common.next")}
          </Button>
        </div>
      </div>
    </div>
  );
}
