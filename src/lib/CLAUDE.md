# src/lib/CLAUDE.md — 유틸 / axios 인스턴스 / 상수

> **이 폴더의 책임.** 프레임워크 독립 유틸, 단일 axios 인스턴스, QUERY_KEYS 팩토리, 에러 매핑. **React 훅 / 컴포넌트 금지**.
>
> **상위 문서.** [루트](../../CLAUDE.md) · [src](../CLAUDE.md)

---

## 1. 의존 규칙

| | |
| --- | --- |
| 의존 **가능** | 외부 라이브러리 (axios, clsx, twMerge, **i18next** 등), `@/store/team-preferences` (format.ts 전용 — §7 참조) |
| 의존 **금지** | React 훅, React 컴포넌트, `@/api/*` (역방향 — api 가 lib 을 씀), `@/hooks/*`, 그 외 `@/store/*` |

**검증.** lib 파일에서 `import { useQuery }` / `import ... from "react"` 가 보이면 즉시 리팩터.

**i18n 예외.** `i18next` 싱글톤(`import i18n from "i18next"` 후 `i18n.t("...")`) 호출은 허용. 훅이 아니라 순수 함수라 lib 의 "프레임워크 독립" 원칙에 위배되지 않음. `error.ts`, `time.ts` 가 이미 사용 중이며, React 바깥에서 번역이 필요한 lib/api 에서는 이 경로를 쓴다.

**format.ts 예외.** `@/store/team-preferences` 의 non-reactive getter `getTeamPreferences()` 만 import 허용 (구독 훅이 아니라 `useXxxStore.getState()` 를 감싼 순수 읽기). format.ts 가 팀 display preference 를 읽어야 해서 불가피. selector 훅 (`useTeamPreferences` 등) 은 여전히 금지.

---

## 2. 현재 파일

| 파일 | 용도 |
| --- | --- |
| `axios.ts` | 단일 axios 인스턴스 + 토큰 유틸 + JWT 인터셉터 + 401 refresh + `API_BASE_URL` 상수 |
| `constants.ts` | `QUERY_KEYS` 팩토리 |
| `error.ts` | `generateErrorMessage(error)` — axios 에러 → i18n `errors.*` 키로 번역 |
| `time.ts` | `formatTimeAgo(input)` — 상대 시간 (i18n 의존, 사용자 언어 따라감) |
| `format.ts` | `formatDate/Time/DateTime/Amount/Weight/Volume` — 팀 프리퍼런스(timezone, currency, decimalPlaces, dateFormat, timeFormat, unitSystem) 기반 UTC → 표시 변환 ★ |
| `timezones.ts` | IANA 타임존 목록 + 라벨 빌더 (`getTimezoneOptions`, `getTimezoneLabel`, `detectBrowserTimezone`) |
| `utils.ts` | `cn(...classes)` — clsx + twMerge |

---

## 3. axios.ts — 단일 인스턴스 + 인터셉터 ★

```ts
// src/lib/axios.ts (실제 코드)
import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

export const ACCESS_TOKEN_KEY = "access_token";

// `||` fallback catches empty strings in .env (e.g. `VITE_API_URL=`), not just null/undefined.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}
export function setAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}
export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>)["Authorization"] =
      `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const resp = await axios.post(   // ← raw axios (api 인스턴스 아님)
    `${API_BASE_URL}/auth/token/access`,
    {},
    { withCredentials: true },
  );
  const newToken: string = resp.data.access_token;
  setAccessToken(newToken);
  return newToken;
}

api.interceptors.response.use(
  (resp) => resp,
  async (error: AxiosError) => {
    const original = error.config as
      | (AxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (
      !original ||
      error.response?.status !== 401 ||
      original._retry ||
      original.url?.includes("/auth/token/access")
    ) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      refreshPromise = refreshPromise ?? refreshAccessToken();
      const newToken = await refreshPromise;
      refreshPromise = null;

      original.headers = original.headers ?? {};
      (original.headers as Record<string, string>)["Authorization"] =
        `Bearer ${newToken}`;
      return api(original);
    } catch (refreshErr) {
      refreshPromise = null;
      clearAccessToken();
      if (typeof window !== "undefined") {
        window.location.href = "/sign-in";
      }
      return Promise.reject(refreshErr);
    }
  },
);

