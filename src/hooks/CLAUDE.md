# src/hooks/CLAUDE.md — TanStack Query (Queries + Mutations)

> **이 폴더의 책임.** 서버 상태를 `useQuery` / `useInfiniteQuery` / `useMutation` 으로 감싸서 컴포넌트에 제공. `api/*.ts` 의 async 함수를 `queryFn` / `mutationFn` 에 꽂는다.
>
> **상위 문서.** [루트](../../CLAUDE.md) · [src](../CLAUDE.md)

---

## 1. 폴더 구조

```
src/hooks/
├── queries/                          ─ useQuery / useInfiniteQuery (flat)
│   ├── use-authors-data.ts
│   ├── use-dashboard-data.ts
│   ├── use-notification-settings-data.ts
│   ├── use-notifications-data.ts
│   ├── use-profile-page-data.ts
│   ├── use-project-rows-data.ts
│   └── use-subscription-summary-data.ts
└── mutations/                        ─ useMutation (도메인별 서브폴더)
    ├── auth/
    │   ├── use-confirm-password-reset.ts
    │   ├── use-request-password-reset-email.ts
    │   ├── use-request-signup-email-code.ts
    │   ├── use-sign-in-with-oauth.ts
    │   ├── use-sign-in-with-password.ts
    │   ├── use-sign-out.ts
    │   ├── use-sign-up.ts
    │   └── use-verify-signup-email-code.ts
    ├── notifications/
    │   ├── use-mark-all-notifications-read.ts
    │   └── use-update-notification-setting.ts
    └── profile/
        └── use-update-profile.ts
```

**규칙.**
- `queries/` 는 **flat**. 도메인별 서브폴더 없음.
- `mutations/` 는 **도메인별 서브폴더**. `auth/`, `notifications/`, `profile/` 식.
- 새 트래킹 도메인 추가 시 `hooks/mutations/shipping-line/use-*.ts` 식.

---

## 2. 의존 규칙

| | |
| --- | --- |
| 의존 **가능** | `@/api/*`, `@/lib/constants`, `@/types`, `@/store/*` (selector 훅), `@tanstack/react-query`, `react-intersection-observer` (queries 의 무한 스크롤 구현부), `react` (hooks) |
| 의존 **금지** | `@/components/*` (역방향), `@/pages/*` (역방향) |

**queries ↔ mutations 상호 참조.**
- `hooks/queries/` → `hooks/mutations/` 금지 (양방향 금지)
- `hooks/mutations/` → `hooks/queries/` **허용** (mutation 이 조회 합성할 때)

---

## 3. QUERY_KEYS 팩토리 (필수)

### 3.1 구조

```ts
// src/lib/constants.ts
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
    projects: ["dashboard", "projects"],
    // ...
  },
  // ... 트래킹 도메인 추가 시:
  // shippingLine: {
  //   all: ["shipping-line"],
  //   list: ["shipping-line", "list"],
  //   byId: (id: number) => ["shipping-line", "byId", id],
  // },
};
```

### 3.2 규칙

1. **queryKey 를 훅에서 직접 배열로 타이핑하지 않는다.** 무조건 `QUERY_KEYS.xxx` 로 생성.
2. 계층: `all → list → byId` 순.
   - 파라미터 없는 키: **배열 리터럴** (`list`, `all`).
   - 파라미터 있는 키: **함수** (`byId`, `userList`, `post`).
3. 도메인마다 `all` 을 둬서 상위 키로 일괄 무효화 가능: `invalidateQueries({ queryKey: QUERY_KEYS.post.all })`.

**WHY.** queryKey 는 "완전히 같은 배열" 이어야 같은 캐시로 취급. 문자열 리터럴을 코드에 흩으면 `["profile"]` vs `["profiles"]` 오타가 별개 캐시 생성 → "mutation 했는데 UI 에 안 반영" 버그 원천. 팩토리 한 곳에서만 생성하면 이 버그 차단.

---

