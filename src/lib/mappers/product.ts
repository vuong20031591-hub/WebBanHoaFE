import { ProductDTO, ProductDetailDTO } from "../api/types";
import { Product } from "../products/types";

export const DEFAULT_PRODUCT_IMAGE =
  "https://canhdonghoatuoi.com/wp-content/uploads/2024/05/Chua-co-ten-1080-x-1080-px-4.png";

export function resolveProductImage(_image: unknown): string {
  // Temporary fallback requested by user: force a single image for all products.
  void _image;
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