export default api;
```

### 3.1 핵심 규칙

1. **인스턴스는 하나.** 모든 `api/*.ts` 는 이 파일의 `api` (default export) 만 import. 새 인스턴스 생성 금지.
2. **Access token** 은 `localStorage`. **Refresh token** 은 서버가 HttpOnly 쿠키로 관리 (JS 접근 불가). `withCredentials: true` 로 쿠키 자동 송수신.
3. **Request interceptor** 가 모든 요청에 `Authorization: Bearer <JWT>` 자동 첨부. 호출부는 토큰 관리 무관심.
4. **Response interceptor** 가 401 을 가로채 `refreshAccessToken()` 호출 후 원 요청 1회 재시도. `_retry` 플래그로 무한 루프 차단.
5. **`/auth/token/access` 경로 자체의 401** 은 재시도 안 함 (refresh 무한 루프 방지).
6. **동시성 제어**: `refreshPromise` 단일 변수로 여러 401 이 동시에 와도 refresh 호출 1회로 합침.
7. **`refreshAccessToken()` 안에서 raw `axios` 사용.** `api` 인스턴스를 쓰면 request interceptor 가 만료된 토큰을 붙여 401 무한 루프.
8. **Refresh 실패 시** `clearAccessToken()` + `window.location.href = "/sign-in"` 하드 네비게이션. React Router 컨텍스트 밖(axios 인터셉터) 에서 안전한 유일한 방법.
9. **토큰 유틸 함수 캡슐화** (`getAccessToken` / `setAccessToken` / `clearAccessToken`). 저장소를 sessionStorage / 쿠키로 바꿀 때 호출부 변경 없음.

### 3.2 `API_BASE_URL` 상수 — `||` fallback

```ts
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";
```

**WHY `??` 가 아니라 `||`.** `??` 는 null / undefined 만 catch. `.env` 에 `VITE_API_URL=` (값 비움) 이 있으면 baseURL 이 `""` 로 되어 요청이 상대 URL (현재 오리진) 로 나가는 무음 버그. `||` 는 빈 문자열도 잡아냄.

**사용.** `api/auth.ts` 의 OAuth 팝업 URL 등 `API_BASE_URL` 이 필요한 곳에서 import:
```ts
import api, { API_BASE_URL } from "@/lib/axios";
```

---

## 4. constants.ts — QUERY_KEYS 팩토리 ★

```ts
// src/lib/constants.ts (실제 코드 구조)
export const QUERY_KEYS = {
  profile: {
    all: ["profile"],
    list: ["profile", "list"],
    byId: (userId: string) => ["profile", "byId", userId],
    me: ["profile", "me"],
  },
  dashboard: {
    all: ["dashboard"],
    stats: ["dashboard", "stats"],
    // ...
  },
  tables: {
    all: ["tables"],
    authors: ["tables", "authors"],
    projects: ["tables", "projects"],
  },
  notifications: {
    all: ["notifications"],
    list: ["notifications", "list"],
    settings: ["notifications", "settings"],
  },
  subscriptions: {
    all: ["subscriptions"],
    plan: ["subscriptions", "plan"],
    // ...
  },
};
```

### 4.1 규칙

1. **모든 queryKey 는 이 팩토리로 생성.** 훅에서 `queryKey: ["xxx"]` 직접 작성 금지.
2. **계층**: `all → list → byId`.
   - 파라미터 없는 키: **배열 리터럴** (`list`, `all`).
   - 파라미터 있는 키: **함수** (`byId`, `userList`, `post`).
3. **각 도메인에 `all`** 을 둔다. 상위 키로 일괄 무효화: `invalidateQueries({ queryKey: QUERY_KEYS.post.all })`.
4. **네이밍**: 도메인은 camelCase (`shippingLine`). 키는 lowercase 소문자로 구성 (`["shipping-line", "byId", id]`).

### 4.2 새 도메인 추가 예시

```ts
// 트래킹 예시
shippingLine: {
  all: ["shipping-line"],
  list: ["shipping-line", "list"],
  byId: (id: number) => ["shipping-line", "byId", id],
},
container: {
  all: ["container"],
  tracking: (trackingNumber: string) => ["container", "tracking", trackingNumber],
  history: (trackingNumber: string) => ["container", "history", trackingNumber],
},
terminal: {
  all: ["terminal"],
  list: ["terminal", "list"],
  byId: (id: number) => ["terminal", "byId", id],
},
```

---

## 5. error.ts — generateErrorMessage ★

```ts
// src/lib/error.ts (실제 코드)
import { AxiosError } from "axios";
import i18n from "i18next";

// 서버에서 내려오는 에러 코드 중 i18n `errors.*` 네임스페이스로 번역할
// 목록. 여기 없는 코드는 서버의 `message` 필드를 그대로 노출.
const KNOWN_CODES = new Set([
  "INVALID_CREDENTIALS",
  "USER_NOT_FOUND",
  "EMAIL_ALREADY_EXISTS",
  "INVALID_EMAIL_CODE",
  "EXPIRED_EMAIL_CODE",
  "PASSWORD_TOO_WEAK",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "RATE_LIMITED",
  "INTERNAL_SERVER_ERROR",
  "NOT_TEAM_MEMBER",
  "TEAM_NOT_FOUND",
  "TEAM_SCOPE_REQUIRED",
]);

export function generateErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as
      | { code?: string; message?: string }
      | undefined;

    if (data?.code && KNOWN_CODES.has(data.code)) {
      return i18n.t(`errors.${data.code}`);
    }
    if (data?.message) return data.message;

    if (!error.response) {
      if (error.code === "ECONNABORTED") return i18n.t("errors.TIMEOUT");
      return i18n.t("errors.NETWORK");
    }

    if (error.response.status === 401) return i18n.t("errors.UNAUTHORIZED");
    if (error.response.status === 403) return i18n.t("errors.FORBIDDEN");
    if (error.response.status === 404) return i18n.t("errors.NOT_FOUND");
    if (error.response.status === 429) return i18n.t("errors.RATE_LIMITED");
    if (error.response.status >= 500)
      return i18n.t("errors.INTERNAL_SERVER_ERROR");

    return error.message;
  }
  if (error instanceof Error) return error.message;
  return i18n.t("errors.UNKNOWN");
}
```

### 5.1 규칙

1. **모든 `toast.error` 에서 이 함수를 거친다.** 서버 에러 코드 → 사용자 언어 메시지.
   ```tsx
   toast.error(generateErrorMessage(error), { position: "top-center" });
   ```
2. **새 에러 코드 추가** — 2곳 동시 변경: `KNOWN_CODES` Set + `src/i18n/locales/{ko,en}.json` 의 `errors.*` 네임스페이스.
3. **새 HTTP 상태 필요하면** `error.response.status === X` 분기 추가 + 해당 i18n 키.
4. **`error` 가 axios 가 아닐 수 있음** — `unknown` 으로 받고 `instanceof AxiosError` / `instanceof Error` 로 좁힘.

### 5.2 트래킹 도메인 에러 코드 추가 예시

```ts
// 1) lib/error.ts
const KNOWN_CODES = new Set([
  // ... 기존
  "SHIPPING_LINE_NOT_FOUND",
  "CONTAINER_NOT_FOUND",
  "TERMINAL_CLOSED",
]);
```

```jsonc
// 2) src/i18n/locales/ko.json (en.json 도 동시에)
{
  "errors": {
    // ... 기존
    "SHIPPING_LINE_NOT_FOUND": "해당 선사를 찾을 수 없습니다.",
    "CONTAINER_NOT_FOUND": "컨테이너 번호가 잘못되었습니다.",
    "TERMINAL_CLOSED": "해당 터미널은 현재 폐쇄되어 있습니다."
  }
}
```

---

## 6. time.ts — formatTimeAgo (i18n)

```ts
// src/lib/time.ts (실제 코드)
import i18n from "i18next";

export function formatTimeAgo(input: string | number | Date): string {
  const date = input instanceof Date ? input : new Date(input);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return i18n.t("time.justNow");
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return i18n.t("time.minutesAgo", { count: diffMin });
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return i18n.t("time.hoursAgo", { count: diffHour });
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return i18n.t("time.daysAgo", { count: diffDay });
  const diffWeek = Math.floor(diffDay / 7);
  if (diffWeek < 5) return i18n.t("time.weeksAgo", { count: diffWeek });
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return i18n.t("time.monthsAgo", { count: diffMonth });
  const diffYear = Math.floor(diffDay / 365);
  return i18n.t("time.yearsAgo", { count: diffYear });
}
```

**용도.** `created_at`, `updated_at` 같은 ISO 문자열을 "방금 전", "5분 전" 같은 상대 표현으로. 현재 호출처: ocean-shipments, ocean-shipment-detail, dashboard, settings-members, api-keys-tab.

**규칙.**
1. **i18n `time.*` 네임스페이스에 의존.** 새 구간 추가 시 (예: "어제") ko/en 번역 둘 다 추가.
2. **언어 반응.** 언어가 전환되면 이 함수 반환값도 즉시 해당 언어로 바뀐다. 호출하는 컴포넌트는 `useTranslation()` 을 통해 이미 언어 변경에 리렌더되므로 별도 구독 불필요.

---

## 7. format.ts — 표시 포맷 중앙화 ★

```ts
// src/lib/format.ts (실제 구조 요약)
import { getTeamPreferences } from "@/store/team-preferences";

export function formatDate(iso: string | Date): string { /* timezone + dateFormat */ }
export function formatTime(iso: string | Date): string { /* timezone + timeFormat */ }
export function formatDateTime(iso: string | Date): string { return `${formatDate(iso)} ${formatTime(iso)}`; }
export function formatAmount(value: number): string { /* currency + decimalPlaces */ }
export function formatWeight(kg: number): string { /* unitSystem: kg ↔ lb */ }
export function formatVolume(cbm: number): string { /* unitSystem: m³ ↔ ft³ */ }
```

### 7.1 핵심 규칙

1. **UTC-first 입력.** 모든 날짜 함수는 **UTC ISO 문자열** 또는 UTC 기준 `Date` 인스턴스만 받는다. 컴포넌트에서 `new Date()` 를 호출해 로컬 time 으로 변환 후 전달하지 말 것.
2. **표시 직전 shift.** `formatDate/Time/DateTime` 안에서 `Intl.DateTimeFormat` 의 `timeZone` 옵션으로 팀 `timezone` 으로 변환. 이 함수 **바깥**에서는 JS `Date` 의 시차 행동을 사용하지 않는다.
3. **팀 프리퍼런스 호출 시점 읽기.** formatter 는 매 호출마다 `getTeamPreferences()` (non-reactive getter) 를 호출. 컴포넌트 리렌더 타이밍은 `useTeamPreferences()` selector 가 담당 → `settings/team` 에서 프리퍼런스 변경 시 전 화면 즉시 재포맷.
4. **단위 변환.** `formatWeight` 는 저장/전달되는 값이 **항상 kg**, `formatVolume` 은 **항상 cbm(m³)** 전제. imperial 은 표시 시점에만 `kg * 2.20462`, `cbm * 35.3147`.

### 7.2 예외 — 단위 없는 정수 카운트

다음 경우는 `value.toLocaleString()` 직접 호출 허용:

- API 호출 수 (`today_count.toLocaleString()`)
- 멤버 수, API key 개수, quota (`12 / 1000`)
- Dashboard KPI (추적 중 / 도착 임박 같은 숫자)

**WHY.** 팀 `currency` / `decimalPlaces` / `unitSystem` 중 어느 것도 적용할 게 없는 순수 정수 — formatter 경유할 이유가 없고, 경유하면 오히려 의미 왜곡(예: ₩ 붙은 "API 호출 수") 가능.

### 7.3 안티 패턴

```tsx
// ❌ 컴포넌트에서 ad-hoc 변환
<span>{new Date(event.timestamp).toLocaleString()}</span>
<span>{new Intl.DateTimeFormat("ko-KR").format(new Date(iso))}</span>
<span>{format(date, "yyyy-MM-dd")}</span>  // date-fns 도 금지

