# src/pages/CLAUDE.md — 라우트 페이지

> **이 폴더의 책임.** 각 URL 에 대응하는 페이지 컴포넌트. **얇게 유지** (`<Outlet />` 에 매달린 entry). 훅 호출은 최소, UI 조립 중심.
>
> **상위 문서.** [루트](../../CLAUDE.md) · [src](../CLAUDE.md)

---

## 1. 의존 규칙

| | |
| --- | --- |
| 의존 **가능** | `@/components/*`, `@/hooks/*`, `@/store/*`, `@/api/*` (얇게), React, React Router |
| 의존 **금지** | `@/provider/*` (페이지는 Provider 를 조립하지 않음), 다른 `@/pages/*` |

---

## 2. 파일 네이밍

**규칙.** 파일명은 `<route-name>-page.tsx` (kebab-case).

| 파일 | 경로 |
| --- | --- |
| `landing/landing-page.tsx` | `/` (마케팅 인덱스) |
| `sign-in-page.tsx` | `/sign-in` |
| `sign-up-page.tsx` | `/sign-up` |
| `forget-password-page.tsx` | `/forget-password` |
| `reset-password-page.tsx` | `/reset-password` |
| `oauth-callback-page.tsx` | `/oauth/callback` |
| `dashboard-page.tsx` | `/app` (앱 인덱스) |
| `profile-page.tsx` | `/app/profile` |
| `tables-page.tsx` | `/app/tables` |
| `notifications-page.tsx` | `/app/notifications` |
| `subscriptions-page.tsx` | `/app/subscriptions` |

**트래킹 도메인 예시** (앱 내부는 모두 `/app` prefix):
- `shipping-line-list-page.tsx` → `/app/shipping-lines`
- `shipping-line-detail-page.tsx` → `/app/shipping-lines/:id`
- `container-tracking-page.tsx` → `/app/containers/:trackingNumber`
- `terminal-list-page.tsx` → `/app/terminals`

---

## 3. Export 규칙

- **`export default`** 로 컴포넌트 하나만.
- 이름은 파일명 PascalCase (`DashboardPage`, `SignInPage`).
- 라우트 설정에서 `import DashboardPage from "@/pages/dashboard-page"`.

---

## 4. 얇게 유지 — UI 조립 중심

### 4.1 좋은 예

```tsx
// src/pages/dashboard-page.tsx (실제 코드)
import HeroBanner from "@/components/dashboard/hero-banner";
import StatCards from "@/components/dashboard/stat-cards";
import ProjectsTable from "@/components/dashboard/projects-table";
// ...
import Footer from "@/components/layout/footer";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col gap-6 p-6">
      <HeroBanner />
      <StatCards />
      <ProjectsTable />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SalesExpensesChart />
        <UserActivityChart />
      </div>
      {/* ... */}
      <Footer />
    </div>
  );
}
```

### 4.2 나쁜 예

```tsx
// ❌ 페이지 안에서 훅 / 데이터 / 사이드 이펙트를 다 함
export default function DashboardPage() {
  const { data } = useDashboardData();
  const { mutate: createPost } = useCreatePost(...);
  const [filter, setFilter] = useState(...);
  useEffect(() => { ... }, []);
  // ... 500 줄 JSX
}
```

**WHY 얇게.**
- 페이지는 라우트 전환마다 unmount / mount → 로컬 state 사라짐.
- 도메인 컴포넌트로 분리하면 다른 페이지에서 재활용 가능 (`PostFeed` 가 홈 + 프로필 공용 등).
- 쿼리 훅은 도메인 컴포넌트가 자체 호출 → 여러 페이지에서 같은 캐시 공유.

### 4.3 허용되는 페이지 로직

- **URL 파라미터 방어** (`useParams` + `<Navigate>`)
- **페이지 레벨 mutation** (예: SignInPage 의 `useSignInWithPassword`)
- **얇은 form state** (SignInPage 처럼 form 자체가 페이지의 주 내용일 때)
- **얇은 layout 조합** (grid 배치, 페이지별 컨테이너 클래스)

---

## 5. URL 파라미터 처리

```tsx
// 패턴 예시
import { Navigate, useParams } from "react-router-dom";

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.postId;

  if (!postId) return <Navigate to={"/app"} />;

  return (
    <div className="flex flex-col gap-5">
      <PostItem postId={Number(postId)} type={"DETAIL"} />
    </div>
  );
}
```

