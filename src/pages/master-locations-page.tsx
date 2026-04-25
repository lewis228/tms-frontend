import LocationList from "@/components/location/location-list";

export default function MasterLocationsPage() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">장소 (Locations)</h1>
      <LocationList />
    </div>
  );
}
