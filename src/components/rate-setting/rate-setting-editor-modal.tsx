// RateSetting 생성/수정. rate_type 셀렉트 + 선택된 type 의 amount 필드만 활성화.
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCreateRateSetting } from "@/hooks/mutations/rate-setting/use-create-rate-setting";
import { useUpdateRateSetting } from "@/hooks/mutations/rate-setting/use-update-rate-setting";
import { generateErrorMessage } from "@/lib/error";
import { useRateSettingEditorModal } from "@/store/rate-setting-editor-modal";
import type { RateType } from "@/types";

const RATE_TYPES: RateType[] = ["FLAT_RATE", "PERCENTAGE", "PER_MILE"];

type OpenModal = Extract<
  ReturnType<typeof useRateSettingEditorModal>,
  { isOpen: true }
>;

function todayIsoDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function RateSettingEditorModal() {
  const modal = useRateSettingEditorModal();
  return (
    <Dialog
      open={modal.isOpen}
      onOpenChange={(o) => !o && modal.actions.close()}
    >
      <DialogContent>
        {modal.isOpen && (
          <Body
            key={modal.type === "EDIT" ? `e-${modal.rateSetting.id}` : "c"}
            modal={modal}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function Body({ modal }: { modal: OpenModal }) {
  const { t } = useTranslation();
  const [name, setName] = useState(
    modal.type === "CREATE" ? "" : modal.rateSetting.name,
  );
  const [rateType, setRateType] = useState<RateType>(
    modal.type === "CREATE" ? "FLAT_RATE" : modal.rateSetting.rateType,
  );
  const [flatAmount, setFlatAmount] = useState(
    modal.type === "CREATE" ? "" : (modal.rateSetting.flatAmount ?? ""),
  );
  const [ratePercent, setRatePercent] = useState(
    modal.type === "CREATE" ? "" : (modal.rateSetting.ratePercent ?? ""),
  );
  const [ratePerMile, setRatePerMile] = useState(
    modal.type === "CREATE" ? "" : (modal.rateSetting.ratePerMile ?? ""),
  );
  const [effectiveDate, setEffectiveDate] = useState(
    modal.type === "CREATE" ? todayIsoDate() : modal.rateSetting.effectiveDate,
  );
  const [description, setDescription] = useState(
    modal.type === "CREATE" ? "" : (modal.rateSetting.description ?? ""),
  );

  const { mutate: createRate, isPending: isCreatePending } =
    useCreateRateSetting({
      onSuccess: () => {
        toast.success(t("toast.created"), {
          position: "top-center",
        });
        modal.actions.close();
      },
      onError: (err) =>
        toast.error(generateErrorMessage(err), { position: "top-center" }),
    });

  const { mutate: updateRate, isPending: isUpdatePending } =
    useUpdateRateSetting({
      onSuccess: () => {
        toast.success(t("toast.updated"), {
          position: "top-center",
        });
        modal.actions.close();
      },
      onError: (err) =>
        toast.error(generateErrorMessage(err), { position: "top-center" }),
    });

  const isPending = isCreatePending || isUpdatePending;

  const handleSave = () => {
    if (!name.trim()) return;
    if (!effectiveDate) {
      toast.error(t("rateSetting.effectiveDateRequired"), {
        position: "top-center",
      });
      return;
    }
    // 선택된 type 의 amount 만 보냄. 다른 필드는 null.
    const flat = rateType === "FLAT_RATE" ? flatAmount.trim() || null : null;
    const pct = rateType === "PERCENTAGE" ? ratePercent.trim() || null : null;
    const perMile =
      rateType === "PER_MILE" ? ratePerMile.trim() || null : null;

    if (rateType === "FLAT_RATE" && !flat) {
      toast.error(t("rateSetting.flatAmountRequired"), {
        position: "top-center",
      });
      return;
    }
    if (rateType === "PERCENTAGE" && !pct) {
      toast.error(t("rateSetting.percentageRequired"), {
        position: "top-center",
      });
      return;
    }
    if (rateType === "PER_MILE" && !perMile) {
      toast.error(t("rateSetting.perMileRequired"), {
        position: "top-center",
      });
      return;
    }

    if (modal.type === "CREATE") {
      createRate({
        name: name.trim(),
        rateType,
        flatAmount: flat,
        ratePercent: pct,
        ratePerMile: perMile,
        effectiveDate,
        description: description.trim() || null,
      });
    } else {
      updateRate({
        id: modal.rateSetting.id,
        payload: {
          name: name.trim(),
          flatAmount: flat,
          ratePercent: pct,
          ratePerMile: perMile,
          effectiveDate,
          description: description.trim() || null,
        },
      });
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-sans">
          {modal.type === "CREATE"
            ? t("rateSetting.createTitle")
            : t("rateSetting.editTitle")}
        </DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-3">
        <Field label={t("rateSetting.field.name")} required>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
            placeholder={t("rateSetting.namePlaceholder")}
          />
        </Field>
        <Field label={t("rateSetting.field.rateType")} required>
          <select
            value={rateType}
            onChange={(e) => setRateType(e.target.value as RateType)}
            disabled={isPending || modal.type === "EDIT"}
            className="rounded-md border bg-background px-3 py-2 text-sm disabled:opacity-50"
          >
            {RATE_TYPES.map((rt) => (
              <option key={rt} value={rt}>
                {rt}
              </option>
            ))}
          </select>
          {modal.type === "EDIT" && (
            <span className="text-xs text-muted-foreground">
              {t("rateSetting.typeImmutableHint")}
            </span>
          )}
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label={t("rateSetting.field.flatAmount")}>
            <Input
              type="number"
              step="0.01"
              value={flatAmount}
              onChange={(e) => setFlatAmount(e.target.value)}
              disabled={isPending || rateType !== "FLAT_RATE"}
              className={
                "text-right " + (rateType !== "FLAT_RATE" ? "opacity-50" : "")
              }
            />
          </Field>
          <Field label={t("rateSetting.field.percentage")}>
            <Input
              type="number"
              step="0.001"
              value={ratePercent}
              onChange={(e) => setRatePercent(e.target.value)}
              disabled={isPending || rateType !== "PERCENTAGE"}
              className={
                "text-right " +
                (rateType !== "PERCENTAGE" ? "opacity-50" : "")
              }
            />
          </Field>
          <Field label={t("rateSetting.field.perMile")}>
            <Input
              type="number"
              step="0.0001"
              value={ratePerMile}
              onChange={(e) => setRatePerMile(e.target.value)}
              disabled={isPending || rateType !== "PER_MILE"}
              className={
                "text-right " + (rateType !== "PER_MILE" ? "opacity-50" : "")
              }
            />
          </Field>
        </div>
        <Field label={t("rateSetting.field.effectiveDate")} required>
          <Input
            type="date"
            value={effectiveDate}
            onChange={(e) => setEffectiveDate(e.target.value)}
            disabled={isPending}
          />
        </Field>
        <Field label={t("rateSetting.field.description")}>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isPending}
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
        <Button onClick={handleSave} disabled={isPending || !name.trim()}>
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
