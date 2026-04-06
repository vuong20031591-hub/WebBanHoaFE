import { apiClient } from "./client";
import {
  AddressDTO,
  CreateAddressRequest,
  UpdateAddressRequest,
  NotificationPreferencesDTO,
  TwoFactorSmsCodeResponse,
  UpdateNotificationPreferencesRequest,
  UserPreferencesDTO,
  UpdateUserPreferencesRequest,
  VerifyTwoFactorSmsCodeRequest,
  UserRewardsDTO,
  RewardsHistoryResponse,
} from "./types";

export async function getUserAddresses(): Promise<AddressDTO[]> {
  const response = await apiClient.get<AddressDTO[]>("/api/addresses");
  return response.data;
}

export async function getAddress(id: number): Promise<AddressDTO> {
  const response = await apiClient.get<AddressDTO>(`/api/addresses/${id}`);
  return response.data;
}

export async function createAddress(
  request: CreateAddressRequest
): Promise<AddressDTO> {
  const response = await apiClient.post<AddressDTO>("/api/addresses", request);
  return response.data;
}

export async function updateAddress(
  id: number,
  request: UpdateAddressRequest
): Promise<AddressDTO> {
  const response = await apiClient.put<AddressDTO>(
    `/api/addresses/${id}`,
    request
  );
  return response.data;
}

export async function deleteAddress(id: number): Promise<void> {
  await apiClient.delete(`/api/addresses/${id}`);
}

export async function setPrimaryAddress(id: number): Promise<AddressDTO> {
  const response = await apiClient.post<AddressDTO>(
    `/api/addresses/${id}/set-primary`
  );
  return response.data;
}

export async function getNotificationPreferences(): Promise<NotificationPreferencesDTO> {
  const response = await apiClient.get<NotificationPreferencesDTO>(
    "/api/notification-preferences"
  );
  return response.data;
}

export async function updateNotificationPreferences(
  request: UpdateNotificationPreferencesRequest
): Promise<NotificationPreferencesDTO> {
  const response = await apiClient.put<NotificationPreferencesDTO>(
    "/api/notification-preferences",
    request
  );
  return response.data;
}

export async function getUserPreferences(): Promise<UserPreferencesDTO> {
  const response = await apiClient.get<UserPreferencesDTO>(
    "/api/user-preferences"
  );
  return response.data;
}

export async function updateUserPreferences(
  request: UpdateUserPreferencesRequest
): Promise<UserPreferencesDTO> {
  const response = await apiClient.put<UserPreferencesDTO>(
    "/api/user-preferences",
    request
  );
  return response.data;
}

export async function requestSmsTwoFactorCode(): Promise<TwoFactorSmsCodeResponse> {
  const response = await apiClient.post<TwoFactorSmsCodeResponse>(
    "/api/user-preferences/two-factor/sms/request-code"
  );
  return response.data;
}

export async function verifySmsTwoFactorCode(
  request: VerifyTwoFactorSmsCodeRequest
): Promise<UserPreferencesDTO> {
  const response = await apiClient.post<UserPreferencesDTO>(
    "/api/user-preferences/two-factor/sms/verify-code",
    request
  );
  return response.data;
}

export async function getUserRewards(): Promise<UserRewardsDTO> {
  const response = await apiClient.get<UserRewardsDTO>("/api/rewards");
  return response.data;
}

export async function getRewardsHistory(
  page: number = 0,
  size: number = 10
): Promise<RewardsHistoryResponse> {
  const response = await apiClient.get<RewardsHistoryResponse>(
    "/api/rewards/history",
    { params: { page, size } }
  );
  return response.data;
}
