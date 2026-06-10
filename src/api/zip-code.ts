// /api/v1/zip-codes/* 매핑 — 전역 zip 마스터(검색/단건). 마스터 폼 zip picker + 존 도시 autocomplete.
import api from "@/lib/axios";
import type { ZipCodeEntity, CitySuggestion } from "@/types";

export async function searchZipCodes(
  q: string,
  state?: string,
): Promise<ZipCodeEntity[]> {
  const { data } = await api.get<ZipCodeEntity[]>("/zip-codes", {
    params: { q, state, limit: 20 },
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
): Promise<CitySuggestion[]> {
  const { data } = await api.get<CitySuggestion[]>("/zip-codes/cities", {
    params: { q, state, limit: 20 },
  });
  return data;
}
