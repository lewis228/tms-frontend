// System User 편집 — SUPER_ADMIN 전용. tenantId 필수 (헤더 명시).
//
// CREATE: email/name/password/role/phone. SUPER_ADMIN 은 셀렉트 비활성.
// EDIT: name/phone/isActive/role. email/password 는 별도 (User 셀프 변경).
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCreateUser } from "@/hooks/mutations/user/use-create-user";
import { useUpdateUser } from "@/hooks/mutations/user/use-update-user";
import { generateErrorMessage } from "@/lib/error";
import { useSystemUserEditorModal } from "@/store/system-user-editor-modal";
import type { UserRole } from "@/types";

const ROLES: UserRole[] = ["SUPER_ADMIN", "ADMIN", "DISPATCHER", "DRIVER"];

type OpenModal = Extract<
  ReturnType<typeof useSystemUserEditorModal>,
  { isOpen: true }
>;

export default function SystemUserEditorModal() {
  const modal = useSystemUserEditorModal();
  return (
    <Dialog
      open={modal.isOpen}
      onOpenChange={(o) => !o && modal.actions.close()}
    >
      <DialogContent>
        {modal.isOpen && (
          <Body
            key={modal.type === "EDIT" ? `e-${modal.user.id}` : "c"}
            modal={modal}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function Body({ modal }: { modal: OpenModal }) {
  const [email, setEmail] = useState(
    modal.type === "CREATE" ? "" : modal.user.email,
  );
  const [name, setName] = useState(
    modal.type === "CREATE" ? "" : modal.user.name,
  );
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState(
    modal.type === "CREATE" ? "" : (modal.user.phone ?? ""),
  );
  const [role, setRole] = useState<UserRole>(
    modal.type === "CREATE" ? "DISPATCHER" : modal.user.role,
  );
  const [isActive, setIsActive] = useState(
    modal.type === "CREATE" ? true : modal.user.isActive,
  );

  const { mutate: createU, isPending: isCreatePending } = useCreateUser({
    onSuccess: () => {
      toast.success("사용자가 생성되었습니다.", { position: "top-center" });
      modal.actions.close();
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const { mutate: updateU, isPending: isUpdatePending } = useUpdateUser({
    onSuccess: () => {
      toast.success("사용자가 수정되었습니다.", { position: "top-center" });
      modal.actions.close();
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const isPending = isCreatePending || isUpdatePending;

  const handleSave = () => {
    if (!name.trim()) return;
    if (modal.type === "CREATE") {
      if (!email.trim() || !password.trim()) {
        toast.error("이메일과 비밀번호를 입력하세요.", {
          position: "top-center",
        });
        return;
      }
      if (password.length < 8) {
        toast.error("비밀번호는 8자 이상.", { position: "top-center" });
        return;
      }
      createU({
        tenantId: modal.tenantId,
        payload: {
          email: email.trim(),
          name: name.trim(),
          password,
          role,
          phone: phone.trim() || null,
        },
      });
    } else {
      updateU({
        id: modal.user.id,
        tenantId: modal.tenantId,
        payload: {
          name: name.trim(),
          phone: phone.trim() || null,
          role,
          isActive,
        },
      });
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-sans">
          {modal.type === "CREATE" ? "사용자 생성" : "사용자 수정"}
        </DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-3">
        <Field label="이메일" required>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending || modal.type === "EDIT"}
          />
        </Field>
        <Field label="이름" required>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
            maxLength={128}
          />
        </Field>
        {modal.type === "CREATE" && (
          <Field label="비밀번호 (최소 8자)" required>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isPending}
              minLength={8}
            />
          </Field>
        )}
        <Field label="전화">
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isPending}
          />
        </Field>
        <Field label="Role" required>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            disabled={isPending}
            className="rounded-md border bg-background px-3 py-2 text-sm"
          >
            {ROLES.map((r) => (
              <option key={r} value={r} disabled={r === "SUPER_ADMIN"}>
                {r}
                {r === "SUPER_ADMIN" ? " (API 생성 불가)" : ""}
              </option>
            ))}
          </select>
          {role === "DRIVER" && (
            <span className="text-xs text-amber-600">
              ⚠ Driver 메타(license/truck)까지 입력하려면 /app/master/drivers
              에서 생성하세요.
            </span>
          )}
        </Field>
        {modal.type === "EDIT" && (
          <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm">
            <input
              id="isActive"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              disabled={isPending}
            />
            <label htmlFor="isActive">Active</label>
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button
          variant="outline"
          onClick={() => modal.actions.close()}
          disabled={isPending}
        >
          취소
        </Button>
        <Button
          onClick={handleSave}
          disabled={
            isPending ||
            !name.trim() ||
            (modal.type === "CREATE" && (!email.trim() || password.length < 8))
          }
        >
          저장
        </Button>
      </div>
    </>
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
    <div className="flex flex-col gap-1">
      <label className="text-xs text-muted-foreground">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}
