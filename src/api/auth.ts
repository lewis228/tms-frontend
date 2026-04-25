// /api/v1/auth/* 매핑.
import api from "@/lib/axios";
import type { LoginResponse, TokenPair } from "@/types";

export async function signIn({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", {
    email,
    password,
  });
  return data;
}

export async function refresh(refreshToken: string): Promise<TokenPair> {
  const { data } = await api.post<TokenPair>("/auth/refresh", {
    refreshToken,
  });
  return data;
}
