import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateApiKey } from "@/hooks/mutations/api-key/use-create-api-key";
import { generateErrorMessage } from "@/lib/error";
import { cn } from "@/lib/utils";
import { useApiKeyCreateModal } from "@/store/api-key-create-modal";
import { useOpenApiKeyCreatedModal } from "@/store/api-key-created-modal";
import { useOpenAlertModal } from "@/store/alert-modal";

// Fixed expiration presets. Null = never expires. Keys are i18n keys
// under `modal.apiKeyCreate.*` so the button labels localise.
const EXPIRY_OPTIONS: readonly { labelKey: string; days: number | null }[] = [
  { labelKey: "modal.apiKeyCreate.days7", days: 7 },
  { labelKey: "modal.apiKeyCreate.days30", days: 30 },
  { labelKey: "modal.apiKeyCreate.days90", days: 90 },
  { labelKey: "modal.apiKeyCreate.year1", days: 365 },
  { labelKey: "modal.apiKeyCreate.never", days: null },
];

const DEFAULT_EXPIRY_DAYS: number | null = 90;

export default function ApiKeyCreateModal() {
  const modal = useApiKeyCreateModal();
  const openCreatedModal = useOpenApiKeyCreatedModal();
  const openAlertModal = useOpenAlertModal();
  const { t } = useTranslation();

  const { mutate: createApiKey, isPending: isCreateApiKeyPending } =
    useCreateApiKey({
      onSuccess: (created) => {
        // Close the form modal first so the reveal modal doesn't stack
        // on top of it (z-index would work but this is visually cleaner).
        modal.actions.close();
        openCreatedModal({ name: created.name, fullKey: created.key });
      },
      onError: (error) => {
        toast.error(generateErrorMessage(error), { position: "top-center" });
      },
    });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [expiresInDays, setExpiresInDays] = useState<number | null>(
    DEFAULT_EXPIRY_DAYS,
  );

  // Reset form on open — intentionally only tracks isOpen so typing into
  // the fields doesn't retrigger the reset mid-session.
  useEffect(() => {
    if (!modal.isOpen) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName("");
    setDescription("");
    setExpiresInDays(DEFAULT_EXPIRY_DAYS);
  }, [modal.isOpen]);

  const handleCloseModal = () => {
    const hasDraft = name.trim() !== "" || description.trim() !== "";
    if (hasDraft) {
      openAlertModal({
        title: t("modal.apiKeyCreate.draftTitle"),
        description: t("modal.apiKeyCreate.draftDescription"),
        onPositive: () => modal.actions.close(),
      });
      return;
    }
    modal.actions.close();
  };

  const handleCreate = () => {
    if (name.trim() === "") return;
    createApiKey({
      name: name.trim(),
      description: description.trim() === "" ? null : description.trim(),
      expiresInDays,
    });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) handleCloseModal();
  };

  return (
    <Dialog open={modal.isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="flex flex-col gap-4">
        <DialogTitle className="font-sans">
          {t("modal.apiKeyCreate.title")}
        </DialogTitle>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-black">
            {t("modal.apiKeyCreate.nameLabel")}{" "}
            <span className="text-red-500">*</span>
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isCreateApiKeyPending}
            placeholder={t("modal.apiKeyCreate.namePlaceholder")}
            maxLength={80}
            autoFocus
            className="rounded-xl border-black/10 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-black">
            {t("modal.apiKeyCreate.descriptionLabel")}{" "}
            <span className="text-black/55">{t("common.optional")}</span>
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isCreateApiKeyPending}
            placeholder={t("modal.apiKeyCreate.descriptionPlaceholder")}
            maxLength={500}
            className="min-h-20 resize-none rounded-xl border-black/10 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-black">
            {t("modal.apiKeyCreate.expiry")}
          </label>
          <div className="flex flex-wrap gap-2">
            {EXPIRY_OPTIONS.map((opt) => {
              const isSelected = expiresInDays === opt.days;
              return (
                <button
                  key={opt.labelKey}
                  type="button"
                  disabled={isCreateApiKeyPending}
                  onClick={() => setExpiresInDays(opt.days)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-sm transition-colors disabled:opacity-50",
                    isSelected
                      ? "border-black bg-black text-white"
                      : "border-black/10 bg-white text-black hover:bg-black/[0.04]",
                  )}
                >
                  {t(opt.labelKey)}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-black/55">
            {t("modal.apiKeyCreate.expiryHint")}
          </p>
        </div>

        <Button
          onClick={handleCreate}
          disabled={isCreateApiKeyPending || name.trim() === ""}
          className="w-full rounded-xl bg-black py-3 text-sm font-medium text-white hover:bg-black/80"
        >
          {isCreateApiKeyPending
            ? t("modal.apiKeyCreate.submitting")
            : t("modal.apiKeyCreate.submit")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
