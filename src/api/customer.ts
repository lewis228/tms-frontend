import api from "@/lib/axios";
import type { CustomerEntity } from "@/types";

// All endpoints are team-scoped via the X-Team-Id header / API Key team_id,
// so the URL itself carries no team segment. The backend enforces the scope
// and 400s if it's missing.

export async function fetchCustomers() {
  const { data } = await api.get<CustomerEntity[]>("/customers");
  return data;
}

export async function createCustomer({ name }: { name: string }) {
  const { data } = await api.post<CustomerEntity>("/customers", { name });
  return data;
}

export async function updateCustomer({
  customerId,
  name,
}: {
  customerId: number;
  name?: string;
}) {
  const { data } = await api.patch<CustomerEntity>(
    `/customers/${customerId}`,
    { name },
  );
  return data;
}

export async function deleteCustomer(customerId: number) {
  await api.delete(`/customers/${customerId}`);
  // Echo the id back so mutation hooks can target cache entries without
  // refetching — the server returns 204 No Content.
  return { id: customerId };
}
