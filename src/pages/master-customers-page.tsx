import CustomerList from "@/components/customer/customer-list";

export default function MasterCustomersPage() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">고객사 (Customers)</h1>
      <CustomerList />
    </div>
  );
}