## 4. useQuery 표준 템플릿

```ts
// src/hooks/queries/use-profile-data.ts (패턴 예시)
import { fetchProfile } from "@/api/profile";
import { QUERY_KEYS } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";

export function useProfileData(userId?: string | number) {
  return useQuery({
    queryKey: QUERY_KEYS.profile.byId(String(userId ?? "")),
    queryFn: () => fetchProfile(userId!),
    enabled: !!userId,
  });
}
```

### 4.1 규칙

1. **파일명**: `use-<thing>-data.ts` / `use-<thing>-by-id-data.ts` / `use-infinite-<things>-data.ts`.
2. **Export**: **named `export function`** (default export 금지).
3. **`queryKey`** 는 `QUERY_KEYS.*` 만 사용.
4. **`queryFn`** 은 `() => fetchXxx(...)` arrow 로 인자 전달. `queryFn` 은 `{ pageParam }` 외의 인자를 받을 수 없으므로 이 방식이 정석.
5. **파라미터 타입이 다르면 `String(userId ?? "")` 처럼 명시적 강제** — queryKey 일관성 유지.

### 4.2 `enabled` 조건 (핵심)

필요한 값 준비 안 됐을 때 fetch 막기:
```ts
enabled: !!userId,
```

**중요 동작.** `enabled: false` 여도 **같은 queryKey 에 캐시가 있으면 그 값을 반환**. 네트워크만 막을 뿐 캐시 읽기는 허용.

이 성질을 §4.3 조건부 fallback 과 §6 정규화 패턴에서 활용.

### 4.3 조건부 fallback 패턴 (FEED vs DETAIL)

```ts
// src/hooks/queries/use-post-by-id-data.ts (패턴 예시)
export function usePostByIdData({
  postId,
  type,
}: {
  postId: number;
  type: "FEED" | "DETAIL";
}) {
  return useQuery({
    queryKey: QUERY_KEYS.post.byId(postId),
    queryFn: () => fetchPostById({ postId }),
    enabled: type === "FEED" ? false : true,
  });
}
```

**WHY.**
- FEED 에서는 `useInfinitePostsData` 가 이미 `setQueryData(QUERY_KEYS.post.byId(...))` 로 캐시를 심어 둠. `enabled: false` 로 네트워크만 막아 N+1 요청 방지.
- DETAIL 에서는 직접 URL 진입했을 수 있어 캐시 비어있을 가능성. `enabled: true` 로 fetch 허용.

---

## 5. useInfiniteQuery 표준 템플릿 ★

```ts
// src/hooks/queries/use-infinite-posts-data.ts (패턴 예시)
import { fetchPosts } from "@/api/post";
import { QUERY_KEYS } from "@/lib/constants";
import { useSession } from "@/store/session";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

const PAGE_SIZE = 5;

export function useInfinitePostsData(authorId?: string) {
  const queryClient = useQueryClient();
  const session = useSession();

  return useInfiniteQuery({
    queryKey: !authorId
      ? QUERY_KEYS.post.list
      : QUERY_KEYS.post.userList(authorId),
    queryFn: async ({ pageParam }) => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const posts = await fetchPosts({
        from,
        to,
        userId: session!.user.id,
        authorId,
      });
      posts.forEach((post) => {
        queryClient.setQueryData(QUERY_KEYS.post.byId(post.id), post);
      });
      return posts.map((post) => post.id);   // ← ID 배열만 반환 (정규화 §6)
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length;
    },
    staleTime: Infinity,
  });
}
```

### 5.1 규칙

