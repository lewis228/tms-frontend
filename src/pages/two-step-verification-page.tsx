import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Smartphone } from "lucide-react";
import AuthLayout from "@/components/layout/auth-layout";
import { useVerifySignupEmailCode } from "@/hooks/mutations/auth/use-verify-signup-email-code";
import { useSignUp } from "@/hooks/mutations/auth/use-sign-up";
import { useConsumeRedirect } from "@/store/redirect";
import { generateErrorMessage } from "@/lib/error";
import { toast } from "sonner";

type LocationState = {
  email?: string;
  password?: string;
  request_id?: string;
};

export default function TwoStepVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const consumeRedirect = useConsumeRedirect();
  const state = location.state as LocationState | null;
  const { t } = useTranslation();

  const { mutateAsync: verifyCode, isPending: isVerifyPending } =
    useVerifySignupEmailCode({
      onError: (error) => {
        toast.error(generateErrorMessage(error), { position: "top-center" });
      },
    });

  const { mutateAsync: signUp, isPending: isSignUpPending } = useSignUp({
    onError: (error) => {
      toast.error(generateErrorMessage(error), { position: "top-center" });
    },
  });

  const [code, setCode] = useState("");

  if (!state?.email || !state?.password || !state?.request_id) {
    return <Navigate to="/sign-up" replace />;
  }

  const { email, password, request_id } = state;
  const isPending = isVerifyPending || isSignUpPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) {
      toast.error(t("auth.twoStep.sixDigitRequired"), {
        position: "top-center",
      });
      return;
    }
    try {
      await verifyCode({ email, requestId: request_id, code });
      await signUp({ email, password, requestId: request_id });
      toast.success(t("auth.twoStep.success"), { position: "top-center" });
      const target = consumeRedirect() ?? "/app";
      navigate(target, { replace: true });
    } catch {
      // error toast handled by mutation onError callbacks
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center">
        <Smartphone className="mb-4 h-10 w-10 text-black" />
        <h1 className="mb-1 text-2xl font-semibold text-black">
          {t("auth.twoStep.title")}
        </h1>
        <p className="mb-2 text-sm text-black/55">
          {t("auth.twoStep.sentTo")}
        </p>
        <p className="mb-6 text-lg font-semibold text-black">{email}</p>
        <p className="mb-4 text-sm text-black">
          {t("auth.twoStep.instruction")}
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex w-full flex-col items-center gap-6"
        >
          <InputOTP maxLength={6} value={code} onChange={setCode}>
            <InputOTPGroup className="gap-2">
              <InputOTPSlot index={0} className="h-12 w-12 rounded-2xl border-black/10 text-lg" />
              <InputOTPSlot index={1} className="h-12 w-12 rounded-2xl border-black/10 text-lg" />
              <InputOTPSlot index={2} className="h-12 w-12 rounded-2xl border-black/10 text-lg" />
              <InputOTPSlot index={3} className="h-12 w-12 rounded-2xl border-black/10 text-lg" />
              <InputOTPSlot index={4} className="h-12 w-12 rounded-2xl border-black/10 text-lg" />
              <InputOTPSlot index={5} className="h-12 w-12 rounded-2xl border-black/10 text-lg" />
            </InputOTPGroup>
          </InputOTP>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full rounded-2xl bg-black py-3 text-sm font-medium text-white hover:bg-black/80"
          >
            {t("auth.twoStep.submit")}
          </Button>
        </form>

        <p className="mt-4 text-sm text-black/55">
          {t("auth.twoStep.noCode")}{" "}
          <button type="button" className="text-[#adadfb] hover:underline">
            {t("auth.twoStep.resend")}
          </button>
          {" "}{t("auth.twoStep.or")}{" "}
          <button type="button" className="text-[#adadfb] hover:underline">
            {t("auth.twoStep.callUs")}
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}
