import { Suspense } from "react";
import { CompletePageContent } from "@/components/checkout";

export default function CheckoutCompletePage() {
  return (
    <Suspense fallback={null}>
      <CompletePageContent />
    </Suspense>
  );
}