1. `PAGE_SIZE` 는 훅 파일 상단 **모듈 스코프 상수**.
2. `initialPageParam: 0` (0-based index).
3. `getNextPageParam(lastPage, allPages)` 에서 **`lastPage.length < PAGE_SIZE` → `undefined`** 반환 (= `hasNextPage = false`). 그 외엔 `allPages.length` (0, 1, 2, ...).
4. **`staleTime: Infinity`** 로 자동 refetch 차단. 명시적 `invalidate` / `reset` 시점에만 재조회.
5. **queryKey 조건부 분기**: 전체 피드(`list`) vs 특정 유저 피드(`userList(authorId)`) 를 별개 캐시로. 유저 A 피드와 B 피드가 섞이지 않음.
6. `queryFn` 은 **async**. 내부에서 개별 상세를 `setQueryData` 로 byId 캐시에 심고, 목록 자체는 **ID 배열만** 반환.

**WHY `staleTime: Infinity`.** 무한 스크롤 중 자동 재조회가 일어나면 pageParam 계산이 어긋나 중복/누락 발생. 명시적 invalidate (생성/삭제 시) 로만 통제.

### 5.2 무한 스크롤 트리거 (useInView)

```tsx
// 도메인 컴포넌트 예시
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

export default function PostFeed({ authorId }: { authorId?: string }) {
  const { data, error, isPending, fetchNextPage, isFetchingNextPage } =
    useInfinitePostsData(authorId);
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  return (
    <div>
      {data.pages.map((page) =>
        page.map((postId) => <PostItem key={postId} postId={postId} type="FEED" />)
      )}
      {isFetchingNextPage && <Loader />}
      <div ref={ref}></div>
    </div>
  );
}
```

**규칙.**
1. `useInView()` 로 sentinel div 감지.
2. 렌더 함수 안에서 `fetchNextPage()` 직접 호출 금지. `useEffect` 안에서만.
3. deps 는 **`[inView]` 만**. `fetchNextPage` 는 TanStack Query 가 매 렌더마다 새 레퍼런스를 만들 수 있어 넣으면 effect 가 의도보다 자주 재실행. `eslint-disable-next-line react-hooks/exhaustive-deps` 주석으로 의도 명시.
4. sentinel 은 `<div ref={ref}></div>` 하나면 충분 (높이 0 이어도 IntersectionObserver 동작).

---

## 6. 정규화 패턴 (목록 = ID 배열, 상세 = byId)

**규칙.** 무한 스크롤 피드 캐시는 **`number[]` 의 배열** (`InfiniteData<number[]>`) 만 보관. 개별 상세는 `QUERY_KEYS.post.byId(id)` 에만 보관.

**WHY.**
- 목록은 ID 배열 → 같은 아이템이 여러 페이지에 나타나도 상세는 한 곳에서만 관리.
- 상세 업데이트 (`useUpdatePost`, `useTogglePostLike`) 는 byId 만 건드려도 목록이 구독하는 상세가 자동 반영.
- `PostItem` 이 `usePostByIdData` 로 상세를 구독, `useInfinitePostsData` 의 `queryFn` 이 각 상세를 `setQueryData` 로 미리 심어 둬 네트워크 없이 그려짐.

---

## 7. useQuery vs useInfiniteQuery 결정 기준

| 시나리오 | 훅 | 근거 |
| --- | --- | --- |
| 단건 조회 (`/user/me`, `/post/{id}`) | `useQuery` | 결과가 1개 |
| 작은 목록 (`/comment?post_id=`) | `useQuery` | 총 개수가 한 화면에 들어감, 페이지네이션 불필요 |
| 페이지 누적 목록 (피드 무한 스크롤) | `useInfiniteQuery` | `pages: T[][]` 누적, `hasNextPage` 내장 |
| "로그인 / 로그아웃 같은 액션" | `useMutation` | `useQuery` 는 자동 실행이라 버튼 트리거에 부적합 |

---

## 8. useMutation 표준 템플릿

```ts
// src/hooks/mutations/post/use-create-post.ts (패턴 예시)
import { createPostWithImages } from "@/api/post";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreatePost(callbacks?: UseMutationCallback) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPostWithImages,
    onSuccess: () => {
      queryClient.resetQueries({ queryKey: QUERY_KEYS.post.list });
      if (callbacks?.onSuccess) callbacks.onSuccess();
    },
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
```

