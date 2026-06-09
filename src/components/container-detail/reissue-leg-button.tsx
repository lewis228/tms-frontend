// Dry Run 재발급 — 현장 도착했으나 작업 불가(빠꾸) 시 원본 leg 를 DRY_RUN 으로
// 종료하고 동일 구간의 새 PENDING leg 를 발급한다.
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useReissueLeg } from "@/hooks/mutations/leg/use-reissue-leg";
import { generateErrorMessage } from "@/lib/error";

export default function ReissueLegButton({
  legId,
  containerId,
}: {
  legId: number;
  containerId: number;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  const { mutate: reissueLeg, isPending: isReissueLegPending } = useReissueLeg({
    onSuccess: () => {
      toast.success(t("loadType.toast.reissued"), { position: "top-center" });
      setOpen(false);
      setReason("");
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        {t("loadType.reissueButton")}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-sans">
              {t("loadType.reissueDialogTitle")}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-muted-foreground">
                {t("loadType.field.reissueReason")}
              </span>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isReissueLegPending}
                placeholder={t("loadType.field.reissueReasonPlaceholder")}
              />
            </label>
            <div className="flex justify-end">
              <Button
                disabled={isReissueLegPending}
                onClick={() =>
                  reissueLeg({
                    id: legId,
                    containerId,
                    reason: reason.trim() === "" ? undefined : reason.trim(),
                  })
                }
              >
                {t("loadType.reissueButton")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
