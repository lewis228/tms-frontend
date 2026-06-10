# tms-frontend 운영 이미지 — Vite 빌드(정적) + nginx(정적 서빙 + /api 리버스 프록시)
# 단일 서버(1GB RAM) 배포용. build args 로 VITE_* 주입(Vite 는 빌드 시점에 인라인).

# ── 1) 빌드 스테이지 ──────────────────────────────────────────
# slim(glibc) — Tailwind oxide / lightningcss 네이티브 prebuild 호환성이 musl(alpine)보다 안정적.
FROM node:20-slim AS build
WORKDIR /app

# 의존성 먼저(레이어 캐시)
COPY package.json package-lock.json ./
RUN npm ci

# 소스 복사 + 빌드 시점 환경변수
COPY . .
ARG VITE_API_URL
ARG VITE_PUBLIC_URL
ARG VITE_MOCK_SESSION=false
ENV VITE_API_URL=$VITE_API_URL \
    VITE_PUBLIC_URL=$VITE_PUBLIC_URL \
    VITE_MOCK_SESSION=$VITE_MOCK_SESSION \
    NODE_OPTIONS=--max-old-space-size=640

# tsc -b && vite build → /app/dist
RUN npm run build

# ── 2) 런타임 스테이지 (nginx) ───────────────────────────────
FROM nginx:1.27-alpine AS runtime

# 기본 conf 제거 후 우리 설정 사용
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
