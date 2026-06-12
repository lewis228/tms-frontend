// 그룹 → 배정 기사 칩 — Rates 화면에서 선택된 그룹을 어떤 기사들이 배정받았는지
// 즉시 확인하고, 팝오버 안에서 바로 추가(다른 그룹이면 이동)/빼기까지 처리하는
// 미니 관리 패널. 더 복잡한 편집(유효기간/노트)은 "배정 관리" 링크로 위임.
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Users, X } from "lucide-react";

import Loader from "@/components/loader";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import SearchableSelect from "@/components/searchable-select";
import { fetchDriver, fetchDrivers } from "@/api/driver";
import { fetchDriverRateAssignments } from "@/api/driver-rate-assignment";
import { useDriversData } from "@/hooks/queries/use-drivers-data";
import { useAssignDriverToGroup } from "@/hooks/mutations/driver-rate-assignment/use-assign-driver-to-group";
import { useDeleteDriverRateAssignment } from "@/hooks/mutations/driver-rate-assignment/use-delete-driver-rate-assignment";
import { QUERY_KEYS } from "@/lib/constants";
import { generateErrorMessage } from "@/lib/error";
import { formatDate } from "@/lib/format";
import { useOpenAlertModal } from "@/store/alert-modal";
import type { DriverEntity, DriverRateAssignmentEntity } from "@/types";

const CHIP_TAKE = 200;

export default function GroupDriverChip({
  groupId,
  groupName,
  isDefault,
  method,
}: {
  groupId: number;
  groupName: string;
  isDefault: boolean;
  method: string;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const params = useParams();

  // 칩 라벨(N명)에 카운트가 항상 보여야 해서 lazy 가 아니라 즉시 fetch.
  // 배정 CUD mutation 들이 driverRateAssignment.all 을 invalidate 하므로 자동 갱신.
  const { data, isPending } = useQuery({
    queryKey: QUERY_KEYS.driverRateAssignment.list({
      rateGroupId: groupId,
      size: CHIP_TAKE,
    }),
    queryFn: () =>
      fetchDriverRateAssignments({ rateGroupId: groupId, size: CHIP_TAKE }),
  });

  const count = data?.items.length ?? 0;
  const managePath = params.teamId
    ? `/app/${params.teamId}/rates/driver-assignment?groupId=${groupId}`
    : "/app";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title={t("driverRateAssignment.groupChip.title")}
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted ${
            count === 0 ? "text-muted-foreground" : ""
          }`}
        >
          <Users className="size-3.5 opacity-60" />
          {isPending
            ? "…"
            : t("driverRateAssignment.groupChip.count", { count })}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-3">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-sm font-semibold">{groupName}</span>
            <span className="text-[11px] text-muted-foreground">
              {t("driverRateAssignment.groupChip.count", { count })}
            </span>
          </div>

          {isPending ? (
            <Loader />
          ) : (
            <AssignedDriverList
              groupId={groupId}
              assignments={data?.items ?? []}
            />
          )}

          <AddDriverRow groupId={groupId} />

          {isDefault && method === "ZIP" && (
            <p className="rounded bg-muted/60 px-2 py-1.5 text-[11px] text-muted-foreground">
              {t("driverRateAssignment.groupChip.defaultNote")}
            </p>
          )}

          <Link
            to={managePath}
            className="border-t pt-2 text-center text-xs font-medium text-primary hover:underline"
            onClick={() => setOpen(false)}
          >
            {t("driverRateAssignment.groupChip.manage")} →
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// 배정 기사 목록 — 이름 + 간단 정보(이메일·전화) + 적용기간 + 빼기 버튼.
function AssignedDriverList({
  groupId,
  assignments,
}: {
  groupId: number;
  assignments: DriverRateAssignmentEntity[];
}) {
  const { t } = useTranslation();
  const { data: driversData } = useDriversData(1, CHIP_TAKE);
  const openAlert = useOpenAlertModal();

  const driverById = useMemo(() => {
    const m = new Map<number, DriverEntity>();
    driversData?.items.forEach((d) => m.set(d.id, d));
    return m;
  }, [driversData]);

  const { mutate: deleteAssignment, isPending: isDeletePending } =
    useDeleteDriverRateAssignment({
      onSuccess: () =>
        toast.success(t("toast.deleted"), { position: "top-center" }),
      onError: (err) =>
        toast.error(generateErrorMessage(err), { position: "top-center" }),
    });

  const handleRemove = (a: DriverRateAssignmentEntity) => {
    const name = driverById.get(a.driverId)?.name ?? `#${a.driverId}`;
    openAlert({
      title: t("driverRateAssignment.groupChip.removePromptTitle", { name }),
      description: t("driverRateAssignment.groupChip.removePromptDesc"),
      onPositive: () => deleteAssignment(a.id),
    });
  };

  if (assignments.length === 0) {
    return (
      <span className="text-xs text-muted-foreground">
        {t("driverRateAssignment.groupChip.empty")}
      </span>
    );
  }

  return (
    <ul
      key={groupId}
      className="flex max-h-64 flex-col divide-y overflow-y-auto rounded-md border"
    >
      {assignments.map((a) => {
        const d = driverById.get(a.driverId);
        return (
          <li key={a.id} className="flex items-center gap-2 px-2.5 py-2">
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium">
                {d?.name ?? `#${a.driverId}`}
              </div>
              <div className="truncate text-[11px] text-muted-foreground">
                {[d?.phone, d?.email].filter(Boolean).join(" · ") || "—"}
              </div>
            </div>
            <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
              {formatDate(a.effectiveFrom)} ~{" "}
              {a.effectiveTo
                ? formatDate(a.effectiveTo)
                : t("rateLookup.result.untilNow")}
            </span>
            <button
              type="button"
              disabled={isDeletePending}
              onClick={() => handleRemove(a)}
              title={t("driverRateAssignment.groupChip.remove")}
              className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="size-3.5" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

// 기사 추가 — 그룹/방식 무관 전체 기사 검색. 추가 시 이 그룹으로 배정(이동).
function AddDriverRow({ groupId }: { groupId: number }) {
  const { t } = useTranslation();
  const [pickedDriverId, setPickedDriverId] = useState<number | null>(null);

  const { mutate: assignDriver, isPending: isAssignPending } =
    useAssignDriverToGroup({
      onDone: (result) => {
        setPickedDriverId(null);
        if (result === "noop") {
          toast.info(t("driverRateAssignment.groupChip.alreadyInGroup"), {
            position: "top-center",
          });
          return;
        }
        toast.success(
          t(
            result === "moved"
              ? "driverRateAssignment.groupChip.movedToast"
              : "toast.created"
          ),
          { position: "top-center" }
        );
      },
      onError: (err) => {
        setPickedDriverId(null);
        toast.error(generateErrorMessage(err), { position: "top-center" });
      },
    });

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] text-muted-foreground">
        {t("driverRateAssignment.groupChip.addDriver")}
      </span>
      <SearchableSelect<DriverEntity>
        value={pickedDriverId}
        onSelect={(id) => {
          if (id == null) return;
          setPickedDriverId(id);
          assignDriver({ driverId: id, rateGroupId: groupId });
        }}
        fetchList={(q) =>
          fetchDrivers({ q, size: 50, activeOnly: true }).then((r) => r.items)
        }
        fetchById={(id) => fetchDriver(id)}
        queryKeyBase={["driver", "search"]}
        getLabel={(d) => `${d.name} (${d.email})`}
        placeholder={t("driverRateAssignment.groupChip.addPlaceholder")}
        disabled={isAssignPending}
      />
    </div>
  );
}
