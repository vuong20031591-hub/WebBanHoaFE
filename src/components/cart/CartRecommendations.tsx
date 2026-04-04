import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";
import { DEFAULT_PRODUCT_IMAGE } from "@/lib/mappers/product";
import { CartRecommendation } from "./constants";

interface CartRecommendationsProps {
  recommendations: CartRecommendation[];
}

export function CartRecommendations({
  recommendations,
}: CartRecommendationsProps) {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className="mt-20 border-t border-[var(--color-cart-border)] pt-20">
      <div className="flex justify-center">
        <h2
          className="text-center text-[36px] leading-none text-[var(--color-cart-ink)] sm:text-[44px]"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          You might also like
        </h2>
      </div>
      <div className="mt-16 grid gap-10 md:grid-cols-2 xl:grid-cols-3">
        {recommendations.map((recommendation) => (
          <Link
            key={recommendation.id}
            href={recommendation.href}
            className="group flex flex-col"
          >
            <div className="relative aspect-[0.75] overflow-hidden rounded-b-[28px] rounded-t-[180px] bg-white/35">
              <Image
                src={recommendation.image || DEFAULT_PRODUCT_IMAGE}
                alt={recommendation.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 352px"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="mt-6 text-center">
              <h3
                className="text-[26px] leading-[1.1] text-[var(--color-cart-ink)]"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                {recommendation.name}
              </h3>
              <p
                className="mt-2 text-[12px] uppercase tracking-[1.2px] text-[var(--color-cart-warm)]"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {formatCurrency(recommendation.price)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
