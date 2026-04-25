# src/provider/CLAUDE.md — SessionProvider / ModalProvider

> **이 폴더의 책임.** 전역 Provider 2개 — `SessionProvider` (앱 부트스트랩 세션 복원 + 로더 단계) + `ModalProvider` (#modal-root 포털 마운트).
>
> **중요.** 이 Provider 들은 **React Context 를 새로 만들지 않는다.** 단지 부수효과 실행 + children 렌더. 상태 자체는 Zustand 에 있다.
>
> **상위 문서.** [루트](../../CLAUDE.md) · [src](../CLAUDE.md)

---

## 1. 의존 규칙

| | |
| --- | --- |
| 의존 **가능** | `@/store/*`, `@/api/*`, `@/components/*`, React |
| 의존 **금지** | `@/pages/*`, `@/hooks/*` 직접 (SessionProvider 는 api/auth 의 fetchMe 만 사용) |

---

## 2. Provider 순서 (App.tsx)

```tsx
// src/App.tsx
export default function App() {
  return (
    <SessionProvider>
      <ModalProvider>
        <RootRoute />
      </ModalProvider>
    </SessionProvider>
  );
}
```

**규칙.** `SessionProvider → ModalProvider → RootRoute`.

**WHY `SessionProvider` 가 가장 바깥.**
- 세션 복원 (`fetchMe`) 이 끝나기 전에 라우트를 그리면 `MemberOnlyLayout` 이 `session === null` 을 "비로그인" 으로 해석 → `/sign-in` 으로 튕긴 뒤, 세션 복원되면 다시 `/` 로 돌아옴 → **깜빡임**.
- `SessionProvider` 가 `isLoaded=false` 구간 동안 `GlobalLoader` 만 렌더 → 라우트 / 모달이 마운트되지 않아 원천 차단.

**WHY `ModalProvider` 가 RootRoute 보다 바깥.**
- 모달 본체를 한 번만 마운트하기 위해 라우트보다 상위에 있어야 함. 라우트 전환 시 모달 재생성 방지.

**Router / QueryClient 는 어디에.** 이 두 Provider 는 App 밖 `main.tsx` 에 있음. Router 는 가장 바깥 → Provider 들도 라우터 context 사용 가능. 자세한 건 루트 §2.1.

---

## 3. SessionProvider (실제 코드)

```tsx
// src/provider/session-provider.tsx
import GlobalLoader from "@/components/global-loader";
import { fetchMe } from "@/api/auth";
import { useIsSessionLoaded, useSetSession } from "@/store/session";
import { useEffect, type ReactNode } from "react";

export default function SessionProvider({ children }: { children: ReactNode }) {
  const setSession = useSetSession();
  const isSessionLoaded = useIsSessionLoaded();

  useEffect(() => {
    let cancelled = false;

    // Demo mode — VITE_MOCK_SESSION=true skips /user/me and injects a demo user.
    if (import.meta.env.VITE_MOCK_SESSION === "true") {
      setSession({
        user: {
          id: "demo",
          email: "demo@example.com",
          name: "Demo User",
          role: "user",
          auth_provider: "password",
        },
      });
      return () => {
        cancelled = true;
      };
    }

    (async () => {
      try {
        const me = await fetchMe();
        if (!cancelled) setSession({ user: me });
      } catch {
        if (!cancelled) setSession(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setSession]);

  if (!isSessionLoaded) return <GlobalLoader />;
  return children;
}
```

### 3.1 규칙

1. **`useEffect` 는 마운트 1회 실행** (`[setSession]` deps; `setSession` 은 Zustand 에서 레퍼런스 안정).
2. **IIFE `(async () => { ... })()`** 로 비동기 함수 실행. `useEffect` 콜백 자체를 `async` 로 만들지 않는다 (cleanup 반환과 충돌).
3. **`cancelled` 플래그 + cleanup** 으로 언마운트 후의 setState 방지.
4. **`fetchMe` 실패 = 확정 비로그인.** `setSession(null)` 로 `isLoaded=true` 도 함께 세팅되어 라우트 렌더.
5. **`isLoaded === false` 구간**엔 `<GlobalLoader />` 만. 라우트 / 모달 마운트 안 됨.
6. **`setSession({ user: me })` 한 줄로.** `me` 는 이미 `AppUser` 타입이므로 필드 재조립 금지.

### 3.2 Mock 모드 분기

```ts
if (import.meta.env.VITE_MOCK_SESSION === "true") {
  setSession({ user: { id: "demo", ... } });
  return () => { cancelled = true; };
}
```

- 환경변수 `VITE_MOCK_SESSION` 이 `"true"` 문자열일 때만 데모 세션 주입.
- `.env` 기본값은 `true` — 백엔드 없이 대시보드 프리뷰 가능.
- 실 서비스 시 `false` 로 전환 (또는 변수 제거) → 실제 `fetchMe` 호출 경로.

Mock 관련 UX 는 Sidebar 의 DEMO MODE 배지로 처리 → [`src/components/layout/CLAUDE.md`](../components/layout/CLAUDE.md) §4.3.

---

## 4. ModalProvider (실제 코드)

```tsx
// src/provider/modal-provider.tsx
import AlertModal from "@/components/modal/alert-modal";
import ProfileEditorModal from "@/components/modal/profile-editor-modal";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

export default function ModalProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {createPortal(
        <>
          <AlertModal />
          <ProfileEditorModal />
        </>,
        document.getElementById("modal-root")!,
      )}
      {children}
    </>
  );
}
```

### 4.1 규칙

1. **`index.html` 에 `<div id="modal-root"></div>` 필수**:
   ```html
   <body>
     <div id="root"></div>
     <div id="modal-root"></div>
     <script type="module" src="/src/main.tsx"></script>
   </body>
   ```
2. **모든 전역 모달 본체는 여기서 한 번만 마운트.** `createPortal` 로 `#modal-root` 에.
3. **`AlertModal` 은 항상 포함.** 다른 모달들이 confirm 다이얼로그로 사용.
4. **새 모달 추가 시** portal 안에 한 줄 추가:
   ```tsx
   <ShippingLineEditorModal />   // ← 추가
   ```

### 4.2 새 모달 등록 체크리스트

1. `store/<name>-modal.ts` 작성 ([`src/store/CLAUDE.md`](../store/CLAUDE.md))
2. `components/modal/<name>-modal.tsx` 작성 ([`src/components/modal/CLAUDE.md`](../components/modal/CLAUDE.md))
3. 이 파일 portal 안에 `<XxxModal />` 추가
4. 여는 버튼에서 `useOpenXxxModal()` 호출

---

## 5. Context vs Zustand 선택 기준 (전역)

**규칙.** 전역 상태는 **Zustand 만**. React Context 는 쓰지 않는다.

### 5.1 왜 Context 안 쓰는가

- Context 는 value 변경 시 **Provider 하위 모든 소비자** 리렌더. selector 가 없어 성능 저하 구조적.
- Zustand 는 `useStore(s => s.theme)` 같은 selector 로 **필요한 조각만 구독** → 무관한 컴포넌트는 리렌더 X.

### 5.2 예외 — 라이브러리가 Context 강제

- React Router (`useNavigate`, `useParams` 등 Context 기반 API)
- TanStack Query (`QueryClientProvider`)
- shadcn Chart (`ChartContext` — 라이브러리 내부 구현)

**이 프로젝트의 Provider 파일**은 라이브러리 Context 아니다. 단지 **부수효과 실행 + children 렌더** 하는 컴포넌트. 상태 자체는 전부 Zustand.

### 5.3 구분하는 방법

- "Provider 가 value prop 에 뭔가 넘겨주는가?" → Context. 쓰지 마라.
- "Provider 가 `useEffect` / `createPortal` 만 하고 children 을 그대로 렌더?" → 이 프로젝트의 패턴. OK.

---

## 6. 안티 패턴

1. ❌ **`React.createContext` 로 새 전역 상태 만들기** — Zustand.
2. ❌ **SessionProvider 에서 상태를 내부 `useState` 로 보관** — 반드시 Zustand store.
3. ❌ **ModalProvider 에 모달 본체가 아닌 다른 것 넣기** — Provider 는 모달 마운트만.
4. ❌ **SessionProvider 의 `useEffect` 콜백을 `async` 로** — IIFE 패턴.
5. ❌ **`isLoaded` 없이 세션 체크** — `session === null` 이 "로딩 중" 인지 "비로그인" 인지 구분 안 됨.
6. ❌ **SessionProvider 가 SSR 환경에서 `fetchMe`** — 이 프로젝트는 client-only Vite 라 상관없지만, SSR 도입 시 guard 추가.

---

## 7. 새 Provider 추가 체크리스트

새 Provider 가 정말 필요한가? (대부분 Zustand 스토어로 대체 가능)

필요하다면:

1. **Context 생성 여부** — 라이브러리가 요구하면 OK, 아니면 Zustand 로 대체.
2. **파일**: `src/provider/<name>-provider.tsx`.
3. **`export default function XxxProvider({ children }: { children: ReactNode })`**.
4. **`useEffect` 안에서 부수효과** — IIFE, cancelled 플래그, cleanup.
5. **로딩 단계 분리가 필요하면** — `if (!isLoaded) return <Loader />` 처럼 early return.
6. **`App.tsx` 에 등록** — 기존 Provider 중첩 순서 고려.
7. **상태는 Zustand store 로** — `store/<name>.ts` 별도 파일.

---

## 8. 관련 문서

- [`src/store/CLAUDE.md`](../store/CLAUDE.md) — Zustand 스토어 (SessionProvider 가 `useSetSession`, `useIsSessionLoaded` 를 사용)
- [`src/api/CLAUDE.md`](../api/CLAUDE.md) — `fetchMe` (SessionProvider 가 호출)
- [`src/components/modal/CLAUDE.md`](../components/modal/CLAUDE.md) — 모달 본체 규칙
- [`src/components/layout/CLAUDE.md`](../components/layout/CLAUDE.md) — 가드 (SessionProvider 의 isLoaded 에 의존)
- [루트 §2](../../CLAUDE.md) — Provider 중첩 순서와 근거
- [루트 §6.1](../../CLAUDE.md) — Context vs Zustand 선택 기준
