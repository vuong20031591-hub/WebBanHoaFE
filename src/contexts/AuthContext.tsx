"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from "react";
import { authApi } from "@/lib/auth/client";
import { getToken, setToken, clearToken } from "@/lib/auth/storage";
import type { AuthUser, LoginRequest, RegisterRequest } from "@/lib/auth/types";
import { useCartStore, useCartSync, mergeCartsOnLogin, cartSyncEngine } from "@/lib/cart";
import { useFavoritesStore } from "@/lib/favorites";
import { cartApi } from "@/lib/api/cart";
import { authService } from "@/lib/supabase/auth";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signUp: (credentials: RegisterRequest) => Promise<void>;
  signIn: (credentials: LoginRequest, rememberMe: boolean) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function describeAuthError(error: unknown): string {
  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (error && typeof error === "object") {
    const maybeMessage = "message" in error ? error.message : undefined;
    if (typeof maybeMessage === "string" && maybeMessage.trim()) {
      return maybeMessage;
    }

    try {
      const serialized = JSON.stringify(error);
      if (serialized && serialized !== "{}") {
        return serialized;
      }
    } catch {
      return "Unknown authentication error";
    }
  }

  return "Unknown authentication error";
}

async function triggerCartMerge(userId: string) {
  try {
    cartSyncEngine.setMerging(true);
    
    const store = useCartStore.getState();
    const localVariants = store.variants;
    
    const serverCart = await cartApi.get();
    
    const { variants, syncState, deltas } = await mergeCartsOnLogin(
      localVariants,
      serverCart,
      userId
    );
    
    store.replaceCart(variants, syncState);
    
    cartSyncEngine.markBaselineResetNeeded();
    
    cartSyncEngine.setMerging(false);
    
    for (const delta of deltas) {
      if (delta.localTotal !== delta.serverTotal) {
        cartSyncEngine.syncVariantChange(delta.productId, delta.localTotal, true);
      }
    }
    
    console.log(`Cart merged for user ${userId}`);
  } catch (error) {
    console.error("Cart merge failed:", error);
    cartSyncEngine.setMerging(false);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const prevUserIdRef = useRef<string | null>(null);
  const lastExchangedSupabaseTokenRef = useRef<string | null>(null);
  const pendingSupabaseTokenRef = useRef<string | null>(null);
  const oauthExchangeInFlightRef = useRef<Promise<void> | null>(null);

  const exchangeSupabaseTokenForBackendToken = async (supabaseAccessToken: string) => {
    if (
      lastExchangedSupabaseTokenRef.current === supabaseAccessToken &&
      getToken()
    ) {
      return;
    }

    if (
      oauthExchangeInFlightRef.current &&
      pendingSupabaseTokenRef.current === supabaseAccessToken
    ) {
      await oauthExchangeInFlightRef.current;
      return;
    }

    pendingSupabaseTokenRef.current = supabaseAccessToken;

    const exchangePromise = (async () => {
      const response = await authApi.loginWithGoogleToken(supabaseAccessToken);
      setToken(response.accessToken, true);
      setUser(response.user);
      prevUserIdRef.current = String(response.user.id);
      lastExchangedSupabaseTokenRef.current = supabaseAccessToken;
    })();

    oauthExchangeInFlightRef.current = exchangePromise;

    try {
      await exchangePromise;
    } finally {
      if (pendingSupabaseTokenRef.current === supabaseAccessToken) {
        pendingSupabaseTokenRef.current = null;
      }

      if (oauthExchangeInFlightRef.current === exchangePromise) {
        oauthExchangeInFlightRef.current = null;
      }
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getToken();
        if (token) {
          try {
            const user = await authApi.me(token);
            setUser(user);
            prevUserIdRef.current = String(user.id);
            return;
          } catch (error) {
            console.warn("Stored backend token is invalid, falling back to Supabase session:", error);
            clearToken();
            lastExchangedSupabaseTokenRef.current = null;
          }
        }

        const session = await authService.getSession();
        if (session?.access_token) {
          await exchangeSupabaseTokenForBackendToken(session.access_token);
          return;
        }
      } catch (error) {
        console.warn("Failed to initialize auth:", describeAuthError(error));
        clearToken();
        lastExchangedSupabaseTokenRef.current = null;
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = authService.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        clearToken();
        useCartStore.getState().clearCart();
        lastExchangedSupabaseTokenRef.current = null;
        pendingSupabaseTokenRef.current = null;
        setUser(null);
        return;
      }

      if (
        session?.access_token &&
        (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")
      ) {
        void (async () => {
          try {
            await exchangeSupabaseTokenForBackendToken(session.access_token);
          } catch (error) {
            console.warn("Google OAuth exchange failed:", describeAuthError(error));
            clearToken();
            lastExchangedSupabaseTokenRef.current = null;
            setUser(null);
          }
        })();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const nextUserId = user ? String(user.id) : null;
    const prevUserId = prevUserIdRef.current;

    useFavoritesStore.getState().setActiveUser(nextUserId);

    if (nextUserId && nextUserId !== prevUserId) {
      const store = useCartStore.getState();
      const lastSyncedUserId = store.syncState.lastSyncedUserId;

      if (!lastSyncedUserId || lastSyncedUserId === nextUserId) {
        console.log(`Merge trigger: ${prevUserId} -> ${nextUserId}`);
        triggerCartMerge(nextUserId);
      } else {
        console.log(`Different user detected, clearing cart`);
        store.clearCart();
        triggerCartMerge(nextUserId);
      }
    }

    if (!nextUserId && prevUserId) {
      console.log(`Logout: clearing sync state`);
      useCartStore.getState().clearCart();
    }

    prevUserIdRef.current = nextUserId;
  }, [user]);

  useCartSync(user ? String(user.id) : null);

  const signUp = async (credentials: RegisterRequest) => {
    setLoading(true);
    try {
      await authApi.register(credentials);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (credentials: LoginRequest, rememberMe: boolean) => {
    setLoading(true);
    try {
      const response = await authApi.login(credentials);
      setToken(response.accessToken, rememberMe);
      setUser(response.user);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/signin`
          : undefined;

      await authService.signInWithGoogle(redirectTo);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
    } catch (error) {
      console.warn("Supabase sign out failed:", error);
    } finally {
      clearToken();
      useCartStore.getState().clearCart();
      setUser(null);
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const nextUser = await authApi.me(token);
      setUser(nextUser);
      prevUserIdRef.current = String(nextUser.id);
    } catch (error) {
      console.error("Failed to refresh current user:", error);
      clearToken();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
