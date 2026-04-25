# src/components/layout/CLAUDE.md — 레이아웃 + 라우트 가드

> **이 폴더의 책임.** 라우트 레벨 레이아웃 (사이드바 포함 셸) 과 인증 가드 (GuestOnly / MemberOnly). 페이지 자체에서 가드 체크하지 않는다.
>
> **상위 문서.** [루트](../../../CLAUDE.md) · [src](../../CLAUDE.md) · [components](../CLAUDE.md)

---

## 1. 현재 파일

| 파일 | 용도 |
| --- | --- |
| `guest-only-layout.tsx` | 비로그인 전용 가드 (`session` 있으면 `/` 로 Navigate) |
| `member-only-layout.tsx` | 로그인 전용 가드 + Sidebar 포함 셸 |
| `sidebar.tsx` | 좌측 네비게이션 |
| `footer.tsx` | 페이지 하단 푸터 |

---

## 2. 가드 구현 원칙

### 2.1 가드는 렌더 결과로 `<Navigate>` 를 리턴

**규칙.** 각 페이지 컴포넌트 안에서 `useEffect + useNavigate` 로 가드하지 않는다. **중첩 레이아웃 라우트**에서 `<Navigate>` 반환.

```tsx
// src/components/layout/guest-only-layout.tsx (실제 코드)
import { useSession } from "@/store/session";
import { Navigate, Outlet } from "react-router-dom";

export default function GuestOnlyLayout() {
  const session = useSession();
  if (session) return <Navigate to={"/app"} replace={true} />;
  return <Outlet />;
}
```

```tsx
// src/components/layout/member-only-layout.tsx (실제 코드)
import Sidebar from "@/components/layout/sidebar";
import { useSession } from "@/store/session";
import { Navigate, Outlet } from "react-router-dom";

export default function MemberOnlyLayout() {
  const session = useSession();
  if (!session) return <Navigate to={"/sign-in"} replace={true} />;
  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
```

**규칙.**
1. **`replace={true}`** 로 히스토리 스택 교체. 뒤로가기로 다시 들어오지 않게.
2. **`useEffect` 금지.** 가드는 렌더 결과 분기.
3. 이 컴포넌트들은 **SessionProvider 가 `isLoaded=true` 를 보장한 뒤** 마운트됨 ([`src/provider/CLAUDE.md`](../../provider/CLAUDE.md) 참조). 따라서 `session === null` 은 "확정 비로그인".

**WHY 가드를 레이아웃에 두는가.** 각 페이지에서 체크하면 **페이지 한 번 마운트됐다가 튕기는 깜빡임** 발생 (useEffect 는 렌더 후 실행). 레이아웃에서 `Navigate` 를 리턴하면 보호된 페이지 컴포넌트 자체가 렌더되지 않음.

### 2.2 라우트 트리 구조

```tsx
// src/root-route.tsx
<Routes>
  <Route path="/oauth/callback" element={<OAuthCallbackPage />} />   {/* Public */}

  <Route element={<LandingLayout />}>
    <Route index element={<LandingPage />} />               {/* / */}
    <Route path="/about" element={<AboutPage />} />
    {/* ... 마케팅 */}
  </Route>

  <Route element={<GuestOnlyLayout />}>
    <Route path="/sign-in" element={<SignInPage />} />
    <Route path="/sign-up" element={<SignUpPage />} />
    <Route path="/forget-password" element={<ForgetPasswordPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
  </Route>

  <Route path="/app" element={<MemberOnlyLayout />}>
    <Route index element={<DashboardPage />} />             {/* /app */}
    <Route path="tables" element={<TablesPage />} />        {/* /app/tables */}
    {/* ... */}
  </Route>

  <Route path="*" element={<NotFoundPage />} />
</Routes>
```

- **LandingLayout / GuestOnlyLayout** 은 `path` 없는 레이아웃 라우트.
- **MemberOnlyLayout 은 `path="/app"` 위에 장착** — 하위 라우트가 모두 `/app` prefix.
- 내부 `<Outlet />` 으로 자식 라우트 렌더.
- `/oauth/callback` 은 팝업이 도착하는 경로라 **가드 밖** (public).

