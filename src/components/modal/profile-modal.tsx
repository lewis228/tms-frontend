import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, ChevronRight, LogOut, User } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useProfileModal } from "@/store/profile-modal";
import { useSession } from "@/store/session";
import { useOpenAlertModal } from "@/store/alert-modal";
import {
  useLanguagePreference,
  useSetLanguagePreference,
} from "@/store/language";
import { useSignOut } from "@/hooks/mutations/auth/use-sign-out";
import { generateErrorMessage } from "@/lib/error";
import { cn } from "@/lib/utils";
import type { AppUser } from "@/types";

// Profile modal — opened from the sidebar avatar. A focused single-panel
// dialog for the current user's profile & account settings. Team-wide
// settings (billing, display prefs, etc.) live under the sidebar Settings
// section instead of a separate modal.

export default function ProfileModal() {
  const profileModal = useProfileModal();
  const session = useSession();
  const { t } = useTranslation();
  const [subDialog, setSubDialog] = useState<
    "name" | "email" | "password" | "logout" | "delete" | null
  >(null);

  const handleOpenChange = (open: boolean) => {
    if (!open) profileModal.actions.close();
  };

  // Defensive: if the session clears while the modal is open (sign-out from
  // anywhere, session expiry), make sure the dialog state closes too. Without
  // this the header shell can linger after navigation to /sign-in because
  // the body is gated on `session`.
  useEffect(() => {
    if (!session && profileModal.isOpen) {
      profileModal.actions.close();
    }
  }, [session, profileModal]);

  return (
    <>
      <Dialog open={profileModal.isOpen} onOpenChange={handleOpenChange}>
        <DialogContent
          className="w-[760px] max-w-[92vw] gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-[760px]"
          showCloseButton
        >
          <DialogHeader className="shrink-0 border-b border-black/10 px-7 py-5">
            <div className="flex items-center gap-3">
              <User className="h-8 w-8 text-black/55" />
              <DialogTitle className="font-sans text-2xl font-semibold">
                {t("profile.title")}
              </DialogTitle>
            </div>
          </DialogHeader>

          <div
            className="overflow-y-auto overflow-x-hidden"
            style={{ maxHeight: "min(640px, 80vh)" }}
          >
            {session && <ProfileBody user={session.user} onOpen={setSubDialog} />}
          </div>
        </DialogContent>
      </Dialog>

      <ChangeNameDialog
        open={subDialog === "name"}
        onOpenChange={(v) => !v && setSubDialog(null)}
      />
      <ChangePasswordDialog
        open={subDialog === "password"}
        onOpenChange={(v) => !v && setSubDialog(null)}
      />
      <LogOutAllDialog
        open={subDialog === "logout"}
        onOpenChange={(v) => !v && setSubDialog(null)}
      />
      <DeleteAccountDialog
        email={session?.user.email ?? ""}
        open={subDialog === "delete"}
        onOpenChange={(v) => !v && setSubDialog(null)}
      />
    </>
  );
}

