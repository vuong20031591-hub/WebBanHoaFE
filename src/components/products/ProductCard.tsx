import Image from "next/image";
import Link from "next/link";
import { Heart, Plus } from "lucide-react";
import { Product } from "@/lib/products";
import { createCartItem, useCartStore } from "@/lib/cart";
import { formatCurrency } from "@/lib/currency";
import { resolveProductImage } from "@/lib/mappers/product";
import { useFavoritesStore } from "@/lib/favorites";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const safeImage = resolveProductImage(product.image);
  const addItem = useCartStore((state) => state.addItem);
  const liked = useFavoritesStore((state) =>
    state.items.some((item) => item.productId === product.id)
  );
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const cartQuantity = useCartStore((state) =>
    state.variants
      .filter((item) => item.productId === product.id)
      .reduce((sum, item) => sum + item.quantity, 0)
  );

  const handleAddToCart = () => {
    addItem(createCartItem(product, { 
      availableStock: product.stockQuantity ?? null 
    }));
  };

  return (
    <div className="bg-[rgba(255,255,255,0.4)] backdrop-blur-sm rounded-[32px] overflow-hidden w-[329px] shadow-[inset_0px_0.8px_0px_0px_rgba(255,255,255,0.6),inset_0px_-0.8px_0px_0px_rgba(255,255,255,0.6)]">
      <Link href={`/products/${product.id}`} className="block relative mx-[20.8px] mt-[20.8px] h-[360px]">
        <div className="relative w-full h-full rounded-tl-[200px] rounded-tr-[200px] rounded-bl-[20px] rounded-br-[20px] overflow-hidden shadow-sm bg-[#f7f3ed]">
          <Image
            src={safeImage}
            alt={product.name}
            fill
            sizes="288px"
            className="object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite({
              productId: product.id,
              name: product.name,
              price: product.price,
              image: safeImage,
              href: `/products/${product.id}`,
              stockQuantity: product.stockQuantity ?? null,
            });
          }}
          className="absolute top-5 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${liked ? "fill-rose-400 text-rose-400" : "text-[#5c6b5e]"}`}
          />
        </button>
      </Link>

      <div className="mx-[20.8px] mt-3 pb-[20.8px]">
        <p
          className="text-[#2d2a26] text-[20px] font-light leading-[28px] text-center"
          style={{ fontFamily: "var(--font-noto-serif)" }}
        >
          {product.name}
        </p>
        <p
          className="text-[#5c6b5e] text-[18px] font-light leading-[28px] text-center mt-1"
          style={{ fontFamily: "var(--font-noto-serif)" }}
        >
          {formatCurrency(product.price)}
        </p>
        <button
          type="button"
          onClick={handleAddToCart}
          className="mt-4 w-full h-[54px] flex items-center justify-center gap-2 rounded-[12px] border border-[rgba(208,187,149,0.3)] hover:bg-[rgba(208,187,149,0.08)] transition-colors"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          <Plus className="w-5 h-5 text-[#d0bb95]" />
          <span className="text-[#d0bb95] text-[12px] font-bold tracking-[1.2px] uppercase">
            {cartQuantity > 0 ? `In Cart (${cartQuantity})` : "Move to Cart"}
          </span>
        </button>
      </div>
    </div>
  );
}
