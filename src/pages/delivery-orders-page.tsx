import DeliveryOrderDrawer from "@/components/delivery-order/delivery-order-drawer";
import DeliveryOrderList from "@/components/delivery-order/delivery-order-list";

export default function DeliveryOrdersPage() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">배차 (Delivery Orders)</h1>
      <DeliveryOrderList />
      <DeliveryOrderDrawer />
    </div>
  );
}