### 8.1 규칙 (통일)

1. **파일명**: `use-<verb>-<thing>.ts` (kebab-case). 예: `use-create-post.ts`, `use-toggle-post-like.ts`.
2. **Export**: **named `export function`**. default export 금지.
3. **시그니처**: `useXxx(callbacks?: UseMutationCallback)`. 호출부가 `onSuccess` / `onError` / `onMutate` / `onSettled` 를 위임.
4. **`mutationFn`** 은 `api/*.ts` 의 async 함수를 **직접** 꽂는다. 래핑 금지.
5. **순서**: 내부 로직(캐시 조작, 세션 주입) 을 mutation 라이프사이클 훅 안에서 **먼저** 실행, 외부 `callbacks.on*` 를 **그 뒤에** 호출. 순서 뒤집으면 호출부 토스트가 "캐시 업데이트 전 상태" 를 보게 됨.

### 8.2 auth mutation 의 특수 패턴

auth 뮤테이션(`useSignInWithPassword`, `useSignInWithOAuth`, `useSignUp`) 은 `onSuccess` 에서:

1. `queryClient.clear()` — 이전 유저 캐시 싹 제거
2. `const me = await fetchMe()` — 새 세션 서버 재검증
3. `setSession({ user: me })` — Zustand 세션 업데이트 (fetchMe 가 `AppUser` 타입 직접 반환하므로 **재조립하지 말 것**)
4. `callbacks.onSuccess?.()` — 호출부의 네비게이션 실행

```ts
// src/hooks/mutations/auth/use-sign-in-with-password.ts (실제 코드)
onSuccess: async () => {
  queryClient.clear();
  const me = await fetchMe();
  setSession({ user: me });       // ← 재조립 금지. me 자체가 AppUser.
  if (callbacks?.onSuccess) callbacks.onSuccess();
},
```

---

## 9. 낙관적 업데이트 5단계 체크리스트

`useMutation` 으로 optimistic update 할 때 **반드시** 이 5단계 준수.

```ts
// 패턴 예시 (post 좋아요 토글)
export default function useTogglePostLike(callbacks?: UseMutationCallback) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: togglePostLike,
    onMutate: async ({ postId }) => {
      // 1) 진행중 refetch 취소
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.post.byId(postId) });

      // 2) 스냅샷 저장
      const prevPost = queryClient.getQueryData<Post>(QUERY_KEYS.post.byId(postId));

      // 3) 낙관적 업데이트
      queryClient.setQueryData<Post>(QUERY_KEYS.post.byId(postId), (post) => {
        if (!post) throw new Error("포스트가 존재하지 않습니다.");
        return {
          ...post,
          isLiked: !post.isLiked,
          like_count: post.isLiked ? post.like_count - 1 : post.like_count + 1,
        };
      });

      // 4) context 로 스냅샷 반환
      return { prevPost };
    },
    onSuccess: () => {
      if (callbacks?.onSuccess) callbacks.onSuccess();
    },
    onError: (error, _, context) => {
      // 5) 롤백
      if (context && context.prevPost) {
        queryClient.setQueryData(
          QUERY_KEYS.post.byId(context.prevPost.id),
          context.prevPost,
        );
      }
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
```

**단계 요약.**
1. `cancelQueries({ queryKey })` — 진행중 refetch 취소
2. `getQueryData<T>(queryKey)` — 스냅샷
3. `setQueryData<T>(queryKey, updater)` — 낙관적 업데이트
4. `onMutate` return `{ prev... }` — context
5. `onError(error, _vars, context)` → `setQueryData(prev)` — 롤백

**참고.** `UseMutationCallback` 타입의 `onMutate: () => void` 는 optimistic 의 full 시그니처가 아님. 본격적으로 쓰려면 훅 시그니처 확장 필요 (현재 TODO).

---

## 10. `invalidateQueries` vs `setQueryData` vs `resetQueries` 선택