**규칙.**
1. `useParams()` 반환값은 `string | undefined`. **반드시 early return + `<Navigate>` 로 방어** 한 뒤 사용.
2. URL 파라미터는 **항상 문자열**이므로 숫자로 쓸 때 `Number(postId)` 명시.

---

## 6. Query Parameter — `useSearchParams`

```tsx
// src/pages/reset-password-page.tsx (실제 코드)
import { useSearchParams, Navigate } from "react-router-dom";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get("request_id");

  if (!requestId) return <Navigate to={"/forget-password"} replace={true} />;
  // ...
}
```

**규칙.** 쿼리 파라미터가 없거나 잘못되면 적절한 페이지로 `Navigate`.

---

## 7. 로그인 페이지 (mutation + form) 패턴

```tsx
// src/pages/sign-in-page.tsx (실제 코드 요약)
export default function SignInPage() {
  const navigate = useNavigate();

  // 1) useMutation
  const { mutate: signInWithPassword, isPending: isSignInPending } =
    useSignInWithPassword({
      onSuccess: () => navigate("/app", { replace: true }),
      onError: (error) => {
        toast.error(generateErrorMessage(error), { position: "top-center" });
      },
    });

  const { mutate: signInWithOAuth, isPending: isOAuthPending } =
    useSignInWithOAuth({
      onSuccess: () => navigate("/app", { replace: true }),
      onError: (error) => {
        toast.error(generateErrorMessage(error), { position: "top-center" });
      },
    });

  // 2) useState
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 3) 파생
  const isPending = isSignInPending || isOAuthPending;

  // 4) handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() === "" || password.trim() === "") return;
    signInWithPassword({ email, password });
  };

  // 5) JSX
  return (
    <div className="...">
      <form onSubmit={handleSubmit}>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} disabled={isPending} />
        {/* ... */}
        <Button type="submit" disabled={isPending}>Sign In</Button>
      </form>

      <Button type="button" onClick={() => signInWithOAuth("google")} disabled={isPending}>
        Google
      </Button>
      {/* ... */}
    </div>
  );
}
```

**규칙 요약.**
1. `useMutation` → `useState` → 파생 `isPending` → handlers → JSX 순서.
2. 모든 input / button 에 `disabled={isPending}`.
3. 실패 시 토스트, 성공 시 `navigate("/app", { replace: true })`.
4. 자세한 폼 규칙은 [`src/components/CLAUDE.md`](../components/CLAUDE.md) §10.

---

## 8. OAuth 콜백 페이지

팝업이 백엔드 redirect 받아 도착하는 경로. 가드 밖 (public route).

```tsx
// src/pages/oauth-callback-page.tsx (실제 코드)
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export default function OAuthCallbackPage() {
  const [params] = useSearchParams();

  useEffect(() => {
    const accessToken = params.get("access_token");
    const error = params.get("error");

    if (!window.opener) {
      // 팝업이 아닌 직접 접근 — 로그인 페이지로
      window.location.replace("/sign-in");
      return;
    }

    if (accessToken) {
      window.opener.postMessage(
        { type: "oauth-success", access_token: accessToken },
        window.location.origin,
      );
    } else {
      window.opener.postMessage(
        { type: "oauth-error", message: error ?? "Unknown error" },
        window.location.origin,
      );
    }
    window.close();
  }, [params]);

  return (
    <div className="...">
      <div className="text-body text-stone-600">인증 처리 중...</div>
    </div>
  );
}
```

**규칙.**
- `window.opener` 없으면 팝업 플로우 아님 → `/sign-in` 하드 네비게이션.
- `postMessage` 의 **targetOrigin 은 `window.location.origin`** — 다른 오리진으로 토큰 유출 차단.
- 콜백 페이지가 라우트 가드 없이 공개 상태여야 `root-route.tsx` 에 `Guest/MemberOnly` 밖에 둬야 함.
- 백엔드 계약: `${VITE_PUBLIC_URL}/oauth/callback?access_token=...` 또는 `?error=...` 로 redirect.

자세한 OAuth 는 [`src/api/CLAUDE.md`](../api/CLAUDE.md) §8.

---

## 9. 목록 / 상세 페이지 패턴 (트래킹 용)

