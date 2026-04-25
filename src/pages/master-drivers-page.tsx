import DriverList from "@/components/driver/driver-list";

export default function MasterDriversPage() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">기사 (Drivers)</h1>
      <DriverList />
    </div>
  );
}
