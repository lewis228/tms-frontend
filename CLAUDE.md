# CLAUDE.md — TMS 프론트엔드 코드 스타일 가이드

> **이 프로젝트는 무엇인가.** TMS(Transportation Management System) 기능을 제공하는 프론트엔드. `react-boilerplate` ([HyeongTaekJo/react-boilerplate](https://github.com/HyeongTaekJo/react-boilerplate)) 패턴 위에 구축됨.
>
> **이 문서는 무엇인가.** 프로젝트 전역 규칙과 각 폴더별 상세 규칙으로 연결되는 허브. 새 코드를 작성할 때 **반드시** 관련 하위 `CLAUDE.md` 를 먼저 읽는다.
>
> **규칙 포맷.** 모든 규칙은 **규칙 + WHY + 실제 코드 인용(파일 경로 주석)** 세 요소를 갖춘다.

---

## 0. 문서 네비게이션

새 코드를 짤 때 해당 폴더의 `CLAUDE.md` 를 **함께 읽는다**. Claude Code 는 편집 중 파일의 폴더 + 상위 폴더의 `CLAUDE.md` 를 자동 로드한다.

| 작업할 영역 | 참조할 문서 |
| --- | --- |
| 전체 폴더 구조 / 의존 방향 / 결정 트리 | [`src/CLAUDE.md`](./src/CLAUDE.md) |
| axios 래퍼 (HTTP 호출) | [`src/api/CLAUDE.md`](./src/api/CLAUDE.md) |
| Zustand 스토어 (전역 상태) | [`src/store/CLAUDE.md`](./src/store/CLAUDE.md) |
| TanStack Query (서버 상태) | [`src/hooks/CLAUDE.md`](./src/hooks/CLAUDE.md) |
| 컴포넌트 작성 (공통 규칙) | [`src/components/CLAUDE.md`](./src/components/CLAUDE.md) |
| 모달 본체 작성 | [`src/components/modal/CLAUDE.md`](./src/components/modal/CLAUDE.md) |
| 레이아웃 / 라우트 가드 | [`src/components/layout/CLAUDE.md`](./src/components/layout/CLAUDE.md) |
| 유틸 / axios 인스턴스 / QUERY_KEYS | [`src/lib/CLAUDE.md`](./src/lib/CLAUDE.md) |
| 라우트 페이지 | [`src/pages/CLAUDE.md`](./src/pages/CLAUDE.md) |
| Session / Modal Provider | [`src/provider/CLAUDE.md`](./src/provider/CLAUDE.md) |

---

## 1. 기술 스택

| 영역 | 라이브러리 / 도구 | 역할 |
| --- | --- | --- |
| 번들러 | Vite 7 (`@vitejs/plugin-react` + `@tailwindcss/vite`) | 개발 서버 / 빌드 |
| 언어 | TypeScript 5.9 (`strict: true`, `verbatimModuleSyntax: true`) | 정적 타입 |
| UI | React 19 (Concurrent `createRoot`) | 컴포넌트 |
| 라우팅 | `react-router-dom` v7 | `BrowserRouter` + 중첩 라우트 + `Outlet` |
| 서버 상태 | `@tanstack/react-query` v5 (+ devtools) | `useQuery` / `useInfiniteQuery` / `useMutation` |
| 클라이언트 상태 | `zustand` v5 | `create` + `combine` + `devtools` (+ `persist` 일부) |
| HTTP | `axios` | 단일 인스턴스 + JWT 인터셉터 + 401 refresh |
| 스타일 | Tailwind CSS v4 | `@import "tailwindcss"` + `@custom-variant dark` |
| UI 프리미티브 | shadcn/ui (`radix-ui` + `@base-ui/react/button`) | alert-dialog / button / card / dialog / input / popover / sonner / table / textarea ... |
| 아이콘 | `lucide-react` | |
| 토스트 | `sonner` | `toast.error/info/success` (`{ position: "top-center" }`) |
| 폰트 | `@fontsource-variable/geist` + Inter (Google Fonts) | |
| 차트 | `recharts` | |
| 다국어 | `i18next` + `react-i18next` | `useTranslation()` 훅 / `i18n.t()` 싱글톤 / `src/i18n/locales/{ko,en}.json` |
| 인터섹션 관찰 | `react-intersection-observer` | `useInView()` 무한 스크롤 센티넬 |
| 린터 | ESLint (+ typescript-eslint + react-hooks + react-refresh) | `no-unused-vars` / `no-explicit-any` = error |
| 포매터 | Prettier + `prettier-plugin-tailwindcss` | Tailwind 클래스 자동 정렬 |
| 패키지 매니저 | **npm** (고정) | `package-lock.json` |

**규칙.** pnpm / yarn 금지 (락파일 혼재 시 CI 의존성 충돌). 다른 라이브러리 추가 시 **반드시** 위 목적과 겹치지 않는지 확인.

---

## 2. 진입점과 Provider 중첩

### 2.1 main.tsx

```tsx
// src/main.tsx
createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools />
      <Toaster />
      <App />
    </QueryClientProvider>
  </BrowserRouter>,
);
```

**규칙.**

1. `Router → Query → App` 순. Router 가 최상위여야 하위 모든 컴포넌트에서 `useNavigate` / `useParams` / `Link` 가 동작.
2. `QueryClient` 기본값은 `retry: false` + `refetchOnWindowFocus: false`. 실패는 즉시 UI 에 노출, 무효화는 각 mutation 이 명시적으로 수행.
3. `Toaster` 는 `<App>` 밖. `<App>` 이 `SessionProvider` 로 로더 단계에 있어도 토스트는 독립적으로 떠야 함.

### 2.2 App.tsx (Provider 합성만)

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

**규칙.** `App.tsx` 는 **조립만 담당**. UI 는 그리지 않는다. 라우트는 `root-route.tsx` 로 분리.

**WHY `SessionProvider` 가 가장 바깥인가.** 세션 복원(`fetchMe`) 이 끝나기 전에 라우트를 그리면 `MemberOnlyLayout` 이 `session === null` 을 "비로그인" 으로 해석해 `/sign-in` 으로 튕긴다. 그 후 세션 복원되면 다시 `/app` 으로 돌아와 "깜빡임". `SessionProvider` 가 `GlobalLoader` 로 이 구간을 원천 차단.

### 2.3 root-route.tsx (라우트 트리)

**핵심 구조.** 경로를 **세 영역**으로 나눈다.

| prefix | 가드 | 용도 |
| --- | --- | --- |
| `/` | LandingLayout (public) | 랜딩 + 마케팅 서브페이지 (`/about`, `/pricing`, `/blog`, ...) |
| `/sign-in`, `/sign-up`, ... | GuestOnlyLayout | 인증 / 온보딩 (로그인되어 있으면 `/app` 으로 리다이렉트) |
| `/app/*` | MemberOnlyLayout | 앱 본체 (비로그인이면 `/sign-in` 으로 리다이렉트) |

```tsx
// src/root-route.tsx 의 구조 요약
<Routes>
  <Route path="/oauth/callback" element={<OAuthCallbackPage />} />   {/* Public */}
  <Route path="/coming-soon" element={<ComingSoonPage />} />
  <Route path="/maintenance" element={<MaintenancePage />} />

  {/* 마케팅 — `/` 에 랜딩 인덱스 */}
  <Route element={<LandingLayout />}>
    <Route index element={<LandingPage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/pricing" element={<PricingPage />} />
    {/* ... */}
  </Route>

  <Route element={<GuestOnlyLayout />}>
    <Route path="/sign-in" element={<SignInPage />} />
    <Route path="/sign-up" element={<SignUpPage />} />
    <Route path="/forget-password" element={<ForgetPasswordPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    {/* 온보딩 */}
  </Route>

  {/* 앱 — `/app` prefix 아래 전부 */}
  <Route path="/app" element={<MemberOnlyLayout />}>
    <Route index element={<DashboardPage />} />
    <Route path="tables" element={<TablesPage />} />
    <Route path="profile" element={<ProfilePage />} />
    <Route path="notifications" element={<NotificationsPage />} />
    <Route path="subscriptions" element={<SubscriptionsPage />} />
    {/* 신규 트래킹 도메인은 여기에 추가 (예: <Route path="shipping-lines" ... />) */}
  </Route>

  <Route path="*" element={<NotFoundPage />} />
</Routes>
```

**WHY `/app` prefix.**
- 마케팅 페이지(`/`, `/about`, `/pricing`) 와 앱(`/app/*`) 이 URL 수준에서 명확히 분리 → SEO / 분석 / CDN 캐시 정책 구분 용이.
- 가드가 **한 곳** (`<Route path="/app">`) 에 걸려 있어 새 앱 페이지 추가 시 경로만 선언하면 자동 보호.
- Sidebar 링크가 전부 `/app/...` 로 통일 → 경로 패턴 일관.

상세 규칙은 [`src/components/layout/CLAUDE.md`](./src/components/layout/CLAUDE.md) 와 [`src/pages/CLAUDE.md`](./src/pages/CLAUDE.md) 참조.

---

## 3. 전역 TypeScript 규칙

### 3.1 strict 설정 필수

`tsconfig.app.json` 에 다음이 켜져 있다. **절대 끄지 않는다.**

```json
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "verbatimModuleSyntax": true,
  "erasableSyntaxOnly": true,
  "noFallthroughCasesInSwitch": true,
  "noUncheckedSideEffectImports": true
}
```

**WHY 각 옵션.**
- `verbatimModuleSyntax`: 타입 전용 import 를 `import type` 또는 `import { type X }` 로 명시 강제. 런타임 번들 트리쉐이킹 보장.
- `erasableSyntaxOnly`: `enum` 같은 런타임 생성 구문 금지. `type` / `interface` / `as const` 만 허용.
- `noUnusedLocals` / `noUnusedParameters`: 죽은 코드 차단.

### 3.2 import 경로

**규칙.** 모든 소스 import 는 `@/` prefix 로 시작. **상대 경로(`../../`) 금지.**

```tsx
// ✅ Good
import { QUERY_KEYS } from "@/lib/constants";
import PostItem from "@/components/post/post-item";

// ❌ Bad
import { QUERY_KEYS } from "../../lib/constants";
```

**WHY.** 파일 이동 시 리팩터 비용 최소화. 경로에서 "이 모듈은 어디에 있는지" 가 자명해짐.

### 3.3 `any` / `!` / `as` 사용 규칙

자세한 규칙은 [`src/CLAUDE.md`](./src/CLAUDE.md) §"타입 규칙". 요약:

- **`any` 절대 금지.** ESLint `error` 로 강제. 불가피하면 `unknown` + 타입 가드.
- **`!` non-null assertion 은 3가지 경우만 허용** — `enabled: !!x` 가드된 queryFn 내부, `MemberOnlyLayout` 하위의 `session!`, `index.html` 에 반드시 존재하는 DOM 엘리먼트.
- **`as` 단언 5가지만 허용** — Zustand 초기값 유니온, DU 스토어 훅 반환, axios 에러 payload, axios config 확장, `AxiosHeaders` 를 `Record<string, string>` 으로.
- **이중 단언 금지**: `value as any`, `value as unknown as T`.

---

## 4. 전역 네이밍 규칙

### 4.1 파일명 / 폴더명: kebab-case

| 종류 | 예시 |
| --- | --- |
| 컴포넌트 | `post-item.tsx`, `edit-profile-button.tsx` |
| 페이지 | `dashboard-page.tsx`, `sign-in-page.tsx` |
| 쿼리 훅 | `use-profile-data.ts`, `use-infinite-posts-data.ts` |
| 뮤테이션 훅 | `use-create-post.ts`, `use-toggle-post-like.ts` |
| 스토어 | `session.ts`, `alert-modal.ts` |
| API | `auth.ts`, `post.ts` |
| 폴더 | `components/layout/header/`, `hooks/mutations/post/` |

### 4.2 식별자명: JS 관례

- 컴포넌트: **PascalCase** (`PostItem`, `EditProfileButton`)
- 훅: **camelCase** with `use` prefix (`useCreatePost`, `useProfileData`)
- 타입: **PascalCase** (`PostEntity`, `NestedComment`, `UseMutationCallback`)
- 상수: 모듈 스코프 `UPPER_SNAKE_CASE` 또는 camelCase 허용 (`PAGE_SIZE`, `QUERY_KEYS`)

### 4.3 Export 원칙

- **컴포넌트 파일**: `export default`. 파일당 1개 컴포넌트.
- **훅 파일**: **named `export function`** (default 금지 — 원본 `frontend_sample` 의 `use-toggle-post-like.ts` 가 유일한 예외였지만 새 파일은 named 로 통일).
- **스토어**: named export 로 `useXxxStore` + selector 훅들 (`useXxx`, `useSetXxx`, `useOpenXxx` ...).
- **API**: named export per 함수.

### 4.4 ESLint 예외

- `src/components/ui/**` 는 `react-refresh/only-export-components` 룰을 **끈다**. shadcn/ui 자동 생성 파일은 컴포넌트와 variant(cva) 를 같은 파일에서 export 하는 관용이 있어 구조적으로 경고 발생.
- 그 외 모든 컴포넌트 파일은 "컴포넌트 1개 + 필요 시 const 상수만 export" 를 지킨다.

---

## 5. 환경변수

`.env` 와 `.env.example` 두 파일. 값 형식 동일하게 유지.

```dotenv
# .env / .env.example
VITE_API_URL=http://localhost:8080      # FastAPI 백엔드 엔드포인트
VITE_PUBLIC_URL=http://localhost:5173   # OAuth 콜백 등 프론트 공개 URL
VITE_MOCK_SESSION=true                  # 백엔드 없이 대시보드 미리보기 (실서비스 시 false)
```

**규칙.**

1. 클라이언트 노출 변수는 **반드시 `VITE_` prefix**. Vite 는 이 prefix 없으면 번들에 노출하지 않음.
2. `.env` 는 커밋하지 않는다 (`.gitignore` 에 있음). `.env.example` 만 커밋.
3. **비밀 값(secret, service account key 등) 은 절대 프론트엔드에 넣지 않는다.** 런타임 번들이 브라우저에 그대로 떨어진다.
4. `VITE_API_URL` 사용 시 **`||` 로 fallback** (빈 문자열도 catch):
   ```ts
   export const API_BASE_URL =
     import.meta.env.VITE_API_URL || "http://localhost:8080";
   ```
   **WHY.** `??` 는 `null` / `undefined` 만 catch. `.env` 에 `VITE_API_URL=` (값 비움)으로 쓰면 baseURL 이 `""` 가 되어 요청이 상대 URL 로 나가는 버그 발생.

타입 확장은 `src/vite-env.d.ts`:
```ts
/// <reference types="vite/client" />
```

---

## 6. 아키텍처 의사결정 (이 프로젝트의 "헌법")

### 6.1 전역 상태: Zustand 만

**규칙.** `React.createContext` 로 전역 상태 새로 만들지 않는다. 전부 Zustand.

**WHY.**
- Context 는 value 가 바뀌면 Provider 하위의 **모든 소비자** 가 리렌더 → 성능 저하 구조적.
- Zustand 는 `useStore(s => s.theme)` 같은 selector 로 **필요한 조각만 구독** → 무관한 컴포넌트는 리렌더 X.
- 예외: `react-router` / `@tanstack/react-query` 같이 라이브러리가 Context 를 강제하는 경우는 허용 (라이브러리 구현 내부).

### 6.2 서버 상태: TanStack Query 만

**규칙.** 서버 데이터는 `useState` 로 관리하지 않는다. 전부 `useQuery` / `useInfiniteQuery` / `useMutation`. 컴포넌트는 **절대 `fetch` / `axios` 를 직접 부르지 않는다.**

**WHY.** 캐싱 / 무효화 / 중복 요청 제거 / 로딩 / 에러 상태가 한 훅에 묶여 있음. 매번 수동 관리하면 불일치와 무한 useEffect 지옥.

### 6.3 HTTP: axios 단일 인스턴스

**규칙.** `src/lib/axios.ts` 의 `api` 인스턴스만 사용. 다른 인스턴스 만들지 않는다.

**WHY.** 인터셉터(JWT 자동 첨부, 401 refresh, 토큰 동시성 제어) 를 한 곳에 집중. 여러 인스턴스 = 여러 인터셉터 = 디버깅 지옥.

**예외.** 서드파티 presigned PUT 업로드는 **raw `axios`** 사용 (공용 `api` 의 `Authorization` 헤더가 S3/MinIO 서명 검증을 깨뜨림). 자세한 건 [`src/api/CLAUDE.md`](./src/api/CLAUDE.md).

### 6.4 폴더 의존 방향: 단방향

```
pages → components → hooks → api → lib
                  ↘ store ↗       ↗
                  provider ───────┘
```

- `lib/` 는 누구에게도 의존하지 않는다 (외부 라이브러리만).
- `store/` 는 `types.ts` + 브라우저 API 만 의존.
- `api/` 는 `lib/axios` 만 의존. `hooks/` / `store/` 의존 금지.
- `hooks/queries/` 는 `hooks/mutations/` 를 import 하지 않는다. 역도 마찬가지 (양방향 금지).
- `components/ui/*` 는 도메인 파일(`api/`, `hooks/`, `store/`) 을 import 하지 않는다.

자세한 표는 [`src/CLAUDE.md`](./src/CLAUDE.md) §"의존 방향".

### 6.5 모달: 한 곳에서만 마운트

**규칙.** 모든 전역 모달 본체는 `components/modal/*-modal.tsx` 에 만들고, **`ModalProvider` 가 `createPortal` 로 `#modal-root` 에 한 번만 마운트**. 버튼은 Zustand 스토어의 `open` 액션만 호출.

**WHY.** 모달을 여러 곳에서 렌더하면 DOM 중복 → 포커스 / 애니메이션 / z-index 꼬임. 트리 안에 두면 부모의 `overflow` / `transform` 에 종속.

### 6.6 라우트 가드: 레이아웃 라우트로

**규칙.** 인증 가드는 각 페이지 컴포넌트 안에서 `useEffect + useNavigate` 로 하지 않는다. **중첩 레이아웃 라우트** 에서 `<Navigate>` 를 렌더 결과로 리턴.

**WHY.** 페이지 컴포넌트 안에서 체크하면 "한 번 마운트됐다가 튕기는 깜빡임" 발생. 레이아웃에서 `Navigate` 리턴하면 보호된 페이지 자체가 렌더되지 않음.

### 6.7 텍스트 중앙화: i18next 만

**규칙.** 앱에서 **사용자에게 보이는 모든 문자열**은 `i18next` 번역 파일(`src/i18n/locales/{ko,en}.json`)을 거친다. JSX / toast / aria-label / placeholder / 에러 메시지 전부 예외 없음. 하드코딩된 한국어 / 영어 UI 문자열 금지.

- **React 컴포넌트** — `const { t } = useTranslation()` 로 훅 사용:
  ```tsx
  // src/components/modal/alert-modal.tsx
  const { t } = useTranslation();
  <AlertDialogCancel onClick={handleNegative}>{t("common.cancel")}</AlertDialogCancel>
  ```
- **React 바깥 (lib / api 등)** — `i18next` 싱글톤 직접 호출 (§6.7 예외 참조):
  ```ts
  // src/lib/error.ts
  import i18n from "i18next";
  return i18n.t("errors.UNAUTHORIZED");
  ```
- **언어 선택** — `src/store/language.ts` 의 `useLanguagePreference` / `useSetLanguagePreference`. 값은 `"system" | "ko" | "en"`. `system`은 `navigator.language` 로 해석 — `ko*`면 한국어, 그 외 전부 영어 폴백.
- **동기화** — 스토어 변경 시 `subscribeLanguagePreference` 브리지가 자동으로 `i18n.changeLanguage(resolveLanguage(pref))` 호출 → `useTranslation` 쓰는 모든 컴포넌트 즉시 리렌더. Provider 없음.
- **서버 에러 코드** — `errors.*` 네임스페이스로 매핑. `generateErrorMessage(error)` 가 이미 해석.
- **NAV_CONFIG 라벨** — `label` 값을 i18n 키로 쓴다 (`label: "nav.dashboard"`). 렌더 시 `t(leaf.label)`. 키를 쓰므로 Favorites / Breadcrumb 저장에도 안전.
- **새 키 추가** — 반드시 **ko.json + en.json 양쪽에 동시 추가**. 폴백 언어는 `en`.

**WHY.**
- 언어 전환이 Profile 모달에서 즉시 반영돼야 하는 UX 제약. 전역 스토어 + i18next 리렌더가 유일한 해답.
- 런타임에 언어가 바뀌므로 어떤 경로에도 하드코딩이 남으면 "일부만 영어/일부는 한국어" 비일관.
- 상세한 네임스페이스 / 호출 예외 / 브리지 동작은 [`src/lib/CLAUDE.md`](./src/lib/CLAUDE.md) 와 [`src/store/CLAUDE.md`](./src/store/CLAUDE.md).

### 6.8 UTC-first 포맷 중앙화: lib/format.ts 만

**규칙.** 앱에서 **표시되는 날짜·시간·금액·중량·부피**는 `@/lib/format` 의 formatter 만 경유한다. 컴포넌트에서 `new Date(x).toLocaleDateString(...)` / `new Intl.DateTimeFormat(...)` 직접 호출 금지.

| 대상 | 함수 | 읽는 팀 프리퍼런스 |
| --- | --- | --- |
| 날짜 | `formatDate(iso)` | `timezone`, `dateFormat` |
| 시간 | `formatTime(iso)` | `timezone`, `timeFormat` |
| 날짜+시간 | `formatDateTime(iso)` | 위 양쪽 |
| 상대시간 | `formatTimeAgo(iso)` (`@/lib/time`) | (i18n 의존 — 사용자 언어) |
| 금액 | `formatAmount(number)` | `currency`, `decimalPlaces` |
| 중량 | `formatWeight(kg)` | `unitSystem` |
| 부피 | `formatVolume(cbm)` | `unitSystem` |

**핵심 약속.**
1. **입력은 항상 UTC ISO 문자열** (백엔드가 주는 포맷). 컴포넌트에서 `new Date()` 로 변환해 로컬 시간으로 만들어 전달 금지.
2. DB / API / 프론트 로직은 전부 UTC. **표시 직전에만** formatter 가 팀 `timezone` 으로 shift.
3. 팀이 `timezone` / `dateFormat` / `currency` 등을 바꾸면 즉시 전 화면에 반영 (formatter 는 호출 시점에 `getTeamPreferences()` 를 읽음).
4. **예외 — 단위 없는 정수 카운트** (API 호출 수, 멤버 수, quota `123/1000`) 는 `value.toLocaleString()` 직접 허용. 팀 프리퍼런스 영향이 없는 순수 숫자라 formatter 경유할 이유가 없음.

**WHY.**
- 시차 버그 방지. 브라우저 기본 zone 으로 표시하면 같은 팀원이 다른 지역에서 다른 ETA 를 본다.
- 통화 / 단위계 / 날짜 형식은 팀 운영 기준이라 일관성이 생명. 한 곳에서만 바꿔도 UI 전체가 따라옴.
- 상세 구현과 사용 예는 [`src/lib/CLAUDE.md`](./src/lib/CLAUDE.md) §"format.ts".

---

## 7. 새 도메인(Feature) 추가 순서

트래킹 예시로 **`shipping-line`** (선사) 도메인을 추가한다고 가정.

1. **Entity / Domain 타입 추가** — `src/types.ts` 에 `ShippingLineEntity`, `ShippingLine` 추가.
2. **API 래퍼 작성** — `src/api/shipping-line.ts`. 네이밍 / 에러 처리 규칙은 [`src/api/CLAUDE.md`](./src/api/CLAUDE.md).
3. **QUERY_KEYS 확장** — `src/lib/constants.ts` 의 `QUERY_KEYS` 에 `shippingLine.{all, list, byId}` 추가. 규칙은 [`src/lib/CLAUDE.md`](./src/lib/CLAUDE.md).
4. **Query 훅** — `src/hooks/queries/use-shipping-lines-data.ts`, `use-shipping-line-by-id-data.ts`. 템플릿은 [`src/hooks/CLAUDE.md`](./src/hooks/CLAUDE.md).
5. **Mutation 훅** — `src/hooks/mutations/shipping-line/use-create-shipping-line.ts` 등. 패턴은 [`src/hooks/CLAUDE.md`](./src/hooks/CLAUDE.md).
6. **(선택) 모달 스토어 + 본체** — `src/store/shipping-line-editor-modal.ts` + `src/components/modal/shipping-line-editor-modal.tsx`. 규칙은 [`src/store/CLAUDE.md`](./src/store/CLAUDE.md) + [`src/components/modal/CLAUDE.md`](./src/components/modal/CLAUDE.md).
7. **(선택) ModalProvider 에 한 줄** — `src/provider/modal-provider.tsx` 의 portal 안에 추가. [`src/provider/CLAUDE.md`](./src/provider/CLAUDE.md).
8. **도메인 컴포넌트** — `src/components/shipping-line/*.tsx`. 규칙은 [`src/components/CLAUDE.md`](./src/components/CLAUDE.md).
9. **페이지** — `src/pages/shipping-line-list-page.tsx`, `src/pages/shipping-line-detail-page.tsx`. 규칙은 [`src/pages/CLAUDE.md`](./src/pages/CLAUDE.md).
10. **라우트 등록** — `src/root-route.tsx` 의 `<MemberOnlyLayout>` 내부에 추가.
11. **(필요 시) 에러 코드 매핑** — `src/lib/error.ts` 의 `ERROR_MESSAGE_MAP` 에 서버와 합의된 코드 추가.

---

## 8. 절대 하지 말 것 (전역 안티 패턴)

각 폴더 CLAUDE.md 에도 폴더별 안티 패턴이 있다. 이건 전역 필수.

1. **React Context 로 전역 상태를 새로 만들지 말 것.** 전부 Zustand.
2. **queryKey 를 문자열/배열로 직접 타이핑하지 말 것.** 무조건 `QUERY_KEYS.*`.
3. **`fetch` / raw `axios` 를 컴포넌트 / 훅에서 직접 부르지 말 것.** 호출은 `api/*.ts` 의 함수로만.
4. **presigned PUT 업로드에 공용 `api` 를 쓰지 말 것.** raw `axios` 사용.
5. **`any` 금지.** `unknown` + 타입 가드.
6. **`useEffect` 콜백 자체를 `async` 로 만들지 말 것.** IIFE 패턴 사용.
7. **같은 모달을 트리 여러 곳에서 렌더하지 말 것.** 본체는 `ModalProvider` 에서 1번만.
8. **`<a>` 로 SPA 내부 이동 금지.** 전부 `<Link>` / `useNavigate`.
9. **`useInfiniteQuery` 의 `setQueryData` 로 새 아이템 수동 삽입 금지.** 생성은 `resetQueries`.
10. **Tailwind 클래스 순서 수작업 금지.** Prettier 자동 정렬.
11. **`components/ui/*` 수정 금지.** shadcn 재생성 시 충돌.
12. **`URL.createObjectURL` 하고 `revokeObjectURL` 안 하는 것 금지.** 메모리 누수.
13. **mutation `onSuccess` 에서 `invalidateQueries` 로 InfiniteQuery 통째 무효화 금지.** 생성 → `resetQueries`, 수정/삭제 → `setQueryData`.
14. **세션을 `persist` 미들웨어로 localStorage 캐시 금지.** 서버 재검증이 항상 먼저.
15. **`strict: true` 를 끄지 말 것.** strict 없는 TS 는 JS 보다 나쁘다.
16. **유저 페이싱 문자열 하드코딩 금지.** 전부 `t(...)` / `i18n.t(...)` (§6.7).
17. **날짜/시간/금액 표시 시 `toLocaleDateString` / `new Intl.DateTimeFormat` 등 직접 호출 금지.** `@/lib/format` formatter 만 사용 (§6.8). 단위 없는 정수 카운트는 예외.
18. **shadcn `DialogTitle` / `CardTitle` / `AlertDialogTitle` 을 기본값 그대로 쓰지 말 것.** `className="font-sans"` 로 serif(Instrument Serif) override 필수. 근거는 [`src/components/CLAUDE.md`](./src/components/CLAUDE.md) §"font-sans override".

---

## 9. Mutation 호출부 컨벤션 (전역)

모든 페이지 / 컴포넌트에서 mutation 을 구조분해할 때:

### 9.1 rename

```tsx
const { mutate: createPost, isPending: isCreatePostPending } = useCreatePost({ ... });
const { mutate: updatePost, isPending: isUpdatePostPending } = useUpdatePost({ ... });
const { mutate: deletePost, isPending: isDeletePostPending } = useDeletePost({ ... });
```

- `mutate` → **동사 + 도메인**
- `isPending` → **`is<Verb><Thing>Pending`**

### 9.2 여러 pending 합치기

```tsx
const isPending = isCreatePostPending || isUpdatePostPending;
// 모든 input / button 에 disabled={isPending}
```

### 9.3 toast 규칙

```ts
import { toast } from "sonner";
import { generateErrorMessage } from "@/lib/error";

toast.error(generateErrorMessage(error), { position: "top-center" });  // 실패 (반드시 generateErrorMessage)
toast.info(t("auth.signUp.codeSent"), { position: "top-center" });          // 중립 / 정보
toast.success(t("auth.twoStep.success"), { position: "top-center" });       // 성공 종료
```

**모든 토스트 문자열은 `t(...)` 로.** 하드코딩된 한국어/영어 금지 (§6.7).

**위치는 전부 `{ position: "top-center" }`** 로 통일.

### 9.4 네비게이션

삭제 / 세션 종료처럼 **현재 URL 이 무효해진 경우만** 이동. 로그인 성공 후엔 `navigate("/app", { replace: true })`, 로그아웃 / 세션 만료엔 `navigate("/sign-in", { replace: true })`.

---

## 10. 프로젝트 히스토리 / 맥락

**원본.** `react-boilerplate` ([HyeongTaekJo/react-boilerplate](https://github.com/HyeongTaekJo/react-boilerplate)) 디자인 + `react-vite-starter` 패턴을 합쳐 구축됨. 모든 아키텍처 선택은 보일러플레이트 원칙을 따른다.

**STE 트래킹 시스템에서 분기.** 이 프로젝트는 `ste/frontend_web` 을 베이스로 분기한 TMS 전용 프론트엔드다. 랜딩 / 로그인 / 대시보드 / 레이아웃 / 인증 / 세션 / 모달 시스템은 그대로 인계받았다.

**현재 미션.** TMS(Transportation Management System) 구축 — 도메인 기능은 새로 정의한다.

**보일러플레이트에서 참고 예시로 유지되는 것.**
- `/` 대시보드 (`dashboard-page.tsx`)
- `/tables`, `/profile`, `/notifications`, `/subscriptions` — 도메인 패턴 참고용
- `hooks/queries/use-dashboard-data.ts` 등 — 쿼리 훅 패턴 참고용

**새 TMS 도메인 추가 시.** 위 예시들은 **제거하지 않고** 참고 자료로 남긴다. 새 도메인은 §7 순서대로 추가.
