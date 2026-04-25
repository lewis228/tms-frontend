import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AuthLayout from "@/components/layout/auth-layout";
import { useRequestPasswordResetEmail } from "@/hooks/mutations/auth/use-request-password-reset-email";
import { generateErrorMessage } from "@/lib/error";
import { toast } from "sonner";

export default function ForgetPasswordPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { mutateAsync: requestReset, isPending } = useRequestPasswordResetEmail({
    onError: (error) => {
      toast.error(generateErrorMessage(error), { position: "top-center" });
    },
  });

  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      const data = await requestReset(email);
      toast.info(t("auth.forgetPassword.codeSent"), {
        position: "top-center",
      });
      navigate("/reset-password", {
        replace: true,
        state: { email, request_id: data.request_id },
      });
    } catch {
      // error toast handled by onError callback
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center">
        <h1 className="mb-1 text-2xl font-semibold text-black">
          {t("auth.forgetPassword.title")}
        </h1>
        <p className="mb-8 text-sm text-black/55">
          {t("auth.forgetPassword.subtitle")}
        </p>

        <form onSubmit={handleSubmit} className="mb-4 flex w-full flex-col gap-5">
          <Input
            type="email"
            placeholder={t("auth.forgetPassword.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
            className="rounded-2xl border-black/10 px-4 py-3 text-sm placeholder:text-black/20"
          />
          <Button
            type="submit"
            disabled={isPending}
            className="w-full rounded-2xl bg-black py-3 text-sm font-medium text-white hover:bg-black/80"
          >
            {t("auth.forgetPassword.submit")}
          </Button>
        </form>

        <Link to="/sign-in" className="text-sm text-[#adadfb] hover:underline">
          {t("auth.forgetPassword.back")}
        </Link>
      </div>
    </AuthLayout>
  );
}
