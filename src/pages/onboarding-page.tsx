// /app/onboarding — 신규 tenant 의 첫 사용자가 거치는 3단계 wizard.
//
// step 1: 회사 정보 (회사명/timezone/전화)
// step 2: 첫 customer 등록
// step 3: 첫 driver 등록 → onboarding_completed=true → 대시보드로
//
// 이미 완료된 사용자가 와도 안전하게 step 4 ("완료") 화면 표시.
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Fallback from "@/components/fallback";
import { useUpdateTenant } from "@/hooks/mutations/tenant/use-update-tenant";
import { useUpdateOnboarding } from "@/hooks/mutations/tenant/use-update-onboarding";
import { useCreateCustomer } from "@/hooks/mutations/customer/use-create-customer";
import { useCreateDriver } from "@/hooks/mutations/driver/use-create-driver";
import { useCurrentTenantId, useCurrentUser } from "@/store/auth";
import { generateErrorMessage } from "@/lib/error";

export default function OnboardingPage() {
  const user = useCurrentUser();
  const tenantId = useCurrentTenantId();
  const navigate = useNavigate();

  const membership = useMemo(
    () => user?.tenants.find((t) => t.tenantId === tenantId) ?? null,
    [user, tenantId],
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

  if (!user || !tenantId || !membership) {
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
        <Step1 tenantId={tenantId} onDone={() => setStep(2)} />
      )}
      {step === 2 && (
        <Step2 tenantId={tenantId} onDone={() => setStep(3)} />
      )}
      {step === 3 && (
        <Step3 tenantId={tenantId} onDone={() => setStep(4)} />
      )}
      {step === 4 && (
        <Done onContinue={() => navigate("/app", { replace: true })} />
      )}
    </div>
  );
}

function Header({ step }: { step: number }) {
  const stages: { idx: number; label: string }[] = [
    { idx: 1, label: "회사 정보" },
    { idx: 2, label: "첫 고객사" },
    { idx: 3, label: "첫 기사" },
  ];
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold">TMS Pro 시작하기</h1>
      <p className="text-sm text-muted-foreground">
        간단한 3단계만 마치면 운송 운영을 시작할 수 있습니다.
      </p>
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
function Step1({ tenantId, onDone }: { tenantId: number; onDone: () => void }) {
  const [companyName, setCompanyName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [timezone, setTimezone] = useState("Asia/Seoul");

  const { mutate: updateOnb, isPending: isOnbPending } = useUpdateOnboarding({
    onSuccess: () => onDone(),
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });
  const { mutate: updateT, isPending: isUpdatePending } = useUpdateTenant({
    onSuccess: () => updateOnb({ tenantId, payload: { step1Done: true } }),
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const isPending = isUpdatePending || isOnbPending;

  const handleNext = () => {
    if (!companyName.trim()) {
      toast.error("회사명을 입력하세요.", { position: "top-center" });
      return;
    }
    updateT({
      id: tenantId,
      payload: {
        companyName: companyName.trim(),
        phoneNumber: phoneNumber.trim() || null,
        timezone: timezone.trim() || null,
      },
    });
  };

  return (
    <Card title="1. 회사 정보">
      <Field label="회사명" required>
        <Input
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Acme Drayage Inc."
          disabled={isPending}
        />
      </Field>
      <Field label="대표 전화">
        <Input
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="02-1234-5678"
          disabled={isPending}
        />
      </Field>
      <Field label="Timezone">
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
          다음
        </Button>
      </Footer>
    </Card>
  );
}

// ── Step 2: 첫 고객사 ─────────────────────────────────────────
function Step2({ tenantId, onDone }: { tenantId: number; onDone: () => void }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const { mutate: updateOnb, isPending: isOnbPending } = useUpdateOnboarding({
    onSuccess: () => onDone(),
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });
  const { mutate: createC, isPending: isCreatePending } = useCreateCustomer({
    onSuccess: () => updateOnb({ tenantId, payload: { step2Done: true } }),
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const isPending = isCreatePending || isOnbPending;

  const handleNext = () => {
    if (!name.trim()) {
      toast.error("고객사 이름을 입력하세요.", { position: "top-center" });
      return;
    }
    createC({
      name: name.trim(),
      code: code.trim() || null,
    });
  };

  return (
    <Card title="2. 첫 고객사 등록">
      <p className="text-xs text-muted-foreground">
        나중에 마스터 데이터에서 추가/수정할 수 있습니다.
      </p>
      <Field label="고객사 이름" required>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Acme Logistics"
          disabled={isPending}
        />
      </Field>
      <Field label="코드">
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
          다음
        </Button>
      </Footer>
    </Card>
  );
}

// ── Step 3: 첫 기사 ───────────────────────────────────────────
function Step3({ tenantId, onDone }: { tenantId: number; onDone: () => void }) {
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
      // step3 완료 + completed=true 한꺼번에
      updateOnb({
        tenantId,
        payload: { step3Done: true, completed: true },
      });
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const isPending = isCreatePending || isOnbPending;

  const handleNext = () => {
    if (!email.trim() || !name.trim()) {
      toast.error("이메일과 이름을 입력하세요.", { position: "top-center" });
      return;
    }
    createD({
      email: email.trim(),
      name: name.trim(),
      phone: phone.trim() || null,
    });
  };

  return (
    <Card title="3. 첫 기사 등록">
      <p className="text-xs text-muted-foreground">
        기사가 모바일 앱에 로그인할 이메일을 입력하세요. 임시 비밀번호는 등록
        직후 1회 표시됩니다.
      </p>
      <Field label="이메일" required>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="driver@example.com"
          disabled={isPending || tempPassword !== null}
        />
      </Field>
      <Field label="이름" required>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="홍길동"
          disabled={isPending || tempPassword !== null}
        />
      </Field>
      <Field label="전화">
        <Input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="010-1234-5678"
          disabled={isPending || tempPassword !== null}
        />
      </Field>
      {tempPassword && (
        <div className="rounded-md border bg-yellow-50 p-3 text-sm">
          <strong>임시 비밀번호:</strong>{" "}
          <code className="font-mono">{tempPassword}</code>
          <p className="mt-1 text-xs text-muted-foreground">
            기사에게 별도로 전달하세요. 첫 로그인 시 변경하게 됩니다.
          </p>
        </div>
      )}
      <Footer>
        {tempPassword === null ? (
          <Button onClick={handleNext} disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            등록
          </Button>
        ) : (
          <Button onClick={onDone}>완료로 이동</Button>
        )}
      </Footer>
    </Card>
  );
}

// ── 완료 ─────────────────────────────────────────────────────
function Done({ onContinue }: { onContinue: () => void }) {
  return (
    <Card title="설정 완료 ✨">
      <p className="text-sm">
        TMS Pro 의 기본 데이터가 준비되었습니다. 이제 D/O 를 생성하고 운송을
        시작할 수 있습니다.
      </p>
      <Footer>
        <Button onClick={onContinue}>대시보드로</Button>
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
