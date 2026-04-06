import { apiClient } from "./client";

export interface EventInquiryRequest {
  fullName: string;
  email: string;
  eventType: string;
  eventDate: string;
  vision: string;
}

export async function submitEventInquiry(request: EventInquiryRequest): Promise<void> {
  await apiClient.post("/api/inquiries/events", request);
}