| 목적 | 선택 | 근거 |
| --- | --- | --- |
| "새로 받아오면 된다" (비활성 쿼리는 그대로) | `invalidateQueries` | stale 마킹만. 활성 쿼리는 refetch. |
| "이미 결과를 알고 있다" (즉시 반영) | `setQueryData` | 네트워크 0. 깜빡임 0. |
| "InfiniteQuery 를 맨 앞으로 리셋" | `resetQueries` | pages 전부 날리고 첫 페이지부터 재요청. 커서 꼬이지 않음. |
| "엔트리 자체 제거 (죽은 데이터)" | `removeQueries` | `setQueryData(null)` 로 두면 좀비 캐시 남음. |

### 10.1 구체 상황별

- **생성 → 피드 재구성**: `resetQueries({ queryKey: QUERY_KEYS.post.list })`. `setQueryData` 로 직접 삽입하면 커서 / 페이지 경계 꼬임.
- **수정 → 상세 반영**: `setQueryData<Thing>(byId(id), prev => ({ ...prev, ...updated }))`. 머지해서 부분 응답 안전.
- **삭제 → 목록 + 상세 정리**:
  - list: `setQueryData<InfiniteData<number[]>>` 의 `pages.map(page => page.filter(id => id !== deletedId))`
  - byId: `removeQueries({ queryKey: byId(id) })`
- **댓글 append**: 배열 크기 작고 전부 화면에 있으므로 `setQueryData<Comment[]>(comment.post(postId), prev => [...prev, newComment])`. invalidate 하면 깜빡임.
- **댓글 삭제 / 수정**: 동일 캐시 `setQueryData` + `filter` / `map`.
- **프로필 수정**: 서버가 최종 전체 상태 반환 시 **통째 교체** (`setQueryData<Profile>(byId, updated)`). 머지 불필요.
- **계정 전환 (로그인 / 로그아웃 / 회원가입)**: `queryClient.clear()`. 이전 유저의 모든 캐시 싹 제거.

---

## 11. 실전 템플릿 — 생성 / 수정 / 삭제

### 11.1 생성

```ts
// src/hooks/mutations/<domain>/use-create-<thing>.ts
export function useCreateXxx(callbacks?: UseMutationCallback) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createXxx,
    onSuccess: () => {
      queryClient.resetQueries({ queryKey: QUERY_KEYS.xxx.list });
      callbacks?.onSuccess?.();
    },
    onError: (error) => callbacks?.onError?.(error),
  });
}
```

### 11.2 수정 (머지)

```ts
export function useUpdateXxx(callbacks?: UseMutationCallback) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateXxx,
    onSuccess: (updated) => {
      queryClient.setQueryData<Xxx>(QUERY_KEYS.xxx.byId(updated.id), (prev) => {
        if (!prev) throw new Error(`${updated.id} 캐시 없음`);
        return { ...prev, ...updated };
      });
      callbacks?.onSuccess?.();
    },
    onError: (error) => callbacks?.onError?.(error),
  });
}
```

### 11.3 삭제 (InfiniteData + removeQueries)

```ts
export function useDeleteXxx(callbacks?: UseMutationCallback) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteXxx,
    onSuccess: (deleted) => {
      queryClient.setQueryData<InfiniteData<number[]>>(
        QUERY_KEYS.xxx.list,
        (prev) => {
          if (!prev) throw new Error("리스트 캐시 없음");
          return {
            ...prev,
            pages: prev.pages.map((page) =>
              page.includes(deleted.id) ? page.filter((id) => id !== deleted.id) : page,
            ),
          };
        },
      );
      queryClient.removeQueries({ queryKey: QUERY_KEYS.xxx.byId(deleted.id) });
      callbacks?.onSuccess?.();
    },
    onError: (error) => callbacks?.onError?.(error),
  });
}
```

### 11.4 설정 토글 (setQueryData 로 부분 업데이트)

