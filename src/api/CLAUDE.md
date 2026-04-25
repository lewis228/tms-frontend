# src/api/CLAUDE.md — axios 래퍼

> **이 폴더의 책임.** 서버 API 호출을 async 함수로 감싸서 export. **엔드포인트 1개 = 함수 1개.** 이 함수들은 `useQuery.queryFn` / `useMutation.mutationFn` 에 **그대로** 꽂힌다.
>
> **상위 문서.** [루트](../../CLAUDE.md) · [src](../CLAUDE.md)

---

## 1. 의존 규칙

| | |
| --- | --- |
| 의존 **가능** | `@/lib/axios` (단일 인스턴스), `@/types`, 서드파티 (axios, 기타 SDK) |
| 의존 **금지** | `@/hooks/*`, `@/store/*`, React 훅, React 컴포넌트 |

**검증.** `import { use... } from "react"` 또는 `import { useQuery } from "@tanstack/react-query"` 가 이 폴더에 있으면 즉시 리팩터.

---

## 2. 파일 분할 기준

**도메인당 파일 1개.** 현재 파일:

| 파일 | 엔드포인트 그룹 |
| --- | --- |
| `auth.ts` | `/auth/login`, `/auth/logout`, `/auth/register/*`, `/auth/password/reset/*`, `/auth/oauth/:provider`, `/auth/token/access`, `/user/me` |
| `dashboard.ts` | 대시보드 묶음 데이터 (mock 현재, 실제 백엔드 연결 시 개별 엔드포인트 분할 고려) |
| `tables.ts` | `fetchAuthors`, `fetchProjectRows` |
| `profile.ts` | 프로필 페이지 데이터, `updateProfile` |
| `notifications.ts` | 알림 목록 + 설정 |
| `subscriptions.ts` | 구독 요약 |

**새 트래킹 도메인 추가 시** 예시:
- `src/api/shipping-line.ts` — `fetchShippingLines`, `fetchShippingLineById`, `createShippingLine`, `updateShippingLine`, `deleteShippingLine`
- `src/api/container.ts` — `fetchContainerTracking`, `fetchContainerHistory`
- `src/api/terminal.ts` — `fetchTerminals`, `fetchTerminalById`

---

## 3. 함수 네이밍 컨벤션

HTTP 메서드 → 함수 prefix 매핑.

| HTTP 메서드 | 함수 prefix | 예시 |
| --- | --- | --- |
| GET (목록) | `fetch<Things>` | `fetchPosts`, `fetchComments`, `fetchShippingLines` |
| GET (단건) | `fetch<Thing>ById` 또는 `fetch<Thing>` | `fetchPostById`, `fetchProfile`, `fetchMe` |
| POST | `create<Thing>` / `sign<Action>` 등 | `createPost`, `signInWithPassword`, `signOut` |
| PATCH | `update<Thing>` | `updatePost`, `updateProfile` |
| DELETE | `delete<Thing>` | `deletePost`, `deleteComment` |
| 토글 | `toggle<Thing><Aspect>` | `togglePostLike` |
| 업로드 | `upload<Things>` / `put<Thing>...` | `uploadFiles`, `putFileToPresignedUrl`, `requestUploadUrls` |

---

## 4. 핵심 규칙

### 4.1 모든 함수는 순수 async

**규칙.** `useQuery.queryFn` / `useMutation.mutationFn` 에 그대로 꽂힐 수 있어야 한다.

**WHY.** TanStack Query 가 인자를 전달하는 방식이 정해져 있음. 여기서 훅 래핑 / React state 접근을 하면 재사용 불가.

```ts
// src/api/auth.ts
export async function signInWithPassword({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const { data } = await api.post<{ access_token: string }>("/auth/login", {
    email,
    password,
  });
  setAccessToken(data.access_token);
  return data;
}
```

### 4.2 파라미터는 객체 구조분해

**규칙.** 기본은 `{ field, field }` 객체 파라미터. 단일 원시값은 예외적으로 허용.

```ts
// ✅ 다중 필드
export async function createComment({
  postId,
  content,
  parentCommentId,
}: {
  postId: number;
  content: string;
  parentCommentId?: number;
}) { ... }

// ✅ 단일 원시값 (예외)
export async function deletePost(id: number) { ... }
export async function requestSignupEmailCode(email: string) { ... }
```

**WHY.** 객체 파라미터는 인자 순서에 의존하지 않아 호출부가 읽기 쉽고, `useMutation` 이 하나의 vars 객체를 받는 것과 맞음.

### 4.3 응답 타입 제네릭 명시

```ts
// ✅
const { data } = await api.post<{ access_token: string }>("/auth/login", body);

const { data } = await api.get<{ items: Comment[] }>("/comment", {
  params: { post_id: postId },
});
return data.items;

// ❌ 타입 추론 포기
const { data } = await api.post("/auth/login", body);  // data: any
```

