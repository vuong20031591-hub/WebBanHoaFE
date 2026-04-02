import { cartApi } from "../api/cart";
import { useCartStore } from "./store";
import { getVariantsByProductId, sumQuantities } from "./utils";
import { ServerCartEntry } from "./types";

interface SyncOperation {
  productId: number;
  quantity: number;
  timestamp: number;
}

class CartSyncEngine {
  private queue: Map<number, SyncOperation> = new Map();
  private processing = false;
  private debounceTimers: Map<number, NodeJS.Timeout> = new Map();
  private merging = false;
  private baselineResetNeeded = false;

  setMerging(value: boolean) {
    this.merging = value;
  }

  isMerging(): boolean {
    return this.merging;
  }

  markBaselineResetNeeded() {
    this.baselineResetNeeded = true;
  }

  shouldResetBaseline(): boolean {
    if (this.baselineResetNeeded) {
      this.baselineResetNeeded = false;
      return true;
    }
    return false;
  }

  syncVariantChange(productId: number, newTotal: number, bypassLock = false) {
    // Skip if merge in progress (unless bypass)
    if (this.merging && !bypassLock) {
      console.log(`Sync skipped for product ${productId}: merge in progress`);
      return;
    }

    const existingTimer = this.debounceTimers.get(productId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    this.queue.set(productId, {
      productId,
      quantity: newTotal,
      timestamp: Date.now(),
    });

    const timer = setTimeout(() => {
      this.debounceTimers.delete(productId);
      this.processQueue();
    }, 300);

    this.debounceTimers.set(productId, timer);
  }

  private async processQueue() {
    if (this.processing) return;
    this.processing = true;

    // Drain loop: process until queue is empty
    while (this.queue.size > 0) {
      const operations = Array.from(this.queue.values());
      this.queue.clear();

      for (const op of operations) {
        try {
          useCartStore.getState().updateSyncEntry(op.productId, {
            syncStatus: "syncing",
          });

          const result = await this.executeSyncOperation(op);

          // Skip update if entry was deleted
          if (!result.deleted) {
            useCartStore.getState().updateSyncEntry(op.productId, {
              syncStatus: "synced",
              serverQuantity: result.actualQuantity,
            });
          }
        } catch (error) {
          useCartStore.getState().updateSyncEntry(op.productId, {
            syncStatus: "error",
            errorMessage: (error as Error).message || "Sync failed",
          });
        }
      }
    }

    this.processing = false;
  }

  private async executeSyncOperation(op: SyncOperation): Promise<{ deleted: boolean; actualQuantity: number }> {
    const syncEntry = useCartStore.getState().getSyncEntry(op.productId);

    if (op.quantity === 0) {
      if (syncEntry?.serverCartItemId) {
        await cartApi.deleteItem(syncEntry.serverCartItemId);
      }
      useCartStore.getState().removeSyncEntry(op.productId);
      return { deleted: true, actualQuantity: 0 };
    }

    const result = await this.syncProductQuantity(op.productId, op.quantity, syncEntry);
    return result;
  }

  private async syncProductQuantity(
    productId: number,
    targetQuantity: number,
    syncEntry: ServerCartEntry | undefined
  ): Promise<{ deleted: boolean; actualQuantity: number }> {
    try {
      if (syncEntry?.serverCartItemId) {
        await cartApi.updateItem(syncEntry.serverCartItemId, { quantity: targetQuantity });
      } else {
        const serverCart = await cartApi.get();
        const existingItem = serverCart.items.find(
          (i) => i.productId === productId
        );

        if (existingItem) {
          await cartApi.updateItem(existingItem.id, { quantity: targetQuantity });
          useCartStore.getState().updateSyncEntry(productId, {
            serverCartItemId: existingItem.id,
            serverQuantity: targetQuantity,
            syncStatus: "synced",
          });
        } else {
          const response = await cartApi.addItem({ productId, quantity: targetQuantity });
          const newItem = response.items.find((i) => i.productId === productId);
          useCartStore.getState().updateSyncEntry(productId, {
            serverCartItemId: newItem!.id,
            serverQuantity: targetQuantity,
            syncStatus: "synced",
          });
        }
      }
      return { deleted: false, actualQuantity: targetQuantity };
    } catch (error) {
      // Match normalized ApiError from client.ts
      const apiError = error as { status?: number; message?: string };
      
      if (
        apiError.status === 400 &&
        apiError.message?.toLowerCase().includes("stock")
      ) {
        const serverCart = await cartApi.get();
        const serverItem = serverCart.items.find(
          (i) => i.productId === productId
        );

        const safeQuantity =
          serverItem?.availableStock ?? serverItem?.quantity ?? 0;

        if (safeQuantity === 0) {
          const store = useCartStore.getState();
          const variants = store.variants.filter(
            (v) => v.productId !== productId
          );
          store.replaceCart(variants, store.syncState);
          store.removeSyncEntry(productId);
          return { deleted: true, actualQuantity: 0 };
        }

        // Recursive retry with safe quantity
        const retryResult = await this.syncProductQuantity(productId, safeQuantity, syncEntry);

        const store = useCartStore.getState();
        const variants = getVariantsByProductId(store.variants, productId);
        const currentTotal = sumQuantities(variants);

        // Use actual quantity from retry (may differ if stock changed again)
        const actualSafeQuantity = retryResult.actualQuantity;

        if (currentTotal !== actualSafeQuantity) {
          const ratio = actualSafeQuantity / currentTotal;
          let remaining = actualSafeQuantity;

          const updatedVariants = store.variants.map((v) => {
            if (v.productId !== productId) return v;

            const isLast =
              v.localId ===
              variants[variants.length - 1].localId;

            if (isLast) {
              return { ...v, quantity: remaining, availableStock: actualSafeQuantity };
            } else {
              const newQty = Math.floor(v.quantity * ratio);
              remaining -= newQty;
              return { ...v, quantity: newQty, availableStock: actualSafeQuantity };
            }
          }).filter((v) => v.quantity > 0);

          store.replaceCart(updatedVariants, store.syncState);
        }
        
        return retryResult;
      } else {
        throw error;
      }
    }
  }

  async retryProduct(productId: number) {
    const store = useCartStore.getState();
    const variants = getVariantsByProductId(store.variants, productId);
    const total = sumQuantities(variants);

    if (total === 0) {
      const syncEntry = store.getSyncEntry(productId);
      if (syncEntry?.serverCartItemId) {
        await cartApi.deleteItem(syncEntry.serverCartItemId);
      }
      store.removeSyncEntry(productId);
      return;
    }

    this.syncVariantChange(productId, total);
  }
}

export const cartSyncEngine = new CartSyncEngine();
