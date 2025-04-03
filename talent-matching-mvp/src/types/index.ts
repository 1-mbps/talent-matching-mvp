export type UserType = "business" | "user";

export interface RegisterRequest {
  name: string;
  username: string;
  password: string;
  user_type: UserType;
  city: string;
  country: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface User {
  name: string;
  email: string;
  user_type: UserType;
  city: string;
  country: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
} 