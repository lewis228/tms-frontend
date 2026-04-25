import api from "@/lib/axios";
import type {
  CarrierEntity,
  ContainerPhysicalStatus,
  CursorPaginated,
  LocationEntity,
} from "@/types";

// 전역 containers 리스트 row. shipment 조인을 통해 carrier / pol / pod / eta
// 가 nested 로 포함된다 (Terminal49 Containers 페이지 컬럼과 1:1 매칭).
export type OceanContainerListRow = {
  id: number;
  shipment_id: number;
  number: string;
  size_type: string | null;
  size_type_code: string | null;
  status: string | null;
  physical_status: ContainerPhysicalStatus | null;
  terminal_location: LocationEntity | null;
  lfd: string | null;

  // 부모 shipment 에서 파생
  mbl: string;
  carrier: CarrierEntity | null;
  pol_location: LocationEntity | null;
  pod_location: LocationEntity | null;
  eta: string | null;
};

export type OceanContainerListParams = {
  where__id__less_than?: number;
  include_total?: boolean;
  take?: number;
  // 컨테이너 번호 부분 매칭 (case-insensitive)
  where__number__i_like?: string;
  // 부모 MBL 부분 매칭 (case-insensitive). Backend 가 shipments 조인으로 필터.
  where__mbl__i_like?: string;
  // 물리 상태 탭 매칭. ContainerPhysicalStatus 값 그대로.
  where__physical_status__equal?: ContainerPhysicalStatus;
  // 사이즈 타입 (20DS / 40HC 등)
  where__size_type_code__equal?: string;
  // 선사 FK
  where__carrier_id__equal?: number;
};

export async function fetchOceanContainers(
  params: OceanContainerListParams = {},
) {
  const { data } = await api.get<CursorPaginated<OceanContainerListRow>>(
    "/ocean/containers",
    { params },
  );
  return data;
}
