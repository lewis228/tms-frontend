# src/components/modal/CLAUDE.md — 전역 모달 본체

> **이 폴더의 책임.** `ModalProvider` 가 `createPortal` 로 `#modal-root` 에 한 번만 마운트하는 전역 모달 본체들. 각 모달은 자기 열림 상태를 Zustand 스토어에서 구독.
>
> **상위 문서.** [루트](../../../CLAUDE.md) · [src](../../CLAUDE.md) · [components](../CLAUDE.md)

---

## 1. 핵심 원칙

### 1.1 본체는 한 곳에서만 마운트

모든 전역 모달은 `components/modal/*-modal.tsx` 로 본체 작성 → **`provider/modal-provider.tsx` 가 `createPortal` 로 `#modal-root` 에 단 한 번 마운트**. 다른 곳에서 같은 모달을 또 렌더하지 않는다.

**WHY.**
- 모달을 컴포넌트 트리 안에 두면 부모의 `overflow: hidden` / `transform` / z-index 에 종속 → 잘리는 버그 흔함.
- 같은 모달을 여러 곳에서 렌더하면 DOM 중복 → 포커스 / 애니메이션 / z-index 꼬임.
- `ModalProvider` 한 번 마운트가 정답.

### 1.2 상태는 Zustand 스토어에서 구독

모달 본체는 자기 스토어를 통해 open/close + 데이터를 받는다. **버튼은 스토어의 `open` 액션만 호출**한다.

```tsx
// 버튼
const openAlertModal = useOpenAlertModal();
<button onClick={() => openAlertModal({ title, description, onPositive })}>삭제</button>

// 본체는 스토어 구독
const alertModal = useAlertModal();
<AlertDialog open={alertModal.isOpen} ... />
```

스토어 규칙은 [`src/store/CLAUDE.md`](../../store/CLAUDE.md).

---

## 2. 현재 모달

| 파일 | 스토어 | 용도 |
| --- | --- | --- |
| `alert-modal.tsx` | `store/alert-modal.ts` | 전역 확인/취소 (파괴적 액션 confirm) |
| `profile-editor-modal.tsx` | `store/profile-editor-modal.ts` | 프로필 편집 폼 |

**새 모달 추가 시** 예시:
- `components/modal/shipping-line-editor-modal.tsx` — 선사 정보 편집
- `components/modal/container-detail-modal.tsx` — 컨테이너 상세 정보

---

## 3. Dialog (일반 모달) vs AlertDialog (확인 전용)

| 컴포넌트 | 용도 |
| --- | --- |
| `Dialog` (`components/ui/dialog.tsx`) | 폼 / 에디터 / 상세보기 — 닫기 버튼, overlay 클릭 / Esc 로 닫힘 |
| `AlertDialog` (`components/ui/alert-dialog.tsx`) | 파괴적/비가역 액션 확인 — overlay 클릭으로 닫히지 않음, 확인/취소 버튼 필수 |

**규칙.**
- "삭제하시겠습니까?" 같은 확인 → `AlertDialog` + `AlertModal` 스토어
- "편집 폼 열기" → `Dialog` + `<Thing>EditorModal` 스토어

---

## 4. AlertModal 본체 (실제 코드)

```tsx
// src/components/modal/alert-modal.tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAlertModal } from "@/store/alert-modal";

export default function AlertModal() {
  const alertModal = useAlertModal();

  const handleOpenChange = (open: boolean) => {
    if (!open) alertModal.actions.close();
  };

  const handlePositive = () => {
    if (alertModal.isOpen && alertModal.onPositive) alertModal.onPositive();
    alertModal.actions.close();
  };

  const handleNegative = () => {
    if (alertModal.isOpen && alertModal.onNegative) alertModal.onNegative();
    alertModal.actions.close();
  };

  return (
    <AlertDialog open={alertModal.isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {alertModal.isOpen ? alertModal.title : ""}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {alertModal.isOpen ? alertModal.description : ""}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleNegative}>취소</AlertDialogCancel>
          <AlertDialogAction onClick={handlePositive}>확인</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

**사용 예** (다른 컴포넌트에서):
```tsx
const openAlertModal = useOpenAlertModal();

