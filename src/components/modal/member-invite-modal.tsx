import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Mail, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { listUsers } from "@/api/user";
import { useMemberInviteModal } from "@/store/member-invite-modal";
import { useInviteMember } from "@/hooks/mutations/team/use-invite-member";
import { useCurrentTeamId } from "@/store/auth";
import { generateErrorMessage } from "@/lib/error";

// Invite modal — admin pastes an email, we look up the existing account on
// the server and create the membership. There's no token-based email invite
// flow yet (on roadmap), so invited users must already have accounts.
//
// TMS adaptation: backend's POST /teams/{teamId}/members expects a
// `userId` (not email), so the modal resolves email → user via listUsers
// then calls the invite mutation. Team id comes from the auth store.

export default function MemberInviteModal() {
  const modal = useMemberInviteModal();
  const teamId = useCurrentTeamId();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  const { mutate: inviteMember, isPending: isInviteMemberPending } =
    useInviteMember({
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

  const isPending = isInviteMemberPending || isResolving;

  const handleOpenChange = (open: boolean) => {
    if (!open) modal.actions.close();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId) return;
    const trimmed = email.trim().toLowerCase();
    if (trimmed === "") return;

    setIsResolving(true);
    try {
      // Resolve email → user. listUsers is paginated; for this v1 we scan
      // the first page (size=100) which covers most teams. Token-based
      // email invites (no pre-existing account) are on the roadmap.
      const page = await listUsers({ page: 1, size: 100 }, teamId);
      const match = page.items.find(
        (u) => (u.email ?? "").toLowerCase() === trimmed,
      );
      if (!match) {
        toast.error(t("modal.memberInvite.notFound"), {
          position: "top-center",
        });
        return;
      }
      inviteMember({ teamId, userId: match.id });
    } catch (err) {
      toast.error(generateErrorMessage(err), { position: "top-center" });
    } finally {
      setIsResolving(false);
    }
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
                disabled={isPending}
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
            disabled={isPending || email.trim() === "" || !teamId}
            className="rounded-xl bg-black py-3 text-sm font-medium text-white hover:bg-black/80"
          >
            {isPending
              ? t("modal.memberInvite.submitting")
              : t("modal.memberInvite.submit")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
