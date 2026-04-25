# src/components/CLAUDE.md — 컴포넌트 공통 규칙

> **이 폴더의 책임.** 재사용 가능한 UI 컴포넌트. `ui/` (shadcn 생성, 수정 금지), `layout/` (레이아웃+가드), `modal/` (전역 모달 본체), `<domain>/` (도메인별 컴포넌트).
>
> **상위 문서.** [루트](../../CLAUDE.md) · [src](../CLAUDE.md)

**하위 문서.**
- [`components/modal/CLAUDE.md`](./modal/CLAUDE.md) — 모달 본체 특화 규칙
- [`components/layout/CLAUDE.md`](./layout/CLAUDE.md) — 레이아웃 + 라우트 가드 특화 규칙

이 문서는 **전 컴포넌트 공통 규칙**만 담는다. 모달·레이아웃 고유 규칙은 각 하위 CLAUDE.md 참조.

---

## 1. 의존 규칙

| | |
| --- | --- |
| 의존 **가능** | `@/hooks/*`, `@/store/*`, `@/api/*`, `@/components/ui`, `@/components/<다른 도메인>`, `@/lib/*`, `@/types`, React, React Router, lucide-react, sonner, tanstack/react-query (hooks 경유가 원칙) |
| 의존 **금지** | `@/pages/*` (역방향), `@/provider/*` (컴포넌트는 Provider 를 사용할 뿐 참조 안 함) |

**components/ui 는 특수.** `lib/utils` (cn) + 외부 라이브러리만 의존. 도메인 파일(`api/`, `hooks/`, `store/`) import 금지.

---

## 2. 파일 / 폴더 네이밍

### 2.1 파일명: kebab-case

```
post-item.tsx
edit-profile-button.tsx
create-post-button.tsx
```

### 2.2 컴포넌트명: PascalCase

```tsx
export default function PostItem(props: ...) { ... }
export default function EditProfileButton(props: ...) { ... }
```

### 2.3 폴더명: kebab-case

```
components/
├── post/
├── comment/
├── shipping-line/      ← 트래킹 도메인 예시
└── layout/
    └── header/
```

### 2.4 Export

**컴포넌트는 `export default`.** 파일당 1개 컴포넌트. 보조 컴포넌트는 같은 파일 안에 `function XxxRow(...) { ... }` 로 선언하고 export 안 한다.

---

## 3. Props 타입 선언

### 3.1 간단한 props (1~3 필드) → inline object type

```tsx
export default function DeletePostButton({ id }: { id: number }) { ... }

export default function LikePostButton({
  id,
  likeCount,
  isLiked,
}: {
  id: number;
  likeCount: number;
  isLiked: boolean;
}) { ... }
```

### 3.2 Entity 를 통째로 받는다면 → 기존 타입 그대로

```tsx
// components/post/edit-post-button.tsx
export default function EditPostButton(props: PostEntity) { ... }
```

### 3.3 Discriminated Union → 별도 `type` 으로 조립

```tsx
// components/comment/comment-editor.tsx (패턴 예시)
type CreateMode = { type: "CREATE"; postId: number };
type EditMode = {
  type: "EDIT";
  commentId: number;
  initialContent: string;
  onClose: () => void;
};
type ReplyMode = {
  type: "REPLY";
  postId: number;
  parentCommentId: number;
  rootCommentId: number;
  onClose: () => void;
};
type Props = CreateMode | EditMode | ReplyMode;

export default function CommentEditor(props: Props) {
  // switch (props.type) { case "CREATE": ... }
}
```

### 3.4 `type` vs `interface`

**`type`** 만. `interface` 는 쓰지 않는다. union / intersection / DU 가 자유롭고 프로젝트 전체가 `type` 기반.

### 3.5 구조분해는 한 번에

```tsx
// ✅
function PostItem({ postId, type }: { postId: number; type: "FEED" | "DETAIL" }) { ... }

// ❌ props 를 받은 뒤 함수 본문에서 재분해
function PostItem(props: { postId: number; type: ... }) {
  const { postId, type } = props;
  ...
}
```

---

## 4. 훅 호출 순서 (필수)

훅 / 변수 선언은 **항상** 아래 순서.

