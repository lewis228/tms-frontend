import { useState } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Eye, EyeOff } from "lucide-react";
import AuthLayout from "@/components/layout/auth-layout";
import { useVerifyPasswordResetCode } from "@/hooks/mutations/auth/use-verify-password-reset-code";
import { useConfirmPasswordReset } from "@/hooks/mutations/auth/use-confirm-password-reset";
import { generateErrorMessage } from "@/lib/error";
import { toast } from "sonner";

function PasswordStrength({ password }: { password: string }) {
  const strength = Math.min(
    4,
    (password.length >= 8 ? 1 : 0) +
      (/[a-z]/.test(password) && /[A-Z]/.test(password) ? 1 : 0) +
      (/\d/.test(password) ? 1 : 0) +
      (/[^a-zA-Z0-9]/.test(password) ? 1 : 0),
  );
  return (
    <div className="flex gap-2">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full transition-colors ${
            i < strength ? "bg-black" : "bg-black/10"
          }`}
        />
      ))}
    </div>
  );
}

type LocationState = {
  email?: string;
  request_id?: string;
};

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const { t } = useTranslation();

  const { mutateAsync: verifyCode, isPending: isVerifyPending } =
    useVerifyPasswordResetCode({
      onError: (error) => {
        toast.error(generateErrorMessage(error), { position: "top-center" });
      },
    });

  const { mutateAsync: confirmReset, isPending: isConfirmPending } =
    useConfirmPasswordReset({
      onError: (error) => {
        toast.error(generateErrorMessage(error), { position: "top-center" });
      },
    });

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!state?.email || !state?.request_id) {
    return <Navigate to="/forget-password" replace />;
  }

  const { email, request_id } = state;
  const isPending = isVerifyPending || isConfirmPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) {
      toast.error(t("auth.resetPassword.sixDigitRequired"), {
        position: "top-center",
      });
      return;
    }
    if (password.length < 8) {
      toast.error(t("auth.signUp.passwordTooShort"), {
        position: "top-center",
      });
      return;
    }
    if (password !== repeatPassword) {
      toast.error(t("auth.signUp.passwordMismatch"), {
        position: "top-center",
      });
      return;
    }
    if (!agreeTerms) {
      toast.error(t("auth.signUp.agreeRequired"), { position: "top-center" });
      return;
    }
    try {
      await verifyCode({ email, requestId: request_id, code });
      await confirmReset({
        email,
        requestId: request_id,
        newPassword: password,
      });
      toast.success(t("auth.resetPassword.success"), {
        position: "top-center",
      });
      navigate("/sign-in", { replace: true });
    } catch {
      // error toast handled by mutation onError callbacks
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center">
        <h1 className="mb-1 text-2xl font-semibold text-black">
          {t("auth.resetPassword.title")}
        </h1>
        <p className="mb-2 text-sm text-black/55">
          {t("auth.resetPassword.codeSentTo")}
        </p>
        <p className="mb-8 text-sm font-semibold text-black">{email}</p>

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-black/55">
              {t("auth.resetPassword.sixDigitLabel")}
            </span>
            <InputOTP maxLength={6} value={code} onChange={setCode}>
              <InputOTPGroup className="gap-2">
                <InputOTPSlot index={0} className="h-11 w-11 rounded-xl border-black/10" />
                <InputOTPSlot index={1} className="h-11 w-11 rounded-xl border-black/10" />
                <InputOTPSlot index={2} className="h-11 w-11 rounded-xl border-black/10" />
                <InputOTPSlot index={3} className="h-11 w-11 rounded-xl border-black/10" />
                <InputOTPSlot index={4} className="h-11 w-11 rounded-xl border-black/10" />
                <InputOTPSlot index={5} className="h-11 w-11 rounded-xl border-black/10" />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder={t("auth.resetPassword.newPassword")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isPending}
              className="rounded-2xl border-black/10 px-4 py-3 pr-10 text-sm placeholder:text-black/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={
                showPassword ? t("auth.hidePassword") : t("auth.showPassword")
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-black/20 hover:text-black"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <PasswordStrength password={password} />
          <p className="text-xs text-black/55">
            {t("auth.signUp.passwordHint")}
          </p>
          <Input
            type="password"
            placeholder={t("auth.resetPassword.repeatPassword")}
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            disabled={isPending}
            className="rounded-2xl border-black/10 px-4 py-3 text-sm placeholder:text-black/20"
          />
          <label className="flex items-center gap-2">
            <Checkbox
              checked={agreeTerms}
              onCheckedChange={(v) => setAgreeTerms(v === true)}
              disabled={isPending}
            />
            <span className="text-sm text-black">
              {t("auth.signUp.acceptTerms")}{" "}
              <button type="button" className="text-[#adadfb] hover:underline">
                {t("auth.signUp.terms")}
              </button>
            </span>
          </label>
          <Button
            type="submit"
            disabled={isPending}
            className="w-full rounded-2xl bg-black py-3 text-sm font-medium text-white hover:bg-black/80"
          >
            {t("auth.resetPassword.submit")}
          </Button>
        </form>

        <p className="mt-4 text-sm text-black/55">
          {t("auth.resetPassword.remembered")}{" "}
          <Link to="/sign-in" className="text-[#adadfb] hover:underline">
            {t("auth.resetPassword.signInLink")}
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
