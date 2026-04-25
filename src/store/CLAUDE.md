# src/store/CLAUDE.md — Zustand 스토어

> **이 폴더의 책임.** 클라이언트 전역 상태 (세션, 모달 open/close, UI 토글 등) 를 Zustand 로 관리. **서버 상태는 여기 두지 않는다** — `hooks/queries/` 로 간다.
>
> **상위 문서.** [루트](../../CLAUDE.md) · [src](../CLAUDE.md)

---

## 1. 의존 규칙

| | |
| --- | --- |
| 의존 **가능** | `zustand`, `zustand/middleware`, `@/types`, 브라우저 API (`window.matchMedia`, `localStorage`) |
| 의존 **금지** | `@/api/*`, `@/hooks/*`, React 컴포넌트 |

**검증.** store 파일에서 `import { useQuery }` 또는 `import api from "@/lib/axios"` 가 보이면 즉시 리팩터.

---

## 2. 현재 스토어

| 파일 | 용도 |
| --- | --- |
| `session.ts` | 로그인 세션 (`AppSession`) + `isLoaded` 플래그 |
| `alert-modal.ts` | 전역 확인/취소 모달 (title, description, onPositive, onNegative) |
| `profile-editor-modal.ts` | 프로필 편집 모달 open/close |

**새 스토어 추가 시** 파일당 스토어 1개. 파일명은 `<name>.ts` (kebab-case). 기능 섞어 담지 말 것.

---

## 3. 표준 템플릿

**모든 스토어는 반드시 이 구조를 따른다.**

```ts
import { create } from "zustand";
import { combine, devtools /* , persist */ } from "zustand/middleware";

type State = { /* ... */ };

const initialState: State = { /* ... */ };

const useXxxStore = create(
  devtools(
    combine(initialState, (set) => ({
      actions: {
        doThing: () => set({ /* ... */ }),
      },
    })),
    { name: "XxxStore" },
  ),
);

// selector 훅들 — 다음 섹션 §6 참조
export const useXxx = () => useXxxStore((s) => s.fieldName);
export const useSetXxx = () => useXxxStore((s) => s.actions.doThing);
```

### 3.1 미들웨어 중첩 순서

- 기본: `create(devtools(combine(initialState, (set) => ({ actions: {...} }))))`
- persist 필요 시: `create(devtools(persist(combine(...), persistConfig)))`

**WHY 이 순서.** `combine` 은 반드시 맨 안쪽. `persist` 가 `combine` 바깥에 있어야 저장 가능한 상태만 추출할 수 있음. `devtools` 는 맨 바깥 (디버거 라벨링).

### 3.2 `devtools` 의 `name` 옵션 필수

```ts
devtools(..., { name: "SessionStore" })
```

**WHY.** Redux DevTools 에서 스토어 구분할 때 이름이 없으면 모두 "anonymous" 로 떠서 디버깅 불가.

---

## 4. `actions` 중첩 (state 와 분리)

```ts
combine(initialState, (set) => ({
  actions: {
    open: (...) => set(...),
    close: () => set(...),
  },
}))
```

**WHY.**
- state 와 actions 가 같은 객체 레벨에 섞이면 selector 로 "state 만" / "actions 만" 구독하기 번거로움.
- `actions` 를 한 객체로 모으면 `useXxxStore(s => s.actions.open)` 이 **함수 레퍼런스만** 안정적으로 구독 → 버튼 컴포넌트가 state 변화로 리렌더되지 않음.

**규칙.** actions 를 state 필드처럼 흩어 쓰지 않는다. 반드시 `{ actions: { ... } }` 중첩.

---

## 5. Discriminated Union State (모달에 유용)

"열렸을 때만 존재하는 필드" 가 있으면 DU 로 쓴다.

```ts
// src/store/alert-modal.ts (실제 코드)
type OpenState = {
  isOpen: true;
  title: string;
  description: string;
  onPositive?: () => void;
  onNegative?: () => void;
};

type CloseState = { isOpen: false };
type State = CloseState | OpenState;

const initialState = { isOpen: false } as State;   // ← 반드시 `as State`
```

### 5.1 초기값 캐스팅 필수

```ts
const initialState = { isOpen: false } as State;
```

**WHY.** `combine` 이 유니온을 올바르게 추론하려면 초기값 타입을 명시해야 함. 없으면 이후 `set({ isOpen: true, title: ... })` 호출이 "필드 초과" 로 타입 에러.

### 5.2 스토어 훅 반환 캐스팅

