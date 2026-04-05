"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  CalendarDays,
  Leaf,
  MessageCircle,
  PackageSearch,
  ShieldCheck,
  Truck,
  X,
} from "lucide-react";
import { createCartItem, useCartStore } from "@/lib/cart";
import { formatCurrency } from "@/lib/currency";
import { isApiError, productsApi } from "@/lib/api";
import { mapProductDTOsToProducts, mapProductDetailDTOToProduct } from "@/lib/mappers";
import { DEFAULT_PRODUCT_IMAGE } from "@/lib/mappers/product";
import { Navbar, Footer } from "@/components/layout";
import { Product } from "@/lib/products";
import { useAuth, useLocale } from "@/src/contexts";

const RIBBONS = [
  { label: "Red", bg: "#e8305e" },
  { label: "Silver", bg: "linear-gradient(to bottom, #f5f5dc, #8f8f80)" },
  { label: "Rose Gold", bg: "#bc8f8f" },
  { label: "Gold", bg: "#d4af37" },
] as const;

function RelatedProductCard({ product, locale }: { product: Product; locale: "en" | "vi" }) {
  const safeImage = product.image || DEFAULT_PRODUCT_IMAGE;
  return (
    <Link href={`/products/${product.id}`} className="flex flex-col gap-6 group">
      <div className="bg-[rgba(255,255,255,0.4)] rounded-tl-[1000px] rounded-tr-[1000px] overflow-hidden relative w-full aspect-[3/4] shrink-0">
        <Image
          src={safeImage}
          alt={product.name}
          fill
          sizes="(max-width: 1280px) 25vw, 280px"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="flex flex-col gap-1 items-center w-full">
        <p
          className="text-[#2d2a26] text-[20px] font-light leading-[28px] text-center"
          style={{ fontFamily: "var(--font-noto-serif)" }}
        >
          {product.name}
        </p>
        <p
          className="text-[#9a8c81] text-[11px] font-medium tracking-[1.1px] uppercase text-center"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          {formatCurrency(product.price, locale)}
        </p>
      </div>
    </Link>
  );
}

function ProductDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { locale } = useLocale();
  const { user } = useAuth();
  const id = Number(params?.id);
  const addItem = useCartStore((state) => state.addItem);
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState<"classic" | "deluxe" | "grand">("deluxe");
  const [selectedRibbon, setSelectedRibbon] = useState(0);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [giftNote, setGiftNote] = useState("");

  const copy =
    locale === "vi"
      ? {
          notFound: "Khong tim thay san pham",
          backToShop: "Quay lai cua hang",
          home: "Trang chu",
          shop: "Cua hang",
          updated: "Cap nhat tu cua hang",
          selectSize: "Chon kich thuoc bo hoa",
          ribbon: "Chon mau no",
          deliveryDate: "Ngay giao",
          giftNote: "Loi nhan tang kem",
          personalization: "Ca nhan hoa",
          notePlaceholder: "Viet loi nhan chan thanh cua ban tai day...",
          maxChars: "{count} / Toi da 250 ky tu",
          signInOrder: "Dang nhap de dat hang",
          addToCart: "Them vao gio",
          storeDelivery: "Giao tu cua hang",
          realStock: "Ton kho thuc",
          secure: "An toan",
          similar: "San pham tuong tu",
          viewAll: "Xem tat ca",
        }
      : {
          notFound: "Product not found",
          backToShop: "Back to Shop",
          home: "Home",
          shop: "Shop",
          updated: "Updated from store",
          selectSize: "Select Arrangement Size",
          ribbon: "Ribbon Selection",
          deliveryDate: "Delivery Date",
          giftNote: "Gift Note",
          personalization: "Personalization",
          notePlaceholder: "Type your heartfelt message here...",
          maxChars: "{count} / Max 250 characters",
          signInOrder: "Sign In To Order",
          addToCart: "Add to Cart",
          storeDelivery: "Store Delivery",
          realStock: "Real Stock",
          secure: "Secure",
          similar: "Similar products",
          viewAll: "View All",
        };

  useEffect(() => {
    if (!Number.isFinite(id)) {
      setLoading(false);
      setProduct(null);
      return;
    }

    let active = true;

    const loadProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        const productDetail = await productsApi.getById(id);
        const mappedProduct = mapProductDetailDTOToProduct(productDetail);

        if (!active) {
          return;
        }

        setProduct(mappedProduct);
        setActiveImg(0);

        const relatedResponse = await productsApi.search({
          categoryId: productDetail.categoryId,
          size: 5,
        });

        if (!active) {
          return;
        }

        setRelated(
          mapProductDTOsToProducts(relatedResponse.content)
            .filter((item) => item.id !== id)
            .slice(0, 4)
        );
      } catch (fetchError) {
        if (!active) {
          return;
        }

        setProduct(null);
        setRelated([]);
        setError(
          isApiError(fetchError) && fetchError.status !== 404
            ? fetchError.message
            : null
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      active = false;
    };
  }, [id]);

  const cartQuantity = useCartStore((state) =>
    state.variants
      .filter((item) => item.productId === id && item.size === selectedSize)
      .reduce((sum, item) => sum + item.quantity, 0)
  );

  if (loading) {
    return (
      <div className="bg-[#f9f7f2] min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 px-[80px] py-12">
          <div className="mx-auto max-w-[1280px] h-[720px] rounded-[40px] bg-white/60 animate-pulse" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-[#f9f7f2] min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
          <PackageSearch className="w-12 h-12 text-[#d0bb95]" />
          <p
            className="text-[#5c6b5e] text-[18px] font-light"
            style={{ fontFamily: "var(--font-noto-serif)" }}
          >
            {error ?? copy.notFound}
          </p>
          <Link
            href="/products"
            className="mt-4 px-8 py-3 bg-[#d0bb95] text-white text-[14px] rounded-full hover:bg-[#c2a571] transition-colors"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            {copy.backToShop}
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const images = [product.image || DEFAULT_PRODUCT_IMAGE];

  const handleAddToCart = () => {
    if (!user) {
      router.push("/signin");
      return;
    }

    addItem(
      createCartItem(product, {
        deliveryDate: deliveryDate || undefined,
        giftNote: giftNote.trim() || undefined,
        ribbon: RIBBONS[selectedRibbon]?.label,
        size: selectedSize,
        availableStock: product.stockQuantity ?? null,
      })
    );
  };

  return (
    <div className="bg-[#f9f7f2] min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-[1280px] mx-auto px-[80px] py-12">
          <div className="flex items-center gap-4 mb-12">
            <Link
              href="/"
              className="text-[#9a8c81] text-[11px] tracking-[1.65px] uppercase hover:text-[#2d2a26] transition-colors"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {copy.home}
            </Link>
            <span className="text-[#9a8c81] text-[11px]">/</span>
            <Link
              href="/products"
              className="text-[#9a8c81] text-[11px] tracking-[1.65px] uppercase hover:text-[#2d2a26] transition-colors"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {copy.shop}
            </Link>
            <span className="text-[#9a8c81] text-[11px]">/</span>
            <span
              className="text-[#2d2a26] text-[11px] tracking-[1.65px] uppercase"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {product.name}
            </span>
          </div>

          <div className="flex gap-[128px] items-start pb-[112px]">
            <div className="flex-1 flex flex-col gap-8 min-w-0">
              <div className="bg-[#f3f4f6] border border-[rgba(255,255,255,0.5)] rounded-tl-[1000px] rounded-tr-[1000px] overflow-hidden relative w-full shadow-sm">
                <div className="relative w-full" style={{ paddingBottom: "115%" }}>
                  <Image
                    src={images[activeImg]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1280px) 45vw, 520px"
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {images.map((src, index) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActiveImg(index)}
                    className={`relative rounded-tl-[1000px] rounded-tr-[1000px] overflow-hidden border-2 transition-all ${
                      activeImg === index
                        ? "border-[#2d2a26]"
                        : "border-[rgba(255,255,255,0.4)] hover:border-[rgba(45,42,38,0.3)]"
                    }`}
                    style={{ paddingBottom: "36%" }}
                  >
                    <Image
                      src={src}
                      alt={`View ${index + 1}`}
                      fill
                      sizes="520px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 flex flex-col min-w-0 py-4">
              <div className="pb-6">
                <h1
                  className="text-[#2d2a26] text-[60px] font-light leading-[60px]"
                  style={{ fontFamily: "var(--font-noto-serif)" }}
                >
                  {product.name}
                </h1>
              </div>

              <div className="pb-8 flex items-baseline gap-4">
                <span
                  className="text-[#2d2a26] text-[24px] font-light tracking-[-0.6px]"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {formatCurrency(product.price, locale)}
                </span>
                <span
                  className="text-[#9a8c81] text-[10px] tracking-[1px] uppercase"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {copy.updated}
                </span>
              </div>

              <div className="pb-12 max-w-[448px]">
                <p
                  className="text-[rgba(45,42,38,0.7)] text-[16px] font-light leading-[26px]"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {product.description}
                </p>
              </div>

              <div className="flex flex-col gap-12">
                <div className="flex flex-col gap-4">
                  <p
                    className="text-[rgba(45,42,38,0.4)] text-[10px] font-semibold tracking-[2px] uppercase"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    {copy.selectSize}
                  </p>
                  <div className="flex gap-3">
                    {(["classic", "deluxe", "grand"] as const).map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`px-8 py-3 rounded-full text-[11px] tracking-[1.1px] uppercase border transition-colors ${
                          selectedSize === size
                            ? "bg-[#2d2a26] border-[#2d2a26] text-white"
                            : "border-[rgba(45,42,38,0.1)] text-[#2d2a26] hover:border-[rgba(45,42,38,0.4)]"
                        }`}
                        style={{ fontFamily: "var(--font-inter)" }}
                      >
                        {size.charAt(0).toUpperCase() + size.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <p
                    className="text-[rgba(45,42,38,0.4)] text-[10px] font-semibold tracking-[2px] uppercase"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    {copy.ribbon}
                  </p>
                  <div className="flex gap-4">
                    {RIBBONS.map((ribbon, index) => (
                      <button
                        key={ribbon.label}
                        type="button"
                        title={ribbon.label}
                        onClick={() => setSelectedRibbon(index)}
                        className="relative w-8 h-8 rounded-full shrink-0 transition-transform hover:scale-110"
                        style={{ background: ribbon.bg }}
                      >
                        {selectedRibbon === index ? (
                          <span className="absolute inset-0 rounded-full shadow-[0_0_0_2px_white,0_0_0_3px_#2d2a26]" />
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <p
                    className="text-[rgba(45,42,38,0.4)] text-[10px] font-semibold tracking-[2px] uppercase"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    {copy.deliveryDate}
                  </p>
                  <label className="relative w-[256px] border-b border-[rgba(45,42,38,0.2)] pb-2 cursor-pointer">
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(event) => setDeliveryDate(event.target.value)}
                      className="w-full bg-transparent text-[#2d2a26] text-[14px] outline-none cursor-pointer appearance-none pr-6 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                      style={{ fontFamily: "var(--font-inter)" }}
                    />
                    <CalendarDays className="absolute right-0 top-0 w-4.5 h-4.5 text-[#9a8c81] pointer-events-none" />
                  </label>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-end justify-between">
                    <p
                      className="text-[rgba(45,42,38,0.4)] text-[10px] font-semibold tracking-[2px] uppercase"
                      style={{ fontFamily: "var(--font-inter)" }}
                    >
                      {copy.giftNote}
                    </p>
                    <p
                      className="text-[#9a8c81] text-[9px] tracking-[0.9px] uppercase"
                      style={{ fontFamily: "var(--font-inter)" }}
                    >
                      {copy.personalization}
                    </p>
                  </div>
                  <div className="relative">
                    <div className="relative -rotate-1 bg-[rgba(252,250,247,0.8)] border border-[rgba(45,42,38,0.07)] rounded-sm shadow-sm overflow-hidden">
                      <div className="rotate-1">
                        <textarea
                          value={giftNote}
                          onChange={(event) =>
                            setGiftNote(event.target.value.slice(0, 250))
                          }
                          placeholder={copy.notePlaceholder}
                          rows={5}
                          className="w-full bg-transparent px-8 py-8 text-[20px] text-[#2d2a26] outline-none resize-none placeholder-[rgba(0,0,0,0.3)]"
                          style={{ fontFamily: "cursive, var(--font-noto-serif)" }}
                        />
                        {giftNote ? (
                          <button
                            type="button"
                            onClick={() => setGiftNote("")}
                            className="absolute top-2 right-2 w-9 h-9 flex items-center justify-center opacity-40 hover:opacity-70 transition-opacity"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        ) : null}
                      </div>
                    </div>
                    <p
                      className="text-[#9a8c81] text-[9px] tracking-[0.9px] uppercase text-right mt-2"
                      style={{ fontFamily: "var(--font-inter)" }}
                    >
                      {copy.maxChars.replace("{count}", String(giftNote.length))}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4 pt-8">
                  <button
                    type="button"
                  onClick={handleAddToCart}
                  className="w-full py-6 bg-[#2d2a26] text-white text-[12px] font-medium tracking-[2.4px] uppercase rounded-full hover:bg-[#1a1815] transition-colors"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {!user
                    ? copy.signInOrder
                    : cartQuantity > 0
                      ? `${copy.addToCart} (${cartQuantity})`
                      : copy.addToCart}
                </button>
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5 text-[#9a8c81] shrink-0" />
                      <span
                        className="text-[#9a8c81] text-[10px] font-medium tracking-[1px] uppercase"
                        style={{ fontFamily: "var(--font-inter)" }}
                      >
                        {copy.storeDelivery}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Leaf className="w-3 h-3 text-[#9a8c81] shrink-0" />
                      <span
                        className="text-[#9a8c81] text-[10px] font-medium tracking-[1px] uppercase"
                        style={{ fontFamily: "var(--font-inter)" }}
                      >
                        {copy.realStock}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#9a8c81] shrink-0" />
                      <span
                        className="text-[#9a8c81] text-[10px] font-medium tracking-[1px] uppercase"
                        style={{ fontFamily: "var(--font-inter)" }}
                      >
                        {copy.secure}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {related.length > 0 ? (
            <div className="border-t border-[rgba(45,42,38,0.05)] pt-20 flex flex-col gap-16">
              <div className="flex items-center justify-between px-4">
                <h2
                  className="text-[#2d2a26] text-[36px] font-light leading-[40px]"
                  style={{ fontFamily: "var(--font-noto-serif)" }}
                >
                  {copy.similar}
                </h2>
                <Link
                  href="/products"
                  className="text-[#9a8c81] text-[11px] tracking-[2.2px] uppercase border-b border-[#9a8c81] pb-1 hover:text-[#2d2a26] hover:border-[#2d2a26] transition-colors"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {copy.viewAll}
                </Link>
              </div>
              <div className="grid grid-cols-4 gap-12">
                {related.map((relatedProduct) => (
                  <RelatedProductCard
                    key={relatedProduct.id}
                    product={relatedProduct}
                    locale={locale}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-[#f8e1da] rounded-full shadow-[0px_4px_20px_0px_rgba(138,109,93,0.1)] flex items-center justify-center hover:bg-[#f0cfc4] transition-colors z-50">
        <MessageCircle className="w-6 h-6 text-[#c2a571]" />
      </button>
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<div className="bg-[#f9f7f2] min-h-screen" />}>
      <ProductDetailContent />
    </Suspense>
  );
}