openAlertModal({
  title: "삭제하시겠습니까?",
  description: "복구할 수 없습니다.",
  onPositive: () => deleteItem(id),
});
```

---

## 5. Editor Modal 본체 표준 템플릿

```tsx
// src/components/modal/<domain>-editor-modal.tsx (CREATE/EDIT DU 예시)
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCreateXxx } from "@/hooks/mutations/<domain>/use-create-xxx";
import { useUpdateXxx } from "@/hooks/mutations/<domain>/use-update-xxx";
import { generateErrorMessage } from "@/lib/error";
import { useOpenAlertModal } from "@/store/alert-modal";
import { useXxxEditorModal } from "@/store/xxx-editor-modal";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function XxxEditorModal() {
  const xxxEditorModal = useXxxEditorModal();
  const openAlertModal = useOpenAlertModal();

  const { mutate: createXxx, isPending: isCreatePending } = useCreateXxx({
    onSuccess: () => xxxEditorModal.actions.close(),
    onError: (error) => {
      toast.error(generateErrorMessage(error), { position: "top-center" });
    },
  });

  const { mutate: updateXxx, isPending: isUpdatePending } = useUpdateXxx({
    onSuccess: () => xxxEditorModal.actions.close(),
    onError: (error) => {
      toast.error(generateErrorMessage(error), { position: "top-center" });
    },
  });

  const [name, setName] = useState("");
  // ... 다른 필드

  // §6 — 폼 상태 초기화 (모달 열림 전이)
  useEffect(() => {
    if (!xxxEditorModal.isOpen) return;
    if (xxxEditorModal.type === "CREATE") {
      setName("");
      // ...
    } else {
      setName(xxxEditorModal.name);
      // ...
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xxxEditorModal.isOpen]);

  // §7 — 미저장 변경사항 경고
  const handleCloseModal = () => {
    const hasDraft = name.trim() !== "" /* || 다른 필드 */;
    if (hasDraft) {
      openAlertModal({
        title: "작성 중이던 내용이 있습니다",
        description: "이 화면에서 나가면 작성중이던 내용이 사라집니다.",
        onPositive: () => xxxEditorModal.actions.close(),
      });
      return;
    }
    xxxEditorModal.actions.close();
  };

  const handleSaveClick = () => {
    if (name.trim() === "") return;
    if (!xxxEditorModal.isOpen) return;

    if (xxxEditorModal.type === "CREATE") {
      createXxx({ name });
    } else {
      if (name === xxxEditorModal.name) return;  // 변경 없으면 skip
      updateXxx({ id: xxxEditorModal.id, name });
    }
  };

  const isPending = isCreatePending || isUpdatePending;

  return (
    <Dialog open={xxxEditorModal.isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="max-h-[90vh]">
        <DialogTitle>Xxx 작성</DialogTitle>
        <Input
          disabled={isPending}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름"
        />
        <Button disabled={isPending} onClick={handleSaveClick}>저장</Button>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 6. 폼 상태 초기화 패턴

### 6.1 규칙

**모달 열릴 때마다 폼 리셋.** `useEffect` 의 deps 를 `[modal.isOpen]` 만.

```tsx
useEffect(() => {
  if (!xxxEditorModal.isOpen) return;

  if (xxxEditorModal.type === "CREATE") {
    setName("");
    setDescription("");
  } else {
    setName(xxxEditorModal.name);
    setDescription(xxxEditorModal.description);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [xxxEditorModal.isOpen]);
```

**WHY deps 가 `[isOpen]` 만.** `name` / `description` 같은 state 를 deps 에 넣으면 **입력 중 매번 effect 가 다시 실행**해서 사용자가 타이핑한 값이 사라짐. ESLint 가 exhaustive-deps 를 경고하지만 **의도적 스킵**. `eslint-disable-next-line react-hooks/exhaustive-deps` 주석으로 의도 명시.

### 6.2 `setState` in effect 경고

`react-hooks/set-state-in-effect` 룰도 `profile-editor-modal.tsx` 에서 disable 함 (모달 열림 전이 시 상태 초기화는 정당한 사용). 필요 시 위 주석으로 같이 disable.

---

## 7. 미저장 변경사항 경고

### 7.1 규칙

`Dialog` 의 `onOpenChange` 핸들러에서 **draft 있으면 AlertModal 로 한 번 더 확인**.

```tsx
const handleCloseModal = () => {
  const hasDraft =
    name.trim() !== "" ||
    description.trim() !== "" ||
    images.length !== 0;

  if (hasDraft) {
    openAlertModal({
      title: "작성 중이던 내용이 있습니다",
      description: "이 화면에서 나가면 작성중이던 내용이 사라집니다.",
      onPositive: () => xxxEditorModal.actions.close(),
    });
    return;
  }
  xxxEditorModal.actions.close();
};

<Dialog open={xxxEditorModal.isOpen} onOpenChange={handleCloseModal}>
```

**포인트.** AlertModal 의 `onPositive` 에서만 실제 `close()` 호출. 취소 누르면 폼 유지.

### 7.2 언제 적용하나

- 긴 텍스트 편집 모달 (에디터, 프로필 편집)
- 파일 업로드 중
- 짧은 toggle / 한 필드 입력은 생략 가능

---

## 8. 파일 업로드 + ObjectURL 관리

```tsx
type Image = { file: File; previewUrl: string };
const [images, setImages] = useState<Image[]>([]);

const handleSelect = (e: ChangeEvent<HTMLInputElement>) => {
  if (e.target.files) {
    Array.from(e.target.files).forEach((file) => {
      setImages((prev) => [
        ...prev,
        { file, previewUrl: URL.createObjectURL(file) },
      ]);
    });
  }
  e.target.value = "";  // 같은 파일 재선택 허용
};

const handleDelete = (image: Image) => {
  setImages((prev) => prev.filter((i) => i.previewUrl !== image.previewUrl));
  URL.revokeObjectURL(image.previewUrl);
};

// 모달 닫힐 때도 revoke
useEffect(() => {
  if (!xxxEditorModal.isOpen) {
    images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    return;
  }
  // ... 폼 초기화
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [xxxEditorModal.isOpen]);
```

**규칙.** `createObjectURL` 한 건 **반드시** `revokeObjectURL`. 안 하면 메모리 누수.

---

## 9. textarea 자동 높이

```tsx
const textareaRef = useRef<HTMLTextAreaElement>(null);

useEffect(() => {
  if (textareaRef.current) {
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
  }
}, [description]);

<textarea ref={textareaRef} value={description} onChange={(e) => setDescription(e.target.value)} />
```

---

## 10. ModalProvider 등록

새 모달 추가 시:

1. `components/modal/<name>-modal.tsx` 작성
2. `store/<name>-modal.ts` 작성
3. `provider/modal-provider.tsx` 의 portal 안에 **한 줄 추가**:

```tsx
// src/provider/modal-provider.tsx
return (
  <>
    {createPortal(
      <>
        <AlertModal />
        <ProfileEditorModal />
        <ShippingLineEditorModal />   {/* ← 추가 */}
      </>,
      document.getElementById("modal-root")!,
    )}
    {children}
  </>
);
```

**규칙.** `AlertModal` 은 다른 모달들의 confirm 으로 쓰이므로 **항상 포함**. 신규 모달은 마지막에 추가.

---

## 11. 안티 패턴

1. ❌ **모달 본체를 페이지 / 도메인 컴포넌트 안에서 렌더** — 반드시 `ModalProvider` 로 한 번만.
2. ❌ **모달 open/close 를 컴포넌트 local state 로** — Zustand 스토어 필수.
3. ❌ **AlertModal 과 Dialog 혼용** — 파괴적 액션은 AlertModal, 폼/에디터는 Dialog.
4. ❌ **모달 안에서 직접 mutate 호출 + alert** — AlertModal 로 한 번 더 확인 후.
5. ❌ **폼 초기화 `useEffect` deps 에 `name`, `description` 같은 state 넣기** — 입력 중 reset 지옥.
6. ❌ **`URL.createObjectURL` 한 뒤 `revokeObjectURL` 누락**.
7. ❌ **모달 본체를 `export function XxxModal()` (named)** — 모달은 **`export default`** 가 원칙 (컴포넌트 1파일 1export).

---

## 12. 새 모달 추가 체크리스트

1. **스토어 작성** — `store/<name>-modal.ts` ([`src/store/CLAUDE.md`](../../store/CLAUDE.md) §7, §8 템플릿).
2. **본체 작성** — `components/modal/<name>-modal.tsx` (§5 템플릿).
3. **미저장 경고** 필요하면 §7.
4. **파일 업로드** 있으면 §8 ObjectURL 관리.
5. **ModalProvider 등록** (§10).
6. **여는 버튼** — 도메인 컴포넌트에서 `useOpenXxxModal()` 호출.
7. **Dialog vs AlertDialog** 결정 (§3).

---

## 13. 관련 문서

- [`components/CLAUDE.md`](../CLAUDE.md) — 컴포넌트 공통 (폼 처리, 훅 순서 등)
- [`src/store/CLAUDE.md`](../../store/CLAUDE.md) — 모달 스토어 템플릿 (DU 포함)
- [`src/provider/CLAUDE.md`](../../provider/CLAUDE.md) — ModalProvider 구현
- [`src/hooks/CLAUDE.md`](../../hooks/CLAUDE.md) — mutation 훅 (create/update/delete)
