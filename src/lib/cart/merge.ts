import { CartVariantItem, CartSyncState, ServerCartEntry } from "./types";
import { CartDTO } from "../api/types";
import { groupByProductId, sumQuantities, generateUUID } from "./utils";
import { resolveProductImage } from "../mappers/product";

export async function mergeCartsOnLogin(
  localVariants: CartVariantItem[],
  serverCart: CartDTO,
  userId: string
): Promise<{ variants: CartVariantItem[]; syncState: CartSyncState; deltas: Array<{ productId: number; localTotal: number; serverTotal: number }> }> {
  const localByProduct = groupByProductId(localVariants);
  const serverByProduct = new Map(
    serverCart.items.map((item) => [item.productId, item])
  );

  const allProductIds = new Set([
    ...Object.keys(localByProduct).map(Number),
    ...serverByProduct.keys(),
  ]);

  const merged: CartVariantItem[] = [];
  const newSyncState: Record<string, ServerCartEntry> = {};
  const deltas: Array<{ productId: number; localTotal: number; serverTotal: number }> = [];

  for (const productId of allProductIds) {
    const localTotal = sumQuantities(localByProduct[productId] || []);
    const serverItem = serverByProduct.get(productId);
    const serverTotal = serverItem?.quantity ?? 0;

    // Preserve local stock if server has no info
    const localStock = localByProduct[productId]?.[0]?.availableStock ?? null;
    const availableStock = serverItem?.availableStock ?? localStock;

    let targetTotal = Math.max(localTotal, serverTotal);

    if (availableStock !== null && targetTotal > availableStock) {
      targetTotal = availableStock;
      console.warn(`Product ${productId}: clamped to stock ${availableStock}`);
    }

    if (targetTotal === 0) {
      console.warn(`Product ${productId}: skipped (out of stock)`);
      deltas.push({ productId, localTotal: 0, serverTotal });
      
      if (serverItem) {
        newSyncState[productId.toString()] = {
          productId,
          serverCartItemId: serverItem.id,
          serverQuantity: serverTotal,
          syncStatus: "synced",
        };
      }
      
      continue;
    }

    deltas.push({ productId, localTotal: targetTotal, serverTotal });

    if (localByProduct[productId]) {
      const variants = localByProduct[productId].map((variant) => ({
        ...variant,
        productImage: resolveProductImage(variant.productImage),
      }));
      const currentSum = sumQuantities(variants);

      if (targetTotal > currentSum) {
        variants[variants.length - 1].quantity += targetTotal - currentSum;
        variants[variants.length - 1].availableStock = availableStock;
      } else if (targetTotal < currentSum) {
        const ratio = targetTotal / currentSum;
        let remaining = targetTotal;

        for (let i = 0; i < variants.length; i++) {
          if (i === variants.length - 1) {
            variants[i].quantity = remaining;
          } else {
            const newQty = Math.floor(variants[i].quantity * ratio);
            variants[i].quantity = newQty;
            remaining -= newQty;
          }
          variants[i].availableStock = availableStock;
        }
      } else {
        variants.forEach((v) => (v.availableStock = availableStock));
      }

      const nonZeroVariants = variants.filter((v) => v.quantity > 0);
      merged.push(...nonZeroVariants);
    } else {
      merged.push({
        localId: generateUUID(),
        productId: serverItem!.productId,
        productName: serverItem!.productName,
        productImage: resolveProductImage(serverItem!.image),
        price: Number(serverItem!.price),
        quantity: targetTotal,
        availableStock: availableStock,
        size: "deluxe",
      });
    }

    newSyncState[productId.toString()] = {
      productId,
      serverCartItemId: serverItem?.id ?? null,
      serverQuantity: serverTotal,
      syncStatus: "synced",
    };
  }

  return {
    variants: merged,
    syncState: {
      entries: newSyncState,
      lastSyncedUserId: userId,
    },
    deltas,
  };
}