---

## 3. MemberOnlyLayout 의 셸 구조

```tsx
<div className="flex min-h-screen bg-stone-50">
  <Sidebar />
  <main className="flex-1 overflow-auto">
    <Outlet />
  </main>
</div>
```

- 외곽 `min-h-screen flex`: 사이드바 + 본문 좌우 배치, 본문이 넘치면 스크롤.
- `Sidebar` 는 **sticky** 로 상단 고정 (§4).
- `main` 은 `flex-1 overflow-auto` — 본문 스크롤.

**디자인 규칙.** `bg-stone-50` 는 현재 테마. `index.css` 토큰 값이 아니라 Tailwind 팔레트의 literal. 변경 금지 (리팩터 시 디자인 보존 원칙).

---

## 4. Sidebar 패턴

### 4.1 구조

```tsx
<aside className="sticky top-0 flex h-screen w-[240px] shrink-0 flex-col px-4 py-6">
  <h1 className="heading-md mb-4 px-2 text-stone-900">Material Shadcn</h1>

  <nav className="flex flex-col gap-1">
    {mainLinks.map((link) => {
      const isActive = location.pathname === link.to;
      return (
        <Link
          key={link.label}
          to={link.to}
          className={`text-body flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
            isActive
              ? "bg-gradient-to-b from-stone-600 to-stone-800 text-stone-50 shadow-sm"
              : "text-stone-700 hover:bg-stone-100"
          }`}
        >
          <link.icon className="h-4 w-4" />
          <span>{link.label}</span>
        </Link>
      );
    })}
  </nav>

  <Separator className="my-4 bg-stone-200" />

  <div className="mt-auto flex flex-col gap-1">
    {IS_MOCK_MODE ? (
      <div className="...">DEMO MODE</div>
    ) : (
      <button onClick={handleSignOutClick}>Sign Out</button>
    )}
  </div>
</aside>
```

**핵심 규칙.**
1. **`sticky top-0 h-screen`** — 스크롤 중에도 사이드바 고정.
2. **`w-[240px] shrink-0`** — 고정 너비, 본문이 좁혀도 유지.
3. **mainLinks 배열 + map**. 새 트래킹 페이지 추가 시 이 배열에 한 줄 추가 (모두 `/app` prefix):
   ```ts
   const mainLinks = [
     { label: "Dashboard", icon: LayoutDashboard, to: "/app" },
     { label: "Shipping Lines", icon: Ship, to: "/app/shipping-lines" },   // 트래킹 신규
     { label: "Containers", icon: Package, to: "/app/containers" },
     // ...
   ];
   ```
4. **`isActive` 판정**은 `location.pathname === link.to`. 정확 일치. 하위 경로까지 포함하려면 `startsWith` 로 변경.
5. **`<Link>` 사용** — `<a>` 금지.

### 4.2 Sign Out + AlertModal 패턴

```tsx
const openAlertModal = useOpenAlertModal();
const { mutate: signOut, isPending: isSignOutPending } = useSignOut({
  onError: (error) => {
    toast.error(generateErrorMessage(error), { position: "top-center" });
  },
});

const handleSignOutClick = () => {
  openAlertModal({
    title: "로그아웃 하시겠습니까?",
    description: "다시 로그인하려면 이메일과 비밀번호가 필요합니다.",
    onPositive: () => signOut(),
  });
};
```

### 4.3 Mock 모드 UX 처리

```tsx
const IS_MOCK_MODE = import.meta.env.VITE_MOCK_SESSION === "true";
```

모듈 스코프 상수로 체크. `VITE_MOCK_SESSION=true` 일 때 Sign Out 버튼 대신 "DEMO MODE" 배지 표시. 사용자가 데모에서 Sign Out 눌러 `/sign-in` 에 갇히는 것 방지.

