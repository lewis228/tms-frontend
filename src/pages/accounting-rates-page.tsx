import RateSettingList from "@/components/rate-setting/rate-setting-list";

export default function AccountingRatesPage() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">요율 설정 (Rate Settings)</h1>
      <p className="text-xs text-muted-foreground">
        ADMIN+ 만 접근 가능. FLAT_RATE / PERCENTAGE / PER_MILE 중 type 별로 한
        가지 amount 필드만 사용.
      </p>
      <RateSettingList />
    </div>
  );
}
