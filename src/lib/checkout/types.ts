export interface DeliveryInfo {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postCode: string;
}

export interface PersonalNote {
  recipient: string;
  message: string;
  signature: string;
  keepAnonymous: boolean;
}

export type PaymentMethod = "qr" | "cash";

export interface DiscountCode {
  code: string;
  amount: number;
}

export interface CheckoutState {
  deliveryInfo: DeliveryInfo | null;
  personalNote: PersonalNote | null;
  paymentMethod: PaymentMethod;
  discountCode: DiscountCode | null;
}
