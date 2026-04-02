import { Suspense } from "react";
import { TrackingPageContent } from "@/components/checkout";

export default function CheckoutTrackingPage() {
  return (
    <Suspense fallback={null}>
      <TrackingPageContent />
    </Suspense>
  );
}
