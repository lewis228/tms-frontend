// /api/v1/zip-codes/* 매핑 — 전역 zip 마스터(검색/단건). 마스터 폼 zip picker + 존 도시 autocomplete.
// scope=true 면 팀 영업권역(Service Area) 선언 범위로 결과 제한 (선언 없으면 전체).
import api from "@/lib/axios";
import type { ZipCodeEntity, CitySuggestion } from "@/types";

export async function searchZipCodes(
  q: string,
  state?: string,
  scope?: boolean
): Promise<ZipCodeEntity[]> {
  const { data } = await api.get<ZipCodeEntity[]>("/zip-codes", {
    params: { q, state, limit: 20, ...(scope ? { scope: true } : {}) },
  });
  return data;
}

export async function fetchZipCode(id: number): Promise<ZipCodeEntity> {
  const { data } = await api.get<ZipCodeEntity>(`/zip-codes/${id}`);
  return data;
}

export async function searchCities(
  q: string,
  state?: string,
  scope?: boolean
): Promise<CitySuggestion[]> {
  const { data } = await api.get<CitySuggestion[]>("/zip-codes/cities", {
    params: { q, state, limit: 20, ...(scope ? { scope: true } : {}) },
  });
  return data;
}
