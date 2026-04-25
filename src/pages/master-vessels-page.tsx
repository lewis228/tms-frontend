import VesselList from "@/components/vessel/vessel-list";

export default function MasterVesselsPage() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">선박 (Vessels)</h1>
      <VesselList />
    </div>
  );
}
