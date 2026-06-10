import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { fetchRateGroup, fetchRateGroups } from "@/api/rate-group";
import { fetchRatePoint, fetchRatePoints } from "@/api/rate-point";
import SearchableSelect from "@/components/searchable-select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCreateRateSheet } from "@/hooks/mutations/rate-sheet/use-create-rate-sheet";
import { generateErrorMessage } from "@/lib/error";
import { useRateSheetCreateModal } from "@/store/rate-sheet-create-modal";
import type {
  RateGroupEntity,
  RateMoveType,
  RatePointEntity,
  RateServiceType,
  SheetKind,
} from "@/types";

const SEARCH_SIZE = 50;
const KINDS: SheetKind[] = [
  "POINT_ZONE",
  "POINT_CITY",
  "POINT_POINT",
  "MILE",
  "HOURLY",
];
const MOVE_TYPES: RateMoveType[] = ["LOAD", "EMPTY", "NONE"];
const SERVICE_TYPES: RateServiceType[] = ["LIVE", "DROP", "NONE"];
const MATRIX_KINDS: SheetKind[] = ["POINT_ZONE", "POINT_CITY", "POINT_POINT"];

export default function RateSheetCreateModal() {
  const modal = useRateSheetCreateModal();
  return (
    <Dialog open={modal.isOpen} onOpenChange={(o) => !o && modal.actions.close()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        {modal.isOpen && <Body onClose={() => modal.actions.close()} />}
      </DialogContent>
    </Dialog>
  );
}

function Body({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const [rateGroupId, setRateGroupId] = useState<number | null>(null);
  const [kind, setKind] = useState<SheetKind>("POINT_ZONE");
  const [moveType, setMoveType] = useState<RateMoveType>("LOAD");
  const [serviceType, setServiceType] = useState<RateServiceType>("LIVE");
  const [rowPointId, setRowPointId] = useState<number | null>(null);
  const [note, setNote] = useState("");

  const isMatrix = MATRIX_KINDS.includes(kind);

  const { mutate: createRateSheet, isPending } = useCreateRateSheet({
    onSuccess: () => {
      toast.success(t("toast.created"), { position: "top-center" });
      onClose();
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const canSave =
    rateGroupId != null && (!isMatrix || rowPointId != null) && !isPending;

  const handleSave = () => {
    if (rateGroupId == null) return;
    createRateSheet({
      rateGroupId,
      kind,
      moveType: isMatrix ? moveType : null,
      serviceType: isMatrix ? serviceType : null,
      rowPointId: isMatrix ? rowPointId : null,
      note: note.trim() || null,
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-sans">
          {t("rateSheet.createTitle")}
        </DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-3">
        <Field label={t("rateSheet.field.rateGroup")} required>
          <SearchableSelect<RateGroupEntity>
            value={rateGroupId}
            onSelect={(id) => setRateGroupId(id)}
            fetchList={(q) =>
              fetchRateGroups({ q, size: SEARCH_SIZE }).then((r) => r.items)
            }
            fetchById={(id) => fetchRateGroup(id)}
            queryKeyBase={["rate-group", "search"]}
            getLabel={(item) => item.name}
            placeholder={t("rateSheet.rateGroupPlaceholder")}
            disabled={isPending}
          />
        </Field>
        <Field label={t("rateSheet.field.kind")} required>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as SheetKind)}
            disabled={isPending}
            className="rounded-md border bg-background px-3 py-2 text-sm"
          >
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {t(`rateSheet.kind.${k}`)}
              </option>
            ))}
          </select>
        </Field>
        {isMatrix && (
          <>
            <Field label={t("rateSheet.field.moveType")} required>
              <select
                value={moveType}
                onChange={(e) => setMoveType(e.target.value as RateMoveType)}
                disabled={isPending}
                className="rounded-md border bg-background px-3 py-2 text-sm"
              >
                {MOVE_TYPES.map((m) => (
                  <option key={m} value={m}>
                    {t(`rateSheet.moveType.${m}`)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("rateSheet.field.serviceType")} required>
              <select
                value={serviceType}
                onChange={(e) =>
                  setServiceType(e.target.value as RateServiceType)
                }
                disabled={isPending}
                className="rounded-md border bg-background px-3 py-2 text-sm"
              >
                {SERVICE_TYPES.map((s) => (
                  <option key={s} value={s}>
                    {t(`rateSheet.serviceType.${s}`)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("rateSheet.field.rowPoint")} required>
              <SearchableSelect<RatePointEntity>
                value={rowPointId}
                onSelect={(id) => setRowPointId(id)}
                fetchList={(q) =>
                  fetchRatePoints({ q, size: SEARCH_SIZE }).then((r) => r.items)
                }
                fetchById={(id) => fetchRatePoint(id)}
                queryKeyBase={["rate-point", "search"]}
                getLabel={(item) => item.name}
                placeholder={t("rateSheet.rowPointPlaceholder")}
                disabled={isPending}
              />
            </Field>
          </>
        )}
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
        <Button variant="outline" onClick={onClose} disabled={isPending}>
          {t("common.cancel")}
        </Button>
        <Button onClick={handleSave} disabled={!canSave}>
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
