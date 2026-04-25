import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import AuthLayout from "@/components/layout/auth-layout";
import { Eye, EyeOff } from "lucide-react";
import { useRequestSignupEmailCode } from "@/hooks/mutations/auth/use-request-signup-email-code";
import { useSignInWithOAuth } from "@/hooks/mutations/auth/use-sign-in-with-oauth";
import { useConsumeRedirect } from "@/store/redirect";
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

export default function SignUpPage() {
  const navigate = useNavigate();
  const consumeRedirect = useConsumeRedirect();
  const { t } = useTranslation();

  const { mutateAsync: requestCode, isPending: isRequestPending } =
    useRequestSignupEmailCode({
      onError: (error) => {
        toast.error(generateErrorMessage(error), { position: "top-center" });
      },
    });

  const { mutate: signInWithOAuth, isPending: isOAuthPending } =
    useSignInWithOAuth({
      onSuccess: () => {
        const target = consumeRedirect() ?? "/app";
        navigate(target, { replace: true });
      },
      onError: (error) => {
        toast.error(generateErrorMessage(error), { position: "top-center" });
      },
    });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPending = isRequestPending || isOAuthPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
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
      const data = await requestCode(email);
      toast.info(t("auth.signUp.codeSent"), { position: "top-center" });
      navigate("/two-step-verification", {
        replace: true,
        state: { email, password, request_id: data.request_id },
      });
    } catch {
      // error toast handled by onError callback
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center">
        <h1 className="mb-1 text-2xl font-semibold text-black">
          {t("auth.signUp.title")}
        </h1>
        <p className="mb-6 text-sm text-black/55">{t("auth.signUp.subtitle")}</p>

        <div className="mb-6 flex w-full gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => signInWithOAuth("apple")}
            disabled={isPending}
            className="flex-1 gap-2 rounded-2xl border-black/10 py-2.5 text-sm text-black hover:bg-black/[0.02]"
          >
            <img src="/icons/apple-logo.svg" alt="Apple" className="h-4 w-4" />
            {t("auth.appleButton")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => signInWithOAuth("google")}
            disabled={isPending}
            className="flex-1 gap-2 rounded-2xl border-black/10 py-2.5 text-sm text-black hover:bg-black/[0.02]"
          >
            <img src="/icons/google-logo.svg" alt="Google" className="h-4 w-4" />
            {t("auth.googleButton")}
          </Button>
        </div>

        <div className="mb-6 flex w-full items-center gap-4">
          <Separator className="flex-1 bg-black/10" />
          <span className="text-xs text-black/55">{t("auth.orWithEmail")}</span>
          <Separator className="flex-1 bg-black/10" />
        </div>

        <form onSubmit={handleSubmit} className="mb-6 flex w-full flex-col gap-4">
          <Input
            type="email"
            placeholder={t("auth.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
            className="rounded-2xl border-black/10 px-4 py-3 text-sm placeholder:text-black/20"
          />
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder={t("auth.passwordPlaceholder")}
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
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <PasswordStrength password={password} />
          <p className="text-xs text-black/55">
            {t("auth.signUp.passwordHint")}
          </p>
          <Input
            type="password"
            placeholder={t("auth.signUp.repeatPlaceholder")}
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
            {t("auth.signUp.submit")}
          </Button>
        </form>

        <p className="text-sm text-black/55">
          {t("auth.signUp.already")}{" "}
          <Link to="/sign-in" className="text-[#adadfb] hover:underline">
            {t("auth.signUp.signInLink")}
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
