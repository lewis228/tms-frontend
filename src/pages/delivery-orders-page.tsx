import { useTranslation } from "react-i18next";

import ContainerDrawer from "@/components/container/container-drawer";
import DeliveryOrderDrawer from "@/components/delivery-order/delivery-order-drawer";
import DeliveryOrderList from "@/components/delivery-order/delivery-order-list";

export default function DeliveryOrdersPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">
        {t("pages.deliveryOrders.title")}
      </h1>
      <DeliveryOrderList />
      <DeliveryOrderDrawer />
      <ContainerDrawer />
    </div>
  );
}
