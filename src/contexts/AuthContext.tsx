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
import { cartApi } from "@/lib/api/cart";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signUp: (credentials: RegisterRequest) => Promise<void>;
  signIn: (credentials: LoginRequest, rememberMe: boolean) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getToken();
        if (token) {
          const user = await authApi.me(token);
          setUser(user);
          prevUserIdRef.current = String(user.id);
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        clearToken();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    const nextUserId = user ? String(user.id) : null;
    const prevUserId = prevUserIdRef.current;

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
      useCartStore.getState().clearSyncState();
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

  const signOut = async () => {
    setLoading(true);
    try {
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signOut,
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
