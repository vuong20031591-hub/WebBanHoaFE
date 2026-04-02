import { useEffect, useRef } from "react";
import { useCartStore } from "./store";
import { cartSyncEngine } from "./sync";
import { groupByProductId, sumQuantities } from "./utils";

export function useCartSync(userId: string | null) {
  const variants = useCartStore((state) => state.variants);
  const prevVariantsRef = useRef(variants);

  useEffect(() => {
    if (!userId) return;
    
    // Check if baseline reset needed (after merge)
    if (cartSyncEngine.shouldResetBaseline()) {
      console.log("useCartSync: baseline reset after merge");
      prevVariantsRef.current = variants;
      return;
    }
    
    // Skip sync if merge in progress, but update ref to prevent stale baseline
    if (cartSyncEngine.isMerging()) {
      console.log("useCartSync: skipped (merge in progress)");
      prevVariantsRef.current = variants;
      return;
    }

    const prevVariants = prevVariantsRef.current;
    const currentVariants = variants;

    const prevByProduct = groupByProductId(prevVariants);
    const currentByProduct = groupByProductId(currentVariants);

    const allProductIds = new Set([
      ...Object.keys(prevByProduct).map(Number),
      ...Object.keys(currentByProduct).map(Number),
    ]);

    for (const productId of allProductIds) {
      const prevTotal = sumQuantities(prevByProduct[productId] || []);
      const currentTotal = sumQuantities(currentByProduct[productId] || []);

      if (prevTotal !== currentTotal) {
        cartSyncEngine.syncVariantChange(productId, currentTotal);
      }
    }

    prevVariantsRef.current = currentVariants;
  }, [variants, userId]);

  return {
    retryProduct: (productId: number) => cartSyncEngine.retryProduct(productId),
  };
}