### 4.4 응답 필드명 변환 (snake → camel)

**규칙.** 서버가 `snake_case` 로 내려보내는 필드 중 **UI 가 자주 쓰는 것** 은 함수 내부에서 camelCase 로 변환해서 return. 나머지는 snake_case 유지 (entity 는 snake_case 가 기본).

```ts
// src/api/post.ts
export async function fetchPosts({ from, to, authorId }: ...) {
  const { data } = await api.get<{ items: Array<PostEntity & { is_liked: boolean }> }>("/post", {
    params: { offset: from, limit: to - from + 1, author_id: authorId },
  });
  return data.items.map((post) => ({ ...post, isLiked: post.is_liked }));
}
```

`isLiked` 는 UI 에서 `post.isLiked` 로 자주 쓰므로 camelCase. `like_count` 같은 건 서버 스키마와 1:1 유지.

---

## 5. 에러 처리

### 5.1 원칙: 던져라 (catch 하지 마라)

**규칙.** `api/*.ts` 내부에서 **에러를 잡지 않는다**. axios 가 throw 하는 그대로 상위(mutation / query) 로 전파. 호출부가 toast / 롤백을 결정.

**WHY.** API 함수가 에러를 삼키면 호출부가 실패를 알 수 없어 UI 상태 꼬임.

### 5.2 예외: `try / finally` (필연적 후처리)

서버 실패 여부와 무관하게 반드시 실행해야 하는 후처리가 있을 때만 try / finally.

```ts
// src/api/auth.ts
export async function signOut() {
  try {
    await api.post("/auth/logout");
  } finally {
    clearAccessToken();
  }
}
```

### 5.3 사용자 메시지는 프론트가 매핑

에러 메시지는 `@/lib/error` 의 `generateErrorMessage(error)` 가 서버 코드 → 한국어 변환. `api/*.ts` 에서 직접 메시지 생성 금지.

자세한 건 [`src/lib/CLAUDE.md`](../lib/CLAUDE.md) §"error.ts".

---

## 6. 페이지네이션 규약

### 6.1 페이지 기반 (기본)

**규칙.** `offset` / `limit` 을 서버로 보낸다. 클라이언트 내부 인자는 `from` / `to` (inclusive range).

```ts
// src/api/post.ts
export async function fetchPosts({
  from,
  to,
  authorId,
}: {
  from: number;
  to: number;
  authorId?: string | number;
}) {
  const limit = to - from + 1;
  const { data } = await api.get<{ items: Array<PostEntity & { ... }> }>("/post", {
    params: { offset: from, limit, author_id: authorId },
  });
  return data.items.map(...);
}
```

- **클라이언트 `PAGE_SIZE`** 는 훅이 정의 ([`src/hooks/CLAUDE.md`](../hooks/CLAUDE.md)).

### 6.2 커서 기반 — 쓰지 않는다 (기본)

다음 조건이 **모두 충족**될 때만 커서 기반으로 전환:
1. 데이터가 자주 "맨 앞에 추가" 된다 (실시간 피드).
2. 페이지 번호로 접근하면 "같은 페이지에 새 글과 오래된 글이 섞이는 문제" 가 UX 치명적.
3. 서버가 `next_cursor` 를 실제로 내려줄 수 있다.

위 조건 아니면 페이지 기반이 단순하고 디버깅 쉬움.

---

## 7. 파일 업로드 패턴 (presigned URL 3단계)

이미지 / 파일 업로드는 **MinIO / S3 presigned URL** 로 한다.

```
1) POST /file/upload-urls  { filenames: string[] }
    → 서버가 파일별 presigned PUT URL + temp key 반환
2) PUT <presigned URL>  body=file  (raw axios, Authorization 헤더 없이)
    → 브라우저가 MinIO/S3 에 직접 업로드
3) 도메인 엔드포인트(/post 등) 호출 시 body.temp_keys 를 함께 전송
    → 서버가 temp → permanent 로 확정
```

```ts
// src/api/image.ts (참고 예시, 현재 프로젝트에는 아직 없음 — 필요 시 추가)
import axios from "axios";                // ← raw axios (공용 api 아님)
import api from "@/lib/axios";

export type UploadedFile = {
  filename: string;
  upload_url: string;
  key: string;
};

export async function requestUploadUrls(filenames: string[]) {
  const { data } = await api.post<{
    token: string;
    files: UploadedFile[];
  }>("/file/upload-urls", { filenames });
  return data;
}

export async function putFileToPresignedUrl(url: string, file: File) {
  await axios.put(url, file, {
    headers: { "Content-Type": file.type || "application/octet-stream" },
  });
}

export async function uploadFiles(files: File[]): Promise<string[]> {
  if (files.length === 0) return [];
  const filenames = files.map((f) => f.name);
  const { files: uploads } = await requestUploadUrls(filenames);
  await Promise.all(
    uploads.map((u, idx) => putFileToPresignedUrl(u.upload_url, files[idx])),
  );
  return uploads.map((u) => u.key);
}
```

