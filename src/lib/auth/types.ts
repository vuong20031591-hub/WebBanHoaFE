export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  role: string;
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
