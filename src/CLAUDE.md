# src/CLAUDE.md — 폴더 구조와 의존 방향

> **이 문서는 무엇인가.** `src/` 내부의 폴더 책임, 의존 그래프, "이 코드를 어디에 둘지" 결정 트리, 타입 시스템 규칙.
>
> **상위 문서.** [루트 `CLAUDE.md`](../CLAUDE.md)

---

## 1. 전체 트리

```
src/
├── api/                 ─ axios 래퍼. 엔드포인트당 async 함수 1개.
│   ├── auth.ts
│   ├── dashboard.ts
│   ├── notifications.ts
│   ├── profile.ts
│   ├── subscriptions.ts
│   └── tables.ts
├── assets/              ─ 이미지/SVG. Vite 가 해시 URL 로 번들링.
├── components/
│   ├── ui/              ─ shadcn/ui 자동 생성 (수정 금지)
│   ├── layout/          ─ 전역 레이아웃 + 라우트 가드
│   │   ├── sidebar.tsx
│   │   ├── guest-only-layout.tsx
│   │   ├── member-only-layout.tsx
│   │   └── footer.tsx
│   ├── modal/           ─ 전역 모달 "본체". ModalProvider 가 #modal-root 에 마운트.
│   │   ├── alert-modal.tsx
│   │   └── profile-editor-modal.tsx
│   ├── dashboard/       ─ 대시보드 도메인 컴포넌트 (참고 예시)
│   ├── fallback.tsx     ─ 공통 에러 UI
│   ├── global-loader.tsx─ 전체 화면 부트스트랩 로더
│   └── loader.tsx       ─ 섹션 단위 스피너
├── hooks/
│   ├── queries/         ─ useQuery / useInfiniteQuery 훅 (flat)
│   └── mutations/       ─ useMutation 훅 (도메인별 서브폴더)
│       ├── auth/
│       ├── notifications/
│       └── profile/
├── lib/
│   ├── axios.ts         ─ 단일 axios 인스턴스 + 인터셉터 + 토큰 유틸
│   ├── constants.ts     ─ QUERY_KEYS 팩토리
│   ├── error.ts         ─ generateErrorMessage (axios 에러 → 한국어)
│   ├── time.ts          ─ formatTimeAgo (템플릿)
│   └── utils.ts         ─ cn() (clsx + twMerge)
├── pages/               ─ 라우트 1개 = 파일 1개 (kebab-case)
│   ├── dashboard-page.tsx
│   ├── forget-password-page.tsx
│   ├── notifications-page.tsx
│   ├── oauth-callback-page.tsx
│   ├── profile-page.tsx
│   ├── reset-password-page.tsx
│   ├── sign-in-page.tsx
│   ├── sign-up-page.tsx
│   ├── subscriptions-page.tsx
│   └── tables-page.tsx
├── provider/
│   ├── modal-provider.tsx    ─ createPortal(#modal-root) 로 모달 본체 마운트
│   └── session-provider.tsx  ─ 앱 시작 시 fetchMe 1회 호출로 세션 복원
├── store/               ─ Zustand 스토어. 파일당 스토어 1개.
│   ├── alert-modal.ts
│   ├── profile-editor-modal.ts
│   └── session.ts
├── App.tsx              ─ Provider 합성 (SessionProvider → ModalProvider → RootRoute)
├── index.css            ─ Tailwind v4 + 커스텀 유틸 클래스
├── main.tsx             ─ createRoot + BrowserRouter + QueryClientProvider
├── root-route.tsx       ─ <Routes> 트리
├── types.ts             ─ 도메인 공용 타입 (Entity / 합성 / 콜백 등)
└── vite-env.d.ts
```

**트래킹 도메인 추가 시** (예: `shipping-line`):
- `src/api/shipping-line.ts`
- `src/hooks/queries/use-shipping-lines-data.ts` 등
- `src/hooks/mutations/shipping-line/*`
- `src/store/shipping-line-editor-modal.ts` (모달 필요 시)
- `src/components/shipping-line/*.tsx`
- `src/components/modal/shipping-line-editor-modal.tsx` (모달 필요 시)
- `src/pages/shipping-line-list-page.tsx` 등
- `src/lib/constants.ts` 의 `QUERY_KEYS` 에 `shippingLine` 섹션 추가
- `src/root-route.tsx` 에 라우트 추가
- `src/provider/modal-provider.tsx` 에 모달 한 줄 추가 (필요 시)

---

## 2. 의존 방향 (단방향)

각 폴더는 아래로만 의존. **역방향 금지.**

```
pages → components → hooks → api ─┐
                  ↓         ↓     │
                  store ←───┘    lib
                  ↓
                provider
```

### 폴더별 의존 가능 / 금지 표