**규칙.**
1. presigned PUT 은 **raw `axios`** 로 호출. 공용 `@/lib/axios` 의 `api` 를 쓰면 request interceptor 가 `Authorization` 헤더를 붙여 S3 서명 검증 깨짐.
2. 업로드는 `Promise.all` 로 병렬.
3. 파일 0 개여도 `uploadFiles([])` 가 `[]` 반환하므로 호출부가 분기 안 해도 됨.

---

## 8. OAuth 팝업 플로우

OAuth 로그인은 **전체 페이지 redirect 가 아니라 팝업 윈도우** 에서 수행.

```ts
// src/api/auth.ts — signInWithOAuth(provider)
// 1) 팝업 open: `${API_BASE_URL}/auth/oauth/${provider}` (500x600, 화면 중앙)
// 2) window.addEventListener("message", handleMessage) 로 팝업에서 오는 postMessage 대기
// 3) 백엔드가 인증 후 `${VITE_PUBLIC_URL}/oauth/callback?access_token=...` 로 redirect
// 4) 콜백 페이지가 opener.postMessage({ type: "oauth-success", access_token }) → 팝업 자동 종료
// 5) 이 Promise 가 access_token 과 함께 resolve
```

**보안 체크리스트.**
- `event.origin !== expectedOrigin` 이면 무시 (다른 사이트 메시지 차단)
- 팝업 차단 시 reject (`!popup`)
- 팝업 수동 종료 감지 (500ms 폴링)
- cleanup: 리스너 / 인터벌 제거

**백엔드 요구사항.**
- `/auth/oauth/:provider` 엔드포인트가 provider 로그인 완료 후 `${VITE_PUBLIC_URL}/oauth/callback?access_token=...` (또는 `?error=...`) 로 리다이렉트.
- `VITE_PUBLIC_URL` 은 `.env` 에 정의 ([루트 §5](../../CLAUDE.md#5-환경변수)).

콜백 페이지 규칙은 [`src/pages/CLAUDE.md`](../pages/CLAUDE.md) 의 OAuth 섹션.

---

## 9. 안티 패턴

1. ❌ `api/` 안에서 React 훅 (`useState`, `useQuery`, `useSession`) import
2. ❌ `api/` 함수가 `throw new Error(...)` 로 사용자 메시지 직접 생성 — 프론트는 `generateErrorMessage` 로 변환
3. ❌ `api.*` 함수 내부에서 axios 인스턴스 새로 생성 (`axios.create(...)`)
4. ❌ presigned PUT 을 공용 `api` 로 호출
5. ❌ URL 문자열 하드코딩 (`fetch("http://localhost:8080/post")`). 반드시 `api` 인스턴스 사용
6. ❌ 응답 데이터 타입 생략 (`api.post("/x", body)` — `data: any` 로 떨어짐)
7. ❌ 에러 swallow: `try { ... } catch {}` 또는 `catch(e) { console.log(e) }` — 반드시 throw

---

## 10. 새 API 함수 추가 체크리스트

1. **도메인 파일 선택 또는 생성** — `src/api/<domain>.ts`.
2. **함수 네이밍** (§3) — `fetchXxx` / `createXxx` / `updateXxx` / `deleteXxx` / `toggleXxx`.
3. **파라미터는 객체 구조분해** (§4.2).
4. **응답 타입 제네릭 명시** (§4.3).
5. **snake_case 필드를 UI 가 자주 쓰면 camelCase 로 변환** (§4.4) — 선택.
6. **에러 throw 그대로** (§5.1). 후처리 필요하면 try/finally (§5.2).
7. **페이지네이션이 필요하면 `{ from, to }` 파라미터 + `offset, limit` 서버 전송** (§6.1).
8. **파일 업로드면 §7 패턴**.
9. **`types.ts` 에 `<Thing>Entity` 추가** (필요 시).
10. **`lib/constants.ts` 의 `QUERY_KEYS` 에 도메인 키 추가** (훅이 쓸 때).

---

## 11. 관련 문서

- [`src/lib/CLAUDE.md`](../lib/CLAUDE.md) — `axios.ts` 인터셉터 세부, `error.ts` 매핑, `constants.ts` QUERY_KEYS
- [`src/hooks/CLAUDE.md`](../hooks/CLAUDE.md) — `api/` 함수를 감싸는 query / mutation 훅 템플릿
- [루트 `CLAUDE.md`](../../CLAUDE.md) §9 — 호출부 토스트 / 네비게이션 컨벤션
