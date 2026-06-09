// Load Type 템플릿을 골라 container 에 leg N개를 자동 생성.
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
import { useApplyLoadType } from "@/hooks/mutations/leg/use-apply-load-type";
import { useLoadTypeTemplatesData } from "@/hooks/queries/use-load-type-templates-data";
import { generateErrorMessage } from "@/lib/error";

export default function ApplyLoadTypeButton({
  containerId,
}: {
  containerId: number;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [templateId, setTemplateId] = useState<string>("");
  const [replaceExisting, setReplaceExisting] = useState(false);

  const { data: templates } = useLoadTypeTemplatesData({ size: 100 });

  const { mutate: applyLoadType, isPending: isApplyLoadTypePending } =
    useApplyLoadType({
      onSuccess: () => {
        toast.success(t("loadType.toast.applied"), { position: "top-center" });
        setOpen(false);
        setTemplateId("");
        setReplaceExisting(false);
      },
      onError: (err) =>
        toast.error(generateErrorMessage(err), { position: "top-center" }),
    });

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        {t("loadType.applyButton")}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-sans">
              {t("loadType.dialogTitle")}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-muted-foreground">
                {t("loadType.field.template")}
              </span>
              <select
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                disabled={isApplyLoadTypePending}
                className="bg-background w-full rounded-md border px-3 py-2 text-sm"
              >
                <option value="">{t("loadType.field.selectTemplate")}</option>
                {(templates?.items ?? []).map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.code} · {tpl.name} ({tpl.direction})
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-start gap-2 text-xs">
              <input
                type="checkbox"
                checked={replaceExisting}
                onChange={(e) => setReplaceExisting(e.target.checked)}
                disabled={isApplyLoadTypePending}
                className="mt-0.5"
              />
              <span className="flex flex-col gap-0.5">
                <span className="font-medium">
                  {t("loadType.field.replaceExisting")}
                </span>
                <span className="text-muted-foreground">
                  {t("loadType.field.replaceExistingWarn")}
                </span>
              </span>
            </label>

            <div className="flex justify-end">
              <Button
                disabled={isApplyLoadTypePending || templateId === ""}
                onClick={() =>
                  applyLoadType({
                    containerId,
                    templateId: Number(templateId),
                    replaceExisting,
                  })
                }
              >
                {t("loadType.applyButton")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