| 폴더 | 책임 | 의존 가능 | 의존 금지 |
| --- | --- | --- | --- |
| `lib/` | 유틸 + 상수 + 에러 매핑 + axios 인스턴스 | 외부 라이브러리(axios, clsx, twMerge) | React 훅, 컴포넌트 |
| `store/` | Zustand 스토어 + selector 훅 | `zustand`, `types`, 브라우저 API (matchMedia 등) | `api/`, `hooks/` |
| `api/` | axios 래퍼 async 함수 | `lib/axios`, `lib/constants`, `types` | `hooks/`, `store/`, React 훅, React 컴포넌트 |
| `hooks/queries/` | `useQuery` / `useInfiniteQuery` 래퍼 | `api/`, `lib/constants`, `store/` selector, `types` | `hooks/mutations/` |
| `hooks/mutations/` | `useMutation` 래퍼 | `api/`, `lib/constants`, `store/` selector, `hooks/queries/` (조회 합성) | 서로 순환 |
| `provider/` | 전역 Provider 컴포넌트 | `store/`, `api/`, `components/*` | 페이지, 라우트 컴포넌트 |
| `components/ui/` | shadcn/ui 생성물 (**수정 금지**) | `lib/utils` (cn) | 도메인(`api/`, `hooks/`, `store/`) |
| `components/layout/` | 레이아웃 + 라우트 가드 | `store/`, `hooks/`, `api/`, `components/ui` | 다른 `components/layout/` 상위 순환 |
| `components/<domain>/` | 도메인 UI 컴포넌트 | `hooks/`, `store/`, `api/`, `components/ui`, `lib/`, `types` | 다른 `pages/` |
| `components/modal/` | 전역 모달 본체 | `store/`, `hooks/mutations/`, `components/ui`, `api/`, `lib/` | `pages/` |
| `pages/` | 라우트 엔트리 (얇게) | `components/*`, `hooks/*`, `store/*` | `provider/`, 다른 `pages/` |

**검증.** `api/` 내부에서 `import { useXxx }` 가 보이면 즉시 리팩터 대상. `components/ui/` 내부에서 도메인 import 도 동일.

---

## 3. "어디에 둘지 헷갈릴 때" 결정 트리

1. **axios 를 직접 호출하는가?** → `api/<domain>.ts` 에만 둔다.
2. **`use`로 시작하는 React 훅인가?**
   - 서버 상태 (GET) → `hooks/queries/use-<thing>-data.ts`
   - 서버 상태 (POST/PATCH/DELETE) → `hooks/mutations/<domain>/use-<verb>-<thing>.ts`
   - 클라이언트 상태 → `store/<name>.ts` 의 selector 훅으로 export
3. **두 페이지 이상이 같은 UI 를 재사용하는가?** → `components/<domain>/` 또는 `components/`(루트). 한 페이지 전용이면 페이지 파일 안에 inline 으로 둬도 된다.
4. **전역 상태인가?** → `store/<name>.ts`. Zustand 로만 만든다. Context 금지 (루트 §6.1).
5. **라우트 레벨 가드 / 레이아웃인가?** → `components/layout/`.
6. **전체 화면을 덮는 모달인가?** → 3단계:
   - `components/modal/<name>-modal.tsx` — 본체 (렌더)
   - `store/<name>-modal.ts` — 열림 상태 + actions
   - `provider/modal-provider.tsx` — portal 안에 한 줄 추가
7. **외부 라이브러리 의존이 없는 순수 함수인가?** → `lib/`.
8. **서버 엔티티 타입 / UI 합성 타입인가?** → `types.ts`.

---

## 4. types.ts 구성 규칙

### 4.1 Entity (서버 스키마 1:1)

```ts
// src/types.ts
export type PostEntity = {
  id: number;
  author_id: string | number;
  content: string;
  image_urls: string[] | null;
  like_count: number;
  created_at: string;
  updated_at?: string;
};
```

**규칙.**
- 네이밍: `<Thing>Entity`.
- 필드명은 **snake_case** 를 그대로 유지 (서버 스키마와 1:1). 변환 비용 제거.

### 4.2 Domain (UI 합성)

```ts
export type Post = PostEntity & { author: ProfileEntity; isLiked: boolean };
export type Comment = CommentEntity & { author: ProfileEntity };
```

**규칙.**
- 네이밍: `<Thing>` (Entity 없이).
- `Entity & { 추가 필드 }` 교차.
- UI 전용 필드는 **camelCase** 허용 (`isLiked`).

### 4.3 재귀 타입

```ts
export type NestedComment = Comment & {
  parentComment?: Comment;
  children: NestedComment[];
};
```

### 4.4 공용 콜백

```ts
export type UseMutationCallback = {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onMutate?: () => void;
  onSettled?: () => void;
};
```

