import type { Metadata } from "next";
import { OrderCheckoutView } from "@/components/checkout/order-checkout-view";

export const metadata: Metadata = {
  title: "অর্ডার চেকআউট ও পেমেন্ট | Paws Academy",
  description: "পজ একাডেমি প্রিমিয়াম সাবস্ক্রিপশন ইনভয়েস ও সুরক্ষিত পেমেন্ট সম্পন্ন করুন।",
};

interface OrderCheckoutPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderCheckoutPage({ params }: OrderCheckoutPageProps) {
  const { id } = await params;
  return <OrderCheckoutView orderId={id} />;
}
