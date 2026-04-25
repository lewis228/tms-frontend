import SettlementDrawer from "@/components/settlement/settlement-drawer";
import SettlementList from "@/components/settlement/settlement-list";

export default function AccountingPage() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">정산 (Settlements)</h1>
      <SettlementList />
      <SettlementDrawer />
    </div>
  );
}
