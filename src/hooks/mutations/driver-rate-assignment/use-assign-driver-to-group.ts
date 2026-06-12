import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createDriverRateAssignment,
  fetchDriverRateAssignments,
  updateDriverRateAssignment,
} from "@/api/driver-rate-assignment";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export type AssignDriverResult = "created" | "moved" | "noop";

function todayISO(): string {
  // 로컬 날짜 기준 — UTC toISOString() 은 시차로 하루가 어긋날 수 있다.
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// 기사를 그룹에 "추가" — 배정 모델은 기사당 활성 배정 1개라서:
//   기존 배정 없음 → 오늘부터 신규 배정 생성
//   다른 그룹 배정 있음 → 그 배정의 그룹만 교체(이동)
//   이미 이 그룹 → noop (호출부가 안내 토스트)
export function useAssignDriverToGroup(
  callbacks?: UseMutationCallback & {
    onDone?: (result: AssignDriverResult) => void;
  }
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      driverId,
      rateGroupId,
    }: {
      driverId: number;
      rateGroupId: number;
    }): Promise<AssignDriverResult> => {
      const existing = await fetchDriverRateAssignments({
        driverId,
        size: 10,
      });
      const active = existing.items.find((a) => a.isActive);
      if (active?.rateGroupId === rateGroupId) return "noop";
      if (active) {
        await updateDriverRateAssignment(active.id, { rateGroupId });
        return "moved";
      }
      await createDriverRateAssignment({
        driverId,
        rateGroupId,
        effectiveFrom: todayISO(),
      });
      return "created";
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.driverRateAssignment.all });
      callbacks?.onDone?.(result);
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
