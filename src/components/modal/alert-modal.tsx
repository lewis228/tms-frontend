import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAlertModal } from "@/store/alert-modal";
import { useTranslation } from "react-i18next";

export default function AlertModal() {
  const alertModal = useAlertModal();
  const { t } = useTranslation();

  const handleOpenChange = (open: boolean) => {
    if (!open) alertModal.actions.close();
  };

  const handlePositive = () => {
    if (alertModal.isOpen && alertModal.onPositive) alertModal.onPositive();
    alertModal.actions.close();
  };

  const handleNegative = () => {
    if (alertModal.isOpen && alertModal.onNegative) alertModal.onNegative();
    alertModal.actions.close();
  };

  return (
    <AlertDialog open={alertModal.isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-sans">
            {alertModal.isOpen ? alertModal.title : ""}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {alertModal.isOpen ? alertModal.description : ""}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleNegative}>
            {t("common.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handlePositive}>
            {t("common.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
