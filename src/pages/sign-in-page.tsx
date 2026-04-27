import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import AuthLayout from "@/components/layout/auth-layout";
import { useSignInWithPassword } from "@/hooks/mutations/auth/use-sign-in-with-password";
import { useSignInWithOAuth } from "@/hooks/mutations/auth/use-sign-in-with-oauth";
import { useConsumeRedirect } from "@/store/redirect";
import { generateErrorMessage } from "@/lib/error";
import { toast } from "sonner";

export default function SignInPage() {
  const navigate = useNavigate();
  const consumeRedirect = useConsumeRedirect();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignInSuccess = () => {
    const target = consumeRedirect() ?? "/app";
    navigate(target, { replace: true });
  };

  const { mutate: signInWithPassword, isPending: isSignInPending } =
    useSignInWithPassword({
      onSuccess: handleSignInSuccess,
      onError: (error) => {
        toast.error(generateErrorMessage(error), { position: "top-center" });
      },
    });

  const { mutate: signInWithOAuth, isPending: isOAuthPending } =
    useSignInWithOAuth({
      onSuccess: handleSignInSuccess,
      onError: (error) => {
        toast.error(generateErrorMessage(error), { position: "top-center" });
      },
    });

  const isPending = isSignInPending || isOAuthPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    signInWithPassword({ email, password });
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center">
        <h1 className="mb-1 text-2xl font-semibold text-black">
          {t("auth.signIn.title")}
        </h1>
        <p className="mb-6 text-sm text-black/55">{t("auth.signIn.subtitle")}</p>

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
          <Input
            type="password"
            placeholder={t("auth.passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isPending}
            className="rounded-2xl border-black/10 px-4 py-3 text-sm placeholder:text-black/20"
          />
          <div className="flex justify-end">
            <Link
              to="/forget-password"
              className="text-sm text-[#adadfb] hover:underline"
            >
              {t("auth.signIn.forgot")}
            </Link>
          </div>
          <Button
            type="submit"
            disabled={isPending}
            className="w-full rounded-2xl bg-black py-3 text-sm font-medium text-white hover:bg-black/80"
          >
            {t("auth.signIn.submit")}
          </Button>
        </form>

        <p className="text-sm text-black/55">
          {t("auth.signIn.notMember")}{" "}
          <Link to="/sign-up" className="text-[#adadfb] hover:underline">
            {t("auth.signIn.signUpLink")}
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
