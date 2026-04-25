# react-boilerplate

재사용 가능한 React 프론트엔드 보일러플레이트. **디자인은 그대로 유지**하면서 로그인/회원가입/비밀번호 재설정/대시보드/테이블/프로필/알림/구독 화면을 바로 사용할 수 있도록 만들어져 있습니다.

코드 스타일·폴더 구조·패턴은 [`CLAUDE.md`](./CLAUDE.md)에 상세히 문서화되어 있습니다. 새 도메인을 추가할 때 이 문서만 보고 기존 코드와 동일한 스타일로 구현할 수 있습니다.

## 기술 스택

| 영역 | 라이브러리 |
| --- | --- |
| 번들러 | Vite 7 |
| UI | React 19, TypeScript strict, Tailwind CSS v4 |
| UI 컴포넌트 | shadcn/ui (Dialog/AlertDialog/Input/Button/Card/...), Radix UI, Base UI |
| 라우팅 | react-router-dom v7 (중첩 라우트 + 레이아웃 가드) |
| 서버 상태 | @tanstack/react-query v5 (+ devtools) |
| 클라이언트 상태 | Zustand (+ combine + devtools + persist) |
| HTTP | axios (JWT 인터셉터 + 401 자동 refresh) |
| 차트 | recharts |
| 토스트 | sonner |
| 포맷터 | Prettier + `prettier-plugin-tailwindcss` (클래스 자동 정렬) |

## 빠른 시작

```bash
npm install
npm run dev      # http://localhost:5173
```

기본적으로 `.env`의 `VITE_MOCK_SESSION=true` 가 활성화되어 있어서 **백엔드 없이도** 대시보드에 바로 접근할 수 있습니다. 실제 백엔드를 붙일 때는 이 값을 `false`로 바꾸거나 `.env`에서 제거합니다.

### 스크립트

```bash
npm run dev        # 개발 서버
npm run build      # 타입 체크 + 프로덕션 빌드
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm run format     # prettier --write
npm run preview    # 빌드 결과 미리보기
```

## 환경변수

```dotenv
# .env
VITE_API_URL=http://localhost:8080      # FastAPI 백엔드 엔드포인트
VITE_PUBLIC_URL=http://localhost:5173   # 프론트 공개 URL (리다이렉트용)
VITE_MOCK_SESSION=true                  # true면 /user/me 호출 대신 데모 세션 주입
```

클라이언트에 노출되는 환경변수는 반드시 `VITE_` prefix 로 시작해야 합니다. 비밀 값(service account key 등)은 **절대** 프론트엔드에 넣지 마세요.

## 폴더 구조

```
src/
├── api/              # axios 래퍼 (도메인당 파일 1개)
├── assets/
├── components/
│   ├── ui/           # shadcn/ui 자동 생성 (수정 금지)
│   ├── layout/       # sidebar, guest/member-only-layout, footer
│   ├── modal/        # 전역 모달 본체 (ModalProvider가 #modal-root에 마운트)
│   └── <domain>/     # 도메인 컴포넌트
├── hooks/
│   ├── queries/      # useQuery / useInfiniteQuery 훅
│   └── mutations/    # useMutation 훅 (도메인별 서브폴더)
├── lib/              # axios 인스턴스, QUERY_KEYS, 에러 매핑, 유틸
├── pages/            # 라우트 1개 = 파일 1개 (kebab-case, 얇게 유지)
├── provider/         # SessionProvider, ModalProvider
├── store/            # Zustand 스토어 (파일당 1개)
├── App.tsx           # Provider 합성
├── main.tsx          # createRoot + BrowserRouter + QueryClientProvider
├── root-route.tsx    # <Routes> 트리
└── types.ts          # 도메인 공용 타입
```

세부 규칙과 근거는 [`CLAUDE.md`](./CLAUDE.md) 참고.

## 라우트

| 경로 | 레이아웃 | 설명 |
| --- | --- | --- |
| `/sign-in` | GuestOnly | 이메일/비밀번호 + OAuth |
| `/sign-up` | GuestOnly | 이메일 인증 OTP → 계정 생성 |
| `/forget-password` | GuestOnly | 비밀번호 재설정 메일 요청 |
| `/` | MemberOnly | 대시보드 |
| `/tables` | MemberOnly | Authors / Projects 테이블 |
| `/profile` | MemberOnly | 프로필 + 설정 |
| `/notifications` | MemberOnly | 알림 목록 + 알림 설정 |
| `/subscriptions` | MemberOnly | 플랜 / 사용량 / 결제 내역 |
| `/reset-password` | MemberOnly | 새 비밀번호 확정 |

## 인증 플로우

1. 앱 진입 시 `SessionProvider`가 `fetchMe()`를 호출해서 세션을 복원합니다. 완료 전까지 `GlobalLoader`만 렌더되어 라우트 깜빡임을 차단합니다.
2. 로그인 성공 시 `access_token`은 `localStorage`에, refresh token은 **HttpOnly 쿠키**에 저장됩니다 (`withCredentials: true`).
3. 모든 요청은 axios request interceptor가 자동으로 `Authorization: Bearer <JWT>` 를 붙입니다.
4. 401 응답은 response interceptor가 `/auth/token/access`로 토큰을 재발급받고 **원 요청을 1회 재시도**합니다. 동시 요청은 `refreshPromise` 단일 변수로 한 번에 합쳐집니다.
5. refresh 실패 시 `clearAccessToken()` 후 `/sign-in`으로 하드 네비게이션됩니다.

## 새 도메인 추가 순서

1. `src/types.ts` 에 `<Thing>Entity`, `<Thing>` 타입 추가
2. `src/api/<domain>.ts` 에 `fetchXxx` / `createXxx` / `updateXxx` / `deleteXxx` 작성
3. `src/lib/constants.ts` 의 `QUERY_KEYS`에 `<domain>.{all,list,byId}` 추가
4. `src/hooks/queries/use-<thing>-data.ts`
5. `src/hooks/mutations/<domain>/use-<verb>-<thing>.ts`
6. (옵션) `src/store/<domain>-editor-modal.ts` + `src/components/modal/<domain>-editor-modal.tsx` + `ModalProvider`에 한 줄 추가
7. `src/components/<domain>/<thing>-item.tsx` 등 도메인 컴포넌트
8. `src/pages/<route>-page.tsx`
9. `src/root-route.tsx`에 Route 등록

완성 예시는 `CLAUDE.md` 부록 A(`item` 도메인) 참고.

## 원본

이 보일러플레이트의 코드 스타일 원본: [HyeongTaekJo/react-vite-starter](https://github.com/HyeongTaekJo/react-vite-starter).