function ProfileBody({
  user,
  onOpen,
}: {
  user: AppUser;
  onOpen: (
    dialog: "name" | "email" | "password" | "logout" | "delete" | null,
  ) => void;
}) {
  const [eventNotif, setEventNotif] = useState(true);
  const language = useLanguagePreference();
  const setLanguage = useSetLanguagePreference();
  const openAlertModal = useOpenAlertModal();
  const profileModal = useProfileModal();
  const { t } = useTranslation();
  const { mutate: signOut, isPending: isSignOutPending } = useSignOut({
    onError: (error) => {
      toast.error(generateErrorMessage(error), { position: "top-center" });
    },
  });
  const displayName = pickDisplayName(user);
  const initial = pickInitial(user);

  const handleSignOutClick = () => {
    openAlertModal({
      title: t("profile.signOutConfirmTitle"),
      description: t("profile.signOutConfirmDescription"),
      onPositive: () => {
        // Close the modal before the session clears — otherwise the dialog
        // shell (header) lingers on the sign-in page because `isOpen` stays
        // true while the body unmounts with the session.
        profileModal.actions.close();
        signOut();
      },
    });
  };

  return (
    <div className="flex flex-col gap-0">
      <div className="flex items-center gap-3 px-6 py-5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black text-base font-semibold text-white">
          {initial}
        </span>
        <div className="flex min-w-0 flex-col">
          <p className="truncate text-base font-semibold text-black">
            {displayName}
          </p>
          <p className="truncate text-xs text-black/55">{user.email}</p>
        </div>
        <button
          type="button"
          onClick={handleSignOutClick}
          disabled={isSignOutPending}
          className="ml-auto flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 text-xs font-medium text-black/60 transition-colors hover:border-black/20 hover:bg-black/[0.02] hover:text-black disabled:opacity-50"
        >
          <LogOut className="h-3.5 w-3.5" />
          {t("profile.signOut")}
        </button>
      </div>

      <ProfileRow
        label={t("profile.name")}
        description={t("profile.nameDescription")}
        value={displayName}
        onClick={() => onOpen("name")}
      />
      <LanguageRow value={language} onChange={setLanguage} />

      <Separator className="mx-6 bg-black/10" />

      <div className="px-6 pb-1 pt-4">
        <h3 className="text-sm font-semibold text-black">
          {t("profile.accountSecurity")}
        </h3>
      </div>
      <ProfileRow label={t("profile.email")} value={user.email} />
      <div
        className="mx-2 cursor-pointer rounded-xl bg-black/[0.04] px-4 py-3 transition-colors hover:bg-black/[0.06]"
        onClick={() => onOpen("password")}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-black">
              {t("profile.password")}
            </p>
            <p className="text-xs text-black/55">
              {t("profile.passwordDescription")}
            </p>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-black/20" />
        </div>
      </div>
      <ProfileRow
        label={t("profile.twoStep")}
        description={t("profile.twoStepDescription")}
        value={t("profile.twoStepOff")}
      />

      <Separator className="mx-6 bg-black/10" />

      <div className="px-6 pb-1 pt-4">
        <h3 className="text-sm font-semibold text-black">
          {t("profile.support")}
        </h3>
      </div>
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex-1 pr-4">
          <p className="text-sm font-semibold text-black">
            {t("profile.eventNotifications")}
          </p>
          <p className="text-xs leading-4 text-black/55">
            {t("profile.eventNotificationsDescription")}
          </p>
        </div>
        <Switch checked={eventNotif} onCheckedChange={setEventNotif} />
      </div>
      <ProfileRow
        label={t("profile.logoutAllDevices")}
        description={t("profile.logoutAllDevicesDescription")}
        onClick={() => onOpen("logout")}
      />
      <ProfileRow
        label={t("profile.deleteAccount")}
        description={t("profile.deleteAccountDescription")}
        onClick={() => onOpen("delete")}
        destructive
      />
    </div>
  );
}

