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

export interface AdminProductUpsertRequest {
  name: string;
  price: number;
  description?: string;
  image?: string;
  stockQuantity: number;
  categoryId: number;
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

export interface AdminOrderStatsDTO {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  cancelledOrders: number;
}

export interface AdminCreateOrderItemRequest {
  productId: number;
  quantity: number;
}

export interface AdminCreateOrderRequest {
  customerEmail: string;
  paymentMethod: OrderPaymentMethod;
  items: AdminCreateOrderItemRequest[];
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

export interface AddressDTO {
  id: number;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressRequest {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward?: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequest {
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
  district?: string;
  ward?: string;
  isDefault?: boolean;
}

export interface NotificationPreferencesDTO {
  emailOrderUpdates: boolean;
  emailPromotions: boolean;
  emailNewsletter: boolean;
  smsOrderUpdates: boolean;
  pushArtistUpdates: boolean;
}

export interface UpdateNotificationPreferencesRequest {
  emailOrderUpdates?: boolean;
  emailPromotions?: boolean;
  emailNewsletter?: boolean;
  smsOrderUpdates?: boolean;
  pushArtistUpdates?: boolean;
}

export interface UserPreferencesDTO {
  language: string;
  currency: string;
  theme: string;
  timezone: string;
  signatureWrap: boolean;
  ecoDelivery: boolean;
  ribbonColor: string;
}

export interface UpdateUserPreferencesRequest {
  language?: string;
  currency?: string;
  theme?: string;
  timezone?: string;
  signatureWrap?: boolean;
  ecoDelivery?: boolean;
  ribbonColor?: string;
}

export interface UserRewardsDTO {
  points: number;
  lifetimePoints: number;
  tier: string;
  pointsToNextTier: number;
}

export interface RewardsTransactionDTO {
  id: number;
  points: number;
  type: string;
  description: string;
  orderId: number | null;
  createdAt: string;
}

export interface RewardsHistoryResponse {
  content: RewardsTransactionDTO[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}
