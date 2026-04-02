import { User, Session } from "@supabase/supabase-js";

export type { User, Session };

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  metadata?: {
    full_name?: string;
    phone?: string;
  };
}

export interface SignInCredentials {
  email: string;
  password: string;
}
