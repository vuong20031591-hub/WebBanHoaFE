import { ProductDTO, ProductDetailDTO } from "../api/types";
import { Product } from "../products/types";

export const DEFAULT_PRODUCT_IMAGE = "/images/hero-main.png";

const mediaBaseUrl = process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.trim() || "";
const mediaBaseHostname = (() => {
  if (!mediaBaseUrl) {
    return null;
  }

  try {
    return new URL(mediaBaseUrl).hostname;
  } catch {
    return null;
  }
})();

const ALLOWED_REMOTE_IMAGE_HOSTS = new Set([
  "images.unsplash.com",
  "picsum.photos",
  "localhost",
  "127.0.0.1",
  ...(mediaBaseHostname ? [mediaBaseHostname] : []),
]);
const ALLOWED_REMOTE_IMAGE_HOST_SUFFIXES = [".r2.cloudflarestorage.com"];

function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function isAllowedRemoteImageUrl(value: string): boolean {
  try {
    const url = new URL(value);

    if (!["http:", "https:"].includes(url.protocol)) {
      return false;
    }

    if (ALLOWED_REMOTE_IMAGE_HOSTS.has(url.hostname)) {
      return true;
    }

    return ALLOWED_REMOTE_IMAGE_HOST_SUFFIXES.some((suffix) =>
      url.hostname.endsWith(suffix)
    );
  } catch {
    return false;
  }
}

export function resolveProductImage(image: unknown): string {
  if (typeof image !== "string") {
    return DEFAULT_PRODUCT_IMAGE;
  }

  const normalized = image.trim();
  if (!normalized) {
    return DEFAULT_PRODUCT_IMAGE;
  }

  if (normalized.startsWith("/")) {
    return normalized;
  }

  if (isAbsoluteUrl(normalized) && isAllowedRemoteImageUrl(normalized)) {
    return normalized;
  }

  return DEFAULT_PRODUCT_IMAGE;
}

export function mapProductDTOToProduct(dto: ProductDTO): Product {
  return {
    id: dto.id,
    name: dto.name,
    price: dto.price,
    image: resolveProductImage(dto.imageUrl),
    description: dto.description || "",
    categoryId: 0,
    stockQuantity: dto.stockQuantity,
  };
}

export function mapProductDetailDTOToProduct(dto: ProductDetailDTO): Product {
  return {
    id: dto.id,
    name: dto.name,
    price: dto.price,
    image: resolveProductImage(dto.image),
    description: dto.description || "",
    categoryId: dto.categoryId,
    stockQuantity: dto.stockQuantity,
  };
}

export function mapProductDTOsToProducts(dtos: ProductDTO[]): Product[] {
  return dtos.map(mapProductDTOToProduct);
}
