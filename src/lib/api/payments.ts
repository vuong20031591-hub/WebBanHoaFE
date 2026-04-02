import { apiClient } from "./client";
import { PaymentCheckoutDTO, PaymentReconciliationDTO } from "./types";

export const paymentsApi = {
  async createVietQrCheckout(orderId: number): Promise<PaymentCheckoutDTO> {
    const { data } = await apiClient.post<PaymentCheckoutDTO>(
      `/api/payments/vietqr/orders/${orderId}/checkout`
    );
    return data;
  },

  async createSePayCheckout(orderId: number): Promise<PaymentCheckoutDTO> {
    const { data } = await apiClient.post<PaymentCheckoutDTO>(
      `/api/payments/sepay/orders/${orderId}/checkout`
    );
    return data;
  },

  async reconcile(orderId: number): Promise<PaymentReconciliationDTO> {
    const { data } = await apiClient.get<PaymentReconciliationDTO>(
      `/api/payments/orders/${orderId}/reconcile`
    );
    return data;
  },
};