// ❌ 금액을 직접 포매팅
<span>₩{amount.toLocaleString()}</span>

// ✅ 무조건 formatter 경유
import { formatDate, formatDateTime, formatAmount } from "@/lib/format";
<span>{formatDate(event.timestamp)}</span>
<span>{formatDateTime(iso)}</span>
<span>{formatAmount(amount)}</span>
```

### 7.4 새 formatter 추가 체크리스트

새 표시 형식이 필요할 때 (예: 거리 `formatDistance(km)`):

1. **format.ts 에 순수 함수 추가** — `getTeamPreferences()` 에서 필요한 필드 읽기.
2. **필요 시 `team-preferences` 스토어에 필드 추가** — state / actions / persist `partialize` / selector 훅.
3. **settings/team 의 Display 섹션에 UI 추가** — 사용자가 선택할 수 있게.
4. **호출처 업데이트** — 기존에 ad-hoc 으로 쓰던 곳 전부 새 formatter 로.

---

## 8. timezones.ts — IANA 타임존 옵션

```ts
// src/lib/timezones.ts 시그니처
export function getTimezoneOptions(): TimezoneOption[];  // 420+ 개, offset 정렬
export function getTimezoneLabel(id: string): string;     // "(GMT+09:00) Asia/Seoul"
export function detectBrowserTimezone(): string;          // Intl API 기반
```

**용도.** `settings/team` 의 TimezonePicker 가 대형 검색 가능한 목록을 그릴 때 사용. `Intl.supportedValuesOf("timeZone")` 네이티브 API 이므로 라이브러리 불필요.

**규칙.**
- 반환되는 `id` 는 그대로 `team-preferences` 스토어의 `timezone` 필드에 저장 → `format.ts` 가 `Intl.DateTimeFormat` 의 `timeZone` 옵션으로 사용.
- `detectBrowserTimezone()` 은 팀 timezone 미설정 시 초기값 폴백.

---

## 9. utils.ts — cn

```ts
// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**용도.** Tailwind 클래스 조건부 합성 + 같은 카테고리 충돌 해결 (`px-2` + `px-4` → 뒤쪽이 이김).

