import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useMemberInviteModal } from "@/store/member-invite-modal";
import { useInviteTeamMember } from "@/hooks/mutations/team-member/use-invite-team-member";
import { generateErrorMessage } from "@/lib/error";

// Invite modal — admin pastes an email, we look up the existing account on
// the server and create the membership. There's no token-based email invite
// flow yet (on roadmap), so invited users must already have accounts.

export default function MemberInviteModal() {
  const modal = useMemberInviteModal();
  const params = useParams();
  const { t } = useTranslation();
  const teamId = params.teamId ? Number(params.teamId) : null;

  const [email, setEmail] = useState("");

  const { mutate: inviteMember, isPending: isInviteMemberPending } =
    useInviteTeamMember({
      onSuccess: () => {
        toast.success(t("modal.memberInvite.successToast"), {
          position: "top-center",
        });
        modal.actions.close();
      },
      onError: (error) => {
        toast.error(generateErrorMessage(error), { position: "top-center" });
      },
    });

  // Reset form each time the modal opens.
  useEffect(() => {
    if (!modal.isOpen) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEmail("");
  }, [modal.isOpen]);

  const handleOpenChange = (open: boolean) => {
    if (!open) modal.actions.close();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId) return;
    const trimmed = email.trim();
    if (trimmed === "") return;
    inviteMember({ teamId, email: trimmed });
  };

  return (
    <Dialog open={modal.isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="flex flex-col gap-5">
        <DialogTitle className="font-sans">
          {t("modal.memberInvite.title")}
        </DialogTitle>

        <div className="flex items-start gap-2 rounded-xl bg-black/[0.02] p-3">
          <UserPlus className="mt-0.5 h-4 w-4 shrink-0 text-black/55" />
          <p className="text-xs leading-relaxed text-black/60">
            {t("modal.memberInvite.note")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-black">
              {t("modal.memberInvite.emailLabel")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <Mail className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-black/45" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isInviteMemberPending}
                placeholder="teammate@example.com"
                autoFocus
                maxLength={255}
                className="rounded-xl border-black/10 pl-9 text-sm"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isInviteMemberPending || email.trim() === ""}
            className="rounded-xl bg-black py-3 text-sm font-medium text-white hover:bg-black/80"
          >
            {isInviteMemberPending
              ? t("modal.memberInvite.submitting")
              : t("modal.memberInvite.submit")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