### 9.1 목록 페이지

```tsx
// src/pages/shipping-line-list-page.tsx (예상 구조)
import CreateShippingLineButton from "@/components/shipping-line/create-shipping-line-button";
import ShippingLineList from "@/components/shipping-line/shipping-line-list";

export default function ShippingLineListPage() {
  return (
    <div className="flex flex-col gap-10 p-6">
      <CreateShippingLineButton />
      <ShippingLineList />
    </div>
  );
}
```

페이지는 얇게. 데이터 fetch / mutation 은 `ShippingLineList` / `CreateShippingLineButton` 이 담당.

### 9.2 상세 페이지

```tsx
// src/pages/shipping-line-detail-page.tsx (예상 구조)
import ShippingLineItem from "@/components/shipping-line/shipping-line-item";
import { Navigate, useParams } from "react-router-dom";

export default function ShippingLineDetailPage() {
  const params = useParams();
  const id = params.id;

  if (!id) return <Navigate to={"/app/shipping-lines"} />;

  return (
    <div className="flex flex-col gap-5 p-6">
      <ShippingLineItem id={Number(id)} type={"DETAIL"} />
    </div>
  );
}
```

---

## 10. 라우트 등록

새 페이지 추가 시 **반드시** `src/root-route.tsx` 에 등록.

```tsx
// src/root-route.tsx
import ShippingLineListPage from "@/pages/shipping-line-list-page";
import ShippingLineDetailPage from "@/pages/shipping-line-detail-page";

<Route path="/app" element={<MemberOnlyLayout />}>
  {/* ... */}
  <Route path="shipping-lines" element={<ShippingLineListPage />} />
  <Route path="shipping-lines/:id" element={<ShippingLineDetailPage />} />
</Route>
```

레이아웃 / 가드 선택은 [`src/components/layout/CLAUDE.md`](../components/layout/CLAUDE.md).

---

## 11. 안티 패턴

1. ❌ **페이지 안에서 데이터 fetch + state + UI 조립 전부** — 도메인 컴포넌트로 분리.
2. ❌ **페이지에서 가드 체크 (`if (!session) navigate(...)`)** — 레이아웃 가드로.
3. ❌ **`useParams()` 결과를 바로 숫자로 사용** — `Number(param)` 명시 + undefined 방어.
4. ❌ **페이지 파일명이 PascalCase** (`DashboardPage.tsx`) — kebab-case (`dashboard-page.tsx`).
5. ❌ **`<Link href>`** — React Router 는 `<Link to>` 사용.
6. ❌ **`<a href="/internal">`** — 페이지 이동은 `<Link>` 또는 `useNavigate`.
7. ❌ **`export function XxxPage`** — 페이지는 `export default`.
8. ❌ **페이지에서 `provider/`, 다른 `pages/` import**.

---

## 12. 새 페이지 추가 체크리스트

1. **파일**: `src/pages/<route>-page.tsx` (kebab-case).
2. **`export default function XxxPage(...)`**.
3. **얇게** — UI 조립 중심. 데이터는 도메인 컴포넌트가.
4. **URL 파라미터**: `useParams` + 방어 (`<Navigate>`).
5. **쿼리 파라미터**: `useSearchParams` + 방어.
6. **Form 페이지면** mutation + handlers + disabled (§7).
7. **`src/root-route.tsx` 등록** — 레이아웃 가드 아래 (MemberOnly / GuestOnly / Public).
8. **Sidebar mainLinks 업데이트** — MemberOnly 페이지가 탑 네비게이션에 필요하면 [`components/layout/CLAUDE.md`](../components/layout/CLAUDE.md) 참조.

---

## 13. 관련 문서

- [`src/components/CLAUDE.md`](../components/CLAUDE.md) — 폼 처리, 훅 순서, mutation 호출부
- [`src/components/layout/CLAUDE.md`](../components/layout/CLAUDE.md) — 가드, Sidebar 링크 배열
- [`src/hooks/CLAUDE.md`](../hooks/CLAUDE.md) — useQuery / useMutation 훅 (도메인 컴포넌트가 사용)
- [`src/api/CLAUDE.md`](../api/CLAUDE.md) — OAuth 팝업 플로우 (callback page 상세)
- [루트 §2.3](../../CLAUDE.md) — root-route.tsx 전체 구조