**사용 규칙**은 [`src/components/CLAUDE.md`](../components/CLAUDE.md) §8 참조. 도메인 코드는 단순 템플릿 리터럴 우선, shadcn wrapping 과 variant 합성에서만 `cn()`.

---

## 10. 안티 패턴

1. ❌ **lib 파일에서 React 훅 import** — React 와 프레임워크 의존 제거가 목적.
2. ❌ **axios 인스턴스 여러 개 만들기** — 이 폴더의 `api` (default) 만.
3. ❌ **`api` 인스턴스를 `refreshAccessToken` 에서 쓰기** — request interceptor 가 만료 토큰 첨부로 무한 루프. raw `axios` 사용.
4. ❌ **`error.ts` 에서 서버 에러 메시지 그대로 throw** — `generateErrorMessage` 가 매핑.
5. ❌ **`VITE_API_URL ?? "..."` (nullish)** — `.env` 빈 값 우회. `||` 사용.
6. ❌ **QUERY_KEYS 를 `constants.ts` 밖에서 정의** — 단일 팩토리 위반.
7. ❌ **lib 에서 하드코딩된 한국어 / 영어 문자열 return** — `error.ts` / `time.ts` 처럼 `i18n.t(...)` 경유.
8. ❌ **format.ts 바깥에서 `new Date(x).toLocaleDateString()` / `new Intl.DateTimeFormat(...)` 직접 호출** — 컴포넌트·페이지 어디서도 금지 (단위 없는 카운트 예외).
9. ❌ **format.ts 입력으로 로컬 zone `Date` 전달** — 반드시 UTC ISO 문자열 또는 UTC 기준 Date.

