// 페이지네이션 응답 어댑터.
//
// 백엔드는 cursor pagination 응답을 보낸다:
//   { meta: { count, hasMore, cursor, next, total }, data: T[] }
//
// 프론트의 PagedResponse<T> 타입은 page-based 형태:
//   { items, total, page, size, pages }
//
// 28+ 컴포넌트가 이미 `data.items / data.total / data.page / data.pages` 를
// 사용하고 있어, API 래퍼 레이어에서 변환해 호환을 유지한다.
import type { PagedResponse } from "@/types";

type CursorMeta = {
  count: number;
  hasMore: boolean;
  cursor: string | null;
  next: string | null;
  total: number | null;
};

export type CursorResponse<T> = {
  meta: CursorMeta;
  data: T[];
};

export function adaptCursorToPaged<T>(
  resp: CursorResponse<T>,
  requestedPage = 1,
  requestedSize = 20,
): PagedResponse<T> {
  // 방어적 처리 — 응답이 예상 형태가 아니면 빈 페이지
  if (!resp || typeof resp !== "object") {
    return { items: [], total: 0, page: 1, size: requestedSize, pages: 1 };
  }
  const r = resp as { meta?: CursorMeta; data?: T[] };
  const items = Array.isArray(r.data) ? r.data : [];
  const total = r.meta?.total ?? r.meta?.count ?? items.length;
  const size = requestedSize > 0 ? requestedSize : 20;
  const pages = total > 0 ? Math.max(1, Math.ceil(total / size)) : 1;
  return {
    items,
    total,
    page: requestedPage,
    size,
    pages,
  };
}
