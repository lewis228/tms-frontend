import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { fetchDriver, fetchDrivers } from "@/api/driver";
import { fetchRateGroup, fetchRateGroups } from "@/api/rate-group";
import SearchableSelect from "@/components/searchable-select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRateGroupsData } from "@/hooks/queries/use-rate-groups-data";
import { useCreateDriverRateAssignment } from "@/hooks/mutations/driver-rate-assignment/use-create-driver-rate-assignment";
import { useUpdateDriverRateAssignment } from "@/hooks/mutations/driver-rate-assignment/use-update-driver-rate-assignment";
import { generateErrorMessage } from "@/lib/error";
import { useDriverRateAssignmentEditorModal } from "@/store/driver-rate-assignment-editor-modal";
import type { DriverEntity, RateGroupEntity, RateMethod } from "@/types";

const SEARCH_SIZE = 50;
const METHODS: RateMethod[] = ["ZIP", "CITY", "MILE", "HOURLY"];

type OpenModal = Extract<
  ReturnType<typeof useDriverRateAssignmentEditorModal>,
  { isOpen: true }
>;

export default function DriverRateAssignmentEditorModal() {
  const modal = useDriverRateAssignmentEditorModal();
  return (
    <Dialog open={modal.isOpen} onOpenChange={(o) => !o && modal.actions.close()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        {modal.isOpen && (
          <Body
            key={modal.type === "EDIT" ? `e-${modal.assignment.id}` : "c"}
            modal={modal}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function Body({ modal }: { modal: OpenModal }) {
  const { t } = useTranslation();
  // 그룹 목록 — EDIT 시 현재 그룹의 방식 파생 + 방식별 필터에 사용 (소량 데이터, 캐시 공유)
  const { data: groupsData } = useRateGroupsData();
  const [driverId, setDriverId] = useState<number | null>(
    modal.type === "CREATE" ? null : modal.assignment.driverId,
  );
  const [rateGroupId, setRateGroupId] = useState<number | null>(
    modal.type === "CREATE" ? null : modal.assignment.rateGroupId,
  );
  // 방식 먼저 선택 → 그룹 목록이 그 방식으로 좁혀짐. EDIT 은 현재 그룹의 방식으로 시작.
  const [pickedMethod, setPickedMethod] = useState<RateMethod | null>(
    modal.type === "CREATE" ? "ZIP" : null,
  );
  const editGroupMethod =
    modal.type === "EDIT"
      ? groupsData?.items.find((g) => g.id === modal.assignment.rateGroupId)
          ?.method
      : undefined;
  const method: RateMethod = pickedMethod ?? editGroupMethod ?? "ZIP";

  const handleMethodChange = (m: RateMethod) => {
    setPickedMethod(m);
    if (m !== method) setRateGroupId(null); // 방식이 바뀌면 기존 그룹 선택 해제
  };
  const [effectiveFrom, setEffectiveFrom] = useState(
    modal.type === "CREATE" ? "" : modal.assignment.effectiveFrom,
  );
  const [effectiveTo, setEffectiveTo] = useState(
    modal.type === "CREATE" ? "" : (modal.assignment.effectiveTo ?? ""),
  );
  const [note, setNote] = useState(
    modal.type === "CREATE" ? "" : (modal.assignment.note ?? ""),
  );

  const { mutate: createAssignment, isPending: isCreatePending } =
    useCreateDriverRateAssignment({
      onSuccess: () => {
        toast.success(t("toast.created"), { position: "top-center" });
        modal.actions.close();
      },
      onError: (err) =>
        toast.error(generateErrorMessage(err), { position: "top-center" }),
    });

  const { mutate: updateAssignment, isPending: isUpdatePending } =
    useUpdateDriverRateAssignment({
      onSuccess: () => {
        toast.success(t("toast.updated"), { position: "top-center" });
        modal.actions.close();
      },
      onError: (err) =>
        toast.error(generateErrorMessage(err), { position: "top-center" }),
    });

  const isPending = isCreatePending || isUpdatePending;

  const canSave =
    driverId != null && rateGroupId != null && effectiveFrom.trim() !== "";

  const handleSave = () => {
    if (!canSave) return;
    if (modal.type === "CREATE") {
      createAssignment({
        driverId,
        rateGroupId,
        effectiveFrom,
        effectiveTo: effectiveTo.trim() || null,
        note: note.trim() || null,
      });
    } else {
      updateAssignment({
        id: modal.assignment.id,
        payload: {
          rateGroupId,
          effectiveFrom,
          effectiveTo: effectiveTo.trim() || null,
          note: note.trim() || null,
        },
      });
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-sans">
          {t(
            modal.type === "CREATE"
              ? "driverRateAssignment.createTitle"
              : "driverRateAssignment.editTitle",
          )}
        </DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-3">
        <Field label={t("driverRateAssignment.field.driver")} required>
          <SearchableSelect<DriverEntity>
            value={driverId}
            onSelect={(id) => setDriverId(id)}
            fetchList={(q) =>
              fetchDrivers({ q, size: SEARCH_SIZE, activeOnly: true }).then(
                (r) => r.items,
              )
            }
            fetchById={(id) => fetchDriver(id)}
            queryKeyBase={["driver", "search"]}
            getLabel={(d) => `${d.name} (${d.email})`}
            placeholder={t("driverRateAssignment.driverPlaceholder")}
            disabled={isPending || modal.type === "EDIT"}
          />
        </Field>
        <Field label={t("rateGroup.field.method")} required>
          <div className="flex flex-wrap gap-1.5">
            {METHODS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => handleMethodChange(m)}
                disabled={isPending}
                className={`rounded-md border px-2.5 py-1.5 text-xs transition-colors ${
                  method === m
                    ? "border-primary bg-primary/10 font-medium"
                    : "hover:bg-muted"
                }`}
              >
                {t(`rateGroup.method.${m}`)}
              </button>
            ))}
          </div>
        </Field>
        <Field label={t("driverRateAssignment.field.rateGroup")} required>
          <SearchableSelect<RateGroupEntity>
            key={method}
            value={rateGroupId}
            onSelect={(id) => setRateGroupId(id)}
            fetchList={(q) =>
              fetchRateGroups({ q, size: SEARCH_SIZE }).then((r) =>
                r.items.filter((g) => g.method === method),
              )
            }
            fetchById={(id) => fetchRateGroup(id)}
            queryKeyBase={["rate-group", "search", method]}
            getLabel={(g) => `${g.name}${g.isDefault ? " ★" : ""}`}
            placeholder={t("driverRateAssignment.rateGroupPlaceholder")}
            disabled={isPending}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("driverRateAssignment.field.effectiveFrom")} required>
            <Input
              type="date"
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(e.target.value)}
              disabled={isPending}
            />
          </Field>
          <Field label={t("driverRateAssignment.field.effectiveTo")}>
            <Input
              type="date"
              value={effectiveTo}
              onChange={(e) => setEffectiveTo(e.target.value)}
              disabled={isPending}
            />
          </Field>
        </div>
        <Field label={t("field.note")}>
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={isPending}
            maxLength={3000}
          />
        </Field>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button
          variant="outline"
          onClick={() => modal.actions.close()}
          disabled={isPending}
        >
          {t("common.cancel")}
        </Button>
        <Button onClick={handleSave} disabled={isPending || !canSave}>
          {t("common.save")}
        </Button>
      </div>
    </>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-muted-foreground">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}
