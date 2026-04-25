import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useApiKeyCreatedModal } from "@/store/api-key-created-modal";
import { AlertTriangle, Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

// Reveals the full secret exactly once. The key is never fetched again from
// the server — if the user closes this modal without saving it, they must
// create a new one. Visual design emphasises "copy now" with a warning and
// a disabled-by-default confirmation button that unlocks after copy.

export default function ApiKeyCreatedModal() {
  const modal = useApiKeyCreatedModal();
  const { t } = useTranslation();
  const [hasCopied, setHasCopied] = useState(false);

  // Reset the copy-confirmation latch on reopen. Closing wipes via the
  // store's DU, so on next open this always starts at false.
  useEffect(() => {
    if (!modal.isOpen) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasCopied(false);
  }, [modal.isOpen]);

  const handleCopy = async () => {
    if (!modal.isOpen) return;
    try {
      await navigator.clipboard.writeText(modal.fullKey);
      setHasCopied(true);
      toast.success(t("modal.apiKeyCreated.clipboardSuccess"), {
        position: "top-center",
      });
    } catch {
      // Some browsers deny clipboard without a user gesture in rare cases —
      // toast an actionable message rather than failing silently.
      toast.error(t("modal.apiKeyCreated.clipboardDenied"), {
        position: "top-center",
      });
    }
  };

  const handleClose = () => {
    modal.actions.close();
  };

  // Close via overlay / Esc — we *don't* block this because forcing a flow
  // can frustrate users in edge cases (e.g. they copied via right-click).
  // The prominent warning + copy button is sufficient UX.
  const handleOpenChange = (open: boolean) => {
    if (!open) handleClose();
  };

  return (
    <Dialog open={modal.isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="flex flex-col gap-5">
        <DialogTitle className="font-sans">
          {t("modal.apiKeyCreated.title")}
        </DialogTitle>

        {modal.isOpen && (
          <>
            <div className="flex items-start gap-2 rounded-xl border border-yellow-500/30 bg-yellow-50 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-black">
                  {t("modal.apiKeyCreated.copyNow")}
                </span>
                <span className="text-xs text-black/60">
                  {t("modal.apiKeyCreated.copyNowDetail")}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-black/60">
                {modal.name}
              </span>
              <div className="flex items-center gap-2">
                <code className="flex-1 overflow-x-auto rounded-lg border border-black/10 bg-black/[0.02] px-3 py-2.5 font-mono text-xs text-black">
                  {modal.fullKey}
                </code>
                <Button
                  type="button"
                  onClick={handleCopy}
                  variant="outline"
                  className="shrink-0 rounded-lg border-black/10 px-3 py-2.5 text-xs text-black hover:bg-black/[0.02]"
                >
                  {hasCopied ? (
                    <>
                      <Check className="mr-1 h-3.5 w-3.5" />
                      {t("modal.apiKeyCreated.copiedButton")}
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1 h-3.5 w-3.5" />
                      {t("modal.apiKeyCreated.copyButton")}
                    </>
                  )}
                </Button>
              </div>
            </div>

            <Button
              onClick={handleClose}
              className="w-full rounded-xl bg-black py-3 text-sm font-medium text-white hover:bg-black/80"
            >
              {t("modal.apiKeyCreated.saved")}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
