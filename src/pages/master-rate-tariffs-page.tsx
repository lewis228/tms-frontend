import RateTariffList from "@/components/rate-tariff/rate-tariff-list";

export default function MasterRateTariffsPage() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Rate Tariffs</h1>
      <p className="text-sm text-muted-foreground">
        거리 × 단가 룰 (per_value × distance + per_min × duration + flat_base).
        단가 한 번 바꾸면 이후 leg 가 자동으로 새 값 적용 (snapshot 정책).
      </p>
      <RateTariffList />
    </div>
  );
}
