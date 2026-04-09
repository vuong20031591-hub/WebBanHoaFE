export interface AuthUser {
  id: number | string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  avatarUrl?: string | null;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  phone: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  deliveryMethod: "email" | "none";
  message: string;
  debugCode: string | null;
}

export interface ResetPasswordWithCodeRequest {
  email: string;
  code: string;
  newPassword: string;
}
