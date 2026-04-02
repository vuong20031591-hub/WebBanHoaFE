export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
  number?: number;
  first?: boolean;
  last?: boolean;
}

export interface ProductDTO {
  id: number;
  name: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
  stockQuantity: number | null;
  categoryName: string | null;
}

export interface ProductDetailDTO {
  id: number;
  name: string;
  price: number;
  description: string | null;
  image: string | null;
  categoryId: number;
  categoryName: string | null;
  stockQuantity: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryDTO {
  id: number;
  name: string;
  description: string | null;
}

export interface CartItemDTO {
  id: number;
  productId: number;
  productName: string;
  image: string | null;
  quantity: number;
  price: number;
  lineTotal: number;
  availableStock: number | null;
}

export interface CartDTO {
  cartId: number;
  userId: string;
  totalItems: number;
  totalAmount: number;
  items: CartItemDTO[];
  updatedAt: string;
}

export interface AddCartItemRequest {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export type OrderPaymentMethod = "COD" | "VIETQR" | "SEPAY";

export interface CreateOrderFromCartRequest {
  paymentMethod: OrderPaymentMethod;
  addressId?: number;
}

export interface OrderItemDTO {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface OrderDTO {
  id: number;
  userId: string;
  totalAmount: number;
  paymentMethod: OrderPaymentMethod;
  status: string;
  items: OrderItemDTO[];
  createdAt: string;
  updatedAt: string;
  confirmedAt: string | null;
}

export interface PaymentCheckoutDTO {
  orderId: number;
  provider: string;
  checkoutUrl: string | null;
  qrContent: string | null;
  note: string | null;
  transactionId: string;
  expiresAt: string;
  expiresInSeconds: number;
}

export interface PaymentReconciliationDTO {
  orderId: number;
  orderStatus: string;
  transactionCount: number;
  paid: boolean;
  transactions: string[];
}
