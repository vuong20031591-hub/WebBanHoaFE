import { ProductDTO, ProductDetailDTO } from "../api/types";
import { Product } from "../products/types";

export const DEFAULT_PRODUCT_IMAGE = "/images/hero-main.png";

function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

export function resolveProductImage(image: unknown): string {
  if (typeof image !== "string") {
    return DEFAULT_PRODUCT_IMAGE;
  }

  const normalized = image.trim();
  if (!normalized) {
    return DEFAULT_PRODUCT_IMAGE;
  }

  if (normalized.startsWith("/") || isAbsoluteUrl(normalized)) {
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
