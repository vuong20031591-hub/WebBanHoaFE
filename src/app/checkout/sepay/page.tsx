import { Suspense } from "react";
import { QrPaymentPageContent } from "@/components/checkout";

export default function CheckoutSePayPage() {
  return (
    <Suspense fallback={null}>
      <QrPaymentPageContent provider="SEPAY" />
    </Suspense>
  );
}
