import type { Metadata } from "next";
import { OrdersView } from "@/components/admin/orders-view";

export const metadata: Metadata = {
  title: "অর্ডার ও পেমেন্ট ব্যবস্থাপনা | PAWS Academy",
  description: "অর্ডার ও পেমেন্ট লেনদেন পরিচালনা ও অনুমোদন",
};

export default function AdminOrdersPage() {
  return <OrdersView />;
}
