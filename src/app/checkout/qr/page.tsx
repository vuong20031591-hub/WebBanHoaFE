import { Suspense } from "react";
import { QrPaymentPageContent } from "@/components/checkout";

export default function CheckoutQrPage() {
  return (
    <Suspense fallback={null}>
      <QrPaymentPageContent />
    </Suspense>
  );
}