---

## 11. 새 lib 파일 추가 체크리스트

새 유틸이 필요할 때:

1. **진짜 lib 인가?** — React 훅 / 컴포넌트 없이 순수 함수 / 상수만. 아니면 `hooks/` / `store/`.
2. **파일명**: `src/lib/<name>.ts` (kebab-case).
3. **외부 의존만** — axios, clsx, twMerge, date-fns 등. `@/api`, `@/hooks`, `@/store` 금지.
4. **named export**. default 피하기.
5. **필요하면** 루트 `CLAUDE.md` §5 (환경변수) / §6 (아키텍처 결정) 업데이트.

---

## 12. 관련 문서

- [루트 §6.7](../../CLAUDE.md) — 텍스트 중앙화 (i18next) 원칙
- [루트 §6.8](../../CLAUDE.md) — UTC-first 포맷 중앙화 원칙
- [`src/api/CLAUDE.md`](../api/CLAUDE.md) — `api` 인스턴스 사용, `signOut` try/finally 패턴
- [`src/hooks/CLAUDE.md`](../hooks/CLAUDE.md) — `QUERY_KEYS` 사용, `generateErrorMessage` 호출부
- [`src/components/CLAUDE.md`](../components/CLAUDE.md) — `cn()` 사용처, toast + `generateErrorMessage`
- [`src/store/CLAUDE.md`](../store/CLAUDE.md) — `team-preferences` / `language` 스토어 (format.ts / i18n 이 소비)
- [루트 §5](../../CLAUDE.md) — 환경변수 / `VITE_API_URL` fallback
