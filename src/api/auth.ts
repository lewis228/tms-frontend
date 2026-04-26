// /auth/* 매핑.
//
// 백엔드 (ste 패턴) 는 로그인에 Basic Auth 헤더를 사용한다 — JSON body 가 아님.
// axios 의 `auth` 옵션을 넘기면 자동으로 `Authorization: Basic base64(email:password)` 가 붙는다.
import api from "@/lib/axios";
import type { LoginResponse, TokenPair } from "@/types";

export async function signIn({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>(
    "/auth/login",
    null,
    { auth: { username: email, password } },
  );
  return data;
}

export async function refresh(refreshToken: string): Promise<TokenPair> {
  // 백엔드: POST /auth/token/refresh — body 는 빈 객체. refresh_token 은 HttpOnly 쿠키로 송신.
  const { data } = await api.post<TokenPair>("/auth/token/refresh", {
    refreshToken,
  });
  return data;
}