```tsx
export default function PostItem({ postId, type }: { postId: number; type: "FEED" | "DETAIL" }) {
  // 1) Zustand selector 훅
  const session = useSession();
  const userId = session?.user.id;

  // 2) useQuery / useInfiniteQuery 훅
  const { data: post, isPending, error } = usePostByIdData({ postId, type });

  // 3) useMutation 훅
  const { mutate: deletePost, isPending: isDeletePostPending } = useDeletePost({ ... });

  // 4) React 기본 훅 (useState, useRef, useEffect, useNavigate, useParams, ...)
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  // 5) early return (error → Fallback, pending → Loader, 인증 가드 등)
  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  // 6) 파생 변수
  const isMine = post.author_id === userId;
  const isPending = isDeletePostPending;

  // 7) JSX return
  return (
    <div>...</div>
  );
}
```

**WHY 파생 변수가 early return 이후인가.** 쿼리 데이터(`post.author_id` 등) 는 `isPending` / `error` 체크 이후에만 non-null 로 확정. early return 앞에서 파생 변수 계산하면 `data` 가 undefined 인 순간에도 접근해 타입/런타임 에러.

---

## 5. Early return (Fallback / Loader / GlobalLoader)

### 5.1 규칙: error → isPending 순서

**쿼리 훅을 쓰는 컴포넌트는 반드시 `error → isPending → 본문` 3단계**.

```tsx
if (error) return <Fallback />;
if (isPending) return <Loader />;
// 이후 data 에 안전하게 접근
```

**WHY error 가 먼저.**
- 에러 + pending 동시 발생 시 에러를 우선 표시해야 사용자가 혼란 안 겪음.
- 이 순서는 `post-feed.tsx`, `comment-list.tsx`, `profile-info.tsx`, `profile-editor-modal.tsx` 등 전 파일 일관.

### 5.2 로더 컴포넌트 용도 구분

| 컴포넌트 | 용도 | 파일 |
| --- | --- | --- |
| `GlobalLoader` | 전체 화면 덮는 부트스트랩 로더 (세션 복원) | `components/global-loader.tsx` |
| `Loader` | 섹션 단위 스피너 (쿼리 isPending, 다음 페이지 로드) | `components/loader.tsx` |
| `Fallback` | 에러 발생 시 공통 UI | `components/fallback.tsx` |

### 5.3 부분 영역 조건부 (모달 내부 등)

모달처럼 "컴포넌트 일부 영역에서만 분기" 하고 싶으면 조건부 렌더:

```tsx
<DialogContent>
  {error && <Fallback />}
  {isPending && <Loader />}
  {!error && !isPending && <실제 본문 />}
</DialogContent>
```

---

## 6. 조건부 렌더

### 6.1 true 일 때만 렌더

```tsx
{condition && <Xxx />}
```

### 6.2 두 요소 택일 — 삼항

```tsx
{condition ? <A /> : <B />}
```

### 6.3 복잡한 분기 — early return + 조건부 조합

```tsx
if (!data) return <Empty />;

return (
  <div>
    {data.isPublished ? <Published /> : <Draft />}
  </div>
);
```

**금지.** `switch` 문 안에서 JSX return 중첩, 삼항 3중 이상.

---

## 7. Tailwind 클래스 순서 — 자동 정렬

**규칙.** **수작업 정렬 금지.** Prettier + `prettier-plugin-tailwindcss` 가 저장 / 포맷 시 자동으로 `layout → spacing → size → display → bg → text → border → effect → transition → misc` 순으로 재배치.

---

## 8. `cn()` 사용처 (tight scope)

```ts
// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 8.1 언제 쓰는가

1. **shadcn/ui 컴포넌트를 감싸 variant 확장** 할 때 (cva + className 병합).
2. **같은 카테고리 Tailwind 클래스 충돌** 가능성: 내부 기본 `px-2` + props 로 받은 `px-4`. `twMerge` 가 "뒤(= 사용자)가 이긴다" 보장.

### 8.2 언제 안 쓰는가

도메인 컴포넌트 JSX 에서 단순 조건부 클래스는 **템플릿 리터럴** 로 충분.

```tsx
// ✅ 도메인 코드 관례
<div className={`flex ${isOpen && "bg-muted"}`}>

