// /app/onboarding — 신규 team 의 첫 사용자가 거치는 3단계 wizard.
//
// step 1: 회사 정보 (회사명/timezone/전화)
// step 2: 첫 customer 등록
// step 3: 첫 driver 등록 → onboarding_completed=true → 대시보드로
//
// 이미 완료된 사용자가 와도 안전하게 step 4 ("완료") 화면 표시.
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Fallback from "@/components/fallback";
import { useUpdateTeam } from "@/hooks/mutations/team/use-update-team";
import { useUpdateOnboarding } from "@/hooks/mutations/team/use-update-onboarding";
import { useCreateCustomer } from "@/hooks/mutations/customer/use-create-customer";
import { useCreateDriver } from "@/hooks/mutations/driver/use-create-driver";
import { useCurrentTeamId, useCurrentUser } from "@/store/auth";
import { generateErrorMessage } from "@/lib/error";

export default function OnboardingPage() {
  const user = useCurrentUser();
  const teamId = useCurrentTeamId();
  const navigate = useNavigate();

  const membership = useMemo(
    () => user?.teams.find((t) => t.teamId === teamId) ?? null,
    [user, teamId],
  );

  // 진행 step 결정 — 이미 끝난 단계는 자동으로 다음으로.
  const initialStep =
    !membership ? 1
    : membership.onboardingCompleted ? 4
    : !membership.onboardingStep1Done ? 1
    : !membership.onboardingStep2Done ? 2
    : !membership.onboardingStep3Done ? 3
    : 4;

  const [step, setStep] = useState<number>(initialStep);

  if (!user || !teamId || !membership) {
    return (
      <div className="p-6">
        <Fallback />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <Header step={step} />
      {step === 1 && (
        <Step1 teamId={teamId} onDone={() => setStep(2)} />
      )}
      {step === 2 && (
        <Step2 teamId={teamId} onDone={() => setStep(3)} />
      )}
      {step === 3 && (
        <Step3 teamId={teamId} onDone={() => setStep(4)} />
      )}
      {step === 4 && (
        <Done onContinue={() => navigate("/app", { replace: true })} />
      )}
    </div>
  );
}

function Header({ step }: { step: number }) {
  const { t } = useTranslation();
  const stages: { idx: number; label: string }[] = [
    { idx: 1, label: t("onboarding.stepCompany") },
    { idx: 2, label: t("onboarding.stepCustomer") },
    { idx: 3, label: t("onboarding.stepDriver") },
  ];
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold">{t("onboarding.title")}</h1>
      <p className="text-sm text-muted-foreground">{t("onboarding.subtitle")}</p>
      <div className="mt-2 flex items-center gap-2">
        {stages.map((s, i) => {
          const done = step > s.idx;
          const current = step === s.idx;
          return (
            <div key={s.idx} className="flex items-center gap-2">
              <div
                className={
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium " +
                  (done
                    ? "bg-green-600 text-white"
                    : current
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground")
                }
              >
                {done ? <Check className="h-3 w-3" /> : s.idx}
              </div>
              <span
                className={
                  "text-sm " +
                  (current ? "font-medium" : "text-muted-foreground")
                }
              >
                {s.label}
              </span>
              {i < stages.length - 1 && (
                <span className="mx-2 h-px w-8 bg-border" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Step 1: 회사 정보 ─────────────────────────────────────────
function Step1({ teamId, onDone }: { teamId: number; onDone: () => void }) {
  const { t } = useTranslation();
  const [companyName, setCompanyName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [timezone, setTimezone] = useState("Asia/Seoul");

  const { mutate: updateOnb, isPending: isOnbPending } = useUpdateOnboarding({
    onSuccess: () => onDone(),
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });
  const { mutate: updateT, isPending: isUpdatePending } = useUpdateTeam({
    onSuccess: () => updateOnb({ teamId, payload: { step1Done: true } }),
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const isPending = isUpdatePending || isOnbPending;

  const handleNext = () => {
    if (!companyName.trim()) {
      toast.error(t("onboarding.validation.companyNameRequired"), {
        position: "top-center",
      });
      return;
    }
    updateT({
      id: teamId,
      payload: {
        companyName: companyName.trim(),
        phoneNumber: phoneNumber.trim() || null,
        timezone: timezone.trim() || null,
      },
    });
  };

  return (
    <Card title={t("onboarding.step1Title")}>
      <Field label={t("onboarding.field.companyName")} required>
        <Input
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Acme Drayage Inc."
          disabled={isPending}
        />
      </Field>
      <Field label={t("onboarding.field.phoneNumber")}>
        <Input
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="02-1234-5678"
          disabled={isPending}
        />
      </Field>
      <Field label={t("onboarding.field.timezone")}>
        <Input
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          placeholder="Asia/Seoul"
          disabled={isPending}
        />
      </Field>
      <Footer>
        <Button onClick={handleNext} disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("common.next")}
        </Button>
      </Footer>
    </Card>
  );
}

// ── Step 2: 첫 고객사 ─────────────────────────────────────────
function Step2({ teamId, onDone }: { teamId: number; onDone: () => void }) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const { mutate: updateOnb, isPending: isOnbPending } = useUpdateOnboarding({
    onSuccess: () => onDone(),
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });
  const { mutate: createC, isPending: isCreatePending } = useCreateCustomer({
    onSuccess: () => updateOnb({ teamId, payload: { step2Done: true } }),
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const isPending = isCreatePending || isOnbPending;

  const handleNext = () => {
    if (!name.trim()) {
      toast.error(t("onboarding.validation.customerNameRequired"), {
        position: "top-center",
      });
      return;
    }
    createC({
      name: name.trim(),
      code: code.trim() || null,
    });
  };

  return (
    <Card title={t("onboarding.step2Title")}>
      <p className="text-xs text-muted-foreground">{t("onboarding.step2Hint")}</p>
      <Field label={t("onboarding.field.customerName")} required>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Acme Logistics"
          disabled={isPending}
        />
      </Field>
      <Field label={t("onboarding.field.customerCode")}>
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="ACME"
          disabled={isPending}
        />
      </Field>
      <Footer>
        <Button onClick={handleNext} disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("common.next")}
        </Button>
      </Footer>
    </Card>
  );
}

// ── Step 3: 첫 기사 ───────────────────────────────────────────
function Step3({ teamId, onDone }: { teamId: number; onDone: () => void }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const { mutate: updateOnb, isPending: isOnbPending } = useUpdateOnboarding({
    onSuccess: () => onDone(),
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });
  const { mutate: createD, isPending: isCreatePending } = useCreateDriver({
    onSuccess: (created) => {
      setTempPassword(created.tempPassword);
      updateOnb({
        teamId,
        payload: { step3Done: true, completed: true },
      });
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const isPending = isCreatePending || isOnbPending;

  const handleNext = () => {
    if (!email.trim() || !name.trim()) {
      toast.error(t("onboarding.validation.driverFieldsRequired"), {
        position: "top-center",
      });
      return;
    }
    createD({
      email: email.trim(),
      name: name.trim(),
      phone: phone.trim() || null,
    });
  };

  return (
    <Card title={t("onboarding.step3Title")}>
      <p className="text-xs text-muted-foreground">{t("onboarding.step3Hint")}</p>
      <Field label={t("onboarding.field.driverEmail")} required>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="driver@example.com"
          disabled={isPending || tempPassword !== null}
        />
      </Field>
      <Field label={t("onboarding.field.driverName")} required>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("onboarding.field.driverNamePlaceholder")}
          disabled={isPending || tempPassword !== null}
        />
      </Field>
      <Field label={t("onboarding.field.driverPhone")}>
        <Input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="010-1234-5678"
          disabled={isPending || tempPassword !== null}
        />
      </Field>
      {tempPassword && (
        <div className="rounded-md border bg-yellow-50 p-3 text-sm">
          <strong>{t("onboarding.tempPasswordTitle")}</strong>{" "}
          <code className="font-mono">{tempPassword}</code>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("onboarding.tempPasswordHint")}
          </p>
        </div>
      )}
      <Footer>
        {tempPassword === null ? (
          <Button onClick={handleNext} disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("onboarding.register")}
          </Button>
        ) : (
          <Button onClick={onDone}>{t("onboarding.goToDone")}</Button>
        )}
      </Footer>
    </Card>
  );
}

// ── 완료 ─────────────────────────────────────────────────────
function Done({ onContinue }: { onContinue: () => void }) {
  const { t } = useTranslation();
  return (
    <Card title={t("onboarding.doneTitle")}>
      <p className="text-sm">{t("onboarding.doneDescription")}</p>
      <Footer>
        <Button onClick={onContinue}>{t("onboarding.goToDashboard")}</Button>
      </Footer>
    </Card>
  );
}

// ── 공용 ─────────────────────────────────────────────────────
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-md border bg-background p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </span>
      {children}
    </label>
  );
}

function Footer({ children }: { children: React.ReactNode }) {
  return <div className="flex justify-end gap-2 pt-2">{children}</div>;
}