```ts
export const useAlertModal = () => {
  const store = useAlertModalStore();
  return store as typeof store & State;
};
```

**WHY.** `combine` 의 반환 타입은 `actions` 와 교차되면서 유니온 분기가 살아있지 않을 수 있음 → `store.title` 접근이 타입 에러. 명시 캐스팅으로 "CloseState 분기 후 title 접근" 재통과.

---

## 6. Selector 훅 분리 export

### 6.1 패턴

**모달 / 전역 상태는 두 가지 훅을 반드시 만든다.**

```ts
// 1) 액션 전용 훅 — 버튼이 쓰는 용도 (함수 레퍼런스만 반환)
export const useOpenXxxModal = () => {
  const open = useXxxStore((s) => s.actions.open);
  return open;
};

// 2) 본체 훅 — 모달 컴포넌트가 쓰는 용도 (전체 상태 + actions)
export const useXxxModal = () => {
  const store = useXxxStore();
  return store as typeof store & State;  // DU 일 경우
};
```

**WHY.**
- 버튼은 `useOpenXxxModal()` 만 구독 → state 변화에 리렌더되지 않음.
- 모달 본체는 `useXxxModal()` 로 전체 구독 → isOpen / title / description 모두 사용.

### 6.2 값 vs 액션 분리

**규칙.** 읽기와 쓰기 훅을 분리한다.

```ts
// session.ts
export const useSession = () => useSessionStore((s) => s.session);              // 읽기
export const useIsSessionLoaded = () => useSessionStore((s) => s.isLoaded);     // 읽기
export const useSetSession = () => useSessionStore((s) => s.actions.setSession); // 쓰기
```

로그아웃 버튼은 `useSetSession` 만 필요하고, 프로필 카드는 `useSession` 만 필요 → 서로 다른 변경에 상호 영향 없음.

---

## 7. 실전 템플릿 — 단순 모달

```ts
// src/store/profile-editor-modal.ts
import { create } from "zustand";
import { devtools, combine } from "zustand/middleware";

const initialState = { isOpen: false };

const useProfileEditorModalStore = create(
  devtools(
    combine(initialState, (set) => ({
      actions: {
        open: () => set({ isOpen: true }),
        close: () => set({ isOpen: false }),
      },
    })),
    { name: "ProfileEditorModalStore" },
  ),
);

export const useOpenProfileEditorModal = () =>
  useProfileEditorModalStore((s) => s.actions.open);

export const useProfileEditorModal = () => {
  const store = useProfileEditorModalStore();
  return store;
};
```

## 8. 실전 템플릿 — CREATE / EDIT DU 모달

```ts
// 예시 — post-editor-modal.ts 패턴 (트래킹 도메인에서 재사용)
import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

type CreateMode = { isOpen: true; type: "CREATE" };
type EditMode = {
  isOpen: true;
  type: "EDIT";
  id: number;
  content: string;
  imageUrls: string[] | null;
};
type OpenState = CreateMode | EditMode;
type CloseState = { isOpen: false };
type State = CloseState | OpenState;

const initialState = { isOpen: false } as State;

const useXxxEditorModalStore = create(
  devtools(
    combine(initialState, (set) => ({
      actions: {
        openCreate: () => set({ isOpen: true, type: "CREATE" }),
        openEdit: (param: Omit<EditMode, "isOpen" | "type">) =>
          set({ isOpen: true, type: "EDIT", ...param }),
        close: () => set({ isOpen: false }),
      },
    })),
    { name: "xxxEditorModalStore" },
  ),
);

export const useOpenCreateXxxModal = () =>
  useXxxEditorModalStore((s) => s.actions.openCreate);
export const useOpenEditXxxModal = () =>
  useXxxEditorModalStore((s) => s.actions.openEdit);
export const useXxxEditorModal = () => {
  const store = useXxxEditorModalStore();
  return store as typeof store & State;
};
```

## 9. 실전 템플릿 — 세션 스토어 (JWT)

```ts
// src/store/session.ts (실제 코드)
import type { AppSession } from "@/types";
import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

type State = {
  isLoaded: boolean;
  session: AppSession | null;
};

const initialState: State = { isLoaded: false, session: null };

const useSessionStore = create(
  devtools(
    combine(initialState, (set) => ({
      actions: {
        setSession: (session: AppSession | null) => {
          set({ session, isLoaded: true });   // ← setSession 이 isLoaded 자동 마킹
        },
        markLoaded: () => set({ isLoaded: true }),
      },
    })),
    { name: "sessionStore" },
  ),
);

export const useSession = () => useSessionStore((s) => s.session);
export const useIsSessionLoaded = () => useSessionStore((s) => s.isLoaded);
export const useSetSession = () => useSessionStore((s) => s.actions.setSession);
export const useMarkSessionLoaded = () =>
  useSessionStore((s) => s.actions.markLoaded);
```

