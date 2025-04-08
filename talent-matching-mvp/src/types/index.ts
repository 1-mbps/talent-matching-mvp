export type UserType = "business" | "user";

export interface RegisterRequest extends LoginRequest {
  name: string;
  user_type: UserType;
  city: string;
  country: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface User {
  email: string;
  name: string;
  user_type: UserType;
  city: string;
  country: string;
  uuid: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface Job {
  user_id: string;
  job_desc: string;
  rating_schema: Record<string, any>;
  rating_schema_weights?: Record<string, number>;
  job_id: string;
  job_title: string;
}

export interface CandidateMatch {
  resume: string;
  score: number;
  name: string;
  ratings: Record<string, any>;
} 