**규칙.** 모든 mutation 훅이 이 하나의 타입을 재사용. 새 콜백 타입 정의 금지.

### 4.5 리터럴 유니온

```ts
// Theme 같은 건 삭제됨. 필요하면 같은 방식으로 추가.
type Role = "user" | "admin";
```

**규칙.** `enum` 금지 (`erasableSyntaxOnly: true`). 리터럴 유니온 또는 `as const` 만.

### 4.6 `type` vs `interface`

**`type`** 만 쓴다. `interface` 금지. union / intersection / DU 가 자유롭고, `types.ts` 전체가 `type` 기반.

---

## 5. 타입 규칙 (Non-null, as 단언)

### 5.1 `!` non-null assertion — 3가지 경우만 허용

```ts
// 1) enabled 가드된 queryFn 내부
useQuery({
  queryKey: QUERY_KEYS.profile.byId(String(userId ?? "")),
  queryFn: () => fetchProfile(userId!),
  enabled: !!userId,
});

// 2) MemberOnlyLayout 하위 (= session 은 항상 non-null)
const session = useSession();
session!.user.id;

// 3) index.html 에 반드시 존재하는 DOM
createRoot(document.getElementById("root")!).render(...);
document.getElementById("modal-root")!;
```

그 외 `!` 사용 금지. 필요하면 early return 으로 좁힌다.

### 5.2 `as` 단언 — 5가지 경우만 허용

```ts
// 1) Zustand combine 초기값 유니온 고정
const initialState = { isOpen: false } as State;

// 2) Zustand 스토어 훅 DU 복원
return store as typeof store & State;

// 3) axios 에러 payload 구조 좁히기
const data = error.response?.data as { code?: string; message?: string } | undefined;

// 4) axios config 커스텀 필드 주입
error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;

// 5) AxiosHeaders 를 Record 로 (AxiosHeaders 타입 직접 사용 불편)
(config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
```

**절대 금지.** `value as any`, `value as unknown as T` 이중 단언.

### 5.3 제네릭 — TanStack Query 캐시 조작

```ts
queryClient.getQueryData<Post>(QUERY_KEYS.post.byId(postId));
queryClient.setQueryData<Post>(QUERY_KEYS.post.byId(postId), (prev) => ({ ... }));
queryClient.setQueryData<InfiniteData<number[]>>(QUERY_KEYS.post.list, ...);
queryClient.setQueryData<Comment[]>(QUERY_KEYS.comment.post(postId), ...);
```

**규칙.** 캐시 조작 API 는 제네릭 **반드시** 지정. 타입 추론에 맡기면 `unknown` 으로 떨어져 안전성 잃는다.

---

## 6. Import 규칙

### 6.1 `@/*` alias 필수

```tsx
// ✅
import { QUERY_KEYS } from "@/lib/constants";
import PostItem from "@/components/post/post-item";

// ❌
import { QUERY_KEYS } from "../../lib/constants";
```

### 6.2 타입 전용 import 명시

`verbatimModuleSyntax: true` 때문에 필수.

```ts
// ✅
import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

import type { AppUser } from "@/types";

// ❌ — 런타임 번들에 type 이 섞여 트리쉐이킹 깨짐
import { AxiosError, AxiosRequestConfig } from "axios";
```

### 6.3 확장자 규칙

- `.tsx` 파일 import 시 **확장자 명시**: `import App from "./App.tsx"`.
- `tsconfig.app.json` 의 `allowImportingTsExtensions: true` 덕분에 가능.
- `.ts` 도 확장자 명시 권장 (명시 안 해도 됨, 일관성 위해).

---

## 7. 관련 문서

- [루트 `CLAUDE.md`](../CLAUDE.md) — 프로젝트 정체성, 기술 스택, 전역 안티 패턴
- [`src/api/CLAUDE.md`](./api/CLAUDE.md) — API 레이어
- [`src/store/CLAUDE.md`](./store/CLAUDE.md) — Zustand 스토어
- [`src/hooks/CLAUDE.md`](./hooks/CLAUDE.md) — TanStack Query
- [`src/components/CLAUDE.md`](./components/CLAUDE.md) — 컴포넌트 공통 규칙
- [`src/components/modal/CLAUDE.md`](./components/modal/CLAUDE.md) — 모달 본체
- [`src/components/layout/CLAUDE.md`](./components/layout/CLAUDE.md) — 레이아웃 + 가드
- [`src/lib/CLAUDE.md`](./lib/CLAUDE.md) — 유틸 / axios / QUERY_KEYS
- [`src/pages/CLAUDE.md`](./pages/CLAUDE.md) — 라우트 페이지
- [`src/provider/CLAUDE.md`](./provider/CLAUDE.md) — Provider 순서와 이유