**규칙.**

1. `isLoaded` 는 **"세션 복원 시도가 끝났는가"** 플래그. `session === null` 과 "아직 로딩 중" 을 구분하기 위해 반드시 별개 필드.
2. `setSession` 호출 시 **자동으로 `isLoaded: true` 마킹**. 로그인 / 로그아웃 / 앱 시작 모두 같은 setter 사용.
3. **`persist` 미들웨어 금지** (§10 참조).

---

## 10. `persist` 사용 규칙

### 10.1 언제 쓰는가

- 사용자 UI 선택 (테마, 언어) — 재방문 시 유지되면 UX 좋음
- 복잡한 드래프트 상태 — 실수로 탭 닫아도 보전

### 10.2 언제 쓰면 안 되는가

- **세션** — 반드시 서버 재검증 (`fetchMe`) 이 먼저. localStorage 에 cache 하면 서버에서 역할 / 이름 바뀌어도 stale.
- **서버 데이터 캐시** — TanStack Query 가 담당.

### 10.3 `partialize` 필수

`actions` 는 함수라 JSON 직렬화 불가 → 반드시 제외.

```ts
persist(combine(...), {
  name: "XxxStore",
  partialize: (store) => ({ someField: store.someField }),   // actions 제외
});
```

---

## 11. DOM 조작 (예외적)

**규칙.** Zustand action 안에서 `document.documentElement.classList` 같은 DOM 조작이 **허용**되는 경우가 있다. 단 브라우저 전용 작업만.

예전 `theme` 스토어 (현재는 삭제됨) 가 그 사례였음. `.dark` / `.light` 클래스 토글을 setState 만으로 할 수 없기 때문.

새 스토어가 DOM 조작 필요하면:
- action 내부에서 조작 + setState
- SSR 이 없는 Vite 클라이언트 전용 프로젝트라 `typeof window` 가드 불필요

---

## 12. 안티 패턴

1. ❌ **Context 로 전역 상태 새로 만들기** — Zustand 로만.
2. ❌ **`useXxxStore()` 를 선택 없이 통째 구독** — 버튼처럼 리렌더 민감한 컴포넌트는 반드시 `useXxxStore(s => s.필드)` 로 selector 사용. 예외: DU 모달 본체 훅 (필요해서).
3. ❌ **actions 를 state 에 섞기** — 반드시 `{ actions: {...} }` 중첩.
4. ❌ **`combine` 초기값에 `as State` 없음** — DU 에서 타입 에러.
5. ❌ **`persist` 에서 `partialize` 생략** — actions 직렬화 실패.
6. ❌ **세션을 `persist` 로 localStorage 저장** — 서버 재검증이 먼저.
7. ❌ **store 파일에서 `api/`, `hooks/`, React 컴포넌트 import** — 의존 방향 위반.
8. ❌ **여러 스토어를 한 파일에** — 파일당 1개 스토어.

---

## 13. 새 스토어 추가 체크리스트

1. **파일 생성**: `src/store/<name>.ts` (kebab-case).
2. **타입 선언** — 필요하면 DU (§5).
3. **`initialState`** + `as State` (DU 일 때).
4. **`create(devtools(combine(..., { actions: {...} })))` 템플릿** (§3).
5. **DevTools 이름**: `{ name: "XxxStore" }`.
6. **selector 훅 분리 export** — 액션 전용 + 본체 (§6).
7. **모달이면** `components/modal/<name>-modal.tsx` 와 `provider/modal-provider.tsx` 포털 등록도 함께.

---

## 14. 관련 문서

- [`src/provider/CLAUDE.md`](../provider/CLAUDE.md) — ModalProvider, SessionProvider 가 이 스토어를 구독
- [`src/components/modal/CLAUDE.md`](../components/modal/CLAUDE.md) — 모달 본체가 이 스토어를 구독
- [`src/hooks/CLAUDE.md`](../hooks/CLAUDE.md) — mutation 훅이 Zustand setter (예: `useSetSession`) 사용
- [루트 `CLAUDE.md`](../../CLAUDE.md) §6.1 — Context vs Zustand 선택 기준
