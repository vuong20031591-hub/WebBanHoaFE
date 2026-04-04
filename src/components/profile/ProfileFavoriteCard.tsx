"use client";

import Image from "next/image";
import { Heart, Plus } from "lucide-react";
import { CartItem, useCartStore } from "@/lib/cart";
import { DEFAULT_PRODUCT_IMAGE } from "@/lib/mappers/product";
import { useFavoritesStore } from "@/lib/favorites";
import { ProfileFavorite } from "@/lib/profile/types";

const DEFAULT_CART_QUANTITY = 1;
const DEFAULT_CART_SIZE: CartItem["size"] = "deluxe";

interface ProfileFavoriteCardProps {
  item: ProfileFavorite;
}

export function ProfileFavoriteCard({ item }: ProfileFavoriteCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);
  const safeImage = item.image || DEFAULT_PRODUCT_IMAGE;

  const handleAddToCart = () => {
    addItem({
      productId: item.productId,
      productName: item.name,
      productImage: safeImage,
      price: item.price,
      quantity: DEFAULT_CART_QUANTITY,
      availableStock: item.stockQuantity ?? null,
      size: DEFAULT_CART_SIZE,
    });
  };

  return (
    <article className="mx-auto w-full max-w-[329px] overflow-hidden rounded-[32px] bg-[rgba(255,255,255,0.4)] shadow-[inset_0px_0.8px_0px_0px_rgba(255,255,255,0.6),inset_0px_-0.8px_0px_0px_rgba(255,255,255,0.6)] backdrop-blur-sm">
      <div className="relative mx-[20.8px] mt-[20.8px] h-[360px]">
        <div className="relative h-full w-full overflow-hidden rounded-bl-[20px] rounded-br-[20px] rounded-tl-[200px] rounded-tr-[200px] bg-[#f7f3ed] shadow-sm">
          <Image
            src={safeImage}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 90vw, 288px"
            className="object-cover"
          />
        </div>

        <button
          type="button"
          onClick={() => removeFavorite(item.productId)}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(255,255,255,0.9)] shadow-sm backdrop-blur-sm hover:scale-110 transition-transform"
          aria-label={`Remove ${item.name} from favorites`}
        >
          <Heart className="h-5 w-5 fill-[#f5d5d9] text-[#f5d5d9]" />
        </button>
      </div>

      <div className="mx-[20.8px] mt-6 pb-[20.8px]">
        <h3
          className="text-center text-[20px] font-light leading-7 text-[#2d2a26]"
          style={{ fontFamily: "var(--font-noto-serif)" }}
        >
          {item.name}
        </h3>

        <p
          className="mt-1 text-center text-[18px] font-light leading-7 text-[#5c6b5e]"
          style={{ fontFamily: "var(--font-noto-serif)" }}
        >
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(item.price)}
        </p>

        <button
          type="button"
          onClick={handleAddToCart}
          className="mt-6 flex h-[54px] w-full items-center justify-center gap-2 rounded-[12px] border border-[rgba(208,187,149,0.3)] text-[#d0bb95] transition-colors hover:bg-[rgba(208,187,149,0.08)]"
        >
          <Plus className="h-5 w-5" />
          <span className="text-[12px] font-bold uppercase tracking-[1.2px]">
            Move to Cart
          </span>
        </button>
      </div>
    </article>
  );
}