```ts
// src/hooks/mutations/notifications/use-update-notification-setting.ts (실제 코드)
onSuccess: (updated) => {
  queryClient.setQueryData<NotificationSetting[]>(
    QUERY_KEYS.notifications.settings,
    (prev) => {
      if (!prev) return prev;
      return prev.map((s) => (s.id === updated.id ? updated : s));
    },
  );
  callbacks?.onSuccess?.();
},
```

---

## 12. 안티 패턴

1. ❌ **`queryKey: ["post", id]` 처럼 직접 타이핑** — 무조건 `QUERY_KEYS.*`.
2. ❌ **`queryFn: fetchXxx(id)`** — 즉시 호출. 반드시 `queryFn: () => fetchXxx(id)`.
3. ❌ **`default export`** — 훅은 named export.
4. ❌ **`useMutation` `onSuccess` 에서 `invalidateQueries` 로 InfiniteQuery 통째 무효화** — 생성 → `resetQueries`, 수정 / 삭제 → `setQueryData`.
5. ❌ **`useQuery` 데이터를 Zustand 에 복사 저장** — TanStack Query 캐시로 충분.
6. ❌ **`useInfiniteQuery` 의 `setQueryData` 로 새 아이템 수동 삽입** — 커서 꼬임. 생성은 `resetQueries`.
7. ❌ **deps 에 `fetchNextPage` 넣기** — 무한 리렌더 위험. `[inView]` 만.
8. ❌ **auth 뮤테이션 `onSuccess` 에서 `me` 를 필드별로 재조립** — `setSession({ user: me })` 한 줄.

---

## 13. 새 쿼리/뮤테이션 훅 추가 체크리스트

### 13.1 새 Query 훅

1. **`api/<domain>.ts`** 에 `fetchXxx` 먼저 정의.
2. **`lib/constants.ts`** 의 `QUERY_KEYS` 에 도메인 섹션 추가 (`all`, `list`, `byId` 등).
3. **파일 생성**: `src/hooks/queries/use-<thing>-data.ts` 또는 `use-infinite-<things>-data.ts`.
4. **`export function use...`** (named).
5. **`queryKey` 는 `QUERY_KEYS.*`** 사용.
6. **`queryFn` 은 arrow** (`() => fetchXxx(...)`).
7. 필요하면 **`enabled` 가드**.
8. 무한 스크롤이면 §5 전체 규칙 준수.

### 13.2 새 Mutation 훅

1. **`api/<domain>.ts`** 에 `createXxx` / `updateXxx` / `deleteXxx` 정의.
2. **도메인 폴더 생성** (첫 뮤테이션이면): `src/hooks/mutations/<domain>/`.
3. **파일 생성**: `src/hooks/mutations/<domain>/use-<verb>-<thing>.ts`.
4. **`useXxx(callbacks?: UseMutationCallback)`** 시그니처.
5. **`mutationFn: apiFunction`** (래핑 없이 직접).
6. **`onSuccess` 내부 로직 먼저, `callbacks.onSuccess` 뒤에** (§8.1 #5).
7. **캐시 업데이트 선택** — 생성 → `resetQueries`, 수정 → `setQueryData` 머지, 삭제 → `setQueryData` + `removeQueries` (§10).
8. Optimistic 이면 §9 5단계 준수.

---

## 14. 관련 문서

- [`src/api/CLAUDE.md`](../api/CLAUDE.md) — 이 폴더의 함수를 쿼리/뮤테이션에 꽂는다
- [`src/lib/CLAUDE.md`](../lib/CLAUDE.md) — `QUERY_KEYS` 팩토리, `error.ts` 매핑
- [`src/components/CLAUDE.md`](../components/CLAUDE.md) — 훅 호출 순서, early return, mutation rename 컨벤션
- [`src/store/CLAUDE.md`](../store/CLAUDE.md) — Zustand selector (auth mutation 에서 `useSetSession` 사용)
- [루트 §9](../../CLAUDE.md) — mutation 호출부 컨벤션 (mutate rename, toast, navigation)
