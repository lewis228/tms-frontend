import DistanceMatrixList from "@/components/distance-matrix/distance-matrix-list";

export default function MasterDistanceMatrixPage() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Distance Matrix</h1>
      <p className="text-sm text-muted-foreground">
        location pair 거리·시간 캐시. RateTariff 산출 시 lookup. provider 어댑터로 측정 가능 (OSRM / Google / Manual).
      </p>
      <DistanceMatrixList />
    </div>
  );
}
