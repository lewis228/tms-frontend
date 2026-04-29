import RateQuoteList from "@/components/rate-quote/rate-quote-list";

export default function MasterRateQuotesPage() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Rate Quotes</h1>
      <p className="text-sm text-muted-foreground">
        정찰가 — 특정 location pair / 화주 / 사이즈 / move_type 조합에 대해 거리룰을
        무시하고 fixed_amount 적용. RateTariff 보다 우선 매칭됨.
      </p>
      <RateQuoteList />
    </div>
  );
}