// ✅ 복잡해지면 cn
<Button className={cn(
  "px-2 py-1",
  isDestructive && "bg-destructive text-destructive-foreground",
  className,  // props
)} />
```

### 8.3 현재 도메인 컴포넌트 실제

`components/ui/*.tsx` 에서는 `cn()` 을 거의 항상 씀 (variant 합성). `components/<domain>/*.tsx` 에서는 거의 안 씀 (템플릿 리터럴 우세).

---

## 9. shadcn 래핑 패턴

### 9.1 `components/ui/*` 직접 수정 금지

shadcn 자동 생성 파일은 CLI 재생성 시 덮어쓰일 수 있음. 커스터마이즈는 **감싸는 도메인 컴포넌트에서** `className` / variant prop 으로.

```tsx
// ❌ components/ui/button.tsx 수정
// ✅ 도메인 컴포넌트에서
<Button variant="outline" className="border-stone-200 text-stone-600">
  Custom Button
</Button>
```

### 9.2 `twMerge` 덕분에 className 덮어쓰기 보장

내부 기본 + 외부 className 충돌 시 **뒤쪽(= 사용자) 이 이긴다**. 도메인 컴포넌트에서 외부 버튼 스타일 커스텀 자유.

### 9.3 shadcn 재export 없는 서브컴포넌트는 Radix 원본에서 직접

```tsx
// 예: PopoverClose 는 shadcn 이 재export 하지 않음
import { PopoverClose } from "@radix-ui/react-popover";
```

### 9.4 이 프로젝트의 Button 특이사항

**중요.** 이 프로젝트의 `components/ui/button.tsx` 는 `@base-ui/react/button` 을 사용 (radix-ui 의 Slot 기반 아님). 따라서:

- **Button 은 `asChild` prop 을 지원하지 않는다.**
- Radix Dialog/AlertDialog 의 `<AlertDialogAction asChild><Button /></AlertDialogAction>` 패턴 **사용 불가**.
- `AlertDialogAction` / `AlertDialogCancel` 은 이미 버튼 variant 를 `buttonVariants({ variant, size })` 클래스로 직접 적용하도록 수정됨 (`components/ui/alert-dialog.tsx`).

새 shadcn 컴포넌트 추가 시 이 점 주의. `asChild` + `Button` 패턴이 있으면 동일하게 `buttonVariants` 로 교체.

### 9.5 `DialogTitle` / `CardTitle` / `AlertDialogTitle` 에 `font-sans` override 필수

**배경.** 이 프로젝트의 `components/ui/{dialog,card,alert-dialog}.tsx` 는 shadcn 기본값대로 Title 에 `font-heading` (= `Instrument Serif`) 을 적용한다. 이 serif 는 **랜딩 페이지 전용**으로 의도된 폰트이며, STE(앱 본체)에서는 Notifications 사이드바와 같은 Inter sans-serif 로 통일되어야 한다.

**규칙.** STE 안에서 위 세 Title 을 렌더할 때 **반드시** `className="font-sans"` 을 추가한다.

```tsx
// ✅ 올바른 사용
<DialogTitle className="font-sans">{t("modal.apiKeyCreate.title")}</DialogTitle>

<DialogTitle className="font-sans text-2xl font-semibold">
  {t("profile.title")}
</DialogTitle>

<AlertDialogTitle className="font-sans">
  {alertModal.isOpen ? alertModal.title : ""}
</AlertDialogTitle>

// ❌ 빠뜨리면 Instrument Serif 가 앱에 유출됨
<DialogTitle>{t("...")}</DialogTitle>
```

**WHY `components/ui/*` 에서 직접 고치지 않는가.** §9.1 규칙 — shadcn CLI 재생성 시 덮어쓰이므로 원본 수정 금지. `twMerge` 가 뒤 className 을 우선 처리하므로 호출처에서 `font-sans` 로 덮는 방식이 안전 (원본 규칙 유지 + 재생성 내성).

**WHY 랜딩은 예외인가.** `src/pages/landing/**` 는 마케팅 페이지라 Instrument Serif 디자인을 **의도적으로 유지**한다 — 랜딩 컴포넌트는 `font-sans` override 를 **넣지 않는다**.

**현재 적용 현황.** Profile 모달 (5곳), AlertModal, MemberInvite 모달, ApiKeyCreate 모달, ApiKeyCreated 모달. 새 Dialog/AlertDialog/Card 를 STE 에 추가하면 이 규칙을 잊지 말 것.

---

## 10. 폼 처리 패턴

**규칙.** `react-hook-form` / `zod` **사용하지 않는다** (package.json 에 없음).

### 10.1 controlled input

모든 입력은 `useState` + `value` + `onChange` 양방향 바인딩. **필드당 state 1개.**

```tsx
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

<Input value={email} onChange={(e) => setEmail(e.target.value)} />
```

### 10.2 validation

인라인 조건 + HTML native 병행. zod 스키마 없음.

```tsx
if (email.trim() === "") return;
if (password.trim() === "" || password !== confirmPassword) {
  toast.error("비밀번호가 일치하지 않습니다.", { position: "top-center" });
  return;
}
```

HTML native: `required`, `maxLength`, `type="email"`, `inputMode="numeric"` 등.

### 10.3 submit 플로우

```
값 수집 → validation → mutation 호출
                       ↓
                  onSuccess: close / navigate / toast.success
                  onError: toast.error + generateErrorMessage
```

### 10.4 에러 표시

**인라인 메시지 대신 토스트.**

```tsx
toast.error(generateErrorMessage(error), { position: "top-center" });
```

### 10.5 isPending 처리

모든 input / button 에 `disabled={isPending}`. 여러 mutation 동시면 `||` 로 합침.

```tsx
const { mutate: a, isPending: isAPending } = useA({ ... });
const { mutate: b, isPending: isBPending } = useB({ ... });
const isPending = isAPending || isBPending;

<Input disabled={isPending} ... />
<Button disabled={isPending} ... />
```

### 10.6 파일 업로드 미리보기

```tsx
type Image = { file: File; previewUrl: string };

const [images, setImages] = useState<Image[]>([]);

const handleSelect = (e: ChangeEvent<HTMLInputElement>) => {
  if (e.target.files) {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      setImages((prev) => [
        ...prev,
        { file, previewUrl: URL.createObjectURL(file) },
      ]);
    });
  }
  e.target.value = "";   // 같은 파일 재선택 허용
};

const handleDelete = (image: Image) => {
  setImages((prev) => prev.filter((i) => i.previewUrl !== image.previewUrl));
  URL.revokeObjectURL(image.previewUrl);    // ← 반드시 revoke
};
```

**규칙.** `URL.createObjectURL` 한 것은 **반드시** `URL.revokeObjectURL` 로 해제. 안 하면 메모리 누수.

### 10.7 textarea 자동 높이

```tsx
const textareaRef = useRef<HTMLTextAreaElement>(null);

useEffect(() => {
  if (textareaRef.current) {
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
  }
}, [content]);

<textarea ref={textareaRef} value={content} onChange={...} />
```

### 10.8 숨긴 file input + 프로그래매틱 click

```tsx
const fileInputRef = useRef<HTMLInputElement>(null);

<input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
<Button onClick={() => fileInputRef.current?.click()}>이미지 추가</Button>
```

---

## 11. Mutation 호출부 컨벤션

### 11.1 rename

```tsx
const { mutate: createPost, isPending: isCreatePostPending } = useCreatePost({ ... });
```

**규칙.**
- `mutate` → 동사 + 도메인 (`createPost`, `deleteComment`, `togglePostLike`, `signInWithPassword`)
- `isPending` → `is<Verb><Thing>Pending`

### 11.2 여러 pending 합치기

```tsx
const isPending = isCreatePostPending || isUpdatePostPending;
```

### 11.3 toast 종류

```tsx
import { toast } from "sonner";
import { generateErrorMessage } from "@/lib/error";

// 에러
toast.error(generateErrorMessage(error), { position: "top-center" });

// 중립 / 정보 ("메일 발송 완료" 등)
toast.info("인증 메일이 발송되었습니다.", { position: "top-center" });

// 강한 긍정 ("회원가입 완료", "비밀번호 변경됨" 등)
toast.success("회원가입이 완료되었습니다.", { position: "top-center" });
```

**위치는 전부 `{ position: "top-center" }`**.

### 11.4 네비게이션

삭제 / 세션 종료처럼 **현재 URL 이 무효해진 경우만** 이동. 앱 내 홈으로 복귀는 `navigate("/app", { replace: true })`, 로그아웃 / 세션 만료는 `navigate("/sign-in", { replace: true })`.

```tsx
// src/components/post/delete-post-button.tsx (패턴 예시)
onSuccess: () => {
  const pathname = window.location.pathname;
  if (pathname.startsWith(`/post/${id}`)) {
    navigate("/app", { replace: true });
  }
},
```

피드(`type="FEED"`) 에서 삭제하면 캐시에서 filter 돼 URL 유효. 이동 안 함.

---

## 12. 이미지 / 링크

- 내부 이동: `<Link to="...">` 또는 `useNavigate`. **`<a>` 금지.**
- 외부 링크: `<a href="https://..." target="_blank" rel="noopener noreferrer">`.
- 이미지: `<img src={url} alt="..." />` — Vite 가 번들. `import xxx from "@/assets/xxx.png"` 로 해시 URL.

---

## 13. 안티 패턴

1. ❌ **훅 호출 순서 어긋남** — §4 순서 위반.
2. ❌ **early return 없이 `data.field` 접근** — pending/error 시 runtime crash.
3. ❌ **`error` 체크 없이 `isPending` 만 체크** — 에러 상태가 본문 렌더로 흘러감.
4. ❌ **Tailwind 클래스 수작업 정렬** — Prettier 자동.
5. ❌ **`components/ui/*` 직접 수정** — 재생성 시 충돌.
6. ❌ **컴포넌트에서 `fetch` / `axios` 직접 호출** — `hooks/` 경유.
7. ❌ **`<a href="/internal">`** — `<Link>` 또는 `useNavigate`.
8. ❌ **인라인 에러 메시지 (JSX)** — 토스트로 통일.
9. ❌ **Button 에 `asChild`** — 이 프로젝트 Button 은 base-ui 라 미지원.
10. ❌ **`URL.createObjectURL` 후 revoke 누락** — 메모리 누수.
11. ❌ **`DialogTitle` / `CardTitle` / `AlertDialogTitle` 을 className 없이 사용** — STE 는 `font-sans` 필수, 랜딩은 예외 (§9.5).
12. ❌ **하드코딩된 한국어 / 영어 문자열 (JSX, aria-label, placeholder, toast)** — 전부 `t(...)` 경유 ([루트 §6.7](../../CLAUDE.md)).
13. ❌ **날짜 / 시간 / 금액을 `new Date(x).toLocale...` / `Intl.DateTimeFormat` 로 직접 포매팅** — `@/lib/format` 의 formatter 사용 ([루트 §6.8](../../CLAUDE.md)).

---

## 14. 새 컴포넌트 추가 체크리스트

1. **위치 결정** — `components/ui/` (금지), `components/layout/`, `components/modal/`, `components/<domain>/`.
2. **파일명 kebab-case** (`post-item.tsx`), **컴포넌트명 PascalCase** (`PostItem`), **`export default`**.
3. **Props 타입** — inline / Entity / DU (§3).
4. **훅 호출 순서** (§4) — Zustand → Query → Mutation → React 기본.
5. **쿼리 훅 있으면 early return** (§5) — error → isPending.
6. **폼이면 §10 모든 규칙** — controlled input, toast error, isPending disabled.
7. **mutation 호출부면 §11** — rename, toast, navigation.
8. **Tailwind 는 자동 정렬**, 조건부는 템플릿 리터럴 우선.
9. **모달이면** `components/modal/CLAUDE.md` 추가 규칙.
10. **레이아웃/가드면** `components/layout/CLAUDE.md` 추가 규칙.

---

## 15. 관련 문서

- [`components/modal/CLAUDE.md`](./modal/CLAUDE.md) — 모달 본체 특화
- [`components/layout/CLAUDE.md`](./layout/CLAUDE.md) — 레이아웃 + 가드 특화
- [`src/hooks/CLAUDE.md`](../hooks/CLAUDE.md) — 쿼리 / 뮤테이션 훅 템플릿
- [`src/store/CLAUDE.md`](../store/CLAUDE.md) — Zustand selector (모달 open 액션)
- [`src/lib/CLAUDE.md`](../lib/CLAUDE.md) — `cn`, `generateErrorMessage`
- [루트 §9](../../CLAUDE.md) — mutation 호출부 컨벤션