function ProfileRow({
  label,
  description,
  value,
  onClick,
  destructive,
}: {
  label: string;
  description?: string;
  value?: string;
  onClick?: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="flex w-full items-center justify-between gap-4 px-6 py-3 text-left transition-colors hover:bg-black/[0.02] disabled:cursor-default disabled:hover:bg-transparent"
    >
      <div className="min-w-0">
        <p
          className={cn(
            "text-sm",
            destructive ? "font-semibold text-red-500" : "text-black",
          )}
        >
          {label}
        </p>
        {description && (
          <p className="truncate text-xs text-black/55">{description}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {value && (
          <span className="truncate text-sm text-black/55">{value}</span>
        )}
        {onClick && <ChevronRight className="h-3.5 w-3.5 text-black/20" />}
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Language row + popover picker
// ---------------------------------------------------------------------------

type LanguageKey = "system" | "ko" | "en";

// Show the detected browser locale as a hint when `system` is selected, so
// the user knows what "browser language" actually resolves to right now.
function detectBrowserLanguageLabel(t: (k: string) => string): string {
  if (typeof navigator === "undefined") return "";
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith("ko")) return t("profile.lang.ko");
  if (lang.startsWith("en")) return t("profile.lang.en");
  return navigator.language;
}

function LanguageRow({
  value,
  onChange,
}: {
  value: LanguageKey;
  onChange: (v: LanguageKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const detected = detectBrowserLanguageLabel(t);
  const systemLabel = t("profile.lang.system");
  const displayValue =
    value === "system" && detected
      ? `${systemLabel} · ${detected}`
      : t(`profile.lang.${value}`);

  const handleSelect = (next: LanguageKey) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between gap-4 px-6 py-3 text-left transition-colors hover:bg-black/[0.02]"
        >
          <div className="min-w-0">
            <p className="text-sm text-black">{t("profile.language")}</p>
            <p className="truncate text-xs text-black/55">
              {t("profile.languageDescription")}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="truncate text-sm text-black/55">
              {displayValue}
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-black/20" />
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={6} className="w-64 p-1.5">
        <div className="flex flex-col">
          {(["system", "ko", "en"] as LanguageKey[]).map((key) => (
            <LanguageOption
              key={key}
              label={t(`profile.lang.${key}`)}
              hint={key === "system" ? detected : undefined}
              selected={value === key}
              onSelect={() => handleSelect(key)}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function LanguageOption({
  label,
  hint,
  selected,
  onSelect,
}: {
  label: string;
  hint?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors",
        selected ? "bg-black/[0.04] text-black" : "text-black/70 hover:bg-black/[0.03] hover:text-black",
      )}
    >
      <div className="flex min-w-0 flex-col">
        <span className="truncate font-medium">{label}</span>
        {hint && (
          <span className="truncate text-xs text-black/55">{hint}</span>
        )}
      </div>
      {selected && <Check className="h-4 w-4 shrink-0 text-black" />}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Sub-dialogs (name / password / logout / delete)
// ---------------------------------------------------------------------------

function ChangeNameDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const { t } = useTranslation();

  const handleSave = () => {
    const trimmed = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (trimmed === "") return;
    toast.info(t("profile.changeName.toastStub"), { position: "top-center" });
    onOpenChange(false);
    setFirstName("");
    setLastName("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="font-sans text-center text-lg font-semibold">
            {t("profile.changeName.title")}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 flex gap-3">
          <Input
            placeholder={t("profile.changeName.firstName")}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="rounded-xl border-black/10 text-sm placeholder:text-black/20"
          />
          <Input
            placeholder={t("profile.changeName.lastName")}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="rounded-xl border-black/10 text-sm placeholder:text-black/20"
          />
        </div>
        <Button
          onClick={handleSave}
          className="mt-4 w-full rounded-2xl bg-black text-sm text-white hover:bg-black/80"
        >
          {t("common.save")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function ChangePasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [repeat, setRepeat] = useState("");
  const { t } = useTranslation();

  const reset = () => {
    setCurrent("");
    setNewPw("");
    setRepeat("");
  };

  const handleSave = () => {
    if (newPw.trim() === "" || newPw !== repeat) {
      toast.error(t("profile.changePassword.mismatch"), {
        position: "top-center",
      });
      return;
    }
    toast.info(t("profile.changePassword.toastStub"), {
      position: "top-center",
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-sm rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="font-sans text-center text-lg font-semibold">
            {t("profile.changePassword.title")}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 flex flex-col gap-3">
          <Input
            type="password"
            placeholder={t("profile.changePassword.current")}
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className="rounded-xl border-black/10 text-sm placeholder:text-black/20"
          />
          <Input
            type="password"
            placeholder={t("profile.changePassword.new")}
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            className="rounded-xl border-black/10 text-sm placeholder:text-black/20"
          />
          <Input
            type="password"
            placeholder={t("profile.changePassword.repeat")}
            value={repeat}
            onChange={(e) => setRepeat(e.target.value)}
            className="rounded-xl border-black/10 text-sm placeholder:text-black/20"
          />
        </div>
        <Button
          onClick={handleSave}
          className="mt-4 w-full rounded-2xl bg-black text-sm text-white hover:bg-black/80"
        >
          {t("common.save")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function LogOutAllDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { t } = useTranslation();
  const { mutate: signOut, isPending: isSignOutPending } = useSignOut({
    onSuccess: () => {
      toast.success(t("profile.logoutAll.success"), {
        position: "top-center",
      });
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(generateErrorMessage(err), { position: "top-center" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="font-sans text-center text-lg font-semibold">
            {t("profile.logoutAll.title")}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 flex flex-col items-center gap-4">
          <p className="text-center text-xs text-black/50">
            {t("profile.logoutAll.body")}
          </p>
          <Button
            onClick={() => signOut()}
            disabled={isSignOutPending}
            className="w-full rounded-2xl bg-black text-sm text-white hover:bg-black/80"
          >
            {t("common.confirm")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DeleteAccountDialog({
  email,
  open,
  onOpenChange,
}: {
  email: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [typed, setTyped] = useState("");
  const openAlertModal = useOpenAlertModal();
  const { t } = useTranslation();

  const handleDeleteClick = () => {
    onOpenChange(false);
    openAlertModal({
      title: t("profile.delete.confirmTitle"),
      description: t("profile.delete.confirmDescription"),
      onPositive: () => {
        toast.info(t("profile.delete.received"), { position: "top-center" });
      },
    });
    setTyped("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setTyped("");
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-sm rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="font-sans text-center text-lg font-semibold">
            {t("profile.delete.title")}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 flex flex-col gap-4">
          <div className="rounded-xl bg-red-50 px-4 py-3 text-center">
            <p className="text-sm font-semibold text-black">
              {t("profile.delete.warning")}
            </p>
            <p className="mt-1 text-xs text-black/55">
              {t("profile.delete.warningDetail")}
            </p>
          </div>
          <p className="text-xs text-black/55">
            {t("profile.delete.emailPrompt")}
          </p>
          <Input
            placeholder={email}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            className="rounded-xl border-black/10 text-sm placeholder:text-black/20"
          />
          <Button
            onClick={handleDeleteClick}
            disabled={typed !== email || email === ""}
            variant="destructive"
            className="w-full rounded-2xl text-sm"
          >
            {t("profile.delete.action")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function pickDisplayName(user: AppUser): string {
  if (user.name && user.name.trim() !== "") return user.name;
  const localPart = user.email.split("@")[0];
  return localPart.length > 0 ? localPart : user.email;
}

function pickInitial(user: AppUser): string {
  const source = user.name && user.name.trim() !== "" ? user.name : user.email;
  return source.charAt(0).toUpperCase();
}