**WHY.** Mock 모드는 백엔드 없이 대시보드 보여주는 용도. Sign Out 하면 세션 null → `/sign-in` redirect → 로그인 불가 (백엔드 없음). 배지로 상태 명시하는 게 UX 정답.

---

## 5. Footer

```tsx
// src/components/layout/footer.tsx
<footer className="mt-auto">
  <Separator className="bg-stone-200" />
  <div className="flex items-center justify-between px-2 py-4">
    ...
  </div>
</footer>
```

**규칙.** 각 페이지가 독립적으로 import 해서 사용 (MemberOnlyLayout 에 강제 포함하지 않음). 페이지별로 Footer 를 넣는다/뺀다 선택 가능.

---

## 6. 향후 확장

### 6.1 Header 분리 (필요 시)

현재 헤더는 없음 (Sidebar 에 제목 포함). 상단 검색바 / 사용자 메뉴가 필요해지면:
- `components/layout/header/` 폴더 생성
- `components/layout/header/header.tsx` 와 하위 버튼 (`profile-button.tsx`, `theme-button.tsx` 등)
- `MemberOnlyLayout` 에 `<Header />` 추가

### 6.2 GlobalLayout (공통 껍데기)

Guest / Member 둘 다 공통 껍데기가 필요하면 상위 `GlobalLayout` 라우트 추가:

```tsx
<Route element={<GlobalLayout />}>        {/* 공통 헤더/푸터 */}
  <Route element={<GuestOnlyLayout />}>...</Route>
  <Route element={<MemberOnlyLayout />}>...</Route>
</Route>
```

현재는 불필요 — Guest 페이지와 Member 페이지가 완전히 다른 셸 (Guest 는 풀페이지 카드, Member 는 사이드바).

---

## 7. 안티 패턴

1. ❌ **각 페이지에서 `useEffect` + `useNavigate` 로 가드 체크** — 레이아웃에서 `<Navigate>` 반환.
2. ❌ **Sidebar 에서 `<a href="/xxx">`** — `<Link>` 또는 `useNavigate`.
3. ❌ **mainLinks 배열을 Sidebar 파일 밖에서 정의** — 이 파일 top-level 상수로.
4. ❌ **`replace` prop 생략** — `<Navigate to="..." replace={true} />` 필수.
5. ❌ **가드 레이아웃에서 `<Outlet />` 외 추가 children** — `MemberOnlyLayout` 처럼 셸(`<Sidebar /><main>`) 은 허용. `GuestOnlyLayout` 은 `<Outlet />` 만.
6. ❌ **가드에서 `isLoaded` 체크** — SessionProvider 가 이미 로드 전엔 `GlobalLoader` 만 그리므로 여기에 도달했으면 `isLoaded = true` 확정.

---

## 8. 새 레이아웃 / 가드 추가 체크리스트

1. **위치**: `src/components/layout/<name>.tsx`.
2. **`export default`** 컴포넌트.
3. **가드면** — `useSession()` 체크 + `<Navigate replace />` 반환.
4. **셸이면** — 외곽 div + `<Outlet />` 포함.
5. **`root-route.tsx` 에 등록** — `<Route element={<NewLayout />}>` 로 감싼 자식 라우트 정의.
6. **내부 컴포넌트 (Sidebar / Header 등) 는 같은 폴더** 또는 `layout/header/` 하위.

---

## 9. 관련 문서

- [`src/provider/CLAUDE.md`](../../provider/CLAUDE.md) — SessionProvider 가 isLoaded 보장, 이 문서의 가드 전제 조건
- [`src/store/CLAUDE.md`](../../store/CLAUDE.md) — `useSession`, `useSetSession`
- [`src/pages/CLAUDE.md`](../../pages/CLAUDE.md) — 페이지 얇게 유지, 라우트 컨벤션
- [`src/hooks/CLAUDE.md`](../../hooks/CLAUDE.md) — `useSignOut` 패턴
- [루트 §2.3](../../../CLAUDE.md) — root-route.tsx 구조